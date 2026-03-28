class RefreshTokenRepository {
  constructor(db) { this.db = db; }

  create(data) { return this.db.createRefreshToken(data); }
  findById(tokenId) { return this.db.findRefreshTokenById(tokenId); }
  revoke(tokenId, data) { return this.db.revokeRefreshToken(tokenId, data); }
  revokeFamily(familyId, data) { return this.db.revokeRefreshTokenFamily(familyId, data); }
}

module.exports = { RefreshTokenRepository };
