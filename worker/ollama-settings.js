import { providerConfig } from './providers.js';
async function ollamaRequest(env, selection, path, body) {
  const config = providerConfig(env, {...selection,provider:'ollama'});
  let response;
  try {
    response = await fetch(`${config.url.slice(0,-3)}${path}`, {method:body?'POST':'GET',headers:{'content-type':'application/json',...(config.key?{authorization:`Bearer ${config.key}`}:{})},body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(15000)});
  } catch {throw new Error('Cannot reach Ollama from this server. Check the configured Ollama connection.');}
  if (response.status === 404) throw new Error('Ollama model or endpoint not found. Refresh the model list and check the server connection.');
  if (!response.ok) throw new Error(`Ollama connection failed (HTTP ${response.status})`);
  return response.json();
}
export async function ollamaModels(env, selection) {
  const data = await ollamaRequest(env,selection,'/api/tags');
  const models = [];
  for (const item of data.models || []) {
    if (typeof item.name !== 'string') continue;
    const details = await ollamaRequest(env,selection,'/api/show',{model:item.name});
    if (!details.capabilities || details.capabilities.includes('completion')) models.push(item.name);
  }
  return {models:[...new Set(models)].sort()};
}
export async function testOllama(env, selection) {
  const {model} = providerConfig(env, {...selection,provider:'ollama'});
  const details = await ollamaRequest(env,selection,'/api/show',{model});
  if (details.capabilities && !details.capabilities.includes('completion')) throw new Error('This model does not support chat. Choose an installed chat model.');
  return {ok:true,model,message:'Ollama is connected and this chat model is installed.'};
}
