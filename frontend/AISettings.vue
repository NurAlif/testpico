<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import catalog from '../app/providers.json';
import { aiState, settingsApi, savePreferences } from './ai-settings.js';
const dialog = ref(null), provider = ref('deepseek'), profiles = ref({}), fallback = ref(false), fallbackModel = ref(''), status = ref(''), testing = ref(false), loading = ref(false);
const models = ref([]);
const editingKey = ref(false);
function cancelKeyEdit() { delete profile.value.api_key; editingKey.value = false; }
const selected = computed(() => catalog[provider.value]);
const profile = computed(() => profiles.value[provider.value] || {});
const info = computed(() => aiState.info?.providers?.find(p => p.id === provider.value));
const providerNeedsKey = computed(() => selected.value?.requires_api_key !== false);
const localAvailable = computed(() => aiState.info?.providers?.find(p => p.id === 'ollama')?.available === true);
const label = computed(() => aiState.selection ? `${catalog[aiState.selection.provider]?.name || 'AI'} · ${aiState.profiles[aiState.selection.provider]?.model || ''}` : 'Choose your AI');
async function open() {
  editingKey.value = false;
  profiles.value = Object.fromEntries(Object.entries(catalog).map(([id,p]) => [id,{model:p.model, ...aiState.profiles[id]}]));
  provider.value = aiState.selection?.provider || 'deepseek';
  fallback.value = aiState.selection?.fallback || false;
  fallbackModel.value = aiState.selection?.fallback_model || '';
  status.value = ''; models.value = []; dialog.value.showModal(); loading.value = true;
  try {
    aiState.info = await settingsApi('/api/providers');
    if (!aiState.selection) provider.value = aiState.info.default_provider || 'deepseek';
    for (const p of aiState.info.providers || []) if (!aiState.profiles[p.id]) profiles.value[p.id].model = p.model;
  } catch (e) { status.value = connectionError(e); }
  finally { loading.value = false; }
  if (provider.value === 'ollama' && info.value?.available) await loadModels();
}
function connectionError(e) { return e.message === 'Not Found' ? 'The app backend needs a restart or update to enable AI settings. Ollama may still be running normally.' : e.message; }
async function changeProvider() {
  editingKey.value = false;
  for (const p of Object.values(profiles.value)) delete p.api_key;
  status.value = ''; models.value = [];
  if (provider.value === 'ollama' && info.value?.available) await loadModels();
}
function selection() { return {provider:provider.value, model:profile.value.model?.trim(), api_key:profile.value.api_key?.trim() || undefined}; }
async function loadModels() {
  testing.value = true; status.value = 'Loading models…';
  try {
    const result = await settingsApi('/api/providers/models', {method:'POST',body:JSON.stringify(selection())});
    models.value = result.models || [];
    if (provider.value === 'ollama') {
      if (!models.value.includes(profile.value.model)) profile.value.model = models.value[0] || '';
      status.value = models.value.length ? `${models.value.length} installed chat models available.` : 'No chat models installed. Download a chat model in Ollama, then refresh this list.';
    } else status.value = models.value.length ? 'Models loaded. Choose one in the model field.' : 'No models found. You can enter a model ID manually.';
  }
  catch(e) { status.value = connectionError(e); }
  finally { testing.value = false; }
}
async function test() {
  testing.value = true; status.value = 'Connecting…';
  try { const result = await settingsApi('/api/providers/test', {method:'POST', body:JSON.stringify(selection())}); status.value = result.message || 'Connected. This model is ready to use.'; }
  catch (e) { status.value = connectionError(e); }
  finally { testing.value = false; }
}
async function saveKey(id = provider.value) {
  const key = profiles.value[id]?.api_key?.trim();
  if (!key) { status.value = 'Enter an API key first.'; return false; }
  await settingsApi('/api/providers/key', {method:'POST',body:JSON.stringify({provider:id,api_key:key})});
  delete profiles.value[id].api_key;
  editingKey.value = false;
  if (aiState.profiles[id]) delete aiState.profiles[id].api_key;
  aiState.info = await settingsApi('/api/providers');
  return true;
}
async function manageKey(remove = false) {
  testing.value = true; status.value = '';
  try {
    if (remove) {
      await settingsApi('/api/providers/key', {method:'POST',body:JSON.stringify({provider:provider.value,api_key:null})});
      delete profile.value.api_key;
      editingKey.value = false;
      aiState.info = await settingsApi('/api/providers');
      status.value = 'Saved key removed. A server default key will be used if configured.';
    } else if (await saveKey()) status.value = 'API key saved securely to your account.';
  } catch(e) { status.value = connectionError(e); }
  finally { testing.value = false; }
}
async function save() {
  if (!profile.value.model?.trim()) {status.value = 'Enter a model name.'; return;}
  if (info.value?.available === false) {status.value = 'Ollama is not connected to this server.'; return;}
  if (provider.value !== 'ollama' && providerNeedsKey.value && !info.value?.configured && !profile.value.api_key?.trim() && !(fallback.value && localAvailable.value)) {status.value = 'Enter an API key for this provider.'; return;}
  profile.value.model = profile.value.model.trim();
  testing.value = true;
  try {
    for (const [id, entry] of Object.entries(profiles.value)) if (id !== 'ollama' && entry.api_key?.trim()) await saveKey(id);
    aiState.profiles = Object.fromEntries(Object.entries(profiles.value).map(([id,p]) => [id,{model:p.model}]));
    aiState.selection = {provider:provider.value, fallback:fallback.value && localAvailable.value, fallback_model:fallbackModel.value.trim()};
    savePreferences(); dialog.value.close();
  } catch(e) {status.value = connectionError(e);}
  finally {testing.value = false;}
}
function clearDraft() { editingKey.value = false; for (const p of Object.values(profiles.value)) delete p.api_key; dialog.value?.close(); }
onMounted(() => window.addEventListener('ai-keys-cleared', clearDraft));
onUnmounted(() => window.removeEventListener('ai-keys-cleared', clearDraft));
</script>

<template>
  <button id="ai-settings-button" class="ai-settings-button" type="button" aria-label="AI settings" :title="label" @click="open"><svg class="utility-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5c-2-4-7-2-6 2-4 0-4 6-1 7-2 4 3 8 7 4m0-13c2-4 7-2 6 2 4 0 4 6 1 7 2 4-3 8-7 4V5Zm-6 2 2 2m-3 5 3-1m10-6-2 2m3 5-3-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg><small>{{ label }}</small></button>
  <Teleport to="body">
    <dialog ref="dialog" class="ai-settings-dialog" aria-labelledby="ai-settings-title" @click="e => { if(e.target === dialog) dialog.close(); }">
      <form @submit.prevent="save">
        <header><div><p class="eyebrow">MAKE IT YOURS</p><h2 id="ai-settings-title">Your AI, your choice</h2></div><button type="button" class="icon-button" aria-label="Close AI settings" @click="dialog.close()">×</button></header>
        <p class="ai-settings-intro">Switch providers in seconds. Changes apply to your next message.</p>
        <label for="ai-provider">Provider</label>
        <select id="ai-provider" v-model="provider" :disabled="testing || loading" @change="changeProvider"><option v-for="(p,id) in catalog" :key="id" :value="id">{{ p.name }}</option></select>
        <p class="ai-provider-note">{{ selected.note }}</p>
        <label for="ai-model">Model</label>
        <select v-if="provider === 'ollama'" id="ai-model" v-model="profile.model" :disabled="testing || loading || !models.length" required>
          <option v-if="!models.length" value="">{{ testing ? 'Loading installed models…' : 'No chat models available' }}</option>
          <option v-for="model in models" :key="model" :value="model">{{ model }}</option>
        </select>
        <input v-else id="ai-model" list="ai-model-options" v-model="profile.model" required maxlength="200" :disabled="testing || loading" :placeholder="selected.model" />
        <datalist id="ai-model-options"><option v-for="model in models" :key="model" :value="model" /></datalist>
        <button class="ai-load-models" type="button" :disabled="testing || loading || info?.available === false" @click="loadModels">{{ provider === 'ollama' ? 'Refresh installed models' : 'Load available models' }}</button>
        <small>{{ provider === 'ollama' ? 'Choose an installed chat model. Embedding-only models are excluded.' : 'Enter the exact model ID from your provider.' }}</small>
        <template v-if="provider !== 'ollama' && providerNeedsKey">
          <template v-if="info?.configured && !editingKey">
            <p class="ai-key-status"><strong>API key configured</strong><small>{{ info?.saved_key ? 'Saved to your account' : 'Using the server key' }}</small></p>
            <div class="ai-key-actions">
              <button type="button" class="ai-test-button" :disabled="testing || loading" @click="editingKey = true">Replace API key</button>
              <button v-if="info?.saved_key" type="button" class="ai-test-button" :disabled="testing || loading" @click="manageKey(true)">Remove saved key</button>
            </div>
          </template>
          <template v-else-if="!loading">
            <label for="ai-provider-key">{{ info?.configured ? 'New API key' : 'API key' }}</label>
            <input id="ai-provider-key" v-model="profile.api_key" type="password" autocomplete="new-password" maxlength="4096" :disabled="testing" placeholder="Paste your new API key" />
            <small>Your key is saved encrypted on the backend and is never displayed after saving.</small>
            <div class="ai-key-actions">
              <button type="button" class="ai-test-button" :disabled="testing || loading || !profile.api_key?.trim()" @click="manageKey()">Save API key</button>
              <button v-if="editingKey" type="button" class="ai-test-button" :disabled="testing" @click="cancelKeyEdit">Cancel replacement</button>
            </div>
          </template>
          <small v-if="aiState.info?.key_storage_available === false">Saving keys needs one-time secure storage setup on this server. You can still use its configured default key.</small>
        </template>
        <template v-else-if="provider === 'freerouter' && !loading">
          <label for="ai-provider-key">Gateway key <span>Optional</span></label>
          <input id="ai-provider-key" v-model="profile.api_key" type="password" autocomplete="new-password" maxlength="4096" :disabled="testing" placeholder="Only needed by secured FreeRouter gateways" />
          <small>FreeRouter normally runs without a key. If your gateway is secured, save its key here.</small>
          <div class="ai-key-actions"><button type="button" class="ai-test-button" :disabled="testing || !profile.api_key?.trim()" @click="manageKey()">Save gateway key</button></div>
        </template>
        <div class="ai-fallback">
          <label><input v-model="fallback" type="checkbox" :disabled="!localAvailable || provider === 'ollama' || testing" /> Use local Ollama if this provider fails</label>
          <p>No API key needed. {{ localAvailable ? 'Ollama must be running with the fallback model installed.' : 'Connect Ollama to the backend to enable this option.' }}</p>
          <template v-if="fallback && localAvailable && provider !== 'ollama'"><label for="ai-fallback-model">Fallback model</label><input id="ai-fallback-model" v-model="fallbackModel" :placeholder="aiState.info?.providers?.find(p => p.id === 'ollama')?.model" maxlength="200" /></template>
        </div>
        <p class="ai-test-status" role="status">{{ status }}</p>
        <footer><button type="button" class="ai-test-button" :disabled="testing || loading || info?.available === false || (provider === 'ollama' && !models.includes(profile.model))" @click="test">{{ testing ? 'Testing…' : 'Test connection' }}</button><button class="new-chat-button" type="submit" :disabled="testing || loading || info?.available === false || (provider === 'ollama' && !models.includes(profile.model))">Save settings</button></footer>
      </form>
    </dialog>
  </Teleport>
</template>
