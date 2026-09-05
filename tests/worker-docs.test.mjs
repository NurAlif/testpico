import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "../worker/index.js";

test("serves an OpenAPI document at /api/openapi.json", async () => {
  const response = await worker.fetch(new Request("https://example.com/api/openapi.json"), {});
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/json/);
  const spec = await response.json();
  assert.equal(spec.openapi, "3.0.3");
  assert.equal(spec.info.title, "WanderAI API");
  for (const path of [
    "/health",
    "/api/config",
    "/api/conversations",
    "/api/conversations/{conversation_id}",
    "/api/chat",
    "/api/chat/stream",
    "/api/places/search",
    "/api/places/photo",
  ]) {
    assert.ok(spec.paths[path], `missing documented path ${path}`);
  }
});

test("serves an interactive docs page at /docs", async () => {
  const response = await worker.fetch(new Request("https://example.com/docs"), {});
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  const html = await response.text();
  assert.match(html, /swagger-ui/);
  assert.match(html, /\/api\/openapi\.json/);
});
