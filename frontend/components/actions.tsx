"use client";

import { useMemo, useState } from 'react';
import type { MarketAsset } from '@lending/contracts';
import { Panel, Pill } from '@/components/ui';

export function LendingActions({ assets }: { assets: MarketAsset[] }) {
  const [mode, setMode] = useState<'deposit' | 'borrow'>('deposit');
  const [assetSymbol, setAssetSymbol] = useState(assets[0]?.symbol ?? 'ETH');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const asset = useMemo(() => assets.find((item) => item.symbol === assetSymbol) ?? assets[0], [assets, assetSymbol]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(`${mode === 'deposit' ? 'Deposit' : 'Borrow'} order prepared for ${amount || '0'} ${asset?.symbol}. Hook this action to POST /positions/${mode} on the backend.`);
  };

  return (
    <Panel className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Position actions</h3>
          <p className="text-sm text-slate-400">Reusable action card with loading/error-ready UX.</p>
        </div>
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
          {(['deposit', 'borrow'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === item ? 'bg-white text-slate-950' : 'text-slate-300'}`}
            >
              {item === 'deposit' ? 'Deposit' : 'Borrow'}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <label className="space-y-2 text-sm text-slate-300">
          Asset
          <select value={assetSymbol} onChange={(e) => setAssetSymbol(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none">
            {assets.map((item) => <option key={item.symbol} value={item.symbol}>{item.symbol} — {item.name}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          Amount
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none" />
        </label>
        <button type="submit" className="mt-auto rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600">Confirm</button>
      </form>

      {asset ? (
        <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/30 p-4 md:grid-cols-3">
          <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Wallet balance</p><p className="mt-2 text-lg font-medium text-white">{asset.walletBalance} {asset.symbol}</p></div>
          <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current {mode === 'deposit' ? 'supply' : 'borrow'} rate</p><p className="mt-2 text-lg font-medium text-white">{mode === 'deposit' ? asset.depositApy.toFixed(2) : asset.borrowApy.toFixed(2)}%</p></div>
          <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Liquidity available</p><p className="mt-2 text-lg font-medium text-white">${asset.liquidity.toLocaleString('fr-FR')}</p></div>
        </div>
      ) : null}

      {status ? <Pill>{status}</Pill> : null}
    </Panel>
  );
}
