const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

class SqliteAdapter {
  constructor(filename) {
    this.kind = 'sqlite';
    this.filename = filename;
    this.db = null;
  }

  async init() {
    fs.mkdirSync(path.dirname(this.filename), { recursive: true });
    this.db = await open({ filename: this.filename, driver: sqlite3.Database });
    await this.db.exec(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        token_id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        family_id TEXT NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        revoked_at TEXT,
        replaced_by_token_id TEXT,
        revoke_reason TEXT,
        used_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    `);

    await this.ensureUserSchema();

    return this;
  }

  async ensureUserSchema() {
    const columns = await this.db.all('PRAGMA table_info(users)');
    const hasRole = columns.some((column) => column.name === 'role');

    if (!hasRole) {
      await this.db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';");
    }
  }

  async close() { if (this.db) await this.db.close(); }

  async createUser({ name, email, passwordHash, role }) {
    try {
      const result = await this.db.run(
        'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
        [name, email, passwordHash, role, new Date().toISOString()]
      );
      return this.findUserById(result.lastID);
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) error.code = 'EMAIL_EXISTS';
      throw error;
    }
  }

  async findUserByEmail(email) {
    return this.db.get('SELECT id, name, email, password_hash as passwordHash, role, created_at as createdAt FROM users WHERE email = ?', [email]);
  }

  async findUserById(id) {
    return this.db.get('SELECT id, name, email, password_hash as passwordHash, role, created_at as createdAt FROM users WHERE id = ?', [id]);
  }

  async listUsers() {
    return this.db.all('SELECT id, name, email, password_hash as passwordHash, role, created_at as createdAt FROM users ORDER BY id ASC');
  }

  async createRefreshToken({ tokenId, userId, familyId, tokenHash, expiresAt }) {
    await this.db.run(
      'INSERT INTO refresh_tokens (token_id, user_id, family_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [tokenId, userId, familyId, tokenHash, expiresAt, new Date().toISOString()]
    );
    return this.findRefreshTokenById(tokenId);
  }

  async findRefreshTokenById(tokenId) {
    return this.db.get(
      'SELECT token_id as tokenId, user_id as userId, family_id as familyId, token_hash as tokenHash, expires_at as expiresAt, created_at as createdAt, revoked_at as revokedAt, replaced_by_token_id as replacedByTokenId, revoke_reason as revokeReason, used_at as usedAt FROM refresh_tokens WHERE token_id = ?',
      [tokenId]
    );
  }

  async revokeRefreshToken(tokenId, data = {}) {
    const existing = await this.findRefreshTokenById(tokenId);
    if (!existing) return null;
    await this.db.run(
      'UPDATE refresh_tokens SET revoked_at = ?, replaced_by_token_id = COALESCE(?, replaced_by_token_id), revoke_reason = COALESCE(?, revoke_reason), used_at = COALESCE(?, used_at) WHERE token_id = ?',
      [data.revokedAt || new Date().toISOString(), data.replacedByTokenId || null, data.revokeReason || null, data.usedAt || null, tokenId]
    );
    return this.findRefreshTokenById(tokenId);
  }

  async revokeRefreshTokenFamily(familyId, data = {}) {
    await this.db.run(
      'UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, ?), revoke_reason = COALESCE(revoke_reason, ?) WHERE family_id = ?',
      [data.revokedAt || new Date().toISOString(), data.revokeReason || 'family_revoked', familyId]
    );
  }
}

module.exports = { SqliteAdapter };
