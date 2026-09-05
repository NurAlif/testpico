CREATE TABLE IF NOT EXISTS provider_keys (
  user_id TEXT NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  PRIMARY KEY (user_id, provider)
);
