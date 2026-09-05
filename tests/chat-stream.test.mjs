import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync("app/static/app.js", "utf8");
const parser = source.slice(source.indexOf("async function postChatStream"), source.indexOf("function createActivity"));

async function parse(raw) {
  const events = [];
  const bytes = new TextEncoder().encode(raw);
  const context = vm.createContext({
    API_BASE:"", requestHeaders:()=>({}), TextDecoder,
    fetch: async () => new Response(new ReadableStream({start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    }})),
  });
  vm.runInContext(parser, context);
  await context.postChatStream("/api/chat/stream", {}, {
    onDelta: text => events.push(["delta",text]),
    onProgress: event => events.push([event.type,event.message]),
    onDone: event => events.push(["done",event.answer]),
  });
  return events;
}

test("browser handles split UTF-8 and final events without trailing newlines", async () => {
  assert.deepEqual(await parse(
    '{"type":"status","message":"Working"}\r\n' +
    '{"type":"delta","text":"Café 🧭"}\n' +
    '{"type":"done","answer":"Café 🧭"}',
  ), [["status","Working"], ["delta","Café 🧭"], ["done","Café 🧭"]]);
});

test("browser rejects interrupted and error streams", async () => {
  await assert.rejects(parse('{"type":"delta","text":"Partial"}\n'), /ended unexpectedly/);
  await assert.rejects(parse('{"type":"error","message":"Provider unavailable"}\n'), /Provider unavailable/);
});
