import { connectSettings, aiPayload, clearAIKeys } from "../../frontend/ai-settings.js";
const API_BASE = document.querySelector('meta[name="api-base"]')?.content || "";
const form = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message");
const apiKeyInput = document.querySelector("#api-key");
const apiKeyWrap = document.querySelector("#api-key-wrap");
const sendButton = document.querySelector("#send");
const modelStatus = document.querySelector("#model-status");
const mapsStatus = document.querySelector("#maps-status");
const notice = document.querySelector("#notice");
const conversation = document.querySelector("#conversation");
const thread = document.querySelector("#thread");
const emptyState = document.querySelector("#empty-state");
const newChatButton = document.querySelector("#new-chat");
const placeTemplate = document.querySelector("#place-template");

const mapDialog = document.querySelector("#map-dialog");
const mapCanvas = document.querySelector("#map-canvas");
const mapFrame = document.querySelector("#map-frame");
const mapLoading = document.querySelector("#map-loading");
const mapUnavailable = document.querySelector("#map-unavailable");
const dialogClose = document.querySelector("#dialog-close");
const dialogTitle = document.querySelector("#dialog-title");
const dialogMapsLink = document.querySelector("#dialog-maps-link");
const dialogPlaceName = document.querySelector("#dialog-place-name");
const dialogAddress = document.querySelector("#dialog-address");
const dialogRating = document.querySelector("#dialog-rating");
const dialogReviews = document.querySelector("#dialog-reviews");
const dialogPhotos = document.querySelector("#dialog-photos");

const ASSISTANT_AVATAR = `
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"></circle>
    <path d="m13.9 7.8-2.1 4.1-4.1 2.2 4.6.1 1.6 2.1.2-4.5 2.2-4-2.4-.1Z" fill="currentColor"></path>
  </svg>`;

let authToken = "";
let history = [];
let currentPlace = null;
let conversationId = null;
let googleMapsPromise = null;
let activeGoogleMap = null;
const CONVERSATION_KEY = "wanderAIConversationId";

try {
  apiKeyInput.value = sessionStorage.getItem("mapsAssistantApiKey") || "";
} catch {
  // Chat and health checks still work when browser storage is blocked.
  apiKeyInput.value = "";
}
apiKeyInput.addEventListener("input", () => {
  try {
    sessionStorage.setItem("mapsAssistantApiKey", apiKeyInput.value);
  } catch {
    // The entered key remains available for this page session.
  }
});

function requestHeaders() {
  const result = { "Content-Type": "application/json" };
  if (authToken) result.Authorization = `Bearer ${authToken}`;
  return result;
}

connectSettings(api);

function errorDetail(body, status) {
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) {
    return body.detail.map((item) => item.msg || "Invalid request").join(". ");
  }
  return `Request failed (${status})`;
}

async function api(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: { ...requestHeaders(), ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && authToken) lockApp();
  if (!response.ok) throw new Error(errorDetail(body, response.status));
  return body;
}

async function postChatStream(path, payload, { onDelta, onDone, onProgress }) {
  const response = await fetch(API_BASE + path, {
    method: "POST", headers: requestHeaders(), body: JSON.stringify(payload),
  });
  if (response.status === 401) lockApp();
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(errorDetail(body, response.status));
  }
  if (!response.body) throw new Error("Streaming is unavailable in this browser.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", final = null;
  const consume = line => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === "delta") onDelta(event.text || "");
    else if (event.type === "done") final = event;
    else if (event.type === "error") throw new Error(event.message || "The response stream failed. Try again.");
    else onProgress?.(event);
  };
  try {
    for (;;) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let newline;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        consume(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
      }
      if (done) break;
    }
    if (buffer.trim()) consume(buffer);
    if (!final) throw new Error("The response stream ended unexpectedly. Try again.");
    onDone(final);
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
}

function createActivity(body) {
  const panel = document.createElement("details");
  panel.className = "agent-activity";
  panel.open = true;
  const summary = document.createElement("summary");
  summary.textContent = "Thinking…";
  panel.classList.add("is-processing");
  panel.setAttribute("aria-busy", "true");
  const status = document.createElement("div");
  status.className = "activity-status";
  status.setAttribute("role", "status");
  const list = document.createElement("ul");
  const reasoning = document.createElement("details");
  reasoning.hidden = true;
  reasoning.open = false;
  const label = document.createElement("summary");
  label.textContent = "Thinking";
  const text = document.createElement("div");
  text.className = "activity-reasoning";
  reasoning.append(label, text);
  panel.append(summary, status, list, reasoning);
  body.prepend(panel);
  const followThinking = () => { text.scrollTop = text.scrollHeight; };
  reasoning.addEventListener("toggle", followThinking);
  panel.addEventListener("toggle", followThinking);
  const tools = new Map();
  return {
    update(event) {
      if (event.type === "status") status.textContent = event.message;
      if (event.type === "tool") {
        let item = tools.get(event.id);
        if (!item) { item = document.createElement("li"); tools.set(event.id, item); list.append(item); }
        item.dataset.state = event.state;
        item.textContent = event.message;
        status.textContent = "";
      }
      if (event.type === "reasoning" && event.text) {
        reasoning.hidden = false;
        text.textContent = (text.textContent + event.text).slice(-24000);
        followThinking();
      }
      scrollToBottom(false);
    },
    finish(failed = false) {
      panel.classList.remove("is-processing");
      panel.setAttribute("aria-busy", "false");
      label.textContent = failed ? "Thinking interrupted" : "Thinking complete";
      summary.textContent = failed ? "Response interrupted" : "Activity complete";
      status.textContent = "";
      for (const item of tools.values()) {
        if (item.dataset.state === "running") {
          item.dataset.state = "error";
          item.textContent += " - interrupted";
        }
      }
      panel.open = failed;
    },
  };
}

function setServiceBadge(element, state, heading, detail) {
  element.classList.remove("checking", "ready", "unavailable");
  element.classList.add(state);
  element.querySelector(".service-copy > span").textContent = heading;
  element.querySelector(".service-copy strong").textContent = detail;
  element.title = `${heading}: ${detail}`;
  element.setAttribute("aria-label", element.title);
}

function setNotice(message = "") {
  notice.textContent = message;
  notice.hidden = !message;
}

function updateSendButton() {
  const busy = form.getAttribute("aria-busy") === "true";
  sendButton.disabled = busy || messageInput.value.trim().length === 0;
}

function setBusy(busy) {
  form.setAttribute("aria-busy", String(busy));
  messageInput.disabled = busy;
  newChatButton.disabled = busy;
  document.querySelector("#logout").disabled = busy;
  updateSendButton();
  if (busy) {
    showTyping();
  } else {
    hideTyping();
  }
}

function formatPlaceType(value) {
  if (!value) return "Place";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function ratingLabel(place) {
  return place.rating == null ? "Rating unavailable" : `★ ${place.rating.toFixed(1)}`;
}

function reviewLabel(place) {
  if (place.rating_count == null) return "";
  const label = place.rating_count === 1 ? "review" : "reviews";
  return `${place.rating_count.toLocaleString()} ${label}`;
}

function renderAnswerText(text, target) {
  target.replaceChildren();
  const normalized = text.replace(/^\s*[-*]\s+/gm, "• ");
  normalized.split(/(\*\*[^*]+\*\*)/g).forEach((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = part.slice(2, -2);
      target.append(strong);
    } else {
      target.append(document.createTextNode(part));
    }
  });
}

function scrollToBottom(smooth = true) {
  conversation.scrollTo({
    top: conversation.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}

function makeAvatar() {
  const avatar = document.createElement("span");
  avatar.className = "msg-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.innerHTML = ASSISTANT_AVATAR;
  return avatar;
}

function hideEmptyState() {
  emptyState.hidden = true;
}

function appendUserBubble(text) {
  const row = document.createElement("div");
  row.className = "msg msg-user";
  const bubble = document.createElement("div");
  bubble.className = "bubble user-bubble";
  bubble.textContent = text;
  row.append(bubble);
  thread.append(row);
  scrollToBottom();
}

function appendPlacesBlock(body, places) {
  const block = document.createElement("div");
  block.className = "places-block";

  const heading = document.createElement("div");
  heading.className = "places-block-heading";
  const label = document.createElement("span");
  label.textContent = "Verified places";
  const count = document.createElement("span");
  count.className = "result-count";
  count.textContent = `${places.length} verified ${places.length === 1 ? "place" : "places"}`;
  heading.append(label, count);

  const grid = document.createElement("div");
  grid.className = "places-grid";
  places.forEach((place, index) => grid.append(renderPlace(place, index)));

  block.append(heading, grid);
  body.append(block);
}

function createAssistantBubble() {
  hideTyping();
  const row = document.createElement("div");
  row.className = "msg msg-assistant";
  const body = document.createElement("div");
  body.className = "msg-body";
  const bubble = document.createElement("div");
  bubble.className = "bubble assistant-bubble";
  body.append(bubble);
  row.append(makeAvatar(), body);
  thread.append(row);
  scrollToBottom(false);
  return { body, bubble };
}

function appendFollowups(body, suggestions) {
    const followups = document.createElement("div");
    followups.className = "followup-actions";
    followups.setAttribute("aria-label", "Suggested follow-up questions");
    for (const prompt of (suggestions || []).slice(0, 3)) {
      if (typeof prompt !== "string" || !prompt.trim()) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = prompt;
      button.addEventListener("click", () => {
        if (form.getAttribute("aria-busy") === "true") return;
        messageInput.value = prompt;
        updateSendButton();
        form.requestSubmit();
      });
      followups.append(button);
    }
    body.append(followups);
}

function appendAssistantBubble(response) {
  const { body, bubble } = createAssistantBubble();
  renderAnswerText(response.answer || "", bubble);
  const places = response.places || [];
  if (places.length) appendPlacesBlock(body, places);
  appendFollowups(body, response.suggestions || []);
}

function showTyping() {
  hideTyping();
  const row = document.createElement("div");
  row.className = "msg msg-assistant";
  row.id = "typing-row";
  const bubble = document.createElement("div");
  bubble.className = "bubble typing-bubble";
  bubble.setAttribute("aria-label", "Wander Pico is thinking");
  [0, 1, 2].forEach(() => bubble.append(document.createElement("span")));
  row.append(makeAvatar(), bubble);
  thread.append(row);
  scrollToBottom();
}

function hideTyping() {
  const typing = thread.querySelector("#typing-row");
  if (typing) typing.remove();
}

async function ensureConversation() {
  if (conversationId) return conversationId;
  const conversation = await api("/api/conversations", { method: "POST" });
  conversationId = conversation.id;
  try { localStorage.setItem(CONVERSATION_KEY, conversationId); } catch {}
  return conversationId;
}

async function newChat() {
  if (form.getAttribute("aria-busy") === "true") return;
  photoObserver?.disconnect();
  thread.querySelectorAll(".msg").forEach((message) => message.remove());
  emptyState.hidden = false;
  history = [];
  conversationId = null;
  try { localStorage.removeItem(CONVERSATION_KEY); } catch {}
  setNotice("");
  messageInput.value = "";
  messageInput.style.height = "auto";
  updateSendButton();
  conversation.scrollTo({ top: 0 });
  messageInput.focus();
  renderHistory();
}

newChatButton.addEventListener("click", () => void newChat());

function mapKeyFromEmbedUrl(url) {
  try { return new URL(url).searchParams.get("key"); } catch { return null; }
}

function loadGoogleMaps(key) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleMapsPromise) return googleMapsPromise;
  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = "__wanderPicoMapsReady";
    const script = document.createElement("script");
    const cleanup = () => { delete window[callbackName]; };
    window[callbackName] = () => {
      cleanup();
      window.google?.maps ? resolve(window.google.maps) : reject(new Error("Google Maps did not load"));
    };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => { cleanup(); reject(new Error("Google Maps failed to load")); };
    document.head.append(script);
  });
  return googleMapsPromise;
}

async function loadInteractiveMap(place, url) {
  const key = mapKeyFromEmbedUrl(url);
  if (!key || !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude) || !mapCanvas) return false;
  try {
    const maps = await loadGoogleMaps(key);
    const Map = (await maps.importLibrary("maps")).Map;
    const colorScheme = document.documentElement.dataset.theme === "dark" ? maps.ColorScheme.DARK : maps.ColorScheme.LIGHT;
    mapCanvas.replaceChildren();
    activeGoogleMap = new Map(mapCanvas, {
      center: { lat: place.latitude, lng: place.longitude }, zoom: 16,
      colorScheme, fullscreenControl: true, streetViewControl: false, mapTypeControl: false,
    });
    mapCanvas.hidden = false;
    mapFrame.hidden = true;
    mapLoading.hidden = true;
    return true;
  } catch {
    return false;
  }
}

function loadEmbeddedMap(place, url) {
  activeGoogleMap = null;
  mapCanvas.hidden = true;
  mapCanvas.replaceChildren();
  mapLoading.hidden = !url;
  mapUnavailable.hidden = Boolean(url);
  mapFrame.hidden = !url;
  if (url) {
    mapFrame.src = url;
  } else {
    mapFrame.removeAttribute("src");
  }
  if (url) void loadInteractiveMap(place, url);
}

mapFrame.addEventListener("load", () => {
  if (mapFrame.src && currentPlace) mapLoading.hidden = true;
});

mapFrame.addEventListener("error", () => {
  mapLoading.hidden = true;
  mapFrame.hidden = true;
  mapUnavailable.hidden = false;
});

const MAX_DIALOG_PHOTOS = 6;

function loadDialogPhotos(place) {
  dialogPhotos.replaceChildren();
  const photos = (place.photos || []).slice(0, MAX_DIALOG_PHOTOS);
  if (!photos.length) {
    const empty = document.createElement("p");
    empty.className = "gallery-empty";
    empty.textContent = "No photos are available for this place from Google yet.";
    dialogPhotos.append(empty);
    return;
  }
  photos.forEach((photo) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item";
    const img = document.createElement("img");
    img.alt = `${place.name} photo`;
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    const caption = document.createElement("figcaption");
    caption.textContent = "Google Maps";
    const author = (photo.authorAttributions || []).find((item) => item.displayName);
    if (author) {
      caption.append(" · ");
      const credit = document.createElement("a");
      credit.textContent = author.displayName;
      if (author.uri?.startsWith("https://")) {
        credit.href = author.uri;
        credit.target = "_blank";
        credit.rel = "noopener noreferrer";
      }
      caption.append(credit);
    }
    figure.append(img, caption);
    dialogPhotos.append(figure);
    api("/api/places/photo", {
      method: "POST",
      body: JSON.stringify({ name: photo.name }),
    })
      .then(({ url }) => {
        if (!figure.isConnected) return;
        img.onerror = () => {
          figure.classList.remove("has-photo");
          figure.classList.add("unavailable");
          caption.textContent = "Photo unavailable";
        };
        img.src = url;
        figure.classList.add("has-photo");
      })
      .catch(() => {
        if (!figure.isConnected) return;
        figure.classList.add("unavailable");
        caption.textContent = "Photo unavailable";
      });
  });
}

function openPlaceMap(place) {
  currentPlace = place;
  dialogTitle.textContent = place.name;
  dialogPlaceName.textContent = place.name;
  dialogAddress.textContent = place.address || "Address unavailable";
  dialogRating.textContent = ratingLabel(place);
  dialogReviews.textContent = reviewLabel(place);
  dialogMapsLink.href = place.google_maps_url;
  loadEmbeddedMap(place, place.embed_url);
  loadDialogPhotos(place);
  mapDialog.showModal();
}

new MutationObserver(() => {
  if (currentPlace && activeGoogleMap) loadEmbeddedMap(currentPlace, currentPlace.embed_url);
}).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

const photoObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          photoObserver.unobserve(entry.target);
          entry.target.loadPlacePhoto();
        }
      });
    }, { root: conversation })
  : null;

function attachPlacePhoto(card, place) {
  const visual = card.querySelector(".place-visual");
  visual.removeAttribute("aria-hidden");
  const caption = document.createElement("span");
  caption.className = "photo-caption";
  caption.textContent = place.photo ? "Loading photo…" : "Photo unavailable";
  visual.append(caption);
  if (!place.photo) return;

  visual.loadPlacePhoto = async () => {
    try {
      const { url } = await api("/api/places/photo", {
        method: "POST",
        body: JSON.stringify({ name: place.photo.name }),
      });
      if (!visual.isConnected) return;
      const img = document.createElement("img");
      img.className = "place-photo";
      img.alt = place.name;
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.onload = () => {
        visual.classList.add("has-photo");
        caption.replaceChildren(document.createTextNode("Google Maps"));
        (place.photo.authorAttributions || []).forEach((author) => {
          if (!author.displayName) return;
          caption.append(document.createTextNode(" · "));
          const credit = document.createElement("a");
          credit.textContent = author.displayName;
          if (author.uri?.startsWith("https://")) {
            credit.href = author.uri;
            credit.target = "_blank";
            credit.rel = "noopener noreferrer";
          }
          caption.append(credit);
        });
      };
      img.onerror = () => {
        img.remove();
        caption.textContent = "Photo unavailable";
      };
      img.src = url;
      visual.prepend(img);
    } catch {
      caption.textContent = "Photo unavailable";
    }
  };
  if (photoObserver) photoObserver.observe(visual);
  else requestAnimationFrame(() => visual.loadPlacePhoto());
}

function renderPlace(place, index) {
  const card = placeTemplate.content.firstElementChild.cloneNode(true);
  const openDetails = () => openPlaceMap(place);
  card.tabIndex = 0;
  card.setAttribute("aria-label", `View details for ${place.name}`);
  card.querySelector(".place-number").textContent = String(index + 1).padStart(2, "0");
  card.querySelector(".place-type").textContent = formatPlaceType(place.primary_type);
  card.querySelector("h3").textContent = place.name;
  card.querySelector(".address").textContent = place.address || "Address unavailable";
  card.querySelector(".rating").textContent = ratingLabel(place);
  card.querySelector(".review-count").textContent = reviewLabel(place);
  card.querySelector(".place-maps-link").href = place.google_maps_url;
  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    openDetails();
  });
  card.addEventListener("keydown", (event) => {
    if (event.target !== card || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    openDetails();
  });
  card.querySelector(".map-button").addEventListener("click", openDetails);
  attachPlacePhoto(card, place);
  return card;
}

dialogClose.addEventListener("click", () => mapDialog.close());
mapDialog.addEventListener("click", (event) => {
  if (event.target === mapDialog) mapDialog.close();
});
mapDialog.addEventListener("close", () => {
  mapFrame.removeAttribute("src");
  mapLoading.hidden = true;
  mapUnavailable.hidden = true;
  dialogPhotos.replaceChildren();
  currentPlace = null;
});

document.querySelectorAll(".suggestion-card").forEach((chip) => {
  chip.addEventListener("click", () => {
    messageInput.value = chip.dataset.prompt;
    messageInput.style.height = "auto";
    messageInput.style.height = `${Math.min(messageInput.scrollHeight, 180)}px`;
    updateSendButton();
    form.requestSubmit();
  });
});

messageInput.addEventListener("input", () => {
  updateSendButton();
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 180)}px`;
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message || form.getAttribute("aria-busy") === "true") return;

  setNotice("");
  hideEmptyState();
  appendUserBubble(message);
  messageInput.value = "";
  messageInput.style.height = "auto";
  updateSendButton();
  setBusy(true);

  const assistant = createAssistantBubble();
  const activity = createActivity(assistant.body);
  activity.update({type: "status", message: "Connecting..."});
  let streamedAnswer = "";
  const finish = (event) => {
    activity.finish();
    const finalAnswer = (event.answer || streamedAnswer).trim();
    renderAnswerText(finalAnswer, assistant.bubble);
    if (event.places?.length) appendPlacesBlock(assistant.body, event.places);
    appendFollowups(assistant.body, event.suggestions || []);
    history.push(
      { role: "user", content: message },
      { role: "assistant", content: finalAnswer },
    );
    history = history.slice(-20);
    setServiceBadge(modelStatus, "ready", "AI", "Connected");
    if (event.places?.length) setServiceBadge(mapsStatus, "ready", "Google Maps", "Places live");
  };

  try {
    await ensureConversation();
    await postChatStream(
      "/api/chat/stream",
      {
        message,
        history: history.slice(-12),
        conversation_id: conversationId,
        ai: aiPayload(),
      },
      {
        onDelta: (text) => {
          streamedAnswer += text;
          renderAnswerText(streamedAnswer, assistant.bubble);
          scrollToBottom(false);
        },
        onProgress: event => activity.update(event),
        onDone: finish,
      },
    );
  } catch (error) {
    activity.finish(true);
    setNotice(error.message);
    if (assistant && streamedAnswer) renderAnswerText(streamedAnswer, assistant.bubble);
    if (error.message.toLowerCase().includes("api key")) {
      apiKeyWrap.hidden = false;
      apiKeyWrap.open = true;
      apiKeyInput.focus();
    }
  } finally {
    setBusy(false);
    if (authToken) await refreshHistory().catch(error => setNotice(error.message));
    messageInput.focus();
  }
});

async function checkServices() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const [healthResult, configResult] = await Promise.allSettled([
    fetch(API_BASE + "/health", { signal: controller.signal, cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("Health check failed");
      return response.json();
    }),
    fetch(API_BASE + "/api/config", { signal: controller.signal, cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("Configuration check failed");
      return response.json();
    }),
  ]);
  clearTimeout(timeout);

  if (healthResult.status === "fulfilled") {
    const health = healthResult.value;
    const modelReady = health.model_available ?? health.status === "ok";
    const modelName = health.model || "AI model";
    const providerName = "Server default";
    setServiceBadge(
      modelStatus,
      modelReady ? "ready" : "unavailable",
      providerName,
      modelReady ? modelName : "Unavailable",
    );
    const mapsReady = health.places_configured;
    setServiceBadge(
      mapsStatus,
      mapsReady ? "ready" : "unavailable",
      "Google Maps",
      mapsReady ? "Places ready" : "Needs setup",
    );
  } else {
    setServiceBadge(modelStatus, "unavailable", "AI", "Backend offline");
    setServiceBadge(mapsStatus, "unavailable", "Google Maps", "Backend offline");
  }

  if (configResult.status === "fulfilled") {
    apiKeyWrap.hidden = !configResult.value.api_auth_required;
    window.dispatchEvent(new CustomEvent("wander-config", { detail: configResult.value }));
  }
}

updateSendButton();
checkServices();
// Refresh after transient startup failures and when returning to the app.
setInterval(() => {
  if (!document.hidden) checkServices();
}, 30000);
window.addEventListener("focus", checkServices);

const authPage = document.querySelector("#auth-page");
const authForm = document.querySelector("#auth-form");
const authError = document.querySelector("#auth-error");
const sidebarToggle = document.querySelector("#sidebar-toggle");
const sidebarBackdrop = document.querySelector("#sidebar-backdrop");
function setSidebar(open) {
  document.body.classList.toggle("sidebar-open", open);
  sidebarToggle.setAttribute("aria-expanded", String(open));
  sidebarBackdrop.hidden = !open;
}
let savedChats = [];
let registering = false;
function authMode() {
  registering = location.hash === "#register";
  document.querySelector("#auth-title").textContent = registering ? "Create your account" : "Welcome back";
  document.querySelector("#identifier-label").firstChild.textContent = registering ? "Username" : "Username or email";
  document.querySelector("#register-email-label").hidden = !registering;
  document.querySelector("#register-email").required = registering;
  document.querySelector("#password").minLength = registering ? 8 : 1;
  document.querySelector("#password").autocomplete = registering ? "new-password" : "current-password";
  const authSubmit = document.querySelector("#auth-submit");
  const authToggle = document.querySelector("#auth-toggle");
  authSubmit.querySelector(".auth-submit-label").textContent = registering ? "Create account" : "Log in";
  authToggle.querySelector(".auth-toggle-label").textContent = registering ? "Log in instead" : "Create an account";
  document.querySelector("#auth-toggle-description").textContent = registering ? "Already have an account?" : "New to Wander Pico?";
  authSubmit.querySelector(".auth-icon-login").toggleAttribute("hidden", registering);
  authSubmit.querySelector(".auth-icon-register").toggleAttribute("hidden", !registering);
  authToggle.querySelector(".auth-icon-login").toggleAttribute("hidden", !registering);
  authToggle.querySelector(".auth-icon-register").toggleAttribute("hidden", registering);
  authToggle.href = registering ? "#login" : "#register";
  authError.textContent = "";
  document.querySelector("#auth-success").textContent = "";
}
window.addEventListener("hashchange", authMode);
authMode();
function lockApp() {
  clearAIKeys();
  authToken = "";
  history = [];
  savedChats = [];
  conversationId = null;
  thread.querySelectorAll(".msg").forEach(node => node.remove());
  document.querySelector("#history-list").replaceChildren();
  setSidebar(false);
  emptyState.hidden = false;
  mapDialog.close();
  mapFrame.removeAttribute("src");
  currentPlace = null;
  document.body.classList.add("auth-locked");
  authPage.hidden = false;
  authForm.reset();
  window.dispatchEvent(new Event("wander-locked"));
}
authForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = document.querySelector("#auth-submit");
  button.disabled = true;
  authError.textContent = "";
  document.querySelector("#auth-success").textContent = "";
  try {
    const identifier = document.querySelector("#identifier").value.trim();
    const password = document.querySelector("#password").value;
    if (registering) {
      await api("/api/auth/register", {method:"POST",body:JSON.stringify({username:identifier,email:document.querySelector("#register-email").value.trim(),password})});
      location.hash = "login";
      authMode();
      document.querySelector("#password").value = "";
      setTimeout(() => { document.querySelector("#auth-success").textContent = "Your account is ready! Log in to start exploring."; }, 0);
    } else {
      const result = await api("/api/auth/login", {method:"POST",body:JSON.stringify({identifier,password})});
      authToken = result.token;
      authForm.reset();
      document.body.classList.remove("auth-locked");
      authPage.hidden = true;
      await refreshHistory();
      if (savedChats.length) await openChat(savedChats[0].id);
      else await newChat();
      window.dispatchEvent(new Event("wander-authenticated"));
      messageInput.focus();
    }
  } catch(error) {
    if (authToken) setNotice(error.message);
    else authError.textContent = error.message;
  } finally { button.disabled = false; }
});
document.querySelector("#logout").addEventListener("click", async () => {
  if (form.getAttribute("aria-busy") === "true") return;
  try { await api("/api/auth/logout", {method:"POST"}); lockApp(); }
  catch(error) { setNotice(error.message); }
});
sidebarToggle.addEventListener("click", () => {
  const open = !document.body.classList.contains("sidebar-open");
  setSidebar(open);
  if (open) refreshHistory().catch(error => setNotice(error.message));
});
sidebarBackdrop.addEventListener("click", () => setSidebar(false));
async function refreshHistory() {
  savedChats = await api("/api/conversations");
  renderHistory();
}
function renderHistory() {
  const list = document.querySelector("#history-list");
  const query = document.querySelector("#history-search").value.toLowerCase();
  list.replaceChildren();
  savedChats.filter(chat => chat.title.toLowerCase().includes(query)).forEach(chat => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.setAttribute("aria-current", String(chat.id === conversationId));
    const title = document.createElement("span");
    title.className = "history-title";
    title.textContent = chat.title;
    button.title = chat.title;
    button.append(title);
    const date = document.createElement("small");
    const updatedAt = new Date(chat.updated_at.replace(" ", "T") + "Z");
    date.textContent = updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric", ...(updatedAt.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}) });
    date.title = updatedAt.toLocaleString();
    button.append(date);
    button.addEventListener("click", () => openChat(chat.id).catch(error => setNotice(error.message)));
    list.append(button);
  });
  if (!list.children.length) list.textContent = "No saved chats found.";
}
document.querySelector("#history-search").addEventListener("input", renderHistory);
async function openChat(id) {
  if (form.getAttribute("aria-busy") === "true") return;
  setBusy(true);
  try {
    const saved = await api(`/api/conversations/${encodeURIComponent(id)}`);
    photoObserver?.disconnect();
    thread.querySelectorAll(".msg").forEach(node => node.remove());
    history = saved.messages || [];
    conversationId = saved.id;
    emptyState.hidden = history.length > 0;
    history.forEach(message => {
      if (message.role === "user") appendUserBubble(message.content);
      else appendAssistantBubble({...message, answer:message.content});
    });
    setNotice("");
    renderHistory();
    setSidebar(false);
    scrollToBottom(false);
  } finally { setBusy(false); }
}
window.addEventListener("pageshow", event => { if (event.persisted) lockApp(); });
