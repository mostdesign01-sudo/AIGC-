<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { CreativeVideo } from '../data/types'
import { formatDay, formatWeekShort } from '../data/format'
import VideoCard from './VideoCard.vue'

withDefaults(
  defineProps<{
    date: string
    videos: CreativeVideo[]
    weekId?: string
    isToday?: boolean
    eagerFirst?: boolean
    linkToDay?: boolean
  }>(),
  { isToday: false, eagerFirst: false, linkToDay: true },
)
</script>

<template>
  <section class="day" :aria-label="`${date} 收录`">
    <header class="day__head">
      <div class="day__title">
        <span v-if="isToday" class="chip chip--accent">今天</span>
        <h2>
          <RouterLink v-if="linkToDay" :to="{ name: 'day', params: { date } }">{{ formatDay(date) }}</RouterLink>
          <template v-else>{{ formatDay(date) }}</template>
        </h2>
        <span class="day__count">{{ videos.length }} 条</span>
      </div>
      <RouterLink v-if="weekId" :to="{ name: 'week', params: { weekId } }" class="day__week">
        {{ formatWeekShort(weekId) }} 周榜 →
      </RouterLink>
    </header>

    <div class="card-grid">
      <VideoCard v-for="(v, i) in videos" :key="v.id" :video="v" :eager="eagerFirst && i < 2" />
    </div>
  </section>
</template>

<style scoped>
.day {
  margin-bottom: 40px;
}

.day__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.day__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.day__title h2 {
  font-size: 20px;
}

.day__title h2 a:hover {
  color: var(--accent-ink);
}

.day__count {
  font-size: 13px;
  color: var(--muted);
}

.day__week {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
}

.day__week:hover {
  color: var(--ink);
}
</style>
