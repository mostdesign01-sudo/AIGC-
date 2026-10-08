<script setup lang="ts">
import { computed } from 'vue'
import type { CreativeVideo } from '../data/types'
import { introSections } from '../data/format'

/**
 * 简介：背景 · 制作 · 创意 三段带标签展示；旧数据没有结构化字段时回退到 intro_zh。
 */
const props = withDefaults(
  defineProps<{
    video: CreativeVideo
    size?: 'card' | 'detail'
  }>(),
  { size: 'card' },
)

const sections = computed(() => introSections(props.video))
</script>

<template>
  <dl v-if="sections.length" class="intro" :class="`intro--${size}`">
    <div v-for="s in sections" :key="s.key" class="intro__row" :class="`intro__row--${s.key}`">
      <dt>{{ s.label }}</dt>
      <dd>{{ s.text }}</dd>
    </div>
  </dl>
  <p v-else class="intro__plain" :class="`intro--${size}`">{{ video.intro_zh || '简介待补。' }}</p>
</template>

<style scoped>
.intro {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.intro__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  align-items: baseline;
}

.intro dt {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.5;
  padding: 1px 6px;
  border-radius: 5px;
  white-space: nowrap;
  color: var(--accent-ink);
  background: var(--accent-soft);
}

.intro__row--production dt {
  color: #6a4a00;
  background: #fbf0d4;
}

.intro__row--concept dt {
  color: #8a2a4a;
  background: #fbe4ec;
}

.intro dd {
  margin: 0;
  color: var(--ink-2);
}

.intro--card dd,
.intro__plain.intro--card {
  font-size: 13px;
  line-height: 1.6;
}

.intro--card dd {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.intro__plain.intro--card {
  color: var(--ink-2);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.intro--detail {
  gap: 12px;
}

.intro--detail dt {
  font-size: 12px;
  padding: 2px 8px;
}

.intro--detail dd,
.intro__plain.intro--detail {
  font-size: 15px;
  line-height: 1.8;
  color: var(--ink);
}
</style>
