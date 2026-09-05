<script setup>
import { onMounted } from "vue";
import AISettings from "./AISettings.vue";
import SetupWizard from "./SetupWizard.vue";
import ThemeSwitcher from "./ThemeSwitcher.vue";
import WelcomeScreen from "./WelcomeScreen.vue";
function discover(prompt) {
  const input = document.querySelector("#message");
  input.value = prompt;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  document.querySelector("#chat-form").requestSubmit();
}
// Keep the existing streaming and map controller attached after Vue mounts the shell.
onMounted(() => import("../app/static/app.js"));
</script>

<template>

    <section id="auth-page" class="auth-page" aria-labelledby="auth-title">
      <div class="auth-card">
        <p class="eyebrow">Wander Pico</p><h1 id="auth-title">Welcome back</h1>
        <p>Save your discoveries and continue your conversations.</p>
        <form id="auth-form">
          <label id="identifier-label">Username or email<input id="identifier" autocomplete="username" required maxlength="254"></label>
          <label id="register-email-label" hidden>Email<input id="register-email" type="email" autocomplete="email" maxlength="254"></label>
          <label>Password<input id="password" type="password" autocomplete="current-password" required maxlength="128"></label>
          <p id="auth-success" role="status" aria-live="polite"></p>
          <p id="auth-error" role="alert"></p>
          <button id="auth-submit" type="submit" class="new-chat-button auth-action">
            <svg class="auth-icon auth-icon-login" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m4-4 3-3-3-3m3 3H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <svg class="auth-icon auth-icon-register" viewBox="0 0 24 24" fill="none" aria-hidden="true" hidden><path d="M15 19a6 6 0 0 0-12 0m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9-5v6m-3-3h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <span class="auth-submit-label">Log in</span>
          </button>
        </form>
        <p class="auth-switch">
          <span id="auth-toggle-description">New to Wander Pico?</span>
          <a id="auth-toggle" href="#register">
            <svg class="auth-icon auth-icon-register" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 19a6 6 0 0 0-12 0m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9-5v6m-3-3h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <svg class="auth-icon auth-icon-login" viewBox="0 0 24 24" fill="none" aria-hidden="true" hidden><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m4-4 3-3-3-3m3 3H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <span class="auth-toggle-label">Create an account</span>
          </a>
        </p>
      </div>
    </section>
    <a class="skip-link" href="#message">Skip to chat input</a>

    <div class="app-shell">
      <aside id="sidebar" class="sidebar" aria-label="Sidebar">
        <div class="sidebar-top">
          <a class="brand" href="/" aria-label="Wander Pico home">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"></circle>
                <path d="m13.9 7.8-2.1 4.1-4.1 2.2 4.6.1 1.6 2.1.2-4.5 2.2-4-2.4-.1Z" fill="currentColor"></path>
              </svg>
            </span>
            <span>
              <strong>Wander Pico</strong>
              <small>Local discovery</small>
            </span>
          </a>

          <button id="new-chat" class="new-chat-button" type="button">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>
            <span>New chat</span>
          </button>
        </div>

        <div class="sidebar-history">
          <h2 class="sidebar-heading">Your chats</h2>
          <input id="history-search" type="search" placeholder="Search chats" aria-label="Search chats">
          <div id="history-list" class="history-list"></div>
        </div>

        <div class="sidebar-bottom">
          <div class="sidebar-bottom-header">
            <span>Workspace</span>
            <a class="docs-link" href="/docs" target="_blank" rel="noopener noreferrer">
              Docs
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </a>
          </div>
          <div class="sidebar-utilities">
            <div class="theme-control">
              <span>Appearance</span>
              <ThemeSwitcher />
            </div>
            <div class="utility-row"><AISettings />
            <span id="model-status" class="service-led checking" role="status" aria-label="Checking AI connection" title="Checking AI connection">
              <span class="status-dot"></span>
              <span class="service-copy"><span>AI</span><strong>Checking</strong></span>
            </span>
            </div>
            <div class="utility-row"><SetupWizard />
            <span id="maps-status" class="service-led checking" role="status" aria-label="Checking Google Maps configuration" title="Checking Google Maps configuration">
              <span class="status-dot"></span>
              <span class="service-copy"><span>Maps</span><strong>Checking</strong></span>
            </span>
            </div>
          </div>
          <button id="logout" class="sidebar-logout" type="button"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 4H5v16h5m5-12 4 4-4 4m-6-4h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>Log out</button>
        </div>
      </aside>

      <div class="main-pane">
      <main id="conversation" class="chat-scroll">
      <div id="thread" class="thread" role="log" aria-live="polite" aria-relevant="additions">
        <WelcomeScreen @discover="discover" />
      </div>
      </main>

      <div class="composer-wrap">
      <div class="composer-shell">
        <div id="notice" class="notice" role="status" aria-live="polite" hidden></div>
        <form id="chat-form">
          <div class="composer-box">
            <textarea
              id="message"
              required
              maxlength="4000"
              rows="1"
              aria-label="Your message"
              placeholder="Where would you like to explore?"
            ></textarea>
            <button id="send" class="send-button" type="submit" aria-label="Send message" disabled>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m14 5 5 7-5 7M19 12H5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </button>
          </div>

          <p class="composer-hint">Try a place, a mood, or a neighborhood.<span>Enter to send · Shift + Enter for a new line</span></p>
          <div class="composer-options">
            <details id="api-key-wrap" class="option-panel" hidden>
              <summary>Connect to this protected assistant</summary>
              <label for="api-key">Backend access key</label>
              <input id="api-key" type="password" autocomplete="off" placeholder="Enter APP_API_KEY">
              <p>Stored only for this browser tab.</p>
            </details>
          </div>
        </form>
      </div>
      </div>
    </div>

    </div>

    <button id="sidebar-toggle" class="sidebar-toggle" type="button" aria-label="Open sidebar" aria-expanded="false" aria-controls="sidebar">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
      </svg>
    </button>
    <div id="sidebar-backdrop" class="sidebar-backdrop" hidden></div>



    <dialog id="map-dialog" class="map-dialog" aria-labelledby="dialog-title">
      <div class="dialog-shell">
        <header class="dialog-header">
          <div class="dialog-place-summary">
            <span class="dialog-pin" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" fill="currentColor"></path>
                <circle cx="12" cy="10" r="2.1" fill="white"></circle>
              </svg>
            </span>
            <div>
              <strong id="dialog-title"></strong>
              <span id="dialog-view-label">Photos &amp; live map</span>
            </div>
          </div>
          <div class="dialog-header-actions">
            <a id="dialog-maps-link" class="dialog-external" target="_blank" rel="noopener noreferrer">
              Open in Google Maps
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </a>
            <button id="dialog-close" class="icon-button" type="button" aria-label="Close map">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>
            </button>
          </div>
        </header>

          <div class="map-dialog-content">
          <section class="live-map-panel" aria-label="Live Google map">
            <div id="map-canvas" aria-label="Interactive Google map" hidden></div>
            <iframe
              id="map-frame"
              title="Google map for the selected place"
              loading="eager"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
            <div id="map-loading" class="map-loading" aria-live="polite">
              <span class="map-loader" aria-hidden="true"></span>
              <strong>Loading Google Maps</strong>
              <span>Bringing the selected place into view…</span>
            </div>
            <div id="map-unavailable" class="map-unavailable" hidden>
              <span class="dialog-pin" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" fill="currentColor"></path>
                  <circle cx="12" cy="10" r="2.1" fill="white"></circle>
                </svg>
              </span>
              <strong>Map preview unavailable</strong>
              <p>You can still open this place safely in Google Maps.</p>
            </div>
          </section>
          <aside class="place-details">
            <p class="section-kicker">Verified place details</p>
            <h2 id="dialog-place-name"></h2>
            <p id="dialog-address" class="dialog-address"></p>
            <div class="dialog-rating">
              <span id="dialog-rating"></span>
              <span id="dialog-reviews"></span>
            </div>

            <div class="gallery-panel">
              <p class="section-kicker">Photos</p>
              <h3>Real photos from Google</h3>
              <div id="dialog-photos" class="photo-gallery" aria-live="polite"></div>
            </div>
          </aside>
        </div>
      </div>
    </dialog>

    
  
</template>
