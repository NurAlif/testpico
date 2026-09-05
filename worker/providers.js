import catalog from '../app/providers.json' with { type: 'json' };
export { catalog };
export function providerConfig(env, selection = {}) {
  const provider = selection.provider || env.AI_PROVIDER || 'deepseek';
  if (!Object.hasOwn(catalog, provider)) throw new Error('Unknown AI provider');
  const item = catalog[provider];
  const key = selection.api_key || env[`${provider.toUpperCase()}_API_KEY`] || '';
  const model = selection.model || env[`${provider.toUpperCase()}_MODEL`] || item.model;
  if (typeof model !== 'string' || !model.trim() || model.length > 200 || typeof key !== 'string' || key.length > 4096 || /[\r\n]/.test(key)) throw new Error('Invalid AI settings');
  const url = provider === 'ollama'
    ? env.OLLAMA_BASE_URL?.replace(/\/$/, '') + '/v1'
    : item.base_url_env ? (env[item.base_url_env] || item.url).replace(/\/$/, '') : item.url;
  if (provider === 'ollama' && !env.OLLAMA_BASE_URL) throw new Error('Local Ollama is not configured on this server');
  if (provider !== 'ollama' && item.requires_api_key !== false && !key) throw new Error(`${item.name} API key is not configured`);
  return { provider, model, key, url, name: item.name };
}
export function providerInfo(env) {
  return { default_provider: env.AI_PROVIDER || 'deepseek', providers: Object.entries(catalog).map(([id, p]) => ({id, name:p.name, model:env[`${id.toUpperCase()}_MODEL`] || p.model, configured: id === 'ollama' ? Boolean(env.OLLAMA_BASE_URL) : p.requires_api_key === false || Boolean(env[`${id.toUpperCase()}_API_KEY`]), available:id !== 'ollama' || Boolean(env.OLLAMA_BASE_URL)})) };
}
