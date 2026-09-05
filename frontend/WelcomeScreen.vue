<script setup>
defineEmits(['discover']);
const ideas = [
  { icon: '☕', title: 'Find my coffee spot', detail: 'Quiet cafés & a change of scenery', prompt: 'Quiet work cafés in Bandung with outdoor seating' },
  { icon: '🍜', title: 'Eat like a local', detail: 'Good food, close to home', prompt: 'Authentic Padang food near Blok M, Jakarta' },
  { icon: '🌿', title: 'Take a breather', detail: 'Parks, fresh air & slower moments', prompt: 'A peaceful park for an evening walk in Central Jakarta' },
  { icon: '☀️', title: 'Make a day of it', detail: 'A little adventure for the weekend', prompt: 'Family-friendly things to do in Yogyakarta this weekend' },
];
</script>
<template>
<section id="empty-state" class="empty-state" aria-labelledby="empty-title">
          <span class="empty-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"></circle>
              <path d="m13.9 7.8-2.1 4.1-4.1 2.2 4.6.1 1.6 2.1.2-4.5 2.2-4-2.4-.1Z" fill="currentColor"></path>
            </svg>
          </span>
          <p class="eyebrow"><span></span> A little closer to your next favorite place</p>
          <h1 id="empty-title">Where should we go?</h1>
          <p class="empty-copy">
            Find a quiet café, plan a little escape, or discover something new nearby. Start with whatever you have in mind.
          </p>
          <div class="suggestion-grid" aria-label="Example searches">
  <button v-for="idea in ideas" :key="idea.title" class="suggestion-card" type="button" @click="$emit('discover', idea.prompt)">
    <span class="suggestion-icon" aria-hidden="true">{{ idea.icon }}</span>
    <span class="suggestion-copy"><strong>{{ idea.title }}</strong><small>{{ idea.detail }}</small></span>
  </button>
</div>
        </section>
</template>
