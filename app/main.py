import asyncio
import json
import time
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from app.config import Settings, get_settings
from app.google_maps import GoogleMapsClient
from app.models import (
    ChatRequest,
    ChatResponse,
    DirectionsRequest,
    DirectionsResponse,
    OpenAIChatRequest,
    Place,
    PlaceSearchRequest,
)
from app.ollama import OllamaClient
from app.security import PUBLIC_PATHS, SlidingWindowLimiter, security_headers, verify_api_key
from app.service import PlacesAssistant

STATIC_DIR = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    client = httpx.AsyncClient(
        limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
        follow_redirects=False,
        headers={"User-Agent": "ollama-maps-assistant/1.0"},
    )
    maps = GoogleMapsClient(client, settings)
    ollama = OllamaClient(client, settings)
    app.state.settings = settings
    app.state.http_client = client
    app.state.maps = maps
    app.state.ollama = ollama
    app.state.assistant = PlacesAssistant(ollama, maps)
    app.state.limiter = SlidingWindowLimiter(
        settings.rate_limit_requests, settings.rate_limit_window_seconds
    )
    yield
    await client.aclose()


app = FastAPI(
    title="Ollama Maps Assistant API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-API-Key"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)


@app.middleware("http")
async def protect_api(request: Request, call_next):
    if request.url.path.startswith(("/api/", "/v1/")) and request.url.path not in PUBLIC_PATHS:
        verify_api_key(request, request.app.state.settings)
        await request.app.state.limiter.check(request.client.host if request.client else "unknown")
    response = await call_next(request)
    security_headers(response.headers)
    return response


@app.exception_handler(HTTPException)
async def http_error_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    response = JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    for key, value in (exc.headers or {}).items():
        response.headers[key] = value
    security_headers(response.headers)
    return response


@app.get("/", include_in_schema=False)
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/health")
async def health(request: Request) -> dict[str, object]:
    settings: Settings = request.app.state.settings
    return {
        "status": "ok",
        "model": settings.ollama_model,
        "ollama_available": await request.app.state.ollama.is_available(),
        "places_configured": bool(Settings.reveal(settings.google_places_api_key)),
        "embed_configured": bool(Settings.reveal(settings.google_maps_embed_api_key)),
    }


@app.get("/api/config")
async def public_config(request: Request) -> dict[str, object]:
    settings: Settings = request.app.state.settings
    return {
        "api_auth_required": bool(Settings.reveal(settings.app_api_key)),
        "maps_configured": request.app.state.maps.configured,
        "embed_configured": request.app.state.maps.embed_configured,
        "max_place_results": settings.max_place_results,
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    return await request.app.state.assistant.chat(payload)


@app.post("/api/places/search", response_model=list[Place])
async def search_places(payload: PlaceSearchRequest, request: Request) -> list[Place]:
    return await request.app.state.maps.search_text(
        payload.query,
        origin=payload.origin,
        travel_mode=payload.travel_mode,
        open_now=payload.open_now,
        language_code=payload.language_code,
    )


@app.post("/api/maps/directions", response_model=DirectionsResponse)
async def directions(payload: DirectionsRequest, request: Request) -> DirectionsResponse:
    embed_url, maps_url = request.app.state.maps.directions_urls(
        payload.place_id, payload.origin, payload.travel_mode, payload.destination
    )
    return DirectionsResponse(embed_url=embed_url, google_maps_url=maps_url)


@app.get("/v1/models")
async def openai_models(request: Request) -> dict[str, object]:
    model = request.app.state.settings.api_model_name
    return {"object": "list", "data": [{"id": model, "object": "model", "owned_by": "local"}]}


def _openai_text(response: ChatResponse) -> str:
    if not response.places:
        return response.answer
    links = "\n".join(f"- [{place.name}]({place.google_maps_url})" for place in response.places)
    return f"{response.answer}\n\n### Maps and directions\n{links}"


@app.post("/v1/chat/completions")
async def openai_chat(payload: OpenAIChatRequest, request: Request):
    user_messages = [message for message in payload.messages if message.role == "user"]
    if not user_messages:
        raise HTTPException(status_code=400, detail="At least one user message is required")
    latest = user_messages[-1]
    history = payload.messages[:-1][-20:]
    result = await request.app.state.assistant.chat(
        ChatRequest(message=latest.content, history=history)
    )
    content = _openai_text(result)
    completion_id = f"chatcmpl-{uuid.uuid4().hex}"
    created = int(time.time())
    model = request.app.state.settings.api_model_name

    if not payload.stream:
        return {
            "id": completion_id,
            "object": "chat.completion",
            "created": created,
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": content},
                    "finish_reason": "stop",
                }
            ],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        }

    async def events() -> AsyncIterator[str]:
        chunk = {
            "id": completion_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "delta": {"role": "assistant", "content": content},
                    "finish_reason": None,
                }
            ],
        }
        yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0)
        chunk["choices"][0] = {"index": 0, "delta": {}, "finish_reason": "stop"}
        yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(events(), media_type="text/event-stream")


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
