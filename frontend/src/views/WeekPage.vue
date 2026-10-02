<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useFeed } from '../data/useFeed'
import type { WeekSummary } from '../data/types'
import { WEEKLY_SLOTS } from '../data/types'
import { formatWeek } from '../data/format'
import WeeklyTop3 from '../components/WeeklyTop3.vue'
import VideoCard from '../components/VideoCard.vue'
import EmptyState from '../components/EmptyState.vue'

const props = defineProps<{ weekId: string }>()

const { weeks, weekById, videosInWeek, slotLabel } = useFeed()

/** 从 ISO 周编号推算起止日期（feed 里没有这一周记录时也能显示标题） */
function isoWeekRange(weekId: string): { start: string; end: string } | undefined {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekId)
  if (!m) return undefined
  const year = Number(m[1])
  const week = Number(m[2])
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { start: iso(monday), end: iso(sunday) }
}

const week = computed<WeekSummary | undefined>(() => {
  const found = weekById(props.weekId)
  if (found) return found
  const range = isoWeekRange(props.weekId)
  if (!range) return undefined
  return {
    week_id: props.weekId,
    start: range.start,
    end: range.end,
    note: '',
    picks: WEEKLY_SLOTS.map((slot) => ({ slot, label: slotLabel(slot).label, tagline: slotLabel(slot).tagline, video_id: null })),
  }
})

const candidates = computed(() => videosInWeek(props.weekId))
const pickedIds = computed(() => new Set(week.value?.picks.map((p) => p.video_id).filter(Boolean) as string[]))
const others = computed(() => candidates.value.filter((v) => !pickedIds.value.has(v.id)))

const index = computed(() => weeks.value.findIndex((w) => w.week_id === props.weekId))
const newer = computed(() => (index.value > 0 ? weeks.value[index.value - 1] : undefined))
const older = computed(() => (index.value >= 0 && index.value < weeks.value.length - 1 ? weeks.value[index.value + 1] : undefined))
</script>

<template>
  <div class="weekpage container">
    <nav class="crumbs" aria-label="面包屑">
      <RouterLink to="/">首页</RouterLink>
      <span>/</span>
      <RouterLink to="/weeks">周榜 TOP3</RouterLink>
      <span>/</span>
      <span>{{ weekId }}</span>
    </nav>

    <template v-if="week">
      <div class="weekpage__nav">
        <RouterLink v-if="older" :to="{ name: 'week', params: { weekId: older.week_id } }" class="btn btn--ghost">
          ← {{ formatWeek(older.week_id) }}
        </RouterLink>
        <span v-else></span>
        <RouterLink v-if="newer" :to="{ name: 'week', params: { weekId: newer.week_id } }" class="btn btn--ghost">
          {{ formatWeek(newer.week_id) }} →
        </RouterLink>
      </div>

      <WeeklyTop3 :week="week" eager />

      <section class="others">
        <div class="section-head">
          <div>
            <h2>本周其余收录</h2>
            <p class="sub">{{ others.length }} 条 · 当周共收录 {{ candidates.length }} 条</p>
          </div>
          <RouterLink to="/days" class="more">按日期浏览 →</RouterLink>
        </div>
        <div v-if="others.length" class="card-grid">
          <VideoCard v-for="v in others" :key="v.id" :video="v" show-date />
        </div>
        <EmptyState v-else title="这一周没有其它收录" :hint="candidates.length ? '三条 TOP3 就是全部。' : '这一周还没有任何收录。'" />
      </section>
    </template>
    <EmptyState v-else title="周编号格式不对" hint="应为 YYYY-Www，例如 2026-W38。">
      <RouterLink to="/weeks" class="btn btn--ghost">回到周榜</RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.weekpage {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.crumbs {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
  margin-bottom: -16px;
}

.crumbs a:hover {
  color: var(--ink);
}

.weekpage__nav {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: -16px;
}
</style>
