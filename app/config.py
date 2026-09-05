from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "WanderAI"
    ai_provider: Literal["ollama", "gemini"] = "ollama"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3.5:9b"
    ollama_context_length: int = Field(default=8192, ge=1024)
    ollama_request_timeout_seconds: float = Field(default=120, ge=5, le=600)
    app_api_key: SecretStr | None = None
    history_database_path: Path = Path("data/wanderai.sqlite3")

    gemini_api_key: SecretStr | None = None
    gemini_model: str = "gemini-2.5-flash"
    gemini_request_timeout_seconds: float = Field(default=120, ge=5, le=600)
    api_model_name: str = "qwen3.5:9b-maps"

    google_places_api_key: SecretStr | None = None
    google_maps_embed_api_key: SecretStr | None = None
    google_request_timeout_seconds: float = Field(default=25, ge=1, le=30)
    max_place_results: int = Field(default=5, ge=1, le=10)

    cors_origins: str = "http://localhost:8001,http://127.0.0.1:8001"
    trusted_hosts: str = "localhost,127.0.0.1,maps-api"
    rate_limit_requests: int = Field(default=30, ge=1, le=10_000)
    rate_limit_window_seconds: int = Field(default=60, ge=1, le=3600)

    @property
    def allowed_origins(self) -> list[str]:
        return [
            value.strip().rstrip("/")
            for value in self.cors_origins.split(",")
            if value.strip()
        ]

    @property
    def allowed_hosts(self) -> list[str]:
        return [value.strip() for value in self.trusted_hosts.split(",") if value.strip()]

    @staticmethod
    def reveal(value: SecretStr | None) -> str | None:
        return value.get_secret_value() if value else None


@lru_cache
def get_settings() -> Settings:
    return Settings()
