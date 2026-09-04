import asyncio

import pytest
from fastapi import HTTPException

from app.security import SlidingWindowLimiter


def test_limiter_rejects_request_over_window_limit():
    async def run() -> None:
        limiter = SlidingWindowLimiter(requests=2, window_seconds=60)
        await limiter.check("client")
        await limiter.check("client")
        with pytest.raises(HTTPException) as error:
            await limiter.check("client")
        assert error.value.status_code == 429
        assert error.value.headers["Retry-After"]

    asyncio.run(run())

