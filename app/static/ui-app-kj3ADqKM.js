import { i as e, r as t, t as n } from "./ui-ai-settings-YwWsTTH9.js";
//#region app/static/app.js
var r = document.querySelector("meta[name=\"api-base\"]")?.content || "", i = document.querySelector("#chat-form"), a = document.querySelector("#message"), o = document.querySelector("#api-key"), s = document.querySelector("#api-key-wrap"), c = document.querySelector("#send"), l = document.querySelector("#model-status"), u = document.querySelector("#maps-status"), d = document.querySelector("#notice"), f = document.querySelector("#conversation"), p = document.querySelector("#thread"), m = document.querySelector("#empty-state"), h = document.querySelector("#new-chat"), ee = document.querySelector("#place-template"), g = document.querySelector("#map-dialog"), _ = document.querySelector("#map-canvas"), v = document.querySelector("#map-frame"), y = document.querySelector("#map-loading"), b = document.querySelector("#map-unavailable"), te = document.querySelector("#dialog-close"), ne = document.querySelector("#dialog-title"), re = document.querySelector("#dialog-maps-link"), ie = document.querySelector("#dialog-place-name"), ae = document.querySelector("#dialog-address"), oe = document.querySelector("#dialog-rating"), se = document.querySelector("#dialog-reviews"), x = document.querySelector("#dialog-photos"), ce = "\n  <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\">\n    <circle cx=\"12\" cy=\"12\" r=\"8.5\" stroke=\"currentColor\" stroke-width=\"1.7\"></circle>\n    <path d=\"m13.9 7.8-2.1 4.1-4.1 2.2 4.6.1 1.6 2.1.2-4.5 2.2-4-2.4-.1Z\" fill=\"currentColor\"></path>\n  </svg>", S = "", C = [], w = null, T = null, E = null, D = null, le = "wanderAIConversationId";
try {
	o.value = sessionStorage.getItem("mapsAssistantApiKey") || "";
} catch {
	o.value = "";
}
o.addEventListener("input", () => {
	try {
		sessionStorage.setItem("mapsAssistantApiKey", o.value);
	} catch {}
});
function ue() {
	let e = { "Content-Type": "application/json" };
	return S && (e.Authorization = `Bearer ${S}`), e;
}
e(O);
function de(e, t) {
	return typeof e.detail == "string" ? e.detail : Array.isArray(e.detail) ? e.detail.map((e) => e.msg || "Invalid request").join(". ") : `Request failed (${t})`;
}
async function O(e, t = {}) {
	let n = await fetch(r + e, {
		...t,
		headers: {
			...ue(),
			...t.headers
		}
	}), i = await n.json().catch(() => ({}));
	if (n.status === 401 && S && Z(), !n.ok) throw Error(de(i, n.status));
	return i;
}
async function fe(e, t, { onDelta: n, onDone: i, onProgress: a }) {
	let o = await fetch(r + e, {
		method: "POST",
		headers: ue(),
		body: JSON.stringify(t)
	});
	if (o.status === 401 && Z(), !o.ok) {
		let e = await o.json().catch(() => ({}));
		throw Error(de(e, o.status));
	}
	if (!o.body) throw Error("Streaming is unavailable in this browser.");
	let s = o.body.getReader(), c = new TextDecoder(), l = "", u = null, d = (e) => {
		if (!e.trim()) return;
		let t = JSON.parse(e);
		if (t.type === "delta") n(t.text || "");
		else if (t.type === "done") u = t;
		else if (t.type === "error") throw Error(t.message || "The response stream failed. Try again.");
		else a?.(t);
	};
	try {
		for (;;) {
			let { done: e, value: t } = await s.read();
			l += e ? c.decode() : c.decode(t, { stream: !0 });
			let n;
			for (; (n = l.indexOf("\n")) !== -1;) d(l.slice(0, n)), l = l.slice(n + 1);
			if (e) break;
		}
		if (l.trim() && d(l), !u) throw Error("The response stream ended unexpectedly. Try again.");
		i(u);
	} finally {
		await s.cancel(), s.releaseLock();
	}
}
function pe(e) {
	let t = document.createElement("details");
	t.className = "agent-activity", t.open = !0;
	let n = document.createElement("summary");
	n.textContent = "Thinking…", t.classList.add("is-processing"), t.setAttribute("aria-busy", "true");
	let r = document.createElement("div");
	r.className = "activity-status", r.setAttribute("role", "status");
	let i = document.createElement("ul"), a = document.createElement("details");
	a.hidden = !0, a.open = !1;
	let o = document.createElement("summary");
	o.textContent = "Thinking";
	let s = document.createElement("div");
	s.className = "activity-reasoning", a.append(o, s), t.append(n, r, i, a), e.prepend(t);
	let c = () => {
		s.scrollTop = s.scrollHeight;
	};
	a.addEventListener("toggle", c), t.addEventListener("toggle", c);
	let l = /* @__PURE__ */ new Map();
	return {
		update(e) {
			if (e.type === "status" && (r.textContent = e.message), e.type === "tool") {
				let t = l.get(e.id);
				t || (t = document.createElement("li"), l.set(e.id, t), i.append(t)), t.dataset.state = e.state, t.textContent = e.message, r.textContent = "";
			}
			e.type === "reasoning" && e.text && (a.hidden = !1, s.textContent = (s.textContent + e.text).slice(-24e3), c()), I(!1);
		},
		finish(e = !1) {
			t.classList.remove("is-processing"), t.setAttribute("aria-busy", "false"), o.textContent = e ? "Thinking interrupted" : "Thinking complete", n.textContent = e ? "Response interrupted" : "Activity complete", r.textContent = "";
			for (let e of l.values()) e.dataset.state === "running" && (e.dataset.state = "error", e.textContent += " - interrupted");
			t.open = e;
		}
	};
}
function k(e, t, n, r) {
	e.classList.remove("checking", "ready", "unavailable"), e.classList.add(t), e.querySelector(".service-copy > span").textContent = n, e.querySelector(".service-copy strong").textContent = r, e.title = `${n}: ${r}`, e.setAttribute("aria-label", e.title);
}
function A(e = "") {
	d.textContent = e, d.hidden = !e;
}
function j() {
	c.disabled = i.getAttribute("aria-busy") === "true" || a.value.trim().length === 0;
}
function M(e) {
	i.setAttribute("aria-busy", String(e)), a.disabled = e, h.disabled = e, document.querySelector("#logout").disabled = e, j(), e ? _e() : H();
}
function me(e) {
	return e ? e.split("_").map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(" ") : "Place";
}
function N(e) {
	return e.rating == null ? "Rating unavailable" : `★ ${e.rating.toFixed(1)}`;
}
function P(e) {
	if (e.rating_count == null) return "";
	let t = e.rating_count === 1 ? "review" : "reviews";
	return `${e.rating_count.toLocaleString()} ${t}`;
}
function F(e, t) {
	t.replaceChildren(), e.replace(/^\s*[-*]\s+/gm, "• ").split(/(\*\*[^*]+\*\*)/g).forEach((e) => {
		if (e.startsWith("**") && e.endsWith("**")) {
			let n = document.createElement("strong");
			n.textContent = e.slice(2, -2), t.append(n);
		} else t.append(document.createTextNode(e));
	});
}
function I(e = !0) {
	f.scrollTo({
		top: f.scrollHeight,
		behavior: e ? "smooth" : "auto"
	});
}
function L() {
	let e = document.createElement("span");
	return e.className = "msg-avatar", e.setAttribute("aria-hidden", "true"), e.innerHTML = ce, e;
}
function he() {
	m.hidden = !0;
}
function R(e) {
	let t = document.createElement("div");
	t.className = "msg msg-user";
	let n = document.createElement("div");
	n.className = "bubble user-bubble", n.textContent = e, t.append(n), p.append(t), I();
}
function z(e, t) {
	let n = document.createElement("div");
	n.className = "places-block";
	let r = document.createElement("div");
	r.className = "places-block-heading";
	let i = document.createElement("span");
	i.textContent = "Verified places";
	let a = document.createElement("span");
	a.className = "result-count", a.textContent = `${t.length} verified ${t.length === 1 ? "place" : "places"}`, r.append(i, a);
	let o = document.createElement("div");
	o.className = "places-grid", t.forEach((e, t) => o.append(Oe(e, t))), n.append(r, o), e.append(n);
}
function B() {
	H();
	let e = document.createElement("div");
	e.className = "msg msg-assistant";
	let t = document.createElement("div");
	t.className = "msg-body";
	let n = document.createElement("div");
	return n.className = "bubble assistant-bubble", t.append(n), e.append(L(), t), p.append(e), I(!1), {
		body: t,
		bubble: n
	};
}
function V(e, t) {
	let n = document.createElement("div");
	n.className = "followup-actions", n.setAttribute("aria-label", "Suggested follow-up questions");
	for (let e of (t || []).slice(0, 3)) {
		if (typeof e != "string" || !e.trim()) continue;
		let t = document.createElement("button");
		t.type = "button", t.textContent = e, t.addEventListener("click", () => {
			i.getAttribute("aria-busy") !== "true" && (a.value = e, j(), i.requestSubmit());
		}), n.append(t);
	}
	e.append(n);
}
function ge(e) {
	let { body: t, bubble: n } = B();
	F(e.answer || "", n);
	let r = e.places || [];
	r.length && z(t, r), V(t, e.suggestions || []);
}
function _e() {
	H();
	let e = document.createElement("div");
	e.className = "msg msg-assistant", e.id = "typing-row";
	let t = document.createElement("div");
	t.className = "bubble typing-bubble", t.setAttribute("aria-label", "Wander Pico is thinking"), [
		0,
		1,
		2
	].forEach(() => t.append(document.createElement("span"))), e.append(L(), t), p.append(e), I();
}
function H() {
	let e = p.querySelector("#typing-row");
	e && e.remove();
}
async function ve() {
	if (T) return T;
	T = (await O("/api/conversations", { method: "POST" })).id;
	try {
		localStorage.setItem(le, T);
	} catch {}
	return T;
}
async function ye() {
	if (i.getAttribute("aria-busy") !== "true") {
		U?.disconnect(), p.querySelectorAll(".msg").forEach((e) => e.remove()), m.hidden = !1, C = [], T = null;
		try {
			localStorage.removeItem(le);
		} catch {}
		A(""), a.value = "", a.style.height = "auto", j(), f.scrollTo({ top: 0 }), a.focus(), $();
	}
}
h.addEventListener("click", () => void ye());
function be(e) {
	try {
		return new URL(e).searchParams.get("key");
	} catch {
		return null;
	}
}
function xe(e) {
	return window.google?.maps ? Promise.resolve(window.google.maps) : E || (E = new Promise((t, n) => {
		let r = "__wanderPicoMapsReady", i = document.createElement("script"), a = () => {
			delete window[r];
		};
		window[r] = () => {
			a(), window.google?.maps ? t(window.google.maps) : n(/* @__PURE__ */ Error("Google Maps did not load"));
		}, i.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(e)}&v=weekly&loading=async&callback=${r}`, i.async = !0, i.onerror = () => {
			a(), n(/* @__PURE__ */ Error("Google Maps failed to load"));
		}, document.head.append(i);
	}), E);
}
async function Se(e, t) {
	let n = be(t);
	if (!n || !Number.isFinite(e.latitude) || !Number.isFinite(e.longitude) || !_) return !1;
	try {
		let t = await xe(n), r = (await t.importLibrary("maps")).Map, i = document.documentElement.dataset.theme === "dark" ? t.ColorScheme.DARK : t.ColorScheme.LIGHT;
		return _.replaceChildren(), D = new r(_, {
			center: {
				lat: e.latitude,
				lng: e.longitude
			},
			zoom: 16,
			colorScheme: i,
			fullscreenControl: !0,
			streetViewControl: !1,
			mapTypeControl: !1
		}), _.hidden = !1, v.hidden = !0, y.hidden = !0, !0;
	} catch {
		return !1;
	}
}
function Ce(e, t) {
	D = null, _.hidden = !0, _.replaceChildren(), y.hidden = !t, b.hidden = !!t, v.hidden = !t, t ? v.src = t : v.removeAttribute("src"), t && Se(e, t);
}
v.addEventListener("load", () => {
	v.src && w && (y.hidden = !0);
}), v.addEventListener("error", () => {
	y.hidden = !0, v.hidden = !0, b.hidden = !1;
});
var we = 6;
function Te(e) {
	x.replaceChildren();
	let t = (e.photos || []).slice(0, we);
	if (!t.length) {
		let e = document.createElement("p");
		e.className = "gallery-empty", e.textContent = "No photos are available for this place from Google yet.", x.append(e);
		return;
	}
	t.forEach((t) => {
		let n = document.createElement("figure");
		n.className = "gallery-item";
		let r = document.createElement("img");
		r.alt = `${e.name} photo`, r.loading = "lazy", r.decoding = "async", r.referrerPolicy = "no-referrer";
		let i = document.createElement("figcaption");
		i.textContent = "Google Maps";
		let a = (t.authorAttributions || []).find((e) => e.displayName);
		if (a) {
			i.append(" · ");
			let e = document.createElement("a");
			e.textContent = a.displayName, a.uri?.startsWith("https://") && (e.href = a.uri, e.target = "_blank", e.rel = "noopener noreferrer"), i.append(e);
		}
		n.append(r, i), x.append(n), O("/api/places/photo", {
			method: "POST",
			body: JSON.stringify({ name: t.name })
		}).then(({ url: e }) => {
			n.isConnected && (r.onerror = () => {
				n.classList.remove("has-photo"), n.classList.add("unavailable"), i.textContent = "Photo unavailable";
			}, r.src = e, n.classList.add("has-photo"));
		}).catch(() => {
			n.isConnected && (n.classList.add("unavailable"), i.textContent = "Photo unavailable");
		});
	});
}
function Ee(e) {
	w = e, ne.textContent = e.name, ie.textContent = e.name, ae.textContent = e.address || "Address unavailable", oe.textContent = N(e), se.textContent = P(e), re.href = e.google_maps_url, Ce(e, e.embed_url), Te(e), g.showModal();
}
new MutationObserver(() => {
	w && D && Ce(w, w.embed_url);
}).observe(document.documentElement, {
	attributes: !0,
	attributeFilter: ["data-theme"]
});
var U = "IntersectionObserver" in window ? new IntersectionObserver((e) => {
	e.forEach((e) => {
		e.isIntersecting && (U.unobserve(e.target), e.target.loadPlacePhoto());
	});
}, { root: f }) : null;
function De(e, t) {
	let n = e.querySelector(".place-visual");
	n.removeAttribute("aria-hidden");
	let r = document.createElement("span");
	r.className = "photo-caption", r.textContent = t.photo ? "Loading photo…" : "Photo unavailable", n.append(r), t.photo && (n.loadPlacePhoto = async () => {
		try {
			let { url: e } = await O("/api/places/photo", {
				method: "POST",
				body: JSON.stringify({ name: t.photo.name })
			});
			if (!n.isConnected) return;
			let i = document.createElement("img");
			i.className = "place-photo", i.alt = t.name, i.decoding = "async", i.referrerPolicy = "no-referrer", i.onload = () => {
				n.classList.add("has-photo"), r.replaceChildren(document.createTextNode("Google Maps")), (t.photo.authorAttributions || []).forEach((e) => {
					if (!e.displayName) return;
					r.append(document.createTextNode(" · "));
					let t = document.createElement("a");
					t.textContent = e.displayName, e.uri?.startsWith("https://") && (t.href = e.uri, t.target = "_blank", t.rel = "noopener noreferrer"), r.append(t);
				});
			}, i.onerror = () => {
				i.remove(), r.textContent = "Photo unavailable";
			}, i.src = e, n.prepend(i);
		} catch {
			r.textContent = "Photo unavailable";
		}
	}, U ? U.observe(n) : requestAnimationFrame(() => n.loadPlacePhoto()));
}
function Oe(e, t) {
	let n = ee.content.firstElementChild.cloneNode(!0), r = () => Ee(e);
	return n.tabIndex = 0, n.setAttribute("aria-label", `View details for ${e.name}`), n.querySelector(".place-number").textContent = String(t + 1).padStart(2, "0"), n.querySelector(".place-type").textContent = me(e.primary_type), n.querySelector("h3").textContent = e.name, n.querySelector(".address").textContent = e.address || "Address unavailable", n.querySelector(".rating").textContent = N(e), n.querySelector(".review-count").textContent = P(e), n.querySelector(".place-maps-link").href = e.google_maps_url, n.addEventListener("click", (e) => {
		e.target.closest("a, button") || r();
	}), n.addEventListener("keydown", (e) => {
		e.target === n && ["Enter", " "].includes(e.key) && (e.preventDefault(), r());
	}), n.querySelector(".map-button").addEventListener("click", r), De(n, e), n;
}
te.addEventListener("click", () => g.close()), g.addEventListener("click", (e) => {
	e.target === g && g.close();
}), g.addEventListener("close", () => {
	v.removeAttribute("src"), y.hidden = !0, b.hidden = !0, x.replaceChildren(), w = null;
}), document.querySelectorAll(".suggestion-card").forEach((e) => {
	e.addEventListener("click", () => {
		a.value = e.dataset.prompt, a.style.height = "auto", a.style.height = `${Math.min(a.scrollHeight, 180)}px`, j(), i.requestSubmit();
	});
}), a.addEventListener("input", () => {
	j(), a.style.height = "auto", a.style.height = `${Math.min(a.scrollHeight, 180)}px`;
}), a.addEventListener("keydown", (e) => {
	e.key === "Enter" && !e.shiftKey && (e.preventDefault(), i.requestSubmit());
}), i.addEventListener("submit", async (e) => {
	e.preventDefault();
	let t = a.value.trim();
	if (!t || i.getAttribute("aria-busy") === "true") return;
	A(""), he(), R(t), a.value = "", a.style.height = "auto", j(), M(!0);
	let r = B(), c = pe(r.body);
	c.update({
		type: "status",
		message: "Connecting..."
	});
	let d = "", f = (e) => {
		c.finish();
		let n = (e.answer || d).trim();
		F(n, r.bubble), e.places?.length && z(r.body, e.places), V(r.body, e.suggestions || []), C.push({
			role: "user",
			content: t
		}, {
			role: "assistant",
			content: n
		}), C = C.slice(-20), k(l, "ready", "AI", "Connected"), e.places?.length && k(u, "ready", "Google Maps", "Places live");
	};
	try {
		await ve(), await fe("/api/chat/stream", {
			message: t,
			history: C.slice(-12),
			conversation_id: T,
			ai: n()
		}, {
			onDelta: (e) => {
				d += e, F(d, r.bubble), I(!1);
			},
			onProgress: (e) => c.update(e),
			onDone: f
		});
	} catch (e) {
		c.finish(!0), A(e.message), r && d && F(d, r.bubble), e.message.toLowerCase().includes("api key") && (s.hidden = !1, s.open = !0, o.focus());
	} finally {
		M(!1), S && await Q().catch((e) => A(e.message)), a.focus();
	}
});
async function W() {
	let e = new AbortController(), t = setTimeout(() => e.abort(), 1e4), [n, i] = await Promise.allSettled([fetch(r + "/health", {
		signal: e.signal,
		cache: "no-store"
	}).then((e) => {
		if (!e.ok) throw Error("Health check failed");
		return e.json();
	}), fetch(r + "/api/config", {
		signal: e.signal,
		cache: "no-store"
	}).then((e) => {
		if (!e.ok) throw Error("Configuration check failed");
		return e.json();
	})]);
	if (clearTimeout(t), n.status === "fulfilled") {
		let e = n.value, t = e.model_available ?? e.status === "ok", r = e.model || "AI model";
		k(l, t ? "ready" : "unavailable", "Server default", t ? r : "Unavailable");
		let i = e.places_configured;
		k(u, i ? "ready" : "unavailable", "Google Maps", i ? "Places ready" : "Needs setup");
	} else k(l, "unavailable", "AI", "Backend offline"), k(u, "unavailable", "Google Maps", "Backend offline");
	i.status === "fulfilled" && (s.hidden = !i.value.api_auth_required, window.dispatchEvent(new CustomEvent("wander-config", { detail: i.value })));
}
j(), W(), setInterval(() => {
	document.hidden || W();
}, 3e4), window.addEventListener("focus", W);
var ke = document.querySelector("#auth-page"), G = document.querySelector("#auth-form"), K = document.querySelector("#auth-error"), Ae = document.querySelector("#sidebar-toggle"), je = document.querySelector("#sidebar-backdrop");
function q(e) {
	document.body.classList.toggle("sidebar-open", e), Ae.setAttribute("aria-expanded", String(e)), je.hidden = !e;
}
var J = [], Y = !1;
function X() {
	Y = location.hash === "#register", document.querySelector("#auth-title").textContent = Y ? "Create your account" : "Welcome back", document.querySelector("#identifier-label").firstChild.textContent = Y ? "Username" : "Username or email", document.querySelector("#register-email-label").hidden = !Y, document.querySelector("#register-email").required = Y, document.querySelector("#password").minLength = Y ? 8 : 1, document.querySelector("#password").autocomplete = Y ? "new-password" : "current-password";
	let e = document.querySelector("#auth-submit"), t = document.querySelector("#auth-toggle");
	e.querySelector(".auth-submit-label").textContent = Y ? "Create account" : "Log in", t.querySelector(".auth-toggle-label").textContent = Y ? "Log in instead" : "Create an account", document.querySelector("#auth-toggle-description").textContent = Y ? "Already have an account?" : "New to Wander Pico?", e.querySelector(".auth-icon-login").toggleAttribute("hidden", Y), e.querySelector(".auth-icon-register").toggleAttribute("hidden", !Y), t.querySelector(".auth-icon-login").toggleAttribute("hidden", !Y), t.querySelector(".auth-icon-register").toggleAttribute("hidden", Y), t.href = Y ? "#login" : "#register", K.textContent = "";
}
window.addEventListener("hashchange", X), X();
function Z() {
	t(), S = "", C = [], J = [], T = null, p.querySelectorAll(".msg").forEach((e) => e.remove()), document.querySelector("#history-list").replaceChildren(), q(!1), m.hidden = !1, g.close(), v.removeAttribute("src"), w = null, document.body.classList.add("auth-locked"), ke.hidden = !1, G.reset(), window.dispatchEvent(new Event("wander-locked"));
}
G.addEventListener("submit", async (e) => {
	e.preventDefault();
	let t = document.querySelector("#auth-submit");
	t.disabled = !0, K.textContent = "";
	try {
		let e = document.querySelector("#identifier").value.trim(), t = document.querySelector("#password").value;
		Y ? (await O("/api/auth/register", {
			method: "POST",
			body: JSON.stringify({
				username: e,
				email: document.querySelector("#register-email").value.trim(),
				password: t
			})
		}), location.hash = "login", X(), document.querySelector("#password").value = "", setTimeout(() => {
			K.textContent = "Account created. Log in to continue.";
		}, 0)) : (S = (await O("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({
				identifier: e,
				password: t
			})
		})).token, G.reset(), document.body.classList.remove("auth-locked"), ke.hidden = !0, await Q(), J.length ? await Me(J[0].id) : await ye(), window.dispatchEvent(new Event("wander-authenticated")), a.focus());
	} catch (e) {
		S ? A(e.message) : K.textContent = e.message;
	} finally {
		t.disabled = !1;
	}
}), document.querySelector("#logout").addEventListener("click", async () => {
	if (i.getAttribute("aria-busy") !== "true") try {
		await O("/api/auth/logout", { method: "POST" }), Z();
	} catch (e) {
		A(e.message);
	}
}), Ae.addEventListener("click", () => {
	let e = !document.body.classList.contains("sidebar-open");
	q(e), e && Q().catch((e) => A(e.message));
}), je.addEventListener("click", () => q(!1));
async function Q() {
	J = await O("/api/conversations"), $();
}
function $() {
	let e = document.querySelector("#history-list"), t = document.querySelector("#history-search").value.toLowerCase();
	e.replaceChildren(), J.filter((e) => e.title.toLowerCase().includes(t)).forEach((t) => {
		let n = document.createElement("button");
		n.type = "button", n.className = "history-item", n.setAttribute("aria-current", String(t.id === T));
		let r = document.createElement("span");
		r.className = "history-title", r.textContent = t.title, n.title = t.title, n.append(r);
		let i = document.createElement("small"), a = /* @__PURE__ */ new Date(t.updated_at.replace(" ", "T") + "Z");
		i.textContent = a.toLocaleDateString(void 0, {
			month: "short",
			day: "numeric",
			...a.getFullYear() === (/* @__PURE__ */ new Date()).getFullYear() ? {} : { year: "numeric" }
		}), i.title = a.toLocaleString(), n.append(i), n.addEventListener("click", () => Me(t.id).catch((e) => A(e.message))), e.append(n);
	}), e.children.length || (e.textContent = "No saved chats found.");
}
document.querySelector("#history-search").addEventListener("input", $);
async function Me(e) {
	if (i.getAttribute("aria-busy") !== "true") {
		M(!0);
		try {
			let t = await O(`/api/conversations/${encodeURIComponent(e)}`);
			U?.disconnect(), p.querySelectorAll(".msg").forEach((e) => e.remove()), C = t.messages || [], T = t.id, m.hidden = C.length > 0, C.forEach((e) => {
				e.role === "user" ? R(e.content) : ge({
					...e,
					answer: e.content
				});
			}), A(""), $(), q(!1), I(!1);
		} finally {
			M(!1);
		}
	}
}
window.addEventListener("pageshow", (e) => {
	e.persisted && Z();
});
//#endregion
