export type UUID = string;
export type DecimalString = string;

export type UserRole = 'user' | 'admin';
export type WalletStatus = 'pending' | 'verified' | 'revoked';
export type OperationStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type OperationType = 'deposit' | 'borrow' | 'repay' | 'withdraw' | 'wallet_link';

export interface WalletIdentityDto {
  address: string;
  chainId: number;
  status: WalletStatus;
}

export interface UserDto {
  id: UUID;
  email: string | null;
  displayName: string;
  role: UserRole;
  wallets: WalletIdentityDto[];
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto extends AuthTokensDto {
  user: UserDto;
}

export interface WalletChallengeRequestDto {
  address: string;
  chainId: number;
  intent?: 'login' | 'link';
}

export interface WalletChallengeResponseDto {
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface DepositRequestDto {
  assetSymbol: string;
  amount: DecimalString;
  collateralEnabled?: boolean;
}

export interface BorrowRequestDto {
  assetSymbol: string;
  amount: DecimalString;
}

export interface MarketDto {
  poolId: UUID;
  symbol: string;
  name: string;
  totalSupplied: DecimalString;
  totalBorrowed: DecimalString;
  utilizationRatio: number;
  supplyApy: number;
  borrowApy: number;
  priceUsd: number;
  ltvBps: number;
  liquidationThresholdBps: number;
}

export interface PositionDto {
  assetSymbol: string;
  principalAmount: DecimalString;
  accruedInterest: DecimalString;
  apy: number;
  collateralEnabled?: boolean;
}

export interface DashboardSummaryDto {
  collateralUsd: number;
  borrowedUsd: number;
  availableToBorrowUsd: number;
  healthFactor: number | null;
  netApy: number;
}

export interface DashboardDto {
  summary: DashboardSummaryDto;
  deposits: PositionDto[];
  borrows: PositionDto[];
  markets: MarketDto[];
}

export interface OperationResponseDto {
  operationId: UUID;
  status: OperationStatus;
  dashboard: DashboardDto;
}

export type AuthUser = {
  id: string | number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
};

export type HealthResponse = {
  status: 'ok';
  storage: 'memory' | 'sqlite' | 'postgres' | string;
  uptime: number;
  timestamp: string;
};

export type MarketAsset = {
  symbol: string;
  name: string;
  supplied: number;
  borrowed: number;
  depositApy: number;
  borrowApy: number;
  liquidity: number;
  utilization: number;
  walletBalance: number;
};

export type PortfolioSummary = {
  totalDepositedUsd: number;
  totalBorrowedUsd: number;
  healthFactor: number;
  netApy: number;
};

export const apiRoutes = {
  health: '/api/v1/health',
  register: '/api/v1/auth/register',
  login: '/api/v1/auth/login',
  refresh: '/api/v1/auth/refresh',
  logout: '/api/v1/auth/logout',
  me: '/api/v1/auth/me',
} as const;
