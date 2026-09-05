<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import catalog from '../app/providers.json';
import { aiState, savePreferences, settingsApi } from './ai-settings.js';

const dialog = ref(null);
const localAvailable = ref(false);
const info = ref(null);
const step = ref(1);
const provider = ref('gemini');
const profiles = ref({});
const models = ref([]);
const placesKey = ref('');
const embedKey = ref('');
const status = ref('');
const busy = ref(false);
const aiVerified = ref(false);
const googleVerified = ref(false);
const authenticated = ref(false);
let loadedForSession = false;

const selected = computed(() => catalog[provider.value]);
const profile = computed(() => profiles.value[provider.value] || {});
const selectedInfo = computed(() => info.value?.providers?.find(item => item.id === provider.value));
const google = computed(() => info.value?.google || {});
const providerReady = computed(() => provider.value === 'ollama'
  ? selectedInfo.value?.available === true && models.value.includes(profile.value.model)
  : selected.value?.requires_api_key === false || selectedInfo.value?.configured === true || Boolean(profile.value.api_key?.trim()));
const summary = computed(() => {
  if (!info.value) return 'First-run guide';
  const ready = info.value.providers?.filter(item => item.configured).length || 0;
  return `${ready} AI option${ready === 1 ? '' : 's'} · ${google.value.places_configured ? 'Maps ready' : 'Maps needed'}`;
});

function resetProfiles(data) {
  profiles.value = Object.fromEntries(Object.entries(catalog).map(([id, entry]) => [
    id,
    { model: aiState.profiles[id]?.model || data.providers?.find(item => item.id === id)?.model || entry.model },
  ]));
}

function bestProvider(data) {
  const usable = id => {
    const item = data.providers?.find(entry => entry.id === id);
    return id === 'ollama' ? item?.available === true : item?.configured === true;
  };
  const candidates = [aiState.selection?.provider, data.default_provider, ...Object.keys(catalog)];
  return candidates.find(id => id && usable(id)) || data.default_provider || 'gemini';
}

async function load(autoOpen = false) {
  if (!localAvailable.value && !autoOpen) return;
  busy.value = true;
  status.value = 'Checking your local services…';
  try {
    const result = await settingsApi('/api/setup');
    localAvailable.value = result.available === true;
    if (!localAvailable.value) return;
    info.value = result;
    resetProfiles(result);
    provider.value = bestProvider(result);
    step.value = 1;
    status.value = '';
    aiVerified.value = false;
    googleVerified.value = false;
    placesKey.value = '';
    embedKey.value = '';
    if (!autoOpen || !result.complete) {
      dialog.value?.showModal();
      if (provider.value === 'ollama') await loadModels();
    }
  } catch (error) {
    status.value = error.message;
  } finally {
    busy.value = false;
  }
}

async function chooseProvider(id) {
  provider.value = id;
  aiVerified.value = false;
  status.value = '';
  models.value = [];
  if (id === 'ollama' && selectedInfo.value?.available) await loadModels();
}

async function loadModels() {
  busy.value = true;
  status.value = 'Finding installed Ollama chat models…';
  try {
    const result = await settingsApi('/api/providers/models', {
      method: 'POST',
      body: JSON.stringify({ provider: 'ollama', model: profile.value.model }),
    });
    models.value = result.models || [];
    if (!models.value.includes(profile.value.model)) profile.value.model = models.value[0] || '';
    status.value = models.value.length
      ? `${models.value.length} local chat model${models.value.length === 1 ? '' : 's'} found.`
      : 'Ollama is running, but no chat model is installed yet.';
  } catch (error) {
    status.value = error.message;
  } finally {
    busy.value = false;
  }
}

function aiSelection() {
  return {
    provider: provider.value,
    model: profile.value.model?.trim(),
    api_key: profile.value.api_key?.trim() || undefined,
  };
}

async function verifyAI() {
  if (!providerReady.value) {
    status.value = provider.value === 'ollama'
      ? 'Start Ollama and install a chat model, or choose a cloud provider.'
      : `Add a ${selected.value.name} API key to continue.`;
    return;
  }
  busy.value = true;
  status.value = `Testing ${selected.value.name}…`;
  try {
    const result = await settingsApi('/api/providers/test', {
      method: 'POST', body: JSON.stringify(aiSelection()),
    });
    aiVerified.value = true;
    status.value = result.message || `${selected.value.name} is connected and ready.`;
    step.value = 2;
  } catch (error) {
    aiVerified.value = false;
    status.value = error.message;
  } finally {
    busy.value = false;
  }
}

async function verifyGoogle() {
  if (!google.value.places_configured && !placesKey.value.trim()) {
    status.value = 'Add a Google Places API key to enable live recommendations.';
    return;
  }
  busy.value = true;
  status.value = 'Saving and testing Google Places…';
  try {
    info.value = await settingsApi('/api/setup', {
      method: 'POST',
      body: JSON.stringify({
        google_places_api_key: placesKey.value.trim() || undefined,
        google_maps_embed_api_key: embedKey.value.trim() || undefined,
      }),
    });
    const result = await settingsApi('/api/setup/google/test', { method: 'POST', body: '{}' });
    googleVerified.value = true;
    status.value = result.message;
    placesKey.value = '';
    embedKey.value = '';
    step.value = 3;
  } catch (error) {
    googleVerified.value = false;
    status.value = error.message;
  } finally {
    busy.value = false;
  }
}

async function finish() {
  if (!aiVerified.value || !googleVerified.value) return;
  busy.value = true;
  status.value = 'Saving your setup…';
  try {
    if (provider.value !== 'ollama' && profile.value.api_key?.trim()) {
      await settingsApi('/api/providers/key', {
        method: 'POST',
        body: JSON.stringify({ provider: provider.value, api_key: profile.value.api_key.trim() }),
      });
      delete profile.value.api_key;
    }
    aiState.profiles = Object.fromEntries(Object.entries(profiles.value).map(([id, entry]) => [
      id, { model: entry.model },
    ]));
    aiState.selection = { provider: provider.value, fallback: false, fallback_model: '' };
    savePreferences();
    info.value = await settingsApi('/api/setup', {
      method: 'POST', body: JSON.stringify({ complete: true }),
    });
    aiState.info = await settingsApi('/api/providers');
    dialog.value.close();
    window.dispatchEvent(new Event('wander-setup-complete'));
  } catch (error) {
    status.value = error.message;
  } finally {
    busy.value = false;
  }
}

function handleConfig(event) {
  localAvailable.value = event.detail?.local_setup_available === true;
  if (localAvailable.value && authenticated.value && !loadedForSession) {
    loadedForSession = true;
    void load(true);
  }
}
function handleAuthenticated() {
  authenticated.value = true;
  if (localAvailable.value && !loadedForSession) {
    loadedForSession = true;
    void load(true);
  }
}
function handleLocked() {
  authenticated.value = false;
  loadedForSession = false;
  dialog.value?.close();
}

onMounted(() => {
  window.addEventListener('wander-config', handleConfig);
  window.addEventListener('wander-authenticated', handleAuthenticated);
  window.addEventListener('wander-locked', handleLocked);
});
onUnmounted(() => {
  window.removeEventListener('wander-config', handleConfig);
  window.removeEventListener('wander-authenticated', handleAuthenticated);
  window.removeEventListener('wander-locked', handleLocked);
});
</script>

<template>
  <button v-if="localAvailable" id="setup-button" class="ai-settings-button setup-launcher" type="button" @click="load(false)">
    <svg class="utility-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 15 6-6m-5-3 2-2a5 5 0 0 1 7 7l-2 2m-3 5-2 2a5 5 0 0 1-7-7l2-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg><span class="sr-only">Connections</span><small>{{ summary }}</small>
  </button>
  <div v-else class="ai-settings-button" aria-label="Connections"><svg class="utility-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 15 6-6m-5-3 2-2a5 5 0 0 1 7 7l-2 2m-3 5-2 2a5 5 0 0 1-7-7l2-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg><small>Google Maps</small></div>
  <Teleport to="body">
    <dialog ref="dialog" class="setup-dialog" aria-labelledby="setup-title">
      <div class="setup-shell">
        <aside class="setup-aside">
          <a class="brand setup-brand" href="/" aria-label="Wander Pico home">
            <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="m13.9 7.8-2.1 4.1-4.1 2.2 4.6.1 1.6 2.1.2-4.5 2.2-4-2.4-.1Z" fill="currentColor"/></svg></span>
            <span><strong>Wander Pico</strong><small>Local setup</small></span>
          </a>
          <div class="setup-aside-copy"><p class="eyebrow">FIRST-RUN GUIDE</p><h2 id="setup-title">From clone to conversation.</h2><p>Connect one AI, verify Google Places, and start exploring.</p></div>
          <ol class="setup-steps" aria-label="Setup progress">
            <li :class="{active:step === 1, done:step > 1}"><span>1</span><div><strong>Choose your AI</strong><small>Cloud or local</small></div></li>
            <li :class="{active:step === 2, done:step > 2}"><span>2</span><div><strong>Connect Google</strong><small>Live place data</small></div></li>
            <li :class="{active:step === 3}"><span>3</span><div><strong>Start exploring</strong><small>Everything checked</small></div></li>
          </ol>
          <p class="setup-security">Keys stay on your backend. Server defaults are detected but never revealed to the browser.</p>
        </aside>

        <main class="setup-main">
          <header class="setup-mobile-header"><p>STEP {{ step }} OF 3</p><button type="button" class="icon-button" aria-label="Close setup" @click="dialog.close()">×</button></header>

          <section v-if="step === 1" class="setup-panel" aria-labelledby="setup-ai-title">
            <p class="eyebrow">YOUR ASSISTANT</p><h3 id="setup-ai-title">Pick the brain behind the journey</h3><p class="setup-lead">Configured keys from <code>.env</code> are ready to use. Or keep every prompt on this machine with Ollama.</p>
            <div class="provider-grid">
              <button v-for="(item,id) in catalog" :key="id" type="button" class="provider-choice" :class="{selected:provider === id}" :disabled="busy || (id === 'ollama' && info?.providers?.find(p => p.id === id)?.available === false)" @click="chooseProvider(id)">
                <span class="provider-monogram">{{ item.name.charAt(0) }}</span><span><strong>{{ item.name }}</strong><small v-if="info?.providers?.find(p => p.id === id)?.configured">Ready</small><small v-else-if="id === 'ollama'">Not detected</small><small v-else>Key needed</small></span><span class="choice-check" aria-hidden="true">✓</span>
              </button>
            </div>
            <div class="setup-fields">
              <template v-if="provider === 'ollama'">
                <label for="setup-ai-model">Installed chat model</label>
                <div class="setup-inline"><select id="setup-ai-model" v-model="profile.model" :disabled="busy || !models.length" @change="aiVerified=false"><option v-if="!models.length" value="">No chat model found</option><option v-for="model in models" :key="model" :value="model">{{ model }}</option></select><button type="button" class="setup-secondary" :disabled="busy" @click="loadModels">Refresh</button></div>
              </template>
              <template v-else>
                <label for="setup-ai-model">Model</label><input id="setup-ai-model" v-model="profile.model" maxlength="200" :placeholder="selected.model" :disabled="busy" @input="aiVerified=false">
              <template v-if="!selectedInfo?.configured && selected?.requires_api_key !== false"><label for="setup-ai-key">{{ selected.name }} API key</label><input id="setup-ai-key" v-model="profile.api_key" type="password" autocomplete="new-password" maxlength="4096" placeholder="Paste your API key" :disabled="busy" @input="aiVerified=false"><small>Encrypted on the backend after setup. It is never saved in browser storage.</small></template>
              <template v-else-if="provider === 'freerouter'"><label for="setup-ai-key">Gateway key <span>Optional</span></label><input id="setup-ai-key" v-model="profile.api_key" type="password" autocomplete="new-password" maxlength="4096" placeholder="Only needed by secured FreeRouter gateways" :disabled="busy" @input="aiVerified=false"><small>FreeRouter normally needs no key. Add one only if your gateway is secured.</small></template>
                <p v-else class="detected-key"><span>✓</span><span><strong>API key detected</strong><small>Using the private server configuration</small></span></p>
              </template>
            </div>
            <div class="setup-actions"><span></span><button class="setup-primary" type="button" :disabled="busy || !providerReady" @click="verifyAI">{{ busy ? 'Testing connection…' : 'Test & continue' }} <span>→</span></button></div>
          </section>

          <section v-else-if="step === 2" class="setup-panel" aria-labelledby="setup-google-title">
            <p class="eyebrow">LIVE LOCAL DATA</p><h3 id="setup-google-title">Bring real places into every answer</h3><p class="setup-lead">Places API (New) powers verified names, ratings, addresses, and photos. Maps Embed adds the optional in-app map preview.</p>
            <div class="google-connection-card">
              <span class="google-mark" aria-hidden="true">G</span><div><strong>Google Maps Platform</strong><small>{{ google.places_configured ? 'Places key detected in local configuration' : 'Places API key required' }}</small></div><span class="connection-pill" :class="{ready:google.places_configured}">{{ google.places_configured ? 'Ready' : 'Connect' }}</span>
            </div>
            <div class="setup-fields">
              <template v-if="!google.places_configured"><label for="setup-places-key">Google Places API key</label><input id="setup-places-key" v-model="placesKey" type="password" autocomplete="new-password" maxlength="4096" placeholder="Paste the server-restricted key" :disabled="busy"><small>Enable Places API (New) and restrict this private key to your backend IP.</small></template>
              <p v-else class="detected-key"><span>✓</span><span><strong>Google Places key detected</strong><small>The key remains on the backend</small></span></p>
              <template v-if="!google.embed_configured"><label for="setup-embed-key">Maps Embed API key <span>Optional</span></label><input id="setup-embed-key" v-model="embedKey" type="password" autocomplete="new-password" maxlength="4096" placeholder="Add for live map previews" :disabled="busy"><small>Use a separate website-restricted key. Direct Google Maps links work without it.</small></template>
              <p v-else class="detected-key"><span>✓</span><span><strong>Maps Embed key detected</strong><small>Live map previews are enabled</small></span></p>
            </div>
            <div class="setup-actions"><button class="setup-back" type="button" :disabled="busy" @click="step=1">← Back</button><button class="setup-primary" type="button" :disabled="busy || (!google.places_configured && !placesKey.trim())" @click="verifyGoogle">{{ busy ? 'Testing Google…' : 'Test Google & continue' }} <span>→</span></button></div>
          </section>

          <section v-else class="setup-panel setup-ready" aria-labelledby="setup-ready-title">
            <span class="ready-orbit" aria-hidden="true"><span>✓</span></span><p class="eyebrow">ALL SYSTEMS READY</p><h3 id="setup-ready-title">Your local guide is ready to roam</h3><p class="setup-lead">The demo will use {{ selected.name }} with {{ profile.model }} and ground place recommendations in live Google data.</p>
            <div class="ready-summary"><div><span class="provider-monogram">{{ selected.name.charAt(0) }}</span><span><small>AI provider</small><strong>{{ selected.name }}</strong></span><b>Connected</b></div><div><span class="google-mark">G</span><span><small>Place data</small><strong>Google Places</strong></span><b>Connected</b></div></div>
            <div class="setup-actions"><button class="setup-back" type="button" :disabled="busy" @click="step=2">← Back</button><button class="setup-primary" type="button" :disabled="busy" @click="finish">{{ busy ? 'Opening demo…' : 'Finish & start chatting' }} <span>→</span></button></div>
          </section>

          <p v-if="status" class="setup-status" role="status">{{ status }}</p>
        </main>
      </div>
    </dialog>
  </Teleport>
</template>
