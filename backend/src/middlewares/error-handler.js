const { ZodError } = require('zod');
const { logger } = require('../config/logger');
const { AppError } = require('../utils/errors');

function notFoundHandler(req, _res, next) {
  next(new AppError(404, 'route_not_found', `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'validation_failed',
        message: 'Validation failed',
        details: error.flatten(),
      },
      requestId: req.id,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details || null,
      },
      requestId: req.id,
    });
  }

  logger.error({ err: error, requestId: req.id }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    error: {
      code: 'internal_server_error',
      message: 'Internal server error',
    },
    requestId: req.id,
  });
}

module.exports = { errorHandler, notFoundHandler };
