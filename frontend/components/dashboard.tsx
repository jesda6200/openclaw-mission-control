import type { MarketAsset, PortfolioSummary } from '@lending/contracts';
import { formatUsd } from '@/lib/utils';
import { Panel, Pill } from '@/components/ui';

export function StatCards({ summary }: { summary: PortfolioSummary }) {
  const cards = [
    { label: 'Total supplied', value: formatUsd(summary.totalDepositedUsd), tone: 'success' as const },
    { label: 'Total borrowed', value: formatUsd(summary.totalBorrowedUsd), tone: 'warning' as const },
    { label: 'Health factor', value: `${summary.healthFactor.toFixed(2)}x`, tone: 'success' as const },
    { label: 'Net APY', value: `${summary.netApy.toFixed(2)}%`, tone: 'default' as const },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Panel key={card.label} className="space-y-3 p-5">
          <p className="text-sm text-slate-400">{card.label}</p>
          <div className="flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold text-white">{card.value}</p>
            <Pill tone={card.tone}>{card.tone === 'warning' ? 'Risk managed' : 'Healthy'}</Pill>
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function MarketsTable({ assets }: { assets: MarketAsset[] }) {
  return (
    <Panel className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">Dynamic lending markets</h3>
        <p className="text-sm text-slate-400">Mock APYs ready to be swapped with backend market endpoints.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-3">Asset</th><th className="px-6 py-3">Supply APY</th><th className="px-6 py-3">Borrow APY</th><th className="px-6 py-3">Liquidity</th><th className="px-6 py-3">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.symbol} className="border-t border-white/5 text-slate-200">
                <td className="px-6 py-4"><div className="font-medium text-white">{asset.symbol}</div><div className="text-xs text-slate-400">{asset.name}</div></td>
                <td className="px-6 py-4 text-emerald-300">{asset.depositApy.toFixed(2)}%</td>
                <td className="px-6 py-4 text-amber-300">{asset.borrowApy.toFixed(2)}%</td>
                <td className="px-6 py-4">{formatUsd(asset.liquidity)}</td>
                <td className="px-6 py-4">{asset.utilization}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
