const { Pool } = require('pg');

class PostgresAdapter {
  constructor(connectionString) {
    this.kind = 'postgres';
    this.pool = new Pool({ connectionString });
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        token_id UUID PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        family_id UUID NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        revoked_at TIMESTAMPTZ,
        replaced_by_token_id UUID,
        revoke_reason TEXT,
        used_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    `);
    return this;
  }

  async close() { await this.pool.end(); }

  mapUser(row) { return row ? { id: row.id, name: row.name, email: row.email, passwordHash: row.password_hash, role: row.role, createdAt: row.created_at } : null; }
  mapRefresh(row) { return row ? { tokenId: row.token_id, userId: row.user_id, familyId: row.family_id, tokenHash: row.token_hash, expiresAt: row.expires_at, createdAt: row.created_at, revokedAt: row.revoked_at, replacedByTokenId: row.replaced_by_token_id, revokeReason: row.revoke_reason, usedAt: row.used_at } : null; }

  async createUser({ name, email, passwordHash, role }) {
    try {
      const { rows } = await this.pool.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, passwordHash, role]);
      return this.mapUser(rows[0]);
    } catch (error) {
      if (error.code === '23505') error.code = 'EMAIL_EXISTS';
      throw error;
    }
  }

  async findUserByEmail(email) {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    return this.mapUser(rows[0]);
  }

  async findUserById(id) {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return this.mapUser(rows[0]);
  }

  async listUsers() {
    const { rows } = await this.pool.query('SELECT * FROM users ORDER BY id ASC');
    return rows.map((row) => this.mapUser(row));
  }

  async createRefreshToken({ tokenId, userId, familyId, tokenHash, expiresAt }) {
    const { rows } = await this.pool.query(
      'INSERT INTO refresh_tokens (token_id, user_id, family_id, token_hash, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tokenId, userId, familyId, tokenHash, expiresAt]
    );
    return this.mapRefresh(rows[0]);
  }

  async findRefreshTokenById(tokenId) {
    const { rows } = await this.pool.query('SELECT * FROM refresh_tokens WHERE token_id = $1 LIMIT 1', [tokenId]);
    return this.mapRefresh(rows[0]);
  }

  async revokeRefreshToken(tokenId, data = {}) {
    const { rows } = await this.pool.query(
      'UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, $2), replaced_by_token_id = COALESCE($3, replaced_by_token_id), revoke_reason = COALESCE($4, revoke_reason), used_at = COALESCE($5, used_at) WHERE token_id = $1 RETURNING *',
      [tokenId, data.revokedAt || new Date().toISOString(), data.replacedByTokenId || null, data.revokeReason || null, data.usedAt || null]
    );
    return this.mapRefresh(rows[0]);
  }

  async revokeRefreshTokenFamily(familyId, data = {}) {
    await this.pool.query(
      'UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, $2), revoke_reason = COALESCE(revoke_reason, $3) WHERE family_id = $1',
      [familyId, data.revokedAt || new Date().toISOString(), data.revokeReason || 'family_revoked']
    );
  }
}

module.exports = { PostgresAdapter };
