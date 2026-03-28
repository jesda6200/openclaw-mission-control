import { apiRoutes, type AuthResponse, type AuthUser, type HealthResponse } from '@lending/contracts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload?.error?.message || 'Request failed');
  }
  return payload.data;
}

export const api = {
  health: () => request<HealthResponse>(apiRoutes.health),
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>(apiRoutes.register, { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>(apiRoutes.login, { method: 'POST', body: JSON.stringify(body) }),
  me: (accessToken: string) =>
    request<{ user: AuthUser }>(apiRoutes.me, { headers: { Authorization: `Bearer ${accessToken}` } }),
};
