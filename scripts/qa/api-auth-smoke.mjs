#!/usr/bin/env node
import process from 'node:process';

const baseUrl = (process.env.API_BASE_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');
const origin = process.env.API_ORIGIN || 'http://localhost:3000';
const email = `qa.${Date.now()}@example.com`;
const password = 'Secret1234!';

async function jsonFetch(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      origin,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { response, body };
}

function assert(condition, message, details) {
  if (!condition) {
    console.error(`❌ ${message}`);
    if (details) console.error(JSON.stringify(details, null, 2));
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

const register = await jsonFetch('/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name: 'QA User', email, password }),
});
assert(register.response.status === 201, 'register returns 201', register.body);
assert(register.body?.data?.accessToken, 'register returns access token');
assert(register.body?.data?.refreshToken, 'register returns refresh token');

const me = await jsonFetch('/auth/me', {
  headers: { authorization: `Bearer ${register.body.data.accessToken}` },
});
assert(me.response.status === 200, 'me returns 200 for fresh access token', me.body);
assert(me.body?.data?.user?.email === email, 'me returns expected user identity', me.body);

const refresh = await jsonFetch('/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({ refreshToken: register.body.data.refreshToken }),
});
assert(refresh.response.status === 200, 'refresh returns 200', refresh.body);
assert(refresh.body?.data?.refreshToken !== register.body.data.refreshToken, 'refresh token rotation is active', refresh.body);

const reuse = await jsonFetch('/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({ refreshToken: register.body.data.refreshToken }),
});
assert(reuse.response.status === 401, 'reused refresh token is rejected', reuse.body);

console.log('\nSmoke auth API terminé.');
