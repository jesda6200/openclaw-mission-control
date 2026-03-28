const { createDatabase } = require('./db');
const { createApp } = require('./app');
const { env } = require('./config/env');
const { logger } = require('./config/logger');

async function start() {
  const db = await createDatabase();
  const { app, services } = createApp({ db });
  const admin = await services.authService.seedAdmin();

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, storage: db.kind, adminEmail: admin.email }, `API started on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    logger.info('Graceful shutdown started');
    server.close(async () => {
      await db.close?.();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
