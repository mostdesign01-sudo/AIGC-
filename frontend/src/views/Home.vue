<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useFeed } from '../data/useFeed'
import type { Orientation } from '../data/types'
import WeeklyTop3 from '../components/WeeklyTop3.vue'
import DaySection from '../components/DaySection.vue'
import EmptyState from '../components/EmptyState.vue'

const { videos, days, categories, featuredWeek } = useFeed()

const RECENT_DAYS = 5

const activeCategory = ref<string>('all')
const activeOrientation = ref<'all' | Orientation>('all')

const todayShanghai = computed(() => {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' })
  return fmt.format(new Date())
})

const filtered = computed(() =>
  videos.value.filter(
    (v) =>
      (activeCategory.value === 'all' || v.category === activeCategory.value) &&
      (activeOrientation.value === 'all' || v.orientation === activeOrientation.value),
  ),
)

const filtering = computed(() => activeCategory.value !== 'all' || activeOrientation.value !== 'all')

/** 最近 N 天（有收录的天）；筛选时展示全部匹配的天。 */
const recentGroups = computed(() => {
  const dates = filtering.value ? days.value.map((d) => d.date) : days.value.slice(0, RECENT_DAYS).map((d) => d.date)
  return dates
    .map((date) => ({
      date,
      weekId: days.value.find((d) => d.date === date)?.week_id,
      videos: filtered.value.filter((v) => v.collected_date === date),
    }))
    .filter((g) => g.videos.length > 0)
})

const categoryCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const v of videos.value) counts.set(v.category, (counts.get(v.category) ?? 0) + 1)
  return counts
})

const resetFilters = () => {
  activeCategory.value = 'all'
  activeOrientation.value = 'all'
}
</script>

<template>
  <div class="home container">
    <section class="intro">
      <p class="eyebrow">Daily AIGC Creative Picks</p>
      <h1>每天挑几条值得看的 AI 创意视频，<br class="br-wide" />用两段 2× GIF 先看个大概。</h1>
      <p class="intro__sub">
        广告、时尚换装、短片、工具演示——只收成片，不收教程；每条配 100–150 字中文解读，
        说清楚它做了什么、点子落在哪里。每周从收录里选出三条：最热、最影响力、最有创意。
      </p>
    </section>

    <WeeklyTop3 v-if="featuredWeek" :week="featuredWeek" hero eager class="home__top3" />

    <section class="feed">
      <div class="section-head">
        <div>
          <h2>每日收录</h2>
          <p class="sub">最近 {{ RECENT_DAYS }} 天 · 共 {{ videos.length }} 条 · {{ days.length }} 个收录日</p>
        </div>
        <RouterLink to="/days" class="more">按日期浏览 →</RouterLink>
      </div>

      <div class="filters" role="group" aria-label="筛选">
        <div class="filters__row">
          <button :class="['filter', { 'is-active': activeCategory === 'all' }]" @click="activeCategory = 'all'">
            全部
          </button>
          <button
            v-for="c in categories"
            :key="c.slug"
            :class="['filter', { 'is-active': activeCategory === c.slug, 'is-empty': !categoryCounts.get(c.slug) }]"
            @click="activeCategory = c.slug"
          >
            {{ c.name }}
            <small v-if="categoryCounts.get(c.slug)">{{ categoryCounts.get(c.slug) }}</small>
          </button>
        </div>
        <div class="filters__row filters__row--right">
          <button
            v-for="o in [
              { key: 'all', label: '横竖都看' },
              { key: 'landscape', label: '横版' },
              { key: 'vertical', label: '竖版' },
            ] as const"
            :key="o.key"
            :class="['filter filter--pill', { 'is-active': activeOrientation === o.key }]"
            @click="activeOrientation = o.key"
          >
            {{ o.label }}
          </button>
        </div>
      </div>

      <template v-if="recentGroups.length">
        <DaySection
          v-for="(g, i) in recentGroups"
          :key="g.date"
          :date="g.date"
          :videos="g.videos"
          :week-id="g.weekId"
          :is-today="g.date === todayShanghai"
          :eager-first="i === 0"
        />
      </template>
      <EmptyState
        v-else-if="filtering"
        title="这个筛选下暂时没有内容"
        hint="换一个分类或方向试试，或者清除筛选。"
      >
        <button class="btn btn--ghost" @click="resetFilters">清除筛选</button>
      </EmptyState>
      <EmptyState
        v-else
        title="还没有收录"
        hint="运行 make ingest_day 收录第一条视频，然后重新构建。"
      />
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.intro {
  max-width: 820px;
  padding-top: 8px;
}

.intro h1 {
  margin-top: 10px;
  font-size: clamp(26px, 3.4vw, 40px);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.intro__sub {
  margin-top: 14px;
  font-size: 15.5px;
  color: var(--muted);
  max-width: 64ch;
}

.filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filters__row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filters__row--right {
  padding: 3px;
  border-radius: 999px;
  background: var(--bg-2);
}

.filter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink-2);
  font-size: 13px;
  font-weight: 600;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.filter small {
  font-size: 11px;
  color: var(--muted);
  font-weight: 600;
}

.filter:hover {
  border-color: var(--ink);
}

.filter.is-active {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

.filter.is-active small {
  color: rgba(255, 255, 255, 0.7);
}

.filter.is-empty {
  color: var(--muted-2);
}

.filter--pill {
  border-color: transparent;
  background: transparent;
}

.filter--pill.is-active {
  background: var(--card);
  color: var(--ink);
  border-color: transparent;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.br-wide {
  display: none;
}

@media (min-width: 900px) {
  .br-wide {
    display: inline;
  }
}

@media (max-width: 640px) {
  .home {
    gap: 28px;
  }
  .intro__sub {
    font-size: 14.5px;
  }
  .filters__row--right {
    width: 100%;
    justify-content: space-between;
  }
  .filter--pill {
    flex: 1;
    justify-content: center;
  }
}
</style>
