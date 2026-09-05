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

let history = [];
let currentPlace = null;
let conversationId = null;
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
  if (apiKeyInput.value) result.Authorization = `Bearer ${apiKeyInput.value}`;
  return result;
}

function errorDetail(body, status) {
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) {
    return body.detail.map((item) => item.msg || "Invalid request").join(". ");
  }
  return `Request failed (${status})`;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { ...requestHeaders(), ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errorDetail(body, response.status));
  return body;
}

async function postChatStream(path, payload, { onDelta, onDone }) {
  const response = await fetch(path, {
    method: "POST",
    headers: requestHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(errorDetail(body, response.status));
  }
  if (!response.body) {
    const body = await response.json().catch(() => ({}));
    onDone(body);
    return;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let final = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newline;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      let event;
      try {
        event = JSON.parse(line);
      } catch {
        continue;
      }
      if (event.type === "delta") {
        onDelta(event.text || "");
      } else if (event.type === "done") {
        final = event;
      } else if (event.type === "error") {
        throw new Error(event.message || "The response stream failed. Try again.");
      }
    }
  }
  if (!final) throw new Error("The response stream ended unexpectedly. Try again.");
  onDone(final);
}

function setServiceBadge(element, state, heading, detail) {
  element.classList.remove("checking", "ready", "unavailable");
  element.classList.add(state);
  element.querySelector(".service-copy > span").textContent = heading;
  element.querySelector(".service-copy strong").textContent = detail;
  element.title = `${heading}: ${detail}`;
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

function appendAssistantBubble(response) {
  const { body, bubble } = createAssistantBubble();
  renderAnswerText(response.answer || "", bubble);
  const places = response.places || [];
  if (places.length) appendPlacesBlock(body, places);
}

function showTyping() {
  hideTyping();
  const row = document.createElement("div");
  row.className = "msg msg-assistant";
  row.id = "typing-row";
  const bubble = document.createElement("div");
  bubble.className = "bubble typing-bubble";
  bubble.setAttribute("aria-label", "WanderAI is thinking");
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
  localStorage.setItem(CONVERSATION_KEY, conversationId);
  return conversationId;
}

async function newChat() {
  photoObserver?.disconnect();
  thread.querySelectorAll(".msg").forEach((message) => message.remove());
  emptyState.hidden = false;
  history = [];
  conversationId = null;
  setNotice("");
  messageInput.value = "";
  messageInput.style.height = "auto";
  updateSendButton();
  conversation.scrollTo({ top: 0 });
  messageInput.focus();
  try {
    await ensureConversation();
  } catch (error) {
    setNotice(`Could not start a saved conversation: ${error.message}`);
  }
}

newChatButton.addEventListener("click", () => void newChat());

async function restoreConversation() {
  const savedId = localStorage.getItem(CONVERSATION_KEY);
  if (!savedId) {
    await ensureConversation();
    return;
  }
  try {
    const saved = await api(`/api/conversations/${encodeURIComponent(savedId)}`);
    conversationId = saved.id;
    history = saved.messages || [];
    if (!history.length) return;
    hideEmptyState();
    history.forEach((message) => {
      if (message.role === "user") appendUserBubble(message.content);
      else appendAssistantBubble({ answer: message.content, places: [] });
    });
  } catch {
    localStorage.removeItem(CONVERSATION_KEY);
    await ensureConversation();
  }
}

function loadEmbeddedMap(url) {
  mapLoading.hidden = !url;
  mapUnavailable.hidden = Boolean(url);
  mapFrame.hidden = !url;
  if (url) {
    mapFrame.src = url;
  } else {
    mapFrame.removeAttribute("src");
  }
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
  loadEmbeddedMap(place.embed_url);
  loadDialogPhotos(place);
  mapDialog.showModal();
}

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
  card.querySelector(".place-number").textContent = String(index + 1).padStart(2, "0");
  card.querySelector(".place-type").textContent = formatPlaceType(place.primary_type);
  card.querySelector("h3").textContent = place.name;
  card.querySelector(".address").textContent = place.address || "Address unavailable";
  card.querySelector(".rating").textContent = ratingLabel(place);
  card.querySelector(".review-count").textContent = reviewLabel(place);
  card.querySelector(".place-maps-link").href = place.google_maps_url;
  card.querySelector(".map-button").addEventListener("click", () => openPlaceMap(place));
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
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
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

  let assistant = null;
  let streamedAnswer = "";
  const finish = (event) => {
    if (!assistant) assistant = createAssistantBubble();
    const finalAnswer = (event.answer || streamedAnswer).trim();
    renderAnswerText(finalAnswer, assistant.bubble);
    if (event.places?.length) appendPlacesBlock(assistant.body, event.places);
    const followups = document.createElement("div");
    followups.className = "followup-actions";
    followups.setAttribute("aria-label", "Suggested follow-up questions");
    for (const prompt of (event.suggestions || []).slice(0, 3)) {
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
    assistant.body.append(followups);
    history.push(
      { role: "user", content: message },
      { role: "assistant", content: finalAnswer },
    );
    history = history.slice(-20);
    setServiceBadge(modelStatus, "ready", "Google AI", "Gemini online");
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
      },
      {
        onDelta: (text) => {
          if (!assistant) assistant = createAssistantBubble();
          streamedAnswer += text;
          renderAnswerText(streamedAnswer, assistant.bubble);
          scrollToBottom(false);
        },
        onDone: finish,
      },
    );
  } catch (error) {
    setNotice(error.message);
    if (assistant && streamedAnswer) renderAnswerText(streamedAnswer, assistant.bubble);
    if (error.message.toLowerCase().includes("api key")) {
      apiKeyWrap.hidden = false;
      apiKeyWrap.open = true;
      apiKeyInput.focus();
    }
  } finally {
    setBusy(false);
    messageInput.focus();
  }
});

async function checkServices() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const [healthResult, configResult] = await Promise.allSettled([
    fetch("/health", { signal: controller.signal, cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("Health check failed");
      return response.json();
    }),
    fetch("/api/config", { signal: controller.signal, cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("Configuration check failed");
      return response.json();
    }),
  ]);
  clearTimeout(timeout);

  if (healthResult.status === "fulfilled") {
    const health = healthResult.value;
    const modelReady = health.model_available ?? health.status === "ok";
    const modelName = health.model || "AI model";
    const providerName = health.provider === "ollama" ? "Local Ollama" : "AI";
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
  }
}

updateSendButton();
checkServices();
// Refresh after transient startup failures and when returning to the app.
setInterval(() => {
  if (!document.hidden) checkServices();
}, 30000);
window.addEventListener("focus", checkServices);
restoreConversation().catch((error) => setNotice(`Could not restore saved chat: ${error.message}`));
