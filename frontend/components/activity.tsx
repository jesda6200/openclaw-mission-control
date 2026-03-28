import { Panel, Pill } from '@/components/ui';

export function RecentActivity({ items }: { items: Array<{ id: string; type: string; asset: string; amount: string; time: string; status: string }> }) {
  return (
    <Panel className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Recent activity</h3>
        <p className="text-sm text-slate-400">Polished transaction feed with ready-to-wire backend states.</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
            <div>
              <p className="font-medium text-white">{item.type} • {item.asset}</p>
              <p className="text-sm text-slate-400">{item.amount} • {item.time} ago</p>
            </div>
            <Pill tone={item.status === 'Completed' ? 'success' : 'warning'}>{item.status}</Pill>
          </div>
        ))}
      </div>
    </Panel>
  );
}
