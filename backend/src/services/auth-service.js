const bcrypt = require('bcryptjs');
const { env } = require('../config/env');
const { ROLES } = require('../constants/roles');
const { AppError } = require('../utils/errors');

class AuthService {
  constructor({ userRepository, refreshTokenRepository, tokenService }) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.tokenService = tokenService;
  }

  sanitizeUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async register(data) {
    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    let user;
    try {
      user = await this.userRepository.create({
        name: data.name,
        email: data.email,
        passwordHash,
        role: ROLES.USER,
      });
    } catch (error) {
      if (error.code === 'EMAIL_EXISTS') {
        throw new AppError(409, 'email_exists', 'Email already registered');
      }
      throw error;
    }

    return this.issueAuthResponse(user);
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(401, 'invalid_credentials', 'Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError(401, 'invalid_credentials', 'Invalid credentials');
    }

    return this.issueAuthResponse(user);
  }

  async refresh(rawRefreshToken) {
    const { storedToken, payload } = await this.tokenService.rotateRefreshToken(rawRefreshToken);
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new AppError(404, 'user_not_found', 'User not found');
    }

    const nextRefresh = await this.tokenService.createRefreshToken(user, storedToken.familyId);
    await this.refreshTokenRepository.revoke(storedToken.tokenId, {
      replacedByTokenId: nextRefresh.tokenId,
      revokeReason: 'rotated',
      usedAt: new Date().toISOString(),
    });

    return {
      user: this.sanitizeUser(user),
      accessToken: this.tokenService.createAccessToken(user),
      refreshToken: nextRefresh.refreshToken,
      tokenType: 'Bearer',
    };
  }

  async logout(rawRefreshToken) {
    const { storedToken } = await this.tokenService.rotateRefreshToken(rawRefreshToken);
    await this.refreshTokenRepository.revoke(storedToken.tokenId, {
      revokeReason: 'logout',
      usedAt: new Date().toISOString(),
    });
  }

  async me(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'user_not_found', 'User not found');
    }
    return this.sanitizeUser(user);
  }

  async listUsers() {
    const users = await this.userRepository.list();
    return users.map((user) => this.sanitizeUser(user));
  }

  async issueAuthResponse(user) {
    const accessToken = this.tokenService.createAccessToken(user);
    const refresh = await this.tokenService.createRefreshToken(user);
    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: refresh.refreshToken,
      tokenType: 'Bearer',
    };
  }

  async seedAdmin() {
    const existing = await this.userRepository.findByEmail(env.DEFAULT_ADMIN_EMAIL);
    if (existing) return this.sanitizeUser(existing);
    const passwordHash = await bcrypt.hash(env.DEFAULT_ADMIN_PASSWORD, env.BCRYPT_ROUNDS);
    const admin = await this.userRepository.create({
      name: env.DEFAULT_ADMIN_NAME,
      email: env.DEFAULT_ADMIN_EMAIL,
      passwordHash,
      role: ROLES.ADMIN,
    });
    return this.sanitizeUser(admin);
  }
}

module.exports = { AuthService };
