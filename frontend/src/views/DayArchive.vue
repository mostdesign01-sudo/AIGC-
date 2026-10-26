<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useFeed } from '../data/useFeed'
import { formatDay, formatWeek, formatWeekShort } from '../data/format'
import EmptyState from '../components/EmptyState.vue'

const { days, videosOnDay, weekById, categoryName } = useFeed()

/** 按 ISO 周分组的日期列表 */
const groupedByWeek = computed(() => {
  const groups: { weekId: string; start?: string; end?: string; days: typeof days.value }[] = []
  for (const d of days.value) {
    let g = groups.find((x) => x.weekId === d.week_id)
    if (!g) {
      const w = weekById(d.week_id)
      g = { weekId: d.week_id, start: w?.start, end: w?.end, days: [] }
      groups.push(g)
    }
    g.days.push(d)
  }
  return groups
})

const preview = (date: string) => {
  const vs = videosOnDay(date)
  return {
    titles: vs.slice(0, 3).map((v) => v.title),
    categories: [...new Set(vs.map((v) => categoryName(v.category)))],
    firstGif: vs.find((v) => v.gif_a_url),
  }
}
</script>

<template>
  <div class="archive container">
    <header class="archive__head">
      <p class="eyebrow">Archive · by day</p>
      <h1>每日归档</h1>
      <p class="archive__sub">按收录日期回看。共 {{ days.length }} 个收录日。</p>
    </header>

    <template v-if="groupedByWeek.length">
      <section v-for="g in groupedByWeek" :key="g.weekId" class="week-group">
        <div class="section-head">
          <div>
            <h2>{{ formatWeek(g.weekId, g.start, g.end) }}</h2>
          </div>
          <RouterLink :to="{ name: 'week', params: { weekId: g.weekId } }" class="more">
            {{ formatWeekShort(g.weekId) }} TOP3 →
          </RouterLink>
        </div>

        <ul class="day-list">
          <li v-for="d in g.days" :key="d.date">
            <RouterLink :to="{ name: 'day', params: { date: d.date } }" class="day-row">
              <div class="day-row__thumb">
                <img
                  v-if="preview(d.date).firstGif"
                  :src="preview(d.date).firstGif!.gif_a_url"
                  :alt="preview(d.date).firstGif!.title"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div class="day-row__main">
                <div class="day-row__date">
                  <strong>{{ formatDay(d.date) }}</strong>
                  <span class="chip chip--outline">{{ d.count }} 条</span>
                </div>
                <p class="day-row__titles">{{ preview(d.date).titles.join(' · ') }}</p>
                <div class="day-row__cats">
                  <span v-for="c in preview(d.date).categories" :key="c" class="chip">{{ c }}</span>
                </div>
              </div>
              <span class="day-row__arrow" aria-hidden="true">→</span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </template>
    <EmptyState v-else title="还没有收录" hint="运行 make ingest_day 收录第一条视频。" />
  </div>
</template>

<style scoped>
.archive__head {
  margin-bottom: 32px;
}

.archive__head h1 {
  font-size: clamp(26px, 3vw, 34px);
  margin-top: 8px;
}

.archive__sub {
  margin-top: 8px;
  color: var(--muted);
}

.week-group {
  margin-bottom: 40px;
}

.day-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-row {
  display: grid;
  grid-template-columns: 160px 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 14px;
  background: var(--card);
  border: 1px solid var(--line-2);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.day-row:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.day-row__thumb {
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #0f1012;
}

.day-row__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.day-row__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.day-row__date {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
}

.day-row__titles {
  font-size: 14px;
  color: var(--ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-row__cats {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.day-row__arrow {
  font-size: 20px;
  color: var(--muted);
}

@media (max-width: 640px) {
  .day-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .day-row__arrow {
    display: none;
  }
  .day-row__titles {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
