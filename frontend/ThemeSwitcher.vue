<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const storageKey = "wander-pico-theme";
const darkMode = ref(false);
let mediaQuery;

function applyTheme(isDark) {
  darkMode.value = isDark;
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
}

function syncWithSystem(event) {
  if (!localStorage.getItem(storageKey)) applyTheme(event.matches);
}

function toggleTheme() {
  const nextTheme = darkMode.value ? "light" : "dark";
  localStorage.setItem(storageKey, nextTheme);
  applyTheme(nextTheme === "dark");
}

onMounted(() => {
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const savedTheme = localStorage.getItem(storageKey);
  applyTheme(savedTheme ? savedTheme === "dark" : mediaQuery.matches);
  mediaQuery.addEventListener("change", syncWithSystem);
});

onUnmounted(() => mediaQuery?.removeEventListener("change", syncWithSystem));
</script>

<template>
  <button
    class="theme-switch"
    type="button"
    role="switch"
    :aria-checked="darkMode"
    :aria-label="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <span class="theme-switch-icon theme-switch-sun" aria-hidden="true">☀</span>
    <span class="theme-switch-track" aria-hidden="true"><span></span></span>
    <span class="theme-switch-icon theme-switch-moon" aria-hidden="true">☾</span>
  </button>
</template>
