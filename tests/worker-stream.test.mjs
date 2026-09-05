import assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "../worker/index.js";
import { partialAnswer, readLines } from "../worker/stream.js";
import { runAgent } from "../worker/agent.js";

test("partial JSON answer handles every split, escapes and Unicode", () => {
  const answer = 'Hello "Jakarta"!\nCafé 🧭';
  const raw = JSON.stringify({action:"finish", answer, suggestions:["Next?"]});
  let previous = "";
  for (let i = 1; i <= raw.length; i++) {
    const current = partialAnswer(raw.slice(0, i));
    assert.ok(answer.startsWith(current));
    assert.ok(current.startsWith(previous));
    previous = current;
  }
  assert.equal(previous, answer);
  assert.equal(partialAnswer('{"action":"search","query":"answer"}'), "");
  assert.equal(partialAnswer('{"action":"finish","answer":"\\uD83E'), "");
  assert.equal(partialAnswer('{"action":"finish","answer":"\\uD83E\\uDDED'), "🧭");
});

test("tool progress is emitted before the lookup finishes, including safe failure", async () => {
  const events = [];
  let step = 0;
  await runAgent({
    emit: event => events.push(event),
    decide: async () => JSON.stringify(step++ ? {action:"finish", answer:"Unavailable"} : {action:"search", query:"Cafe"}),
    search: async () => {
      assert.equal(events.at(-1).state, "running");
      throw new Error("private key");
    },
  }, "Find a cafe");
  assert.ok(events.some(e => e.state === "error"));
  assert.ok(!JSON.stringify(events).includes("private key"));
});

test("worker streams before model completion and saves the final answer", async () => {
  const db = new DatabaseSync(":memory:");
  for (const name of ["0001_initial", "0002_accounts", "0003_message_results"])
    db.exec(readFileSync(`migrations/${name}.sql`, "utf8"));
  const DB = {
    prepare(sql) { return {bind(...args) {
      const stmt = db.prepare(sql);
      return {first:async()=>stmt.get(...args), all:async()=>({results:stmt.all(...args)}), run:async()=>stmt.run(...args)};
    }}; }, batch: async items => Promise.all(items.map(x=>x.run())),
  };
  const env = {DB, DEEPSEEK_API_KEY:"test"};
  const call = (path, data, token) => worker.fetch(new Request("https://example.com" + path, {
    method: data ? "POST" : "GET", headers: token ? {Authorization:`Bearer ${token}`} : {},
    body: data ? JSON.stringify(data) : undefined,
  }), env);
  const original = globalThis.fetch;
  let upstream;
  try {
    const {token} = await (await call("/api/auth/login", {identifier:"testpico", password:"testpico"})).json();
    const {id} = await (await call("/api/conversations", {}, token)).json();
    globalThis.fetch = async (_, options) => {
      assert.equal(JSON.parse(options.body).stream, true);
      return new Response(new ReadableStream({start(controller) { upstream = controller; }}));
    };
    const response = await call("/api/chat/stream", {message:"Hi", conversation_id:id}, token);
    const lines = readLines(response.body);
    assert.equal(JSON.parse((await lines.next()).value).type, "status");
    const encode = new TextEncoder();
    const push = delta => upstream.enqueue(encode.encode(`data: ${JSON.stringify({choices:[{delta}]})}\r\n\r\n`));
    push({reasoning_content:"A greeting is appropriate."});
    assert.equal(JSON.parse((await lines.next()).value).type, "reasoning");
    push({content:'{"action":"finish","answer":"Hello'});
    assert.deepEqual(JSON.parse((await lines.next()).value), {type:"delta", text:"Hello"});
    push({content:' there!","suggestions":["Find cafes"]}'});
    assert.equal(JSON.parse((await lines.next()).value).text, " there!");
    upstream.enqueue(encode.encode("data: [DONE]\n\n"));
    upstream.close();
    const final = JSON.parse((await lines.next()).value);
    assert.equal(final.type, "done");
    assert.equal(final.answer, "Hello there!");
    assert.equal((await lines.next()).done, true);
    const saved = await (await call(`/api/conversations/${id}`, null, token)).json();
    assert.equal(saved.messages.at(-1).content, final.answer);
    assert.deepEqual(saved.messages.at(-1).suggestions, ["Find cafes"]);
  } finally { globalThis.fetch = original; db.close(); }
});
