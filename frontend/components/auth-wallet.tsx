"use client";

import { useEffect, useMemo, useState } from 'react';
import type { AuthResponse } from '@lending/contracts';
import { api } from '@/lib/api';
import { Panel, Pill } from '@/components/ui';
import { shortAddress } from '@/lib/utils';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

const initialAuth = { name: '', email: '', password: '' };

export function AuthWalletCard() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState(initialAuth);
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.health().then(() => setBackendStatus('online')).catch(() => setBackendStatus('offline'));
  }, []);

  const isRegister = mode === 'register';
  const canSubmit = form.email && form.password && (!isRegister || form.name);
  const heading = useMemo(() => auth?.user?.name || 'Guest operator', [auth]);

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = isRegister
        ? await api.register({ name: form.name, email: form.email, password: form.password })
        : await api.login({ email: form.email, password: form.password });
      setAuth(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function connectWallet() {
    setError(null);
    if (!window.ethereum) {
      setError('MetaMask non détecté. Installez l’extension ou utilisez un navigateur compatible.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts?.[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet connection refused');
    }
  }

  return (
    <Panel className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Secure access</p>
          <h3 className="text-2xl font-semibold text-white">{heading}</h3>
        </div>
        <Pill tone={backendStatus === 'online' ? 'success' : backendStatus === 'offline' ? 'warning' : 'default'}>
          Backend {backendStatus}
        </Pill>
      </div>

      <form onSubmit={submitAuth} className="space-y-4">
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
          {(['login', 'register'] as const).map((item) => (
            <button key={item} type="button" onClick={() => setMode(item)} className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${mode === item ? 'bg-white text-slate-950' : 'text-slate-300'}`}>
              {item === 'login' ? 'Email sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {isRegister ? (
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" placeholder="Full name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        ) : null}
        <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
        <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />

        <button disabled={!canSubmit || loading} className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? 'Processing…' : isRegister ? 'Open lending account' : 'Access dashboard'}
        </button>
      </form>

      <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">Wallet access</p>
            <p className="text-base font-medium text-white">{shortAddress(wallet)}</p>
          </div>
          <button type="button" onClick={connectWallet} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5">
            Connect MetaMask
          </button>
        </div>
      </div>

      {auth ? (
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-200">
          Connected as <strong>{auth.user.email}</strong>. JWT reçu côté UI, prêt à être utilisé sur les appels protégés du backend.
        </div>
      ) : null}
      {error ? <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-200">{error}</div> : null}
    </Panel>
  );
}
