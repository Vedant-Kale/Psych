-- One row per accepted order. `key` = sha256(ip|secret|utc-day): never the raw IP, and it changes every UTC day.
CREATE TABLE rate_limits (
  key TEXT NOT NULL,
  ts INTEGER NOT NULL -- epoch ms
);
CREATE INDEX rate_limits_key_ts ON rate_limits (key, ts);
CREATE INDEX rate_limits_ts ON rate_limits (ts);

-- Daily count of model calls, capped atomically.
CREATE TABLE ai_budget (
  day TEXT PRIMARY KEY, -- UTC date, YYYY-MM-DD
  calls INTEGER NOT NULL DEFAULT 0
);

-- Orders nothing in the content supports. Text only: no IP, no key.
CREATE TABLE unknown_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL -- epoch ms
);
CREATE INDEX unknown_questions_created_at ON unknown_questions (created_at);
