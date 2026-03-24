-- Timescale schema minimal pour prices hypertable
CREATE TABLE IF NOT EXISTS prices (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  time TIMESTAMPTZ NOT NULL,
  price NUMERIC(30,10) NOT NULL,
  volume NUMERIC(30,10),
  source TEXT,
  metadata JSONB
);

SELECT create_hypertable('prices', 'time', if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS symbols (
  symbol TEXT PRIMARY KEY,
  base TEXT,
  quote TEXT,
  active BOOLEAN DEFAULT TRUE,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  symbol TEXT,
  condition JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
