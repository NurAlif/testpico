import assert from "node:assert/strict";
import { test } from "node:test";
import { runAgent } from "../worker/agent.js";

test("agent observes searches and details before recommending", async () => {
  const actions = [{action:"search",query:"A"},{action:"search",query:"B"},{action:"details",place_id:"A"},{action:"details",place_id:"B"},{action:"finish",answer:"Both have moderate prices.",suggestions:["Compare hours", "Compare hours"]}];
  const contexts = [], calls = [];
  const result = await runAgent({
    decide: async (_, context) => { contexts.push(JSON.parse(context)); return JSON.stringify(actions.shift()); },
    search: async query => { calls.push(query); return [{place_id:query,name:query}]; },
    details: async id => { calls.push(id); return {priceLevel:"PRICE_LEVEL_MODERATE"}; },
  }, "Compare those", [{role:"assistant",content:"A and B"}]);
  assert.deepEqual(calls, ["A","B","A","B"]);
  assert.equal(contexts.at(-1).observations.at(-1).result.priceLevel, "PRICE_LEVEL_MODERATE");
  assert.equal(contexts[0].history[0].content, "A and B");
  assert.deepEqual(result.suggestions, ["Compare hours"]);
  assert.equal(result.places.length, 2);
});

test("unknown IDs and repeated actions are bounded without tool calls", async () => {
  let steps = 0;
  const result = await runAgent({decide: async () => { steps++; return JSON.stringify({action:"details",place_id:"fake"}); }, search: () => assert.fail(), details: () => assert.fail()}, "details");
  assert.equal(steps, 9);
  assert.match(result.answer, /couldn't complete/);
});

test("tool errors become safe observations", async () => {
  let step = 0;
  await runAgent({
    decide: async (_, context) => {
      if (step++ === 0) return JSON.stringify({action:"search",query:"Cafe"});
      assert.match(JSON.parse(context).observations[0].error, /lookup failed/);
      assert.ok(!context.includes("secret"));
      return JSON.stringify({action:"finish",answer:"Lookup failed",suggestions:[]});
    }, search: async () => { throw Error("secret"); }, details: () => assert.fail(),
  }, "cafe");
});
