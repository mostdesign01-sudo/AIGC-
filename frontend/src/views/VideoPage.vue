<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useFeed } from '../data/useFeed'
import { formatDay, formatDayLong, formatWeek, hostOf, platformName } from '../data/format'
import GifStack from '../components/GifStack.vue'
import SlotBadge from '../components/SlotBadge.vue'
import VideoCard from '../components/VideoCard.vue'
import EmptyState from '../components/EmptyState.vue'

const props = defineProps<{ id: string }>()

const { videoById, videos, categoryName, slotLabel, weekById } = useFeed()

const video = computed(() => videoById(props.id))
const week = computed(() => (video.value ? weekById(video.value.week_id) : undefined))

const related = computed(() => {
  if (!video.value) return []
  const v = video.value
  return videos.value
    .filter((x) => x.id !== v.id && (x.category === v.category || x.collected_date === v.collected_date))
    .slice(0, 3)
})

const shareTitle = computed(() => (video.value ? `${video.value.title} · 得物 AIGC 创意站` : ''))
</script>

<template>
  <div class="videopage container">
    <template v-if="video">
      <nav class="crumbs" aria-label="面包屑">
        <RouterLink to="/">首页</RouterLink>
        <span>/</span>
        <RouterLink :to="{ name: 'day', params: { date: video.collected_date } }">{{ formatDay(video.collected_date, false) }}</RouterLink>
        <span>/</span>
        <span class="crumbs__current">{{ video.title }}</span>
      </nav>

      <div class="layout" :class="[`layout--${video.orientation}`]">
        <div class="media">
          <GifStack :video="video" mode="detail" eager />
          <p class="media__note">
            {{ video.orientation === 'vertical' ? '竖版 · 1 张 360×640 · 2× 速度' : '横版 · 上下两段 720×406 · 2× 速度' }}
            · GIF 只是节选，完整效果请看原片。
          </p>
        </div>

        <aside class="info">
          <div class="info__chips">
            <span class="chip chip--accent">{{ categoryName(video.category) }}</span>
            <span class="chip">{{ video.orientation === 'vertical' ? '竖版 9:16' : '横版 16:9' }}</span>
            <SlotBadge v-if="video.weekly_slot" :slot="video.weekly_slot" :label="`${formatWeek(video.week_id)} · ${slotLabel(video.weekly_slot).label}`" />
          </div>

          <h1 class="info__title">{{ video.title }}</h1>

          <dl class="info__meta">
            <div v-if="video.author">
              <dt>作者 / 出品</dt>
              <dd>{{ video.author }}</dd>
            </div>
            <div>
              <dt>来源平台</dt>
              <dd>{{ platformName(video.platform) }} · {{ hostOf(video.url) }}</dd>
            </div>
            <div>
              <dt>收录日期</dt>
              <dd>
                <RouterLink :to="{ name: 'day', params: { date: video.collected_date } }" class="link">
                  {{ formatDayLong(video.collected_date) }}
                </RouterLink>
              </dd>
            </div>
            <div>
              <dt>所属周</dt>
              <dd>
                <RouterLink :to="{ name: 'week', params: { weekId: video.week_id } }" class="link">
                  {{ formatWeek(video.week_id, week?.start, week?.end) }}
                </RouterLink>
              </dd>
            </div>
          </dl>

          <section class="info__intro">
            <h2>它做了什么</h2>
            <p>{{ video.intro_zh || '简介待补。' }}</p>
          </section>

          <div v-if="video.tags.length" class="info__tags">
            <span v-for="t in video.tags" :key="t" class="chip chip--outline">#{{ t }}</span>
          </div>

          <div class="info__actions">
            <a :href="video.url" target="_blank" rel="noopener noreferrer" class="btn" :title="shareTitle">
              打开原片 · {{ platformName(video.platform) }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
            <a v-if="video.source_video_url" :href="video.source_video_url" target="_blank" rel="noopener noreferrer" class="btn btn--ghost">
              源片 mp4
            </a>
          </div>

          <p v-if="video.source_notes" class="info__notes">
            <strong>来源备注：</strong>{{ video.source_notes }}
          </p>
        </aside>
      </div>

      <section v-if="related.length" class="related">
        <div class="section-head">
          <div>
            <h2>相关收录</h2>
            <p class="sub">同分类或同一天收录</p>
          </div>
        </div>
        <div class="card-grid">
          <VideoCard v-for="v in related" :key="v.id" :video="v" show-date />
        </div>
      </section>
    </template>

    <EmptyState v-else title="没有找到这条视频" hint="它可能已被移除，或者链接不对。">
      <RouterLink to="/" class="btn btn--ghost">回到首页</RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.videopage {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.crumbs {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
  margin-bottom: -20px;
  min-width: 0;
}

.crumbs a:hover {
  color: var(--ink);
}

.crumbs__current {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 40ch;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(320px, 5fr);
  gap: 32px;
  align-items: start;
}

.layout--vertical {
  grid-template-columns: minmax(0, 4fr) minmax(320px, 6fr);
}

.media {
  position: sticky;
  top: 84px;
}

.layout--vertical .media {
  max-width: 440px;
  justify-self: center;
  width: 100%;
}

.media__note {
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--muted);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  background: var(--card);
  border: 1px solid var(--line-2);
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.info__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.info__title {
  font-size: clamp(22px, 2.6vw, 30px);
  line-height: 1.3;
}

.info__meta {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.info__meta div {
  min-width: 0;
}

.info__meta dt {
  font-size: 11.5px;
  letter-spacing: 0.08em;
  color: var(--muted);
  text-transform: uppercase;
}

.info__meta dd {
  margin: 2px 0 0;
  font-size: 14px;
  color: var(--ink-2);
  overflow-wrap: anywhere;
}

.link {
  font-weight: 600;
}

.link:hover {
  color: var(--accent-ink);
}

.info__intro h2 {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 8px;
}

.info__intro p {
  font-size: 15.5px;
  line-height: 1.8;
  color: var(--ink);
}

.info__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.info__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.info__notes {
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.6;
  padding-top: 12px;
  border-top: 1px solid var(--line-2);
}

@media (max-width: 900px) {
  .layout,
  .layout--vertical {
    grid-template-columns: 1fr;
  }
  .media {
    position: static;
  }
  .layout--vertical .media {
    max-width: 360px;
  }
}

@media (max-width: 640px) {
  .info {
    padding: 18px;
  }
  .info__meta {
    grid-template-columns: 1fr;
  }
}
</style>
