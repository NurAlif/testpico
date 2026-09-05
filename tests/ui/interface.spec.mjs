import { test, expect } from '@playwright/test';
const chats = [{id:'beach', title:'A beach escape in Gunungkidul', updated_at:'2026-09-05 03:00:00'}, {id:'food', title:'Good food around Blok M', updated_at:'2026-09-04 02:00:00'}];
async function setup(page, saved = false, firstRun = null) {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('**/health', route => route.fulfill({json:{status:'ok',model_available:true,model:'Assistant ready',places_configured:true}}));
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let json = {};
    if (url.pathname === '/api/config') json = {local_setup_available:Boolean(firstRun)};
    if (url.pathname === '/api/auth/login') json = {token:'test-token'};
    if (url.pathname === '/api/conversations') json = route.request().method() === 'POST' ? {id:'new'} : saved ? chats : [];
    if (url.pathname === '/api/conversations/beach') json = {id:'beach',messages:[{role:'user',content:'I want to go to the beach. Find a good beach in Gunungkidul.'},{role:'assistant',content:'**Sadranan Beach** is a lovely place for a slower day by the sea. Explore the sandy shore, try snorkeling, or settle in at a local café.\n\n**Address:** Pule Gundes II, Sidoharjo, Tepus, Gunungkidul, Yogyakarta.\n\nGo early for a quieter visit and check local conditions before swimming.'}]};
    if (url.pathname === '/api/chat/stream') return route.fulfill({contentType:'application/x-ndjson',body:JSON.stringify({type:'delta',text:'A lovely local spot.'})+'\n'+JSON.stringify({type:'done',answer:'A lovely local spot.',places:[],suggestions:['What else is nearby?']})+'\n'});
    if (firstRun && url.pathname === '/api/setup') {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        if (body.google_places_api_key) firstRun.google.places_configured = true;
        if (body.google_maps_embed_api_key) firstRun.google.embed_configured = true;
        if (body.complete) firstRun.complete = true;
      }
      json = firstRun;
    }
    if (firstRun && url.pathname === '/api/setup/google/test') json = {ok:true,message:'Google Places is connected and ready for live place results.'};
    if (firstRun && url.pathname === '/api/providers/test') json = {ok:true};
    if (firstRun && url.pathname === '/api/providers') json = firstRun;
    if (firstRun && url.pathname === '/api/providers/key') json = {saved:true};
    if (firstRun && url.pathname === '/api/providers/models') json = {models:['qwen3.5:9b']};
    return route.fulfill({json});
  });
  await page.goto('/');
  await expect(page.locator('#auth-submit')).toBeVisible();
  await page.locator('#identifier').fill('testuser');
  await page.locator('#password').fill('password');
  await page.locator('#auth-submit').click();
  await expect(page.locator('.app-shell')).toBeVisible();
  await expect(page.locator('#chat-form')).not.toHaveAttribute('aria-busy', 'true');
  return errors;
}

test('first local login runs the guided setup once and reaches chat', async ({page}) => {
  const firstRun = {
    available:true,
    complete:false,
    key_storage_available:true,
    default_provider:'gemini',
    google:{places_configured:true,embed_configured:true},
    providers:[
      {id:'gemini',name:'Google Gemini',model:'gemini-flash-latest',configured:true,available:true},
      {id:'deepseek',name:'DeepSeek',model:'deepseek-chat',configured:true,available:true},
      {id:'openrouter',name:'OpenRouter',model:'openrouter/free',configured:false,available:true},
      {id:'groq',name:'Groq',model:'llama-3.3-70b-versatile',configured:false,available:true},
      {id:'ollama',name:'Local Ollama',model:'qwen3.5:9b',configured:false,available:false},
    ],
  };
  const errors = await setup(page, false, firstRun);
  const wizard = page.getByRole('dialog',{name:'From clone to conversation.'});
  await expect(wizard).toBeVisible();
  await page.screenshot({path:'test-results/setup-provider.png',fullPage:true});
  await expect(page.getByText('API key detected',{exact:true})).toBeVisible();
  await expect(wizard).not.toContainText('private-key');
  await page.getByRole('button',{name:/Test & continue/}).click();
  await expect(page.getByRole('heading',{name:'Bring real places into every answer'})).toBeVisible();
  await expect(page.getByText('Google Places key detected',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:/Test Google & continue/}).click();
  await expect(page.getByRole('heading',{name:'Your local guide is ready to roam'})).toBeVisible();
  await page.screenshot({path:'test-results/setup-ready.png',fullPage:true});
  await page.getByRole('button',{name:/Finish & start chatting/}).click();
  await expect(wizard).toBeHidden();
  expect(firstRun.complete).toBe(true);
  const sent = page.waitForRequest('**/api/chat/stream');
  await page.locator('#message').fill('Find a quiet cafe in Bandung');
  await page.locator('#send').click();
  expect((await sent).postDataJSON().ai).toMatchObject({provider:'gemini',model:'gemini-flash-latest'});
  await expect(page.locator('.assistant-bubble')).toContainText('A lovely local spot.');
  await page.locator('#logout').click();
  await page.locator('#identifier').fill('testuser');
  await page.locator('#password').fill('password');
  await page.locator('#auth-submit').click();
  await expect(wizard).toBeHidden();
  expect(errors).toEqual([]);
});
test('Vue welcome, suggestion, streaming response, and logout', async ({page}) => {
  const errors = await setup(page);
  await expect(page.locator('#app')).toHaveAttribute('data-v-app', '');
  await expect(page.locator('#send')).toBeDisabled();
  await expect(page.locator('.suggestion-card')).toHaveCount(4);
  await page.screenshot({path:'test-results/welcome-desktop.png',fullPage:true});
  await page.getByRole('button',{name:/Find my coffee spot/}).click();
  await expect(page.locator('.user-bubble')).toContainText('Quiet work cafés');
  await expect(page.locator('.assistant-bubble')).toContainText('A lovely local spot.');
  await page.locator('#logout').click();
  await expect(page.locator('#auth-page')).toBeVisible();
  await expect(page.locator('.app-shell')).toBeHidden();
  expect(errors).toEqual([]);
});
test('saved chat selection, search and new chat', async ({page}) => {
  const errors = await setup(page, true);
  await expect(page.locator('[aria-current="true"]')).toContainText('A beach escape');
  await expect(page.locator('.assistant-bubble')).toContainText('Sadranan Beach');
  await page.screenshot({path:'test-results/chat-desktop.png',fullPage:true});
  await page.locator('#history-search').fill('food');
  await expect(page.locator('.history-item')).toHaveCount(1);
  await page.locator('#new-chat').click();
  await expect(page.locator('#empty-state')).toBeVisible();
  expect(errors).toEqual([]);
});
test('mobile navigation and layout', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  const errors = await setup(page);
  await expect(page.locator('#sidebar-toggle')).toBeVisible();
  await page.screenshot({path:'test-results/welcome-mobile.png',fullPage:true});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#sidebar-toggle').click();
  await expect(page.locator('#sidebar-toggle')).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#new-chat')).toBeVisible();
  await page.locator('#sidebar-backdrop').click({position:{x:360,y:400}});
  await expect(page.locator('#sidebar-toggle')).toHaveAttribute('aria-expanded','false');
  await page.locator('#message').fill('A quiet park');
  await page.locator('#send').click();
  await expect(page.locator('.assistant-bubble')).toContainText('A lovely local spot.');
  expect(errors).toEqual([]);
});

test('theme follows the system preference by default and remembers a manual choice', async ({page}) => {
  await page.emulateMedia({colorScheme: 'dark'});
  const errors = await setup(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const toggle = page.getByRole('switch', {name: 'Switch to light mode'});
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('switch', {name: 'Switch to dark mode'})).toHaveAttribute('aria-checked', 'false');
  expect(await page.evaluate(() => localStorage.getItem('wander-pico-theme'))).toBe('light');
  expect(errors).toEqual([]);
});

test('authentication actions remain visible and icon-labelled in dark mode', async ({page}) => {
  await page.emulateMedia({colorScheme: 'dark'});
  const errors = await setup(page);
  await page.locator('#logout').click();
  const accountLink = page.locator('#auth-toggle');
  await expect(accountLink).toBeVisible();
  await expect(accountLink.locator('svg:not([hidden])')).toHaveCount(1);
  await expect(accountLink).toHaveCSS('color', 'rgb(154, 223, 209)');
  await expect(accountLink).toHaveCSS('background-color', 'rgb(41, 68, 62)');
  await expect(page.locator('#auth-submit').locator('svg:not([hidden])')).toHaveCount(1);
  await page.screenshot({path:'test-results/auth-dark-actions.png',fullPage:true,animations:'disabled'});
  await accountLink.click();
  await expect(page.locator('#auth-submit')).toContainText('Create account');
  await expect(page.locator('#auth-toggle')).toContainText('Log in instead');
  await expect(page.locator('#auth-submit').locator('.auth-icon-register')).toBeVisible();
  expect(errors).toEqual([]);
});

test('map card, unavailable preview, dialog close and registration mode', async ({page}) => {
  const errors = await setup(page);
  await page.route('**/api/chat/stream', route => route.fulfill({contentType:'application/x-ndjson',body:JSON.stringify({type:'done',answer:'Try this beach.',places:[{name:'Sadranan Beach',address:'Tepus, Gunungkidul',rating:4.6,rating_count:1900,google_maps_url:'https://www.google.com/maps/search/?api=1&query=Sadranan',primary_type:'beach'}]})+'\n'}));
  await page.locator('#message').fill('Find a beach');
  await page.locator('#send').click();
  await expect(page.locator('.place-card')).toContainText('Sadranan Beach');
  await page.locator('.place-card').click();
  await expect(page.locator('#map-dialog')).toBeVisible();
  await expect(page.locator('#map-unavailable')).toBeVisible();
  await page.getByRole('button',{name:'Close map'}).click();
  await expect(page.locator('#map-dialog')).toBeHidden();
  await page.locator('#logout').click();
  await page.locator('#auth-toggle').click();
  await expect(page.locator('#auth-title')).toHaveText('Create your account');
  await expect(page.locator('#register-email')).toBeVisible();
  await page.locator('#auth-toggle').click();
  await expect(page.locator('#register-email')).toBeHidden();
  expect(errors).toEqual([]);
});

 test('AI modal saves keys on the backend and sends key-free chat requests', async ({page}) => {
  const errors = await setup(page);
  let savedKey = null;
  await page.route('**/api/providers/key', route => {
    savedKey = route.request().postDataJSON().api_key;
    return route.fulfill({json:{saved:Boolean(savedKey)}});
  });
  await page.route('**/api/providers', route => route.fulfill({json:{key_storage_available:true,default_provider:'deepseek',providers:[{id:'deepseek',model:'deepseek-v4-flash',configured:true,available:true},{id:'openrouter',model:'openrouter/free',configured:Boolean(savedKey),saved_key:Boolean(savedKey),available:true},{id:'ollama',configured:false,available:false}]}}));
  await page.route('**/api/providers/models', route => route.fulfill({json:{models:['openrouter/free','provider/example']}}));
  await page.route('**/api/providers/test', route => route.fulfill({json:{ok:true}}));
  await page.locator('#ai-settings-button').click();
  await expect(page.getByRole('dialog',{name:'Your AI, your choice'})).toBeVisible();
  await page.locator('#ai-provider').selectOption('openrouter');
  await page.locator('#ai-provider-key').fill('secret-test-key');
  await page.getByRole('button',{name:'Load available models'}).click();
  await expect(page.locator('#ai-model-options option')).toHaveCount(2);
  await page.getByRole('button',{name:'Test connection'}).click();
  await expect(page.getByRole('status').filter({hasText:'Connected.'})).toBeVisible();
  await page.getByRole('button',{name:'Save API key',exact:true}).click();
  await expect(page.locator('#ai-provider-key')).toHaveCount(0);
  expect(savedKey).toBe('secret-test-key');
  await expect(page.getByText('Saved to your account', {exact:true})).toBeVisible();
  await page.screenshot({path:'test-results/ai-settings-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Save settings'}).click();
  await expect(page.locator('#ai-settings-button')).toContainText('OpenRouter');
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('secret-test-key');
  const sent = page.waitForRequest('**/api/chat/stream');
  await page.locator('#message').fill('Hello'); await page.locator('#send').click();
  const payload = (await sent).postDataJSON().ai;
  expect(payload).toMatchObject({provider:'openrouter',model:'openrouter/free'});
  expect(payload).not.toHaveProperty('api_key');
  await expect(page.locator('#logout')).toBeEnabled();
  await page.locator('#logout').click();
  await page.locator('#identifier').fill('testuser'); await page.locator('#password').fill('password'); await page.locator('#auth-submit').click();
  await page.locator('#ai-settings-button').click();
  await expect(page.locator('#ai-provider-key')).toHaveCount(0);
  await expect(page.getByText('Saved to your account', {exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Replace API key'}).click();
  await expect(page.locator('#ai-provider-key')).toHaveValue('');
  await page.locator('#ai-provider-key').fill('discard-me');
  await page.getByRole('button',{name:'Cancel replacement'}).click();
  await expect(page.locator('#ai-provider-key')).toHaveCount(0);
  await page.getByRole('button',{name:'Replace API key'}).click();
  await expect(page.locator('#ai-provider-key')).toHaveValue('');
  await page.locator('#ai-provider-key').fill('replacement-key');
  await page.getByRole('button',{name:'Save API key',exact:true}).click();
  await expect(page.locator('#ai-provider-key')).toHaveCount(0);
  expect(savedKey).toBe('replacement-key');
  await page.getByRole('button',{name:'Remove saved key'}).click();
  await expect(page.getByRole('button',{name:'Remove saved key'})).toHaveCount(0);
  expect(savedKey).toBeNull();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'Your AI, your choice'})).toBeHidden();
  expect(errors).toEqual([]);
});

test('AI settings fits mobile and explains unavailable local fallback', async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await setup(page);
  await page.route('**/api/providers', route => route.fulfill({json:{default_provider:'deepseek',providers:[{id:'ollama',available:false}]}}));
  await page.locator('#sidebar-toggle').click(); await page.locator('#ai-settings-button').click();
  await expect(page.getByLabel('Use local Ollama if this provider fails')).toBeDisabled();
  await page.locator('#ai-provider').selectOption('ollama');
  await expect(page.locator('#ai-provider-key')).toHaveCount(0);
  await page.screenshot({path:'test-results/ai-settings-mobile.png',fullPage:true});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Ollama automatically loads installed models into a select and uses the chosen model', async ({page}) => {
  const errors = await setup(page);
  let models = ['qwen3.5:9b','gemma4:26b'];
  await page.route('**/api/providers', route => route.fulfill({json:{default_provider:'deepseek',providers:[{id:'deepseek',model:'deepseek-v4-flash',configured:true,available:true},{id:'ollama',model:'qwen3.5:9b',configured:true,available:true}]}}));
  await page.route('**/api/providers/models', route => route.fulfill({json:{models}}));
  await page.route('**/api/providers/test', route => route.fulfill({json:{ok:true,message:'Ollama is connected and this chat model is installed.'}}));
  await page.locator('#ai-settings-button').click();
  await page.locator('#ai-provider').selectOption('ollama');
  await expect(page.locator('select#ai-model option')).toHaveCount(2);
  await expect(page.locator('#ai-model')).toHaveValue('qwen3.5:9b');
  await page.locator('#ai-model').selectOption('gemma4:26b');
  const probe = page.waitForRequest('**/api/providers/test');
  await page.getByRole('button',{name:'Test connection'}).click();
  expect((await probe).postDataJSON().model).toBe('gemma4:26b');
  await expect(page.getByText('Ollama is connected and this chat model is installed.')).toBeVisible();
  await page.screenshot({path:'test-results/ollama-settings.png',fullPage:true});
  await page.getByRole('button',{name:'Save settings'}).click();
  const chat = page.waitForRequest('**/api/chat/stream');
  await page.locator('#message').fill('Hi'); await page.locator('#send').click();
  expect((await chat).postDataJSON().ai).toMatchObject({provider:'ollama',model:'gemma4:26b'});
  await page.locator('#ai-settings-button').click();
  await expect(page.locator('#ai-model')).toHaveValue('gemma4:26b');
  models = ['new-model:latest'];
  await page.getByRole('button',{name:'Refresh installed models'}).click();
  await expect(page.locator('#ai-model')).toHaveValue('new-model:latest');
  models = [];
  await page.getByRole('button',{name:'Refresh installed models'}).click();
  await expect(page.getByRole('button',{name:'Save settings'})).toBeDisabled();
  await expect(page.getByText('No chat models installed.',{exact:false})).toBeVisible();
  expect(errors).toEqual([]);
});

test('dark conversation and workspace controls stay subdued and fit mobile', async ({page}) => {
  await page.emulateMedia({colorScheme:'dark'});
  await setup(page);
  await page.getByRole('button',{name:/Find my coffee spot/}).click();
  const followup = page.locator('.followup-actions button').first();
  await expect(followup).toBeVisible();
  await expect(followup).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await expect(page.locator('.user-bubble')).toHaveCSS('color','rgb(232, 240, 238)');
  await page.locator('.docs-link').hover();
  await expect(page.locator('.docs-link')).toHaveCSS('background-color','rgb(42, 55, 52)');
  await page.screenshot({path:'test-results/chat-dark-refined.png',fullPage:true});
  await followup.click();
  await expect(page.locator('.user-bubble').last()).toContainText('What else is nearby?');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#sidebar-toggle').click();
  await expect(page.locator('.sidebar-utilities')).toBeVisible();
  await page.screenshot({path:'test-results/workspace-dark-mobile.png',fullPage:true,animations:'disabled'});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
