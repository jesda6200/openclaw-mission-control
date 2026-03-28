SET search_path TO lending, public;

INSERT INTO assets (symbol, name, decimals, is_active, is_collateral)
VALUES
  ('USDC', 'USD Coin', 6, TRUE, TRUE),
  ('ETH', 'Ether', 18, TRUE, TRUE),
  ('WBTC', 'Wrapped Bitcoin', 8, TRUE, TRUE)
ON CONFLICT (symbol) DO NOTHING;

INSERT INTO pools (
  asset_id,
  status,
  ltv_bps,
  liquidation_threshold_bps,
  liquidation_bonus_bps,
  reserve_factor_bps,
  base_rate_bps,
  slope1_bps,
  slope2_bps,
  kink_bps,
  total_supplied,
  total_borrowed,
  utilization_ratio,
  supply_apy,
  borrow_apy
)
SELECT id, 'active', 8000, 8500, 500, 1000, 200, 800, 6000, 8000, 0, 0, 0, 0.00, 0.02
FROM assets
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO price_feeds (asset_id, price_usd, source, as_of)
SELECT id,
  CASE symbol
    WHEN 'USDC' THEN 1.00
    WHEN 'ETH' THEN 3500.00
    WHEN 'WBTC' THEN 65000.00
  END,
  'mock',
  NOW()
FROM assets;

INSERT INTO users (email, password_hash, display_name, role, email_verified_at)
VALUES ('demo@lending.local', '$2b$10$replace.with.real.bcrypt.hash', 'Demo User', 'user', NOW())
ON CONFLICT (email) DO NOTHING;
