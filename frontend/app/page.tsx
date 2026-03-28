import { AuthWalletCard } from '@/components/auth-wallet';
import { LendingActions } from '@/components/actions';
import { MarketsTable, StatCards } from '@/components/dashboard';
import { RecentActivity } from '@/components/activity';
import { Panel, SectionTitle, Shell, Pill } from '@/components/ui';
import { marketAssets, portfolioSummary, recentActivity } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <Shell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Panel className="overflow-hidden p-0">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div className="space-y-6">
              <Pill tone="success">Production-ready UI shell</Pill>
              <SectionTitle
                eyebrow="NebulaLend"
                title="Premium crypto lending experience, distilled for a fast MVP."
                subtitle="Next.js + Tailwind frontend for a simplified Aave-style platform with email auth, MetaMask onboarding, market views, lending actions, responsive dashboard and backend REST integration points."
              />
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Institutions-ready UX', 'Dark premium visuals, responsive surfaces, reusable cards'],
                  ['Backend connected', 'Health/auth wired against Node.js REST API'],
                  ['Composable architecture', 'Shared contracts package and clean monorepo structure'],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="font-medium text-white">{title}</p>
                    <p className="mt-2 text-sm text-slate-400">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
            <AuthWalletCard />
          </div>
        </Panel>

        <StatCards summary={portfolioSummary} />

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <MarketsTable assets={marketAssets} />
          <div className="space-y-6">
            <LendingActions assets={marketAssets} />
            <RecentActivity items={recentActivity} />
          </div>
        </div>
      </div>
    </Shell>
  );
}
