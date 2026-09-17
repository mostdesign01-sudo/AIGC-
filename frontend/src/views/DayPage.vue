<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useFeed } from '../data/useFeed'
import { formatDay, formatDayLong, formatWeek } from '../data/format'
import DaySection from '../components/DaySection.vue'
import EmptyState from '../components/EmptyState.vue'

const props = defineProps<{ date: string }>()

const { days, videosOnDay, weekById } = useFeed()

const videos = computed(() => videosOnDay(props.date))
const index = computed(() => days.value.findIndex((d) => d.date === props.date))
const newer = computed(() => (index.value > 0 ? days.value[index.value - 1] : undefined))
const older = computed(() => (index.value >= 0 && index.value < days.value.length - 1 ? days.value[index.value + 1] : undefined))
const weekId = computed(() => videos.value[0]?.week_id ?? days.value[index.value]?.week_id)
const week = computed(() => (weekId.value ? weekById(weekId.value) : undefined))
</script>

<template>
  <div class="daypage container">
    <nav class="crumbs" aria-label="面包屑">
      <RouterLink to="/">首页</RouterLink>
      <span>/</span>
      <RouterLink to="/days">每日归档</RouterLink>
      <span>/</span>
      <span>{{ formatDay(date, false) }}</span>
    </nav>

    <header class="daypage__head">
      <div>
        <p class="eyebrow">Daily picks</p>
        <h1>{{ formatDayLong(date) }}</h1>
        <p v-if="weekId" class="daypage__sub">
          属于
          <RouterLink :to="{ name: 'week', params: { weekId } }" class="link">
            {{ formatWeek(weekId, week?.start, week?.end) }}
          </RouterLink>
          · {{ videos.length }} 条收录
        </p>
      </div>
      <div class="daypage__nav">
        <RouterLink v-if="older" :to="{ name: 'day', params: { date: older.date } }" class="btn btn--ghost">
          ← {{ formatDay(older.date, false) }}
        </RouterLink>
        <RouterLink v-if="newer" :to="{ name: 'day', params: { date: newer.date } }" class="btn btn--ghost">
          {{ formatDay(newer.date, false) }} →
        </RouterLink>
      </div>
    </header>

    <DaySection v-if="videos.length" :date="date" :videos="videos" :week-id="weekId" :link-to-day="false" eager-first />
    <EmptyState v-else title="这一天没有收录" hint="试试相邻的日期，或回到每日归档。">
      <RouterLink to="/days" class="btn btn--ghost">回到归档</RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.crumbs {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 16px;
}

.crumbs a:hover {
  color: var(--ink);
}

.daypage__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.daypage__head h1 {
  font-size: clamp(24px, 3vw, 32px);
  margin-top: 8px;
}

.daypage__sub {
  margin-top: 8px;
  color: var(--muted);
}

.link {
  color: var(--ink-2);
  font-weight: 600;
}

.link:hover {
  color: var(--accent-ink);
}

.daypage__nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
