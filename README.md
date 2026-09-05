# WanderAI

A secure-by-default FastAPI backend and small web UI that lets local Ollama recognize
place-finding prompts, ground recommendations in Google Places results, and open each
location in Google Maps.

## Google APIs you need

The built-in UI requires one private key. A second key is optional for API clients that
need embedded maps:

| Environment variable | Enable/restrict to | Application restriction | Exposure |
|---|---|---|---|
| `GOOGLE_PLACES_API_KEY` | **Places API (New)** only | **IP addresses**: the backend server's fixed outbound public IP | Private; backend only |
| `GOOGLE_MAPS_EMBED_API_KEY` (optional) | **Maps Embed API** only | **Websites**: exact local and production referrers | Visible in returned iframe URLs by design |

This implementation does **not** need Maps JavaScript API, Routes API, Directions API
(Legacy), or Geocoding API. Places Text Search finds candidates; standard Google Maps URLs
and Maps Embed place views open each location without exposing the private Places key.

## Google Cloud Console setup

1. Open [Google Cloud Console](https://console.cloud.google.com/), create or select a
   dedicated project, and attach a billing account.
2. Open **APIs & Services → Library** and enable **Places API (New)**.
3. Open **APIs & Services → Credentials → Create credentials → API key**.
4. Edit that server key:
   - Name: `places-backend`.
   - Application restrictions: **IP addresses**.
   - Add the public outbound IP/CIDR of the machine that runs this backend. Do not add
     its private LAN address. If the server has a dynamic outbound IP, give it a fixed
     egress IP before production.
   - API restrictions: **Restrict key → Places API (New)**.
5. Optional: enable **Maps Embed API**, create a separate browser key, then configure it:
   - Name: `maps-embed-browser`.
   - Application restrictions: **Websites**.
   - Development referrers: `http://localhost:8001/*` and
     `http://127.0.0.1:8001/*`.
   - Production referrer: `https://maps.example.com/*` (replace with the real origin).
   - API restrictions: **Restrict key → Maps Embed API**.
6. Open **APIs & Services → Enabled APIs & services → Places API (New) → Quotas &
   System Limits**. Set a conservative Text Search requests-per-minute quota based on
   expected traffic. Raise it only after observing real usage.
7. Open **Billing → Budgets & alerts**, create a low monthly budget, and add notification
   thresholds (for example 50%, 80%, and 100%). A budget alert is not a hard spending
   cap; quota limits are the control that actually rejects excess API requests.
8. In **Monitoring**, add quota/usage alerts and periodically check for requests from
   unexpected sources. Disable any Maps APIs the project does not use.

Never reuse the private Places key as the optional browser embed key.

## Saved chat history

WanderAI stores chat history on the server in SQLite at `data/wanderai.sqlite3` by
default. Set `HISTORY_DATABASE_PATH` to place the database on a persistent volume in
production, and include it in your normal encrypted backup routine. Google Places
cards, photos, and photo references are intentionally not stored: they are live
content subject to Google's caching and attribution policies, so a saved place search
is refreshed when it is run again.

## Run locally

Python 3.11+ is required.

```powershell
Copy-Item .env.example .env
# Edit .env and paste the restricted Google Places key.
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Open <http://localhost:8001>. The interactive Swagger API reference is at
<http://localhost:8001/docs>. When `APP_API_KEY` is set, use the **Authorize**
button in the top-right corner to enter the key (as `Bearer <key>` or
`X-API-Key`); the docs page itself stays publicly reachable.

Local runs default to `AI_PROVIDER=ollama`, using `http://localhost:11434` and
`OLLAMA_MODEL=qwen3.5:9b`. Start Ollama and install that model with
`ollama pull qwen3.5:9b` before starting the backend. There is no automatic cloud
fallback. Google Places searches still use the configured Google Places API.
Compose connects to Ollama on the host through `host.docker.internal:11434`.

To explicitly opt into Gemini for a native Python run, set `AI_PROVIDER=gemini`
and `GEMINI_API_KEY`. The hosted Worker has its own independent AI configuration.

## Docker and optional Open WebUI

```powershell
docker compose up -d --build maps-api
```

To also start Open WebUI:

```powershell
docker compose --profile open-webui up -d --build
```

Open WebUI is then at <http://localhost:3000>. Create the first admin account, then go to
**Settings → Admin → Connections → Manage OpenAI API Connections → Add Connection**:

- URL from inside Compose: `http://maps-api:8001/v1`
- URL if Open WebUI is elsewhere: `http://host.docker.internal:8001/v1` or the backend's
  HTTPS URL
- API key: the value of `APP_API_KEY` (set a long random value in production)
- Model filter, if needed: `API_MODEL_NAME`, default `qwen3.5:9b-maps`

Open WebUI receives the answer and safe Google Maps links through the
OpenAI-compatible endpoint. The included UI at port 8001 provides verified place cards with
Google Photos, live embedded map previews when configured, direct Maps links as a fallback,
and a photo gallery for each place.

## API examples

```powershell
$headers = @{ Authorization = "Bearer $env:APP_API_KEY" }
$body = @{
  message = "Find good ramen near Blok M, Jakarta"
} | ConvertTo-Json
Invoke-RestMethod http://localhost:8001/api/chat -Method Post `
  -Headers $headers -ContentType application/json -Body $body
```

Key endpoints:

- `POST /api/chat` — LLM intent detection, Places lookup, grounded answer, structured maps
- `POST /api/chat/stream` — same flow, but streams the answer as newline-delimited JSON
  (`{"type":"delta","text":"..."}` chunks followed by a final `{"type":"done","answer":"...","places":[...]}`)
- `POST /api/places/search` — direct bounded Places search
- `POST /api/places/photo` — resolves a place photo reference to a Google-hosted image URL
- `GET /v1/models` and `POST /v1/chat/completions` — OpenAI-compatible Open WebUI adapter
- `GET /health` — configuration status without revealing secrets

## Security and operating notes

- `.env` is ignored by Git. The private Places key is sent in an HTTPS header only and is
  never returned to the browser. Avoid logging request headers.
- If configured, the optional Embed key is browser-visible. Its website and API restrictions
  are its security boundary; do not use it for billable web-service APIs.
- `APP_API_KEY` is optional only for local development. Set it when reachable by other users
  and expose the service through HTTPS.
- The built-in limiter is intentionally single-process. For multiple replicas/workers, enforce
  per-user/IP limits at a reverse proxy/API gateway or use a Redis-backed limiter.
- Add the production hostname (and any internal reverse-proxy hostname) to `TRUSTED_HOSTS`;
  the defaults intentionally accept only localhost and the Compose service name.
- The backend caps results, uses a minimal Places field mask, validates input sizes and travel
  modes, applies outbound timeouts, and never accepts an arbitrary upstream URL.
- The provided SSH password is not stored or used. A hostname was not supplied, and password
  SSH should be replaced with an SSH key before deployment.

## Official references

- [Google Maps Platform security guidance](https://developers.google.com/maps/api-security-best-practices)
- [Places Text Search (New)](https://developers.google.com/maps/documentation/places/web-service/text-search)
- [Maps Embed API](https://developers.google.com/maps/documentation/embed/embedding-map)
- [Maps reporting and monitoring](https://developers.google.com/maps/reporting-and-monitoring/monitoring)
- [Open WebUI OpenAI-compatible connections](https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/starting-with-openai-compatible/)
- [Google GenAI SDK](https://ai.google.dev/gemini-api/docs/libraries)
- [Gemini Generate Content API](https://ai.google.dev/api/generate-content)
