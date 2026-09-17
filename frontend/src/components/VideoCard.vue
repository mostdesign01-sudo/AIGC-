<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { CreativeVideo } from '../data/types'
import { useFeed } from '../data/useFeed'
import { formatDay, platformName } from '../data/format'
import GifStack from './GifStack.vue'
import SlotBadge from './SlotBadge.vue'

withDefaults(
  defineProps<{
    video: CreativeVideo
    eager?: boolean
    showDate?: boolean
  }>(),
  { eager: false, showDate: false },
)

const { categoryName, slotLabel } = useFeed()
</script>

<template>
  <article class="card" :class="[`card--${video.orientation}`]">
    <RouterLink :to="{ name: 'video', params: { id: video.id } }" class="card__media" :aria-label="`查看 ${video.title}`">
      <GifStack :video="video" :eager="eager" mode="card" />
      <div class="card__badges">
        <span class="chip chip--dark">{{ video.orientation === 'vertical' ? '竖版 9:16' : '横版 16:9' }}</span>
        <SlotBadge v-if="video.weekly_slot" :slot="video.weekly_slot" :label="slotLabel(video.weekly_slot).label" />
      </div>
    </RouterLink>

    <div class="card__body">
      <div class="card__meta">
        <span class="chip chip--accent">{{ categoryName(video.category) }}</span>
        <span v-if="showDate" class="card__date">{{ formatDay(video.collected_date, false) }}</span>
      </div>

      <h3 class="card__title">
        <RouterLink :to="{ name: 'video', params: { id: video.id } }">{{ video.title }}</RouterLink>
      </h3>

      <p class="card__intro">{{ video.intro_zh || '简介待补。' }}</p>

      <div class="card__foot">
        <span class="card__author" :title="video.author || platformName(video.platform)">
          {{ video.author || platformName(video.platform) }}
        </span>
        <a class="card__source" :href="video.url" target="_blank" rel="noopener noreferrer">
          {{ platformName(video.platform) }}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background: var(--card);
  border: 1px solid var(--line-2);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.card__media {
  position: relative;
  display: block;
}

.card__badges {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  pointer-events: none;
}

.chip--dark {
  background: rgba(0, 0, 0, 0.62);
  color: #fff;
  backdrop-filter: blur(4px);
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px 16px;
  flex: 1;
}

.card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card__date {
  font-size: 12px;
  color: var(--muted);
}

.card__title {
  font-size: 16px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__title a:hover {
  color: var(--accent-ink);
}

.card__intro {
  font-size: 13.5px;
  color: var(--ink-2);
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__foot {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--line-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12.5px;
  color: var(--muted);
}

.card__author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__source {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 600;
  color: var(--ink-2);
  white-space: nowrap;
}

.card__source:hover {
  color: var(--accent-ink);
}

.card__source svg {
  width: 14px;
  height: 14px;
}
</style>
