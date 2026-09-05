"""Encrypted, account-scoped provider credentials. Never return plaintext to the UI."""
import base64
import os
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from fastapi import HTTPException
from pydantic import SecretStr

from app.config import Settings


class ProviderVault:
    def __init__(self, settings):
        encoded = Settings.reveal(settings.provider_encryption_key)
        if encoded:
            key = base64.b64decode(encoded, validate=True)
        else:
            path = Path(settings.history_database_path).parent / 'provider-encryption.key'
            path.parent.mkdir(parents=True, exist_ok=True)
            try:
                descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            except FileExistsError:
                key = base64.b64decode(path.read_bytes(), validate=True)
            else:
                key = os.urandom(32)
                with os.fdopen(descriptor, 'wb') as file:
                    file.write(base64.b64encode(key))
        if len(key) != 32:
            raise ValueError('PROVIDER_ENCRYPTION_KEY must be a base64-encoded 32-byte key')
        self.cipher = AESGCM(key)

    def encrypt(self, user_id, provider, key):
        nonce = os.urandom(12)
        encrypted = self.cipher.encrypt(nonce, key.encode(), f'{user_id}:{provider}'.encode())
        return base64.b64encode(nonce + encrypted).decode()

    def decrypt(self, user_id, provider, value):
        try:
            data = base64.b64decode(value, validate=True)
            return self.cipher.decrypt(data[:12], data[12:], f'{user_id}:{provider}'.encode()).decode()
        except Exception as exc:
            raise HTTPException(503, 'Saved API key cannot be read. Restore the encryption key or replace the saved API key.') from exc

    def encrypt_instance(self, name, value):
        """Encrypt a local instance secret without tying it to a user account."""
        nonce = os.urandom(12)
        encrypted = self.cipher.encrypt(nonce, value.encode(), f'instance:{name}'.encode())
        return base64.b64encode(nonce + encrypted).decode()

    def decrypt_instance(self, name, value):
        try:
            data = base64.b64decode(value, validate=True)
            return self.cipher.decrypt(
                data[:12], data[12:], f'instance:{name}'.encode()
            ).decode()
        except Exception as exc:
            raise HTTPException(
                503,
                'Saved local setup secrets cannot be read. Restore the encryption key or run setup again.',
            ) from exc


async def resolve_selection(request, selection):
    if selection is None or Settings.reveal(selection.api_key) or selection.provider == 'ollama':
        return selection
    state = request.app.state
    encrypted = await state.accounts.run('provider_key', request.state.user_id, selection.provider)
    if encrypted:
        key = state.provider_vault.decrypt(request.state.user_id, selection.provider, encrypted)
        return selection.model_copy(update={'api_key': SecretStr(key)})
    return selection
