CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, username TEXT NOT NULL COLLATE NOCASE UNIQUE,
 email TEXT COLLATE NOCASE UNIQUE, password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL
);
ALTER TABLE conversations ADD COLUMN user_id TEXT REFERENCES users(id);
CREATE INDEX conversations_owner ON conversations(user_id);
CREATE TABLE IF NOT EXISTS auth_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);

INSERT OR IGNORE INTO users VALUES ('seed-testpico','testpico',NULL,'759a7e75acf0de2bc29e2e84c6cc4770:de568bce51e3e3a5618d921417c081fbd87fd9f3a84947384d258f06f4753877');
UPDATE conversations SET user_id='seed-testpico' WHERE user_id IS NULL;
