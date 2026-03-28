const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.DB_CLIENT = 'memory';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-abcdefghijklmnopqrstuvwxyz';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefghijklmnopqrstuvwxyz';
process.env.DEFAULT_ADMIN_EMAIL = 'admin@test.local';
process.env.DEFAULT_ADMIN_PASSWORD = 'Admin123!';
process.env.DEFAULT_ADMIN_NAME = 'Admin';

const { MemoryAdapter } = require('../src/db/memory-adapter');
const { createApp } = require('../src/app');

async function buildServer() {
  const db = await new MemoryAdapter().init();
  const { app } = createApp({ db });
  const server = app.listen(0);
  const port = server.address().port;
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

test('health endpoint returns service metadata', async () => {
  const { server, baseUrl } = await buildServer();
  try {
    const response = await fetch(`${baseUrl}/api/v1/health`, {
      headers: { origin: 'http://localhost:3000' },
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'ok');
    assert.equal(body.data.storage, 'memory');
    assert.match(body.data.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(typeof body.data.uptime, 'number');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
