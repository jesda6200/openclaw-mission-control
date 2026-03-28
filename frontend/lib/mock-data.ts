import type { MarketAsset, PortfolioSummary } from '@lending/contracts';

export const marketAssets: MarketAsset[] = [
  { symbol: 'ETH', name: 'Ether', supplied: 24.8, borrowed: 10.4, depositApy: 4.9, borrowApy: 7.2, liquidity: 1820000, utilization: 41, walletBalance: 3.45 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', supplied: 5.1, borrowed: 1.7, depositApy: 2.8, borrowApy: 5.4, liquidity: 940000, utilization: 33, walletBalance: 0.42 },
  { symbol: 'USDC', name: 'USD Coin', supplied: 145000, borrowed: 82000, depositApy: 7.1, borrowApy: 10.5, liquidity: 3100000, utilization: 57, walletBalance: 12450 },
  { symbol: 'ARB', name: 'Arbitrum', supplied: 32000, borrowed: 12000, depositApy: 5.6, borrowApy: 8.8, liquidity: 760000, utilization: 38, walletBalance: 1800 },
];

export const portfolioSummary: PortfolioSummary = {
  totalDepositedUsd: 126540,
  totalBorrowedUsd: 42300,
  healthFactor: 2.84,
  netApy: 4.18,
};

export const recentActivity = [
  { id: '1', type: 'Deposit', asset: 'USDC', amount: '$12,000', time: '2 min', status: 'Completed' },
  { id: '2', type: 'Borrow', asset: 'ETH', amount: '4.2 ETH', time: '14 min', status: 'Pending' },
  { id: '3', type: 'Repay', asset: 'WBTC', amount: '0.08 WBTC', time: '1 h', status: 'Completed' },
];
