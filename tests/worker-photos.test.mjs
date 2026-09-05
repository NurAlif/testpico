import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "../worker/index.js";

test("search retrieves a photo from Place Details when Text Search omits photos", async () => {
  const originalFetch = globalThis.fetch;
  const photo = { name: "places/example/photos/photo1", authorAttributions: [] };
  const requests = [];
  globalThis.fetch = async (url) => {
    requests.push(url);
    if (url === "https://places.googleapis.com/v1/places:searchText") {
      return Response.json({ places: [{ id: "example", displayName: { text: "Restaurant" } }] });
    }
    if (url === "https://places.googleapis.com/v1/places/example") {
      return Response.json({ photos: [photo] });
    }
    return new Response("Not found", { status: 404 });
  };
  try {
    const response = await worker.fetch(new Request("https://example.com/api/places/search", {
      method: "POST",
      headers: { Authorization: "Bearer test-session" },
      body: JSON.stringify({ query: "Restaurant" }),
    }), { GOOGLE_PLACES_API_KEY: "test-key", DB: { prepare: () => ({ bind: () => ({ first: async () => ({ user_id: "test-user" }) }) }) } });
    assert.equal(response.status, 200);
    const [place] = await response.json();
    assert.deepEqual(place.photo, photo);
    assert.deepEqual(place.photos, [photo]);
    assert.equal(requests.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
