"""Live, credential-safe smoke test for every configured Wander Pico provider."""

import asyncio

import httpx

from app.config import Settings
from app.google_maps import GoogleMapsClient
from app.models import AISelection
from app.ollama import OllamaClient
from app.providers import CATALOG, CompatibleClient

AGENT_CONTEXT = {
    "message": "Find one quiet coffee shop in Bandung.",
    "history": [],
    "observations": [],
    "tools_remaining": 8,
}


async def test_agent(client):
    events = []
    action = await client.agent_step_stream(AGENT_CONTEXT, events.append)
    if action.get("action") not in {"search", "details", "finish"}:
        raise RuntimeError("provider returned an invalid agent action")


async def smoke_test() -> int:
    settings = Settings()
    failures = 0
    async with httpx.AsyncClient(
        follow_redirects=False,
        headers={"User-Agent": "wander-pico-smoke-test/1.0"},
    ) as http:
        for provider, item in CATALOG.items():
            model = getattr(settings, f"{provider}_model", item["model"])
            try:
                if provider == "ollama":
                    if not await OllamaClient(http, settings).is_reachable():
                        print(f"SKIP  {item['name']}: Ollama is not running")
                        continue
                    local = OllamaClient(http, settings)
                    result = await local.test_connection()
                    await test_agent(local)
                    print(f"PASS  {item['name']}: {result['model']}")
                    continue

                key = Settings.reveal(getattr(settings, f"{provider}_api_key", None))
                if not key:
                    print(f"SKIP  {item['name']}: no API key configured")
                    continue
                selection = AISelection(provider=provider, model=model)
                await test_agent(CompatibleClient(http, settings, selection))
                print(f"PASS  {item['name']}: {model}")
            except Exception as error:
                failures += 1
                print(f"FAIL  {item['name']}: {error}")
                if provider != "ollama" and key:
                    try:
                        catalog = await http.get(
                            f"{item['url']}/models",
                            headers={"Authorization": f"Bearer {key}"},
                            timeout=20,
                        )
                        if catalog.is_success:
                            choices = [
                                entry.get("id")
                                for entry in catalog.json().get("data", [])
                                if isinstance(entry.get("id"), str)
                            ]
                            print(
                                f"INFO  {item['name']} models: "
                                + ", ".join(choices[:20])
                            )
                            probe_model = choices[0] if provider == "gemini" else model
                            probe = await http.post(
                                f"{item['url']}/chat/completions",
                                headers={"Authorization": f"Bearer {key}"},
                                json={
                                    "model": probe_model,
                                    "messages": [
                                        {"role": "user", "content": "Reply READY."}
                                    ],
                                    "stream": False,
                                },
                                timeout=30,
                            )
                            if probe.is_success:
                                print(
                                    f"INFO  {item['name']} accepted model: "
                                    f"{probe_model}"
                                )
                            else:
                                body = probe.json() if probe.content else {}
                                error = body.get("error", {}) if isinstance(body, dict) else {}
                                reason = str(
                                    error.get("message")
                                    or error.get("type")
                                    or f"HTTP {probe.status_code}"
                                ).replace(key, "[redacted]")
                                print(
                                    f"INFO  {item['name']} probe: HTTP "
                                    f"{probe.status_code} · {reason[:240]}"
                                )
                        else:
                            print(
                                f"INFO  {item['name']} model catalog returned "
                                f"HTTP {catalog.status_code}"
                            )
                    except Exception:
                        print(f"INFO  {item['name']} model catalog unavailable")

        if Settings.reveal(settings.google_places_api_key):
            try:
                await GoogleMapsClient(http, settings).test_connection()
                print("PASS  Google Places: live search request accepted")
            except Exception as error:
                failures += 1
                print(f"FAIL  Google Places: {error}")
        else:
            print("SKIP  Google Places: no API key configured")

    return failures


if __name__ == "__main__":
    raise SystemExit(asyncio.run(smoke_test()))
