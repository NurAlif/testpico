import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from '../worker/index.js';

test('worker accounts enforce ownership, migration, persistence, and logout', async () => {
 const db = new DatabaseSync(':memory:');
 db.exec(readFileSync('migrations/0001_initial.sql','utf8'));
 db.exec(readFileSync('migrations/0002_accounts.sql','utf8'));
 const DB = {prepare(sql) { return {bind(...args) { const stmt=db.prepare(sql); return {first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)}),run:async()=>stmt.run(...args)}; }}; } , batch:async items=>Promise.all(items.map(x=>x.run()))};
 const env={DB};
 const call=(path,data,token)=>worker.fetch(new Request('https://example.com'+path,{method:data?'POST':'GET',headers:token?{Authorization:`Bearer ${token}`}:{},body:data?JSON.stringify(data):undefined}),env);
 assert.equal((await call('/api/conversations')).status,401);
 assert.equal((await call('/api/auth/login',{identifier:'testpico',password:'wrong'})).status,401);
 const {token}=await (await call('/api/auth/login',{identifier:'TESTPICO',password:'testpico'})).json();
 assert.ok(token);
 const {id}=await (await call('/api/conversations',{},token)).json();
 assert.deepEqual(await (await call('/api/conversations',null,token)).json(),[]);
 db.prepare("INSERT INTO messages(conversation_id,role,content) VALUES (?,'user','A saved chat')").run(id);
 assert.equal((await (await call('/api/conversations',null,token)).json())[0].title,'A saved chat');
 assert.equal((await call('/api/auth/register',{username:'alice',email:'alice@example.com',password:'password123'})).status,200);
 const other=await (await call('/api/auth/login',{identifier:'alice@example.com',password:'password123'})).json();
 assert.equal((await call('/api/conversations/'+id,null,other.token)).status,404);
 assert.equal((await call('/api/chat',{message:'steal',conversation_id:id},other.token)).status,404);
 assert.equal((await call('/api/auth/logout',{},token)).status,200);
 assert.equal((await call('/api/conversations',null,token)).status,401);
 db.close();
});
