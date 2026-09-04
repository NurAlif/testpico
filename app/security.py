import asyncio
import hmac
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from app.config import Settings

PUBLIC_PATHS = {"/", "/health", "/api/config", "/favicon.ico"}


def _client_id(request: Request) -> str:
    # Trust proxy headers only when a known reverse proxy sanitizes them. Using
    # request.client by default prevents callers from spoofing their rate-limit key.
    return request.client.host if request.client else "unknown"


class SlidingWindowLimiter:
    """Small single-process limiter. Use Redis/edge limits when running multiple workers."""

    def __init__(self, requests: int, window_seconds: int) -> None:
        self.requests = requests
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def check(self, key: str) -> int:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        async with self._lock:
            events = self._events[key]
            while events and events[0] <= cutoff:
                events.popleft()
            if len(events) >= self.requests:
                retry_after = max(1, int(self.window_seconds - (now - events[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded",
                    headers={"Retry-After": str(retry_after)},
                )
            events.append(now)
            return self.requests - len(events)


def verify_api_key(request: Request, settings: Settings) -> None:
    expected = Settings.reveal(settings.app_api_key)
    if not expected:
        return

    authorization = request.headers.get("authorization", "")
    bearer = authorization[7:] if authorization.lower().startswith("bearer ") else ""
    supplied = bearer or request.headers.get("x-api-key", "")
    if not supplied or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")


def security_headers(response_headers: dict[str, str]) -> None:
    response_headers.update(
        {
            "Content-Security-Policy": (
                "default-src 'self'; frame-src https://www.google.com; "
                "img-src 'self' data: https:; style-src 'self'; script-src 'self'; "
                "connect-src 'self'; base-uri 'none'; frame-ancestors 'self'; form-action 'self'"
            ),
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "SAMEORIGIN",
            "Permissions-Policy": "geolocation=(self), camera=(), microphone=()",
        }
    )

