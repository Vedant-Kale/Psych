-- One row per answered order that carried a conversation id. Full text, kept 30 days, no IP and no account.
CREATE TABLE turns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL, -- random per browser tab, 22-64 chars
  seq INTEGER NOT NULL, -- 1, 2, 3 … within the conversation
  text TEXT NOT NULL,
  kind TEXT NOT NULL, -- mix | fact | none
  chunk_ids TEXT NOT NULL, -- JSON array of the evidence ids retrieved for this order
  created_at INTEGER NOT NULL -- epoch ms
);
CREATE INDEX turns_conversation_seq ON turns (conversation_id, seq);
CREATE INDEX turns_created_at ON turns (created_at);

-- What a visitor did with an answer (filled by the signals ticket). Same retention as turns.
CREATE TABLE signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  turn_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  created_at INTEGER NOT NULL -- epoch ms
);
CREATE INDEX signals_conversation ON signals (conversation_id);
CREATE INDEX signals_created_at ON signals (created_at);
