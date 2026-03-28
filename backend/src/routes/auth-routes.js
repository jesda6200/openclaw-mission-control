const { Router } = require('express');
const { validate } = require('../middlewares/validate');
const { authRateLimit } = require('../middlewares/rate-limit');
const { authenticateAccessToken, authorizeRoles } = require('../middlewares/auth');
const { registerSchema, loginSchema, refreshSchema } = require('../schemas/auth-schema');
const { asyncHandler } = require('../utils/async-handler');
const { ROLES } = require('../constants/roles');

function createAuthRoutes(authController) {
  const router = Router();

  router.post('/register', authRateLimit, validate(registerSchema), asyncHandler(authController.register));
  router.post('/login', authRateLimit, validate(loginSchema), asyncHandler(authController.login));
  router.post('/refresh', authRateLimit, validate(refreshSchema), asyncHandler(authController.refresh));
  router.post('/logout', authRateLimit, validate(refreshSchema), asyncHandler(authController.logout));
  router.get('/me', authenticateAccessToken, asyncHandler(authController.me));
  router.get('/users', authenticateAccessToken, authorizeRoles(ROLES.ADMIN), asyncHandler(authController.listUsers));

  return router;
}

module.exports = { createAuthRoutes };
