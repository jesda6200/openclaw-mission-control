const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.DB_CLIENT = 'memory';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-abcdefghijklmnopqrstuvwxyz';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefghijklmnopqrstuvwxyz';
process.env.JWT_ACCESS_EXPIRES_IN = '1s';
process.env.JWT_REFRESH_EXPIRES_IN = '2s';
process.env.DEFAULT_ADMIN_EMAIL = 'admin@test.local';
process.env.DEFAULT_ADMIN_PASSWORD = 'Admin123!';
process.env.DEFAULT_ADMIN_NAME = 'Admin';

const { MemoryAdapter } = require('../src/db/memory-adapter');
const { createApp } = require('../src/app');

async function buildServer() {
  const db = await new MemoryAdapter().init();
  const { app, services } = createApp({ db });
  await services.authService.seedAdmin();
  const server = app.listen(0);
  const port = server.address().port;
  return { server, baseUrl: `http://127.0.0.1:${port}`, db };
}

async function json(fetchPromise) {
  const response = await fetchPromise;
  return { response, body: await response.json() };
}

test('register -> login -> me -> refresh rotation works', async () => {
  const { server, baseUrl } = await buildServer();
  try {
    const register = await json(fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ name: 'Damien', email: 'damien@example.com', password: 'secret1234' }),
    }));

    assert.equal(register.response.status, 201);
    assert.equal(register.body.data.user.role, 'user');
    assert.ok(register.body.data.accessToken);
    assert.ok(register.body.data.refreshToken);

    const login = await json(fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ email: 'damien@example.com', password: 'secret1234' }),
    }));

    assert.equal(login.response.status, 200);

    const me = await json(fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${login.body.data.accessToken}`, origin: 'http://localhost:3000' },
    }));
    assert.equal(me.response.status, 200);
    assert.equal(me.body.data.user.email, 'damien@example.com');

    const refresh = await json(fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ refreshToken: login.body.data.refreshToken }),
    }));
    assert.equal(refresh.response.status, 200);
    assert.notEqual(refresh.body.data.refreshToken, login.body.data.refreshToken);

    const reuse = await json(fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ refreshToken: login.body.data.refreshToken }),
    }));
    assert.equal(reuse.response.status, 401);
    assert.equal(reuse.body.error.code, 'refresh_token_revoked');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('validation, bad credentials and RBAC admin route are handled', async () => {
  const { server, baseUrl } = await buildServer();
  try {
    const invalid = await json(fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ name: 'A', email: 'bad', password: '123' }),
    }));
    assert.equal(invalid.response.status, 400);
    assert.equal(invalid.body.error.code, 'validation_failed');

    const badLogin = await json(fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ email: 'nope@example.com', password: 'secret1234' }),
    }));
    assert.equal(badLogin.response.status, 401);
    assert.equal(badLogin.body.error.code, 'invalid_credentials');

    const userRegister = await json(fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ name: 'User', email: 'user@example.com', password: 'secret1234' }),
    }));

    const forbidden = await json(fetch(`${baseUrl}/api/v1/auth/users`, {
      headers: { authorization: `Bearer ${userRegister.body.data.accessToken}`, origin: 'http://localhost:3000' },
    }));
    assert.equal(forbidden.response.status, 403);
    assert.equal(forbidden.body.error.code, 'forbidden');

    const adminLogin = await json(fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ email: 'admin@test.local', password: 'Admin123!' }),
    }));
    const adminUsers = await json(fetch(`${baseUrl}/api/v1/auth/users`, {
      headers: { authorization: `Bearer ${adminLogin.body.data.accessToken}`, origin: 'http://localhost:3000' },
    }));
    assert.equal(adminUsers.response.status, 200);
    assert.ok(adminUsers.body.data.users.length >= 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('expired access token and expired refresh token return proper errors', async () => {
  const { server, baseUrl } = await buildServer();
  try {
    const register = await json(fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ name: 'Timer', email: 'timer@example.com', password: 'secret1234' }),
    }));

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const expiredAccess = await json(fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${register.body.data.accessToken}`, origin: 'http://localhost:3000' },
    }));
    assert.equal(expiredAccess.response.status, 401);
    assert.equal(expiredAccess.body.error.code, 'token_expired');

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const expiredRefresh = await json(fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ refreshToken: register.body.data.refreshToken }),
    }));
    assert.equal(expiredRefresh.response.status, 401);
    assert.equal(expiredRefresh.body.error.code, 'refresh_token_expired');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});


test('public register rejects self-assigned admin role', async () => {
  const { server, baseUrl } = await buildServer();
  try {
    const response = await json(fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({
        name: 'Mallory',
        email: 'mallory@example.com',
        password: 'secret1234',
        role: 'admin',
      }),
    }));

    assert.equal(response.response.status, 400);
    assert.equal(response.body.error.code, 'validation_failed');

    const login = await json(fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ email: 'mallory@example.com', password: 'secret1234' }),
    }));
    assert.equal(login.response.status, 401);
    assert.equal(login.body.error.code, 'invalid_credentials');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});


test('wrong JWT token types are rejected for protected and refresh endpoints', async () => {
  const { server, baseUrl } = await buildServer();
  try {
    const register = await json(fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ name: 'Typey', email: 'typey@example.com', password: 'secret1234' }),
    }));

    const refreshTokenPresentedAsAccess = jwt.sign(
      { sub: String(register.body.data.user.id), role: 'user', type: 'refresh', jti: 'fake-refresh-id', familyId: 'fake-family' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '5m' }
    );

    const accessWithRefreshSecretPresentedToRefresh = jwt.sign(
      { sub: String(register.body.data.user.id), role: 'user', email: 'typey@example.com', type: 'access', jti: 'fake-access-id' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '5m' }
    );

    const protectedResponse = await json(fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${refreshTokenPresentedAsAccess}`, origin: 'http://localhost:3000' },
    }));
    assert.equal(protectedResponse.response.status, 401);
    assert.equal(protectedResponse.body.error.code, 'invalid_token');

    const refreshResponse = await json(fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ refreshToken: accessWithRefreshSecretPresentedToRefresh }),
    }));
    assert.equal(refreshResponse.response.status, 401);
    assert.equal(refreshResponse.body.error.code, 'invalid_refresh_token');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
