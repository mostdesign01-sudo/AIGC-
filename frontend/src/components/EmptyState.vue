<script setup lang="ts">
defineProps<{
  title: string
  hint?: string
}>()
</script>

<template>
  <div class="empty">
    <div class="empty__mark" aria-hidden="true"></div>
    <h3>{{ title }}</h3>
    <p v-if="hint">{{ hint }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 64px 24px;
  text-align: center;
  color: var(--muted);
  border: 1px dashed var(--line);
  border-radius: var(--radius);
  background: var(--card);
}

.empty__mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--bg-2), var(--line));
  margin-bottom: 6px;
}

.empty h3 {
  color: var(--ink);
  font-size: 17px;
}

.empty p {
  font-size: 14px;
  max-width: 44ch;
}
</style>
