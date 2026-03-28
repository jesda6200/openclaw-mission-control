const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const { env } = require('./config/env');
const { logger } = require('./config/logger');
const { requestIdMiddleware } = require('./middlewares/request-id');
const { globalRateLimit } = require('./middlewares/rate-limit');
const { errorHandler, notFoundHandler } = require('./middlewares/error-handler');
const { createApiRouter } = require('./routes');
const { UserRepository } = require('./repositories/user-repository');
const { RefreshTokenRepository } = require('./repositories/refresh-token-repository');
const { TokenService } = require('./services/token-service');
const { AuthService } = require('./services/auth-service');
const { AuthController } = require('./controllers/auth-controller');
const { createHealthController } = require('./controllers/health-controller');
const { AppError } = require('./utils/errors');

function createCorsOptions() {
  return {
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGIN.includes(origin)) {
        return callback(null, true);
      }
      return callback(new AppError(403, 'cors_forbidden', `Origin not allowed: ${origin}`));
    },
    credentials: false,
  };
}

function createApp({ db }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  const userRepository = new UserRepository(db);
  const refreshTokenRepository = new RefreshTokenRepository(db);
  const tokenService = new TokenService(refreshTokenRepository);
  const authService = new AuthService({ userRepository, refreshTokenRepository, tokenService });
  const authController = new AuthController(authService);
  const healthController = createHealthController({ db });

  app.use(requestIdMiddleware);
  app.use(pinoHttp({ logger, genReqId: (req) => req.id }));
  app.use(helmet());
  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: '1mb' }));
  app.use(globalRateLimit);

  app.get('/', (_req, res) => {
    res.json({ success: true, data: { name: env.APP_NAME, version: '2.0.0', prefix: env.API_PREFIX } });
  });

  app.use(env.API_PREFIX, createApiRouter({ authController, healthController }));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, services: { authService } };
}

module.exports = { createApp };
