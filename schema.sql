-- LME konto-database (Cloudflare D1)
-- Kjør denne i Cloudflare: Workers & Pages -> D1 -> (din database) -> Console.

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  pass_salt   TEXT NOT NULL,
  pass_hash   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'customer',  -- 'customer' eller 'owner'
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL,
  plan               TEXT,
  status             TEXT NOT NULL DEFAULT 'none',   -- 'active','cancelled','none'
  provider           TEXT,                           -- 'stripe','paypal','vipps'
  current_period_end INTEGER,
  created_at         INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT,
  amount_ore  INTEGER,
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sub_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_user ON purchases(user_id);
