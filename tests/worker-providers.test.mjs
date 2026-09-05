import assert from 'node:assert/strict';
import { test } from 'node:test';
import { providerConfig, providerInfo } from '../worker/providers.js';
import { createDecider } from '../worker/index.js';

test('provider endpoints, models and credentials stay request scoped', () => {
  const env = {DEEPSEEK_API_KEY:'server-secret'};
  for (const provider of ['gemini','deepseek','groq','openrouter']) {
    const config = providerConfig(env,{provider,model:'my-model',api_key:'personal-secret'});
    assert.equal(config.model,'my-model'); assert.equal(config.key,'personal-secret');
    assert.ok(config.url.startsWith('https://'));
  }
  assert.equal(providerConfig(env).key,'server-secret');
  assert.ok(!JSON.stringify(providerInfo(env)).includes('server-secret'));
  assert.throws(() => providerConfig(env,{provider:'__proto__'}), /Unknown/);
  assert.throws(() => providerConfig(env,{provider:'ollama'}), /not configured/);
});

test('FreeRouter permits a local gateway without an API key', () => {
  const config = providerConfig({ FREEROUTER_BASE_URL: 'http://gateway.test/v1' }, { provider: 'freerouter' });
  assert.equal(config.url, 'http://gateway.test/v1');
  assert.equal(config.model, 'auto');
  assert.equal(config.key, '');
});

test('fallback uses configured Ollama without forwarding cloud credentials', async () => {
  const original = globalThis.fetch, calls = [], events = [];
  globalThis.fetch = async (url, options) => {
    calls.push({url, options});
    if (calls.length === 1) return new Response('{}',{status:429});
    return new Response('data: {"choices":[{"delta":{"content":"{\\"action\\":\\"finish\\",\\"answer\\":\\"Hello\\"}"}}]}\n\ndata: [DONE]\n\n');
  };
  try {
    const decide = createDecider({OLLAMA_BASE_URL:'http://localhost:11434'}, {provider:'groq',api_key:'cloud-secret',fallback:true,fallback_model:'local-model'});
    assert.equal(JSON.parse(await decide('JSON','Hello', e => events.push(e))).answer,'Hello');
    assert.equal(calls[1].url,'http://localhost:11434/v1/chat/completions');
    assert.equal(calls[1].options.headers.authorization,undefined);
    assert.equal(JSON.parse(calls[1].options.body).model,'local-model');
    assert.ok(events.some(e => e.message?.includes('Using local Ollama')));
  } finally {globalThis.fetch = original;}
});

test('partial output never falls back and disabled fallback never retries', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {calls++; return new Response('data: {"choices":[{"delta":{"content":"{\\"action\\":\\"finish\\",\\"answer\\":\\"Hello"}}]}\n\n');};
  try {
    const env = {DEEPSEEK_API_KEY:'test',OLLAMA_BASE_URL:'http://localhost:11434'};
    await assert.rejects(createDecider(env,{fallback:true})('JSON','Hello',()=>{}), /unexpectedly/);
    assert.equal(calls,1);
    await assert.rejects(createDecider(env)('JSON','Hello',()=>{}), /unexpectedly/);
    assert.equal(calls,2);
  } finally {globalThis.fetch = original;}
});
