const form = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message");
const messageCount = document.querySelector("#message-count");
const originInput = document.querySelector("#origin");
const travelMode = document.querySelector("#travel-mode");
const apiKeyInput = document.querySelector("#api-key");
const apiKeyWrap = document.querySelector("#api-key-wrap");
const sendButton = document.querySelector("#send");
const sendButtonLabel = sendButton.querySelector("span");
const locateButton = document.querySelector("#locate");
const ollamaStatus = document.querySelector("#ollama-status");
const mapsStatus = document.querySelector("#maps-status");
const notice = document.querySelector("#notice");
const welcome = document.querySelector("#welcome");
const loadingPanel = document.querySelector("#loading");
const results = document.querySelector("#results");
const resultsTitle = document.querySelector("#results-title");
const resultCount = document.querySelector("#result-count");
const answerQuery = document.querySelector("#answer-query");
const answerText = document.querySelector("#answer-text");
const placesGrid = document.querySelector("#places-grid");
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

let history = [];
let currentPlace = null;

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

function setBusy(busy) {
  sendButton.disabled = busy;
  messageInput.disabled = busy;
  sendButtonLabel.textContent = busy ? "Searching…" : "Find places";
  form.setAttribute("aria-busy", String(busy));
  loadingPanel.hidden = !busy;
}

function updateMessageCount() {
  messageCount.textContent = `${messageInput.value.length} / 4000`;
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

function renderAnswerText(text) {
  answerText.replaceChildren();
  const normalized = text.replace(/^\s*[-*]\s+/gm, "• ");
  normalized.split(/(\*\*[^*]+\*\*)/g).forEach((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = part.slice(2, -2);
      answerText.append(strong);
    } else {
      answerText.append(document.createTextNode(part));
    }
  });
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
  placesGrid.append(card);
}

function renderResponse(query, response) {
  const places = response.places || [];
  placesGrid.replaceChildren();
  answerQuery.textContent = `You asked: “${query}”`;
  renderAnswerText(response.answer);
  resultCount.textContent = places.length ? `${places.length} verified ${places.length === 1 ? "place" : "places"}` : "Local answer";
  resultsTitle.textContent = places.length ? "Places worth exploring" : "Your local answer";
  places.forEach(renderPlace);
  welcome.hidden = true;
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
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

document.querySelectorAll(".prompt-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    messageInput.value = chip.dataset.prompt;
    updateMessageCount();
    messageInput.focus();
  });
});

messageInput.addEventListener("input", updateMessageCount);
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
  results.hidden = true;
  welcome.hidden = true;
  setBusy(true);
  try {
    const response = await api("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        history: history.slice(-12),
        origin: originInput.value.trim() || null,
        travel_mode: travelMode.value,
      }),
    });
    history.push(
      { role: "user", content: message },
      { role: "assistant", content: response.answer },
    );
    history = history.slice(-20);
    renderResponse(message, response);
    setServiceBadge(ollamaStatus, "ready", "Local model", "Qwen online");
    if (response.places?.length) setServiceBadge(mapsStatus, "ready", "Google Maps", "Places live");
  } catch (error) {
    setNotice(error.message);
    welcome.hidden = false;
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
    const modelReady = health.ollama_available ?? health.status === "ok";
    const modelName = health.model || "Local model";
    setServiceBadge(
      ollamaStatus,
      modelReady ? "ready" : "unavailable",
      "Local model",
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
    setServiceBadge(ollamaStatus, "unavailable", "Local model", "Backend offline");
    setServiceBadge(mapsStatus, "unavailable", "Google Maps", "Backend offline");
  }

  if (configResult.status === "fulfilled") {
    apiKeyWrap.hidden = !configResult.value.api_auth_required;
  }
}

updateMessageCount();
checkServices();
