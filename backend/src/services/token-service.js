const jwt = require('jsonwebtoken');
const ms = require('ms');
const { env } = require('../config/env');
const { generateTokenId, sha256 } = require('../utils/crypto');
const { AppError } = require('../utils/errors');

class TokenService {
  constructor(refreshTokenRepository) {
    this.refreshTokenRepository = refreshTokenRepository;
  }

  createAccessToken(user) {
    return jwt.sign({ sub: String(user.id), role: user.role, email: user.email, type: 'access' }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
  }

  async createRefreshToken(user, familyId = generateTokenId()) {
    const tokenId = generateTokenId();
    const expiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN));
    const refreshToken = jwt.sign(
      { sub: String(user.id), role: user.role, type: 'refresh', jti: tokenId, familyId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    await this.refreshTokenRepository.create({
      tokenId,
      userId: user.id,
      familyId,
      tokenHash: sha256(refreshToken),
      expiresAt: expiresAt.toISOString(),
    });

    return { refreshToken, tokenId, familyId, expiresAt: expiresAt.toISOString() };
  }

  async rotateRefreshToken(rawToken) {
    let payload;
    try {
      payload = jwt.verify(rawToken, env.JWT_REFRESH_SECRET);
      if (payload.type !== 'refresh') {
        throw new AppError(401, 'invalid_refresh_token', 'Invalid refresh token');
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError(401, 'refresh_token_expired', 'Refresh token expired');
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(401, 'invalid_refresh_token', 'Invalid refresh token');
    }

    const storedToken = await this.refreshTokenRepository.findById(payload.jti);
    if (!storedToken) {
      throw new AppError(401, 'refresh_token_not_found', 'Refresh token not found');
    }

    if (storedToken.tokenHash !== sha256(rawToken)) {
      await this.refreshTokenRepository.revokeFamily(storedToken.familyId, { revokeReason: 'refresh_reuse_detected' });
      throw new AppError(401, 'refresh_token_reused', 'Refresh token reuse detected');
    }

    if (storedToken.revokedAt) {
      await this.refreshTokenRepository.revokeFamily(storedToken.familyId, { revokeReason: 'refresh_reuse_detected' });
      throw new AppError(401, 'refresh_token_revoked', 'Refresh token already revoked');
    }

    if (new Date(storedToken.expiresAt).getTime() <= Date.now()) {
      throw new AppError(401, 'refresh_token_expired', 'Refresh token expired');
    }

    return { payload, storedToken };
  }
}

module.exports = { TokenService };
