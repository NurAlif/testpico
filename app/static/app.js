const form = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message");
const originInput = document.querySelector("#origin");
const travelMode = document.querySelector("#travel-mode");
const apiKeyInput = document.querySelector("#api-key");
const apiKeyWrap = document.querySelector("#api-key-wrap");
const sendButton = document.querySelector("#send");
const locateButton = document.querySelector("#locate");
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
const dialogViewLabel = document.querySelector("#dialog-view-label");
const dialogMapsLink = document.querySelector("#dialog-maps-link");
const dialogPlaceName = document.querySelector("#dialog-place-name");
const dialogAddress = document.querySelector("#dialog-address");
const dialogRating = document.querySelector("#dialog-rating");
const dialogReviews = document.querySelector("#dialog-reviews");
const dialogOrigin = document.querySelector("#dialog-origin");
const dialogMode = document.querySelector("#dialog-mode");
const dialogLocate = document.querySelector("#dialog-locate");
const routeNote = document.querySelector("#route-note");
const showRouteButton = document.querySelector("#show-route");
const routeMapsLink = document.querySelector("#route-maps-link");

const ASSISTANT_AVATAR = `
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"></circle>
    <path d="m13.9 7.8-2.1 4.1-4.1 2.2 4.6.1 1.6 2.1.2-4.5 2.2-4-2.4-.1Z" fill="currentColor"></path>
  </svg>`;

let history = [];
let currentPlace = null;
let conversationId = null;
const CONVERSATION_KEY = "wanderAIConversationId";

apiKeyInput.value = sessionStorage.getItem("mapsAssistantApiKey") || "";
apiKeyInput.addEventListener("input", () => {
  sessionStorage.setItem("mapsAssistantApiKey", apiKeyInput.value);
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

function readBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported by this browser. Enter a starting point instead."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(`${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`),
      () => reject(new Error("Location permission was denied. Enter a starting point instead.")),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });
}

async function fillBrowserLocation(button, targetInput) {
  button.disabled = true;
  setNotice("");
  try {
    const location = await readBrowserLocation();
    targetInput.value = location;
    originInput.value = location;
    dialogOrigin.value = location;
  } catch (error) {
    setNotice(error.message);
  } finally {
    button.disabled = false;
  }
}

function setRouteNote(message, state = "") {
  routeNote.classList.remove("error", "success");
  if (state) routeNote.classList.add(state);
  routeNote.textContent = message;
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

function invalidatePreparedRoute() {
  if (!currentPlace || routeMapsLink.hidden) return;
  routeMapsLink.hidden = true;
  routeMapsLink.removeAttribute("href");
  showRouteButton.hidden = false;
  loadEmbeddedMap(currentPlace.embed_url);
  dialogViewLabel.textContent = `${formatPlaceType(currentPlace.primary_type)} · Live map`;
  setRouteNote("Route details changed. Show the updated route when you are ready.");
}

function openPlaceMap(place) {
  currentPlace = place;
  dialogTitle.textContent = place.name;
  dialogPlaceName.textContent = place.name;
  dialogAddress.textContent = place.address || "Address unavailable";
  dialogRating.textContent = ratingLabel(place);
  dialogReviews.textContent = reviewLabel(place);
  dialogOrigin.value = originInput.value.trim();
  dialogMode.value = travelMode.value;
  dialogMapsLink.href = place.google_maps_url;
  dialogViewLabel.textContent = `${formatPlaceType(place.primary_type)} · ${place.embed_url ? "Live map" : "Map link"}`;
  loadEmbeddedMap(place.embed_url);
  routeMapsLink.hidden = true;
  routeMapsLink.removeAttribute("href");
  showRouteButton.hidden = false;
  setRouteNote(
    dialogOrigin.value
      ? "Your starting point is ready. Show the route directly on the map."
      : "Add a starting point to show a route. Current travel time and distance remain in Google Maps.",
  );
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

locateButton.addEventListener("click", () => fillBrowserLocation(locateButton, originInput));
dialogLocate.addEventListener("click", () => fillBrowserLocation(dialogLocate, dialogOrigin));

originInput.addEventListener("input", () => {
  dialogOrigin.value = originInput.value;
});

travelMode.addEventListener("change", () => {
  dialogMode.value = travelMode.value;
});

dialogOrigin.addEventListener("input", () => {
  originInput.value = dialogOrigin.value;
  invalidatePreparedRoute();
});

dialogMode.addEventListener("change", () => {
  travelMode.value = dialogMode.value;
  invalidatePreparedRoute();
});

dialogClose.addEventListener("click", () => mapDialog.close());
mapDialog.addEventListener("click", (event) => {
  if (event.target === mapDialog) mapDialog.close();
});
mapDialog.addEventListener("close", () => {
  mapFrame.removeAttribute("src");
  mapLoading.hidden = true;
  mapUnavailable.hidden = true;
  currentPlace = null;
});

showRouteButton.addEventListener("click", async () => {
  if (!currentPlace) return;
  const origin = dialogOrigin.value.trim();
  if (!origin) {
    setRouteNote("Enter a starting point or use your location before showing a route.", "error");
    dialogOrigin.focus();
    return;
  }

  originInput.value = origin;
  travelMode.value = dialogMode.value;
  routeMapsLink.hidden = true;
  showRouteButton.disabled = true;
  showRouteButton.textContent = "Loading route…";
  setRouteNote("Loading a validated Google Maps route…");
  try {
    const directions = await api("/api/maps/directions", {
      method: "POST",
      body: JSON.stringify({
        place_id: currentPlace.place_id,
        destination: currentPlace.name,
        origin,
        travel_mode: dialogMode.value,
      }),
    });
    loadEmbeddedMap(directions.embed_url || currentPlace.embed_url);
    routeMapsLink.href = directions.google_maps_url;
    routeMapsLink.hidden = false;
    showRouteButton.hidden = true;
    dialogViewLabel.textContent = `${formatPlaceType(currentPlace.primary_type)} · ${dialogMode.options[dialogMode.selectedIndex].text} route`;
    setRouteNote(
      directions.embed_url
        ? "The route is now shown on the map. Open Google Maps for current travel time, distance, and navigation."
        : "Your route link is ready. Open Google Maps for current travel time, distance, and navigation.",
      "success",
    );
  } catch (error) {
    setRouteNote(error.message, "error");
  } finally {
    showRouteButton.disabled = false;
    showRouteButton.textContent = "Show route on map";
  }
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
  if (!message) return;

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
        origin: originInput.value.trim() || null,
        travel_mode: travelMode.value,
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
  const [healthResult, configResult] = await Promise.allSettled([
    fetch("/health").then((response) => {
      if (!response.ok) throw new Error("Health check failed");
      return response.json();
    }),
    fetch("/api/config").then((response) => {
      if (!response.ok) throw new Error("Configuration check failed");
      return response.json();
    }),
  ]);

  if (healthResult.status === "fulfilled") {
    const health = healthResult.value;
    const modelReady = health.model_available ?? health.status === "ok";
    const modelName = health.model || "Gemini";
    setServiceBadge(
      modelStatus,
      modelReady ? "ready" : "unavailable",
      "Google AI",
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
    setServiceBadge(modelStatus, "unavailable", "Google AI", "Backend offline");
    setServiceBadge(mapsStatus, "unavailable", "Google Maps", "Backend offline");
  }

  if (configResult.status === "fulfilled") {
    apiKeyWrap.hidden = !configResult.value.api_auth_required;
  }
}

updateSendButton();
checkServices();
restoreConversation().catch((error) => setNotice(`Could not restore saved chat: ${error.message}`));
