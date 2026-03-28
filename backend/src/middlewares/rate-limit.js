const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

const defaultHandler = (_req, res) => {
  res.status(429).json({
    success: false,
    error: { code: 'rate_limit_exceeded', message: 'Too many requests' },
  });
};

const globalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler,
});

const authRateLimit = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler,
});

module.exports = { globalRateLimit, authRateLimit };
