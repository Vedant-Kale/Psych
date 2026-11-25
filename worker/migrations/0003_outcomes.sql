-- What happened after each answer. `score` follows decision #29; `vector` is the order's query embedding (JSON), kept so
-- the next order can be compared by meaning without another AI call. Both are purged with the turn after 30 days.
ALTER TABLE turns ADD COLUMN score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE turns ADD COLUMN vector TEXT;

-- One row per UTC day: counts only. No text, no conversation id, nothing that identifies a visitor, so it is kept
-- (the launch gates read it). Every column is a count.
CREATE TABLE daily_outcomes (
  day TEXT PRIMARY KEY, -- UTC date, YYYY-MM-DD
  turns INTEGER NOT NULL DEFAULT 0,
  followups INTEGER NOT NULL DEFAULT 0, -- orders that came after an earlier one in the same conversation
  reworded INTEGER NOT NULL DEFAULT 0,
  deeper INTEGER NOT NULL DEFAULT 0,
  new_topic INTEGER NOT NULL DEFAULT 0,
  yes INTEGER NOT NULL DEFAULT 0,
  no INTEGER NOT NULL DEFAULT 0,
  opened_source INTEGER NOT NULL DEFAULT 0,
  receipt INTEGER NOT NULL DEFAULT 0,
  interview INTEGER NOT NULL DEFAULT 0
);
