-- What the bar has learned about each piece of evidence: a weight around 1.0, kept between 0.5 and 2.0.
-- Aggregate only: no text, no conversation id. Kept, and pulled back toward its reviewed base a little every day.
CREATE TABLE chunk_weights (
  chunk_id TEXT PRIMARY KEY,
  weight REAL NOT NULL,
  updated_at INTEGER NOT NULL -- epoch ms
);

-- How far each conversation (and each UTC day, as the key "day:YYYY-MM-DD") has already moved a chunk's weight.
-- This is what caps one visitor at 0.05 and one day at 0.2. Purged after 30 days with the conversations.
CREATE TABLE weight_moves (
  conversation_id TEXT NOT NULL,
  chunk_id TEXT NOT NULL,
  moved REAL NOT NULL, -- total absolute movement so far
  created_at INTEGER NOT NULL, -- epoch ms
  PRIMARY KEY (conversation_id, chunk_id)
);
CREATE INDEX weight_moves_created_at ON weight_moves (created_at);
