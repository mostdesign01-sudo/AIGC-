<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { WeekSummary } from '../data/types'
import { useFeed } from '../data/useFeed'
import { formatWeek, platformName } from '../data/format'
import GifStack from './GifStack.vue'
import SlotBadge from './SlotBadge.vue'

const props = withDefaults(
  defineProps<{
    week: WeekSummary
    /** 首页 hero 模式：更大标题、带"查看全部周榜"入口 */
    hero?: boolean
    eager?: boolean
  }>(),
  { hero: false, eager: false },
)

const { videoById, categoryName } = useFeed()

const picks = computed(() =>
  props.week.picks.map((p) => ({
    ...p,
    video: p.video_id ? videoById(p.video_id) : undefined,
  })),
)

const filled = computed(() => picks.value.filter((p) => p.video).length)
</script>

<template>
  <section class="top3" :class="{ 'top3--hero': hero }" :aria-label="`${week.week_id} 周榜 TOP3`">
    <div class="top3__head">
      <div>
        <p class="eyebrow">{{ hero ? '本周 TOP3' : '周榜 TOP3' }}</p>
        <h2 class="top3__title">
          <RouterLink :to="{ name: 'week', params: { weekId: week.week_id } }">
            {{ formatWeek(week.week_id, week.start, week.end) }}
          </RouterLink>
        </h2>
        <p v-if="week.note" class="top3__note">{{ week.note }}</p>
      </div>
      <div class="top3__actions">
        <span v-if="filled < 3" class="chip chip--outline">已选 {{ filled }} / 3</span>
        <RouterLink v-if="hero" to="/weeks" class="btn btn--ghost">往期周榜</RouterLink>
      </div>
    </div>

    <div class="top3__grid">
      <article v-for="pick in picks" :key="pick.slot" class="pick" :class="[`pick--${pick.slot}`, { 'pick--empty': !pick.video }]">
        <header class="pick__label">
          <SlotBadge :slot="pick.slot" :label="pick.label" size="md" />
          <span class="pick__tagline">{{ pick.tagline }}</span>
        </header>

        <template v-if="pick.video">
          <RouterLink :to="{ name: 'video', params: { id: pick.video.id } }" class="pick__media">
            <GifStack :video="pick.video" :eager="eager" mode="card" />
          </RouterLink>
          <div class="pick__body">
            <div class="pick__meta">
              <span class="chip chip--accent">{{ categoryName(pick.video.category) }}</span>
              <span class="chip chip--outline">{{ pick.video.orientation === 'vertical' ? '竖版' : '横版' }}</span>
            </div>
            <h3 class="pick__title">
              <RouterLink :to="{ name: 'video', params: { id: pick.video.id } }">{{ pick.video.title }}</RouterLink>
            </h3>
            <p class="pick__intro">{{ pick.video.intro_zh }}</p>
            <div class="pick__foot">
              <span class="pick__author">{{ pick.video.author || platformName(pick.video.platform) }}</span>
              <a :href="pick.video.url" target="_blank" rel="noopener noreferrer" class="pick__link">
                打开原片 · {{ platformName(pick.video.platform) }}
              </a>
            </div>
          </div>
        </template>

        <div v-else class="pick__placeholder">
          <p>本周尚未选出</p>
          <small>用 <code>make pick_week_top3</code> 或后台接口填入</small>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.top3 {
  padding: 24px;
  border-radius: 24px;
  background: var(--card);
  border: 1px solid var(--line-2);
  box-shadow: var(--shadow);
}

.top3--hero {
  padding: 28px;
  background:
    radial-gradient(1200px 400px at 0% 0%, rgba(15, 191, 174, 0.1), transparent 60%),
    radial-gradient(800px 300px at 100% 0%, rgba(79, 91, 255, 0.08), transparent 60%),
    var(--card);
}

.top3__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.top3__title {
  font-size: 24px;
  margin-top: 4px;
}

.top3--hero .top3__title {
  font-size: 30px;
}

.top3__title a:hover {
  color: var(--accent-ink);
}

.top3__note {
  margin-top: 8px;
  color: var(--muted);
  font-size: 14px;
  max-width: 60ch;
}

.top3__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.top3__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.pick {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  background: var(--bg);
  border: 1px solid var(--line-2);
  position: relative;
}

.pick--hottest {
  background: linear-gradient(180deg, var(--slot-hottest-soft), var(--bg) 42%);
}

.pick--influential {
  background: linear-gradient(180deg, var(--slot-influential-soft), var(--bg) 42%);
}

.pick--creative {
  background: linear-gradient(180deg, var(--slot-creative-soft), var(--bg) 42%);
}

.pick__label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.pick__tagline {
  font-size: 12.5px;
  color: var(--muted);
}

.pick__media {
  display: block;
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: transform 0.18s ease;
}

.pick__media:hover {
  transform: translateY(-2px);
}

.pick__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pick__meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pick__title {
  font-size: 17px;
  line-height: 1.4;
}

.pick__title a:hover {
  color: var(--accent-ink);
}

.pick__intro {
  font-size: 13.5px;
  color: var(--ink-2);
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pick__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12.5px;
  color: var(--muted);
  padding-top: 8px;
  border-top: 1px solid var(--line);
}

.pick__author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pick__link {
  font-weight: 600;
  color: var(--ink-2);
  white-space: nowrap;
}

.pick__link:hover {
  color: var(--accent-ink);
}

.pick__placeholder {
  flex: 1;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px dashed var(--line);
  border-radius: var(--radius-sm);
  color: var(--muted);
  text-align: center;
  padding: 16px;
}

.pick__placeholder code {
  font-family: var(--mono);
  font-size: 12px;
  background: var(--bg-2);
  padding: 1px 6px;
  border-radius: 4px;
}

@media (max-width: 1000px) {
  .top3__grid {
    grid-template-columns: 1fr;
  }
  .pick {
    display: grid;
    grid-template-columns: minmax(0, 220px) 1fr;
    grid-template-areas:
      'label label'
      'media body';
    align-items: start;
  }
  .pick__label {
    grid-area: label;
  }
  .pick__media {
    grid-area: media;
  }
  .pick__body {
    grid-area: body;
  }
  .pick__placeholder {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .top3,
  .top3--hero {
    padding: 18px;
    border-radius: 18px;
  }
  .top3__head {
    flex-direction: column;
  }
  .top3--hero .top3__title {
    font-size: 24px;
  }
  .pick {
    grid-template-columns: 1fr;
    grid-template-areas:
      'label'
      'media'
      'body';
  }
}
</style>
