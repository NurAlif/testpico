#!/usr/bin/env bash
# Start the Ollama Maps Assistant locally.
# Usage: ./start.sh
# Stop it later with Ctrl+C (or: ./start.sh stop)
set -euo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-8001}"
HOST="${HOST:-127.0.0.1}"

stop() {
  local pid
  pid="$(netstat -ano 2>/dev/null | grep -E ":$PORT.*LISTEN" | awk '{print $NF}' | head -1 || true)"
  if [ -n "$pid" ]; then
    echo "Stopping app (PID $pid) on port $PORT..."
    taskkill //F //PID "$pid" >/dev/null 2>&1 || kill "$pid" 2>/dev/null || true
  else
    echo "No app running on port $PORT."
  fi
}

if [ "${1:-}" = "stop" ]; then
  stop
  exit 0
fi

# 1. Environment file
if [ ! -f .env ]; then
  echo "Creating .env from .env.example — edit it and add your GOOGLE_PLACES_API_KEY."
  cp .env.example .env
fi

# 2. Virtual environment
if [ ! -d .venv ]; then
  echo "Creating virtual environment..."
  python -m venv .venv
fi
if [ -f .venv/Scripts/activate ]; then
  # shellcheck disable=SC1091
  source .venv/Scripts/activate
else
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

# 3. Dependencies
if ! python -c "import fastapi, httpx, pydantic_settings, uvicorn" 2>/dev/null; then
  echo "Installing dependencies..."
  pip install -r requirements.txt
fi

# 4. Run
stop
echo "Starting app at http://$HOST:$PORT (docs: http://$HOST:$PORT/docs)"
exec uvicorn app.main:app --host "$HOST" --port "$PORT"