import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../worker/index.js';
import { saveProviderKey, resolveSelection } from '../worker/provider-vault.js';

test('encrypted provider keys persist, are isolated, can be replaced and removed', async () => {
  const db = new DatabaseSync(':memory:');
  for (const name of ['0001_initial','0002_accounts','0003_message_results','0004_provider_keys']) db.exec(readFileSync(`migrations/${name}.sql`,'utf8'));
  const DB = {prepare(sql) {return {bind(...args) {const stmt=db.prepare(sql); return {first:async()=>stmt.get(...args), all:async()=>({results:stmt.all(...args)}),run:async()=>stmt.run(...args)};}};},batch:async items=>Promise.all(items.map(x=>x.run()))};
  const env={DB,PROVIDER_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64')};
  const call=(path,data,token)=>worker.fetch(new Request('https://example.com'+path,{method:data?'POST':'GET',headers:token?{Authorization:`Bearer ${token}`}:{},body:data?JSON.stringify(data):undefined}),env);
  const original=globalThis.fetch;
  try {
    const {token}=await (await call('/api/auth/login',{identifier:'testpico',password:'testpico'})).json();
    assert.equal((await call('/api/providers/key',{provider:'groq',api_key:'secret'})).status,401);
    assert.deepEqual(await (await call('/api/providers/key',{provider:'groq',api_key:'saved-secret'},token)).json(),{saved:true});
    const row=db.prepare('SELECT * FROM provider_keys').get();
    assert.ok(!row.encrypted_key.includes('saved-secret'));
    const info=await (await call('/api/providers',null,token)).json();
    assert.ok(info.providers.find(p=>p.id==='groq').saved_key);
    assert.ok(!JSON.stringify(info).includes('saved-secret'));
    for (const provider of info.providers) assert.ok(Object.keys(provider).every(key=>['id','name','model','configured','available','saved_key'].includes(key)));
    assert.equal((await resolveSelection({...env},row.user_id,{provider:'groq'})).api_key,'saved-secret');
    assert.equal((await resolveSelection(env,'another-user',{provider:'groq'})).api_key,undefined);
    await assert.rejects(resolveSelection({...env,PROVIDER_ENCRYPTION_KEY:Buffer.alloc(32,8).toString('base64')},row.user_id,{provider:'groq'}),/cannot be read/);
    let received;
    globalThis.fetch=async (url,options)=>{received=options.headers.authorization;return Response.json({choices:[{message:{content:'{"ok":true}'}}]});};
    assert.equal((await call('/api/providers/test',{provider:'groq'},token)).status,200);
    assert.equal(received,'Bearer saved-secret');
    globalThis.fetch=async()=>Response.json({error:{code:'saved-secret',message:'saved-secret'}},{status:401});
    const rejected = await call('/api/providers/test',{provider:'groq'},token);
    assert.equal(rejected.status,502);
    assert.ok(!(await rejected.text()).includes('saved-secret'));
    await saveProviderKey(env,row.user_id,{provider:'groq',api_key:'replacement'});
    assert.equal((await resolveSelection(env,row.user_id,{provider:'groq'})).api_key,'replacement');
    await saveProviderKey(env,row.user_id,{provider:'groq',api_key:null});
    assert.equal((await resolveSelection(env,row.user_id,{provider:'groq'})).api_key,undefined);
    await assert.rejects(saveProviderKey({DB},row.user_id,{provider:'groq',api_key:'secret'}),/not configured/);
  } finally {globalThis.fetch=original;db.close();}
});
