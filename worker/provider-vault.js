import { catalog } from './providers.js';
const encode = data => btoa(String.fromCharCode(...new Uint8Array(data)));
const decode = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
async function cipherKey(env) {
  if (!env.PROVIDER_ENCRYPTION_KEY) throw new Error('Secure key storage is not configured. Set the server PROVIDER_ENCRYPTION_KEY secret.');
  let bytes;
  try { bytes = decode(env.PROVIDER_ENCRYPTION_KEY); } catch { throw new Error('Invalid server encryption configuration'); }
  if (bytes.length !== 32) throw new Error('Invalid server encryption configuration');
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt','decrypt']);
}
export async function savedProviders(env, userId) {
  if (!env.PROVIDER_ENCRYPTION_KEY) return [];
  const {results} = await env.DB.prepare('SELECT provider FROM provider_keys WHERE user_id=?').bind(userId).all();
  return results.map(row => row.provider);
}
export async function saveProviderKey(env, userId, selection) {
  if (!Object.hasOwn(catalog, selection.provider) || selection.provider === 'ollama') throw new Error('Invalid provider for API key storage');
  const key = await cipherKey(env);
  if (selection.api_key === null) {
    await env.DB.prepare('DELETE FROM provider_keys WHERE user_id=? AND provider=?').bind(userId,selection.provider).run();
    return {saved:false};
  }
  if (typeof selection.api_key !== 'string' || !selection.api_key.trim() || selection.api_key.length > 4096 || /[\x00-\x1f\x7f]/.test(selection.api_key)) throw new Error('Enter a valid API key');
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,additionalData:new TextEncoder().encode(`${userId}:${selection.provider}`)},key,new TextEncoder().encode(selection.api_key.trim())));
  const encrypted = new Uint8Array(nonce.length + ciphertext.length); encrypted.set(nonce); encrypted.set(ciphertext,nonce.length);
  await env.DB.prepare('INSERT INTO provider_keys VALUES (?,?,?) ON CONFLICT(user_id,provider) DO UPDATE SET encrypted_key=excluded.encrypted_key').bind(userId,selection.provider,encode(encrypted)).run();
  return {saved:true};
}
export async function resolveSelection(env, userId, selection = {}) {
  if (selection.api_key || !selection.provider || selection.provider === 'ollama' || !env.PROVIDER_ENCRYPTION_KEY) return selection;
  const row = await env.DB.prepare('SELECT encrypted_key FROM provider_keys WHERE user_id=? AND provider=?').bind(userId,selection.provider).first();
  if (!row) return selection;
  try {
    const data = decode(row.encrypted_key);
    const value = await crypto.subtle.decrypt({name:'AES-GCM',iv:data.slice(0,12),additionalData:new TextEncoder().encode(`${userId}:${selection.provider}`)},await cipherKey(env),data.slice(12));
    return {...selection,api_key:new TextDecoder().decode(value)};
  } catch {throw new Error('Saved API key cannot be read. Restore the encryption key or replace the saved API key.');}
}
