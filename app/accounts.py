import asyncio
import hashlib
import hmac
import secrets
import sqlite3
import time
import uuid

from fastapi import HTTPException


def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 100000).hex()
    return f"{salt}:{digest}"


class AccountStore:
    def __init__(self, path):
        self.path = path

    async def run(self, action, *args):
        return await asyncio.to_thread(getattr(self, action), *args)

    def initialize(self):
        with sqlite3.connect(self.path) as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,
                  username TEXT NOT NULL COLLATE NOCASE UNIQUE, email TEXT COLLATE NOCASE UNIQUE,
                  password_hash TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS provider_keys (user_id TEXT NOT NULL REFERENCES users(id),
                  provider TEXT NOT NULL, encrypted_key TEXT NOT NULL, PRIMARY KEY(user_id,provider));
                CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY,
                  user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL);
                CREATE TABLE IF NOT EXISTS app_settings (
                  key TEXT PRIMARY KEY, value TEXT NOT NULL
                );
            """)
            if "user_id" not in [r[1] for r in db.execute("PRAGMA table_info(conversations)")]:
                db.execute("ALTER TABLE conversations ADD COLUMN user_id TEXT REFERENCES users(id)")
            db.execute(
                "INSERT OR IGNORE INTO users VALUES (?, ?, NULL, ?)",
                ("seed-testpico", "testpico", password_hash("testpico")),
            )
            db.execute("UPDATE conversations SET user_id='seed-testpico' WHERE user_id IS NULL")

    def register(self, username, email, password):
        try:
            with sqlite3.connect(self.path) as db:
                db.execute(
                    "INSERT INTO users VALUES (?, ?, ?, ?)",
                    (str(uuid.uuid4()), username.lower(), email.lower(), password_hash(password)),
                )
        except sqlite3.IntegrityError:
            raise HTTPException(409, "Username or email is already registered") from None

    def login(self, identifier, password):
        with sqlite3.connect(self.path) as db:
            user = db.execute(
                "SELECT id, username, password_hash FROM users "
                "WHERE username=? COLLATE NOCASE OR email=? COLLATE NOCASE",
                (identifier, identifier),
            ).fetchone()
            expected = user[2] if user else password_hash("invalid-password", "00" * 16)
            if (
                not hmac.compare_digest(password_hash(password, expected.split(":")[0]), expected)
                or not user
            ):
                raise HTTPException(401, "Invalid username/email or password")
            token = secrets.token_hex(32)
            db.execute("DELETE FROM sessions WHERE expires_at < ?", (int(time.time()),))
            db.execute(
                "INSERT INTO sessions VALUES (?, ?, ?)",
                (hashlib.sha256(token.encode()).hexdigest(), user[0], int(time.time()) + 28800),
            )
            return {"token": token, "username": user[1]}

    def authenticate(self, token):
        with sqlite3.connect(self.path) as db:
            row = db.execute(
                "SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>?",
                (hashlib.sha256(token.encode()).hexdigest(), int(time.time())),
            ).fetchone()
        if not row:
            raise HTTPException(401, "Please log in to continue")
        return row[0]

    def logout(self, token):
        with sqlite3.connect(self.path) as db:
            db.execute(
                "DELETE FROM sessions WHERE token_hash=?",
                (hashlib.sha256(token.encode()).hexdigest(),),
            )

    def own(self, conversation_id, user_id):
        with sqlite3.connect(self.path) as db:
            row = db.execute(
                "SELECT id FROM conversations WHERE id=? AND user_id=?", (conversation_id, user_id)
            ).fetchone()
        if not row:
            raise HTTPException(404, "Conversation not found")

    def create(self, user_id):
        conversation_id = str(uuid.uuid4())
        with sqlite3.connect(self.path) as db:
            db.execute(
                "INSERT INTO conversations (id,user_id) VALUES (?,?)", (conversation_id, user_id)
            )
        return conversation_id

    def conversations(self, user_id):
        with sqlite3.connect(self.path) as db:
            db.row_factory = sqlite3.Row
            return [
                dict(row)
                for row in db.execute(
                    """SELECT c.id,
                COALESCE((SELECT substr(content,1,80) FROM messages
                WHERE conversation_id=c.id AND role='user'
                ORDER BY id LIMIT 1),'New chat') AS title,
                COALESCE((SELECT MAX(created_at) FROM messages
                WHERE conversation_id=c.id),c.created_at) AS updated_at
                FROM conversations c WHERE user_id=? ORDER BY updated_at DESC, c.rowid DESC""",
                    (user_id,),
                )
            ]

    def provider_key(self, user_id, provider):
        with sqlite3.connect(self.path) as db:
            row = db.execute('SELECT encrypted_key FROM provider_keys WHERE user_id=? AND provider=?', (user_id, provider)).fetchone()
        return row[0] if row else None

    def provider_key_status(self, user_id):
        with sqlite3.connect(self.path) as db:
            return [row[0] for row in db.execute('SELECT provider FROM provider_keys WHERE user_id=?', (user_id,))]

    def save_provider_key(self, user_id, provider, encrypted):
        with sqlite3.connect(self.path) as db:
            if encrypted is None:
                db.execute('DELETE FROM provider_keys WHERE user_id=? AND provider=?', (user_id, provider))
            else:
                db.execute('INSERT INTO provider_keys VALUES (?,?,?) ON CONFLICT(user_id,provider) DO UPDATE SET encrypted_key=excluded.encrypted_key', (user_id, provider, encrypted))

    def app_setting(self, key):
        with sqlite3.connect(self.path) as db:
            row = db.execute('SELECT value FROM app_settings WHERE key=?', (key,)).fetchone()
        return row[0] if row else None

    def save_app_setting(self, key, value):
        with sqlite3.connect(self.path) as db:
            db.execute(
                'INSERT INTO app_settings VALUES (?,?) '
                'ON CONFLICT(key) DO UPDATE SET value=excluded.value',
                (key, value),
            )
