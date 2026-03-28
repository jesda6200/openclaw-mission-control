const { Router } = require('express');
const { createAuthRoutes } = require('./auth-routes');

function createApiRouter({ authController, healthController }) {
  const router = Router();
  router.get('/health', healthController.health);
  router.use('/auth', createAuthRoutes(authController));
  return router;
}

module.exports = { createApiRouter };
