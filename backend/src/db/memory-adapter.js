class MemoryAdapter {
  constructor() {
    this.kind = 'memory';
    this.userSeq = 1;
    this.users = [];
    this.refreshTokens = [];
  }

  async init() { return this; }
  async close() {}

  async createUser({ name, email, passwordHash, role }) {
    if (this.users.some((user) => user.email === email)) {
      const error = new Error('EMAIL_EXISTS');
      error.code = 'EMAIL_EXISTS';
      throw error;
    }
    const user = { id: this.userSeq++, name, email, passwordHash, role, createdAt: new Date().toISOString() };
    this.users.push(user);
    return { ...user };
  }

  async findUserByEmail(email) {
    const user = this.users.find((entry) => entry.email === email);
    return user ? { ...user } : null;
  }

  async findUserById(id) {
    const user = this.users.find((entry) => String(entry.id) === String(id));
    return user ? { ...user } : null;
  }

  async listUsers() {
    return this.users.map((user) => ({ ...user }));
  }

  async createRefreshToken(payload) {
    this.refreshTokens.push({ ...payload, createdAt: new Date().toISOString(), revokedAt: null, replacedByTokenId: null, revokeReason: null, usedAt: null });
    return { ...payload };
  }

  async findRefreshTokenById(tokenId) {
    const token = this.refreshTokens.find((entry) => entry.tokenId === tokenId);
    return token ? { ...token } : null;
  }

  async revokeRefreshToken(tokenId, data = {}) {
    const token = this.refreshTokens.find((entry) => entry.tokenId === tokenId);
    if (!token) return null;
    Object.assign(token, data, { revokedAt: data.revokedAt || new Date().toISOString() });
    return { ...token };
  }

  async revokeRefreshTokenFamily(familyId, data = {}) {
    const revokedAt = data.revokedAt || new Date().toISOString();
    this.refreshTokens = this.refreshTokens.map((token) => token.familyId !== familyId || token.revokedAt ? token : { ...token, ...data, revokedAt });
  }
}

module.exports = { MemoryAdapter };
