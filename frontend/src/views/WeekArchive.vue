<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useFeed } from '../data/useFeed'
import { formatRange, formatWeek } from '../data/format'
import SlotBadge from '../components/SlotBadge.vue'
import EmptyState from '../components/EmptyState.vue'

const { weeks, videoById, videosInWeek } = useFeed()
</script>

<template>
  <div class="weeks container">
    <header class="weeks__head">
      <p class="eyebrow">Archive · weekly TOP3</p>
      <h1>周榜 TOP3</h1>
      <p class="weeks__sub">每周从当周收录里选三条：最热、最影响力、最有创意。往期都留在这里。</p>
    </header>

    <ul v-if="weeks.length" class="week-list">
      <li v-for="w in weeks" :key="w.week_id" class="week-row">
        <RouterLink :to="{ name: 'week', params: { weekId: w.week_id } }" class="week-row__head">
          <div>
            <h2>{{ formatWeek(w.week_id) }}</h2>
            <p class="week-row__meta">{{ formatRange(w.start, w.end) }} · 当周收录 {{ videosInWeek(w.week_id).length }} 条</p>
          </div>
          <span class="week-row__arrow" aria-hidden="true">→</span>
        </RouterLink>
        <p v-if="w.note" class="week-row__note">{{ w.note }}</p>

        <div class="week-row__picks">
          <RouterLink
            v-for="p in w.picks"
            :key="p.slot"
            :to="p.video_id && videoById(p.video_id) ? { name: 'video', params: { id: p.video_id } } : { name: 'week', params: { weekId: w.week_id } }"
            class="mini-pick"
            :class="{ 'mini-pick--empty': !(p.video_id && videoById(p.video_id)) }"
          >
            <div class="mini-pick__thumb" :class="{ 'is-vertical': videoById(p.video_id ?? '')?.orientation === 'vertical' }">
              <img
                v-if="p.video_id && videoById(p.video_id)?.gif_a_url"
                :src="videoById(p.video_id)!.gif_a_url"
                :alt="videoById(p.video_id)!.title"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="mini-pick__text">
              <SlotBadge :slot="p.slot" :label="p.label" />
              <strong>{{ p.video_id && videoById(p.video_id) ? videoById(p.video_id)!.title : '尚未选出' }}</strong>
            </div>
          </RouterLink>
        </div>
      </li>
    </ul>
    <EmptyState v-else title="还没有周榜" hint="运行 make pick_week_top3 选出本周三条。" />
  </div>
</template>

<style scoped>
.weeks__head {
  margin-bottom: 32px;
}

.weeks__head h1 {
  font-size: clamp(26px, 3vw, 34px);
  margin-top: 8px;
}

.weeks__sub {
  margin-top: 8px;
  color: var(--muted);
  max-width: 60ch;
}

.week-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.week-row {
  padding: 20px;
  background: var(--card);
  border: 1px solid var(--line-2);
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.week-row__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.week-row__head h2 {
  font-size: 20px;
}

.week-row__head:hover h2 {
  color: var(--accent-ink);
}

.week-row__meta {
  font-size: 13px;
  color: var(--muted);
  margin-top: 2px;
}

.week-row__arrow {
  font-size: 20px;
  color: var(--muted);
}

.week-row__note {
  margin-top: 10px;
  font-size: 14px;
  color: var(--ink-2);
}

.week-row__picks {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.mini-pick {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border-radius: 14px;
  background: var(--bg);
  border: 1px solid var(--line-2);
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.mini-pick:hover {
  transform: translateY(-2px);
  border-color: var(--line);
}

.mini-pick--empty {
  opacity: 0.7;
}

.mini-pick__thumb {
  width: 96px;
  aspect-ratio: 16 / 9;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #0f1012;
}

.mini-pick__thumb.is-vertical {
  width: 54px;
  aspect-ratio: 9 / 16;
}

.mini-pick__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mini-pick__text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.mini-pick__text strong {
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 900px) {
  .week-row__picks {
    grid-template-columns: 1fr;
  }
}
</style>
