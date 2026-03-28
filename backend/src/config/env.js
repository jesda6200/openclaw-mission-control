const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default('info'),
  API_PREFIX: z.string().default('/api/v1'),
  APP_NAME: z.string().default('backend-v2-auth-api'),
  DB_CLIENT: z.enum(['postgres', 'sqlite', 'memory']).default('sqlite'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/backend_v2'),
  SQLITE_FILE: z.string().default(path.join(process.cwd(), 'data', 'app.sqlite')),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars').default('dev-access-secret-change-me-now-123'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars').default('dev-refresh-secret-change-me-now-456'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  TRUST_PROXY: z.union([z.boolean(), z.string()]).default(false),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
  DEFAULT_ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default('Admin123!'),
  DEFAULT_ADMIN_NAME: z.string().min(2).default('Admin'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten());
  process.exit(1);
}

const env = parsed.data;
env.TRUST_PROXY = String(env.TRUST_PROXY) === 'true';
env.CORS_ORIGIN = env.CORS_ORIGIN.split(',').map((entry) => entry.trim()).filter(Boolean);

module.exports = { env };
