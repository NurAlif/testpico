import { reactive } from 'vue';
export const aiState = reactive({ selection:null, profiles:{}, info:null });
let request;
export function connectSettings(api) { request = api; }
export function settingsApi(path, options) { return request(path, options); }
export function aiPayload() {
  if (!aiState.selection) return undefined;
  const {provider, fallback, fallback_model} = aiState.selection;
  return {provider, fallback, fallback_model, model:aiState.profiles[provider]?.model};
}
export function clearAIKeys() {
  for (const profile of Object.values(aiState.profiles)) delete profile.api_key;
  window.dispatchEvent(new Event('ai-keys-cleared'));
}
try {
  const saved = JSON.parse(localStorage.getItem('wanderAISettings') || 'null');
  if (saved?.selection) {
    aiState.selection = saved.selection;
    for (const [id, profile] of Object.entries(saved.profiles || {})) aiState.profiles[id] = {model:profile.model};
  }
} catch { /* In-memory settings remain usable. */ }
export function savePreferences() {
  try {
    localStorage.setItem('wanderAISettings', JSON.stringify({selection:aiState.selection,
      profiles:Object.fromEntries(Object.entries(aiState.profiles).map(([id,p]) => [id,{model:p.model}]))}));
  } catch { /* Storage is optional. */ }
}
