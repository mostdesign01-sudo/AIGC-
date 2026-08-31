<script setup lang="ts">
import { categoryName } from '../data/categories'
import type { CategorySlot } from '../data/types'
import DownloadBar from './DownloadBar.vue'

defineProps<{ coverage: CategorySlot }>()
</script>

<template>
  <article class="card" :class="{ empty: coverage.empty }">
    <p class="cat">{{ categoryName(coverage.slug) }}</p>

    <template v-if="coverage.empty">
      <h3>本期空</h3>
      <p class="why">{{ coverage.emptyNote || '本窗口没有可收录的样本。' }}</p>
    </template>

    <div v-for="item in coverage.items" :key="item.title" class="item">
      <h3>{{ item.title }}</h3>
      <p class="why">{{ item.why }}</p>
      <p v-if="item.dateLabel" class="date">{{ item.dateLabel }}</p>
      <DownloadBar :media="item.media" :sources="item.sources" />
    </div>
  </article>
</template>

<style scoped>
.card {
  background: #fffdf8;
  border: 1px solid #1a1612;
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 100%;
}

.card.empty {
  background: repeating-linear-gradient(
    -45deg,
    #fffdf8,
    #fffdf8 8px,
    #f3eee4 8px,
    #f3eee4 16px
  );
}

.cat {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #c41230;
}

h3 {
  margin: 0 0 6px;
  font-family: var(--display);
  font-size: 22px;
  line-height: 1.25;
}

.why {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.65;
  color: #2a2620;
}

.date {
  margin: 0 0 10px;
  font-size: 12px;
  color: #6f6a62;
}

.item + .item {
  padding-top: 14px;
  border-top: 1px dashed #d6cfc2;
}
</style>
