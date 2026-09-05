import assert from 'node:assert/strict';
import {test} from 'node:test';
import {ollamaModels,testOllama} from '../worker/ollama-settings.js';
test('hosted Ollama settings use native discovery and exclude embedding models',async()=>{
  const original=globalThis.fetch, paths=[];
  globalThis.fetch=async(url,options)=>{
    paths.push(url);
    if(url.endsWith('/api/tags')) return Response.json({models:[{name:'chat'},{name:'embed'}]});
    assert.ok(url.endsWith('/api/show'));
    const model=JSON.parse(options.body).model;
    return Response.json({capabilities:model==='chat'?['completion']:['embedding']});
  };
  try {
    const env={OLLAMA_BASE_URL:'http://localhost:11434'};
    assert.deepEqual(await ollamaModels(env,{}),{models:['chat']});
    assert.ok((await testOllama(env,{model:'chat'})).ok);
    await assert.rejects(testOllama(env,{model:'embed'}),/does not support chat/);
    assert.ok(paths.every(p=>!p.includes('/v1/')));
  } finally {globalThis.fetch=original;}
});
