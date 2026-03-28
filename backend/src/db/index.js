const { env } = require('../config/env');
const { logger } = require('../config/logger');
const { PostgresAdapter } = require('./postgres-adapter');
const { SqliteAdapter } = require('./sqlite-adapter');
const { MemoryAdapter } = require('./memory-adapter');

async function createDatabase() {
  if (env.DB_CLIENT === 'memory') {
    logger.warn('Using in-memory database');
    return new MemoryAdapter().init();
  }

  if (env.DB_CLIENT === 'postgres') {
    try {
      const postgres = new PostgresAdapter(env.DATABASE_URL);
      await postgres.init();
      logger.info('Using postgres database');
      return postgres;
    } catch (error) {
      logger.warn({ err: error }, 'Postgres unavailable, falling back to SQLite');
    }
  }

  try {
    const sqlite = new SqliteAdapter(env.SQLITE_FILE);
    await sqlite.init();
    logger.info('Using sqlite database');
    return sqlite;
  } catch (error) {
    logger.warn({ err: error }, 'SQLite unavailable, falling back to memory');
    return new MemoryAdapter().init();
  }
}

module.exports = { createDatabase };
