const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/errors');

function authenticateAccessToken(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'missing_token', 'Missing Bearer token'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.type !== 'access') {
      return next(new AppError(401, 'invalid_token', 'Invalid access token'));
    }
    req.auth = payload;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(401, 'token_expired', 'Access token expired'));
    }
    return next(new AppError(401, 'invalid_token', 'Invalid access token'));
  }
}

function authorizeRoles(...roles) {
  return function roleGuard(req, _res, next) {
    if (!req.auth) {
      return next(new AppError(401, 'unauthorized', 'Authentication required'));
    }
    if (!roles.includes(req.auth.role)) {
      return next(new AppError(403, 'forbidden', 'Insufficient permissions'));
    }
    next();
  };
}

module.exports = { authenticateAccessToken, authorizeRoles };
