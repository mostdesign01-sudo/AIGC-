<script setup lang="ts">
import { computed } from 'vue'
import type { CreativeVideo } from '../data/types'
import { fileNameOf } from '../data/format'

/**
 * 下载按钮：GIF（横版上段 / 下段，竖版一张）+ 原片 mp4。
 * 链接直接指向 GitHub Release 资产（releases/download/...），GitHub 以附件返回，
 * 跨域时浏览器会忽略 download 属性，但仍然是下载而不是打开。
 */
const props = withDefaults(
  defineProps<{
    video: CreativeVideo
    size?: 'card' | 'detail'
  }>(),
  { size: 'card' },
)

interface Item {
  key: string
  label: string
  href: string
  file: string
  title: string
}

const gifs = computed<Item[]>(() => {
  const v = props.video
  const items: Item[] = []
  if (v.orientation === 'vertical') {
    if (v.gif_a_url) items.push({ key: 'gif', label: 'GIF', href: v.gif_a_url, file: fileNameOf(v.gif_a_url), title: '下载竖版 GIF' })
  } else {
    if (v.gif_a_url) items.push({ key: 'gif-a', label: 'GIF 上段', href: v.gif_a_url, file: fileNameOf(v.gif_a_url), title: '下载上段 GIF（720×406 · 2×）' })
    if (v.gif_b_url) items.push({ key: 'gif-b', label: 'GIF 下段', href: v.gif_b_url, file: fileNameOf(v.gif_b_url), title: '下载下段 GIF（720×406 · 2×）' })
  }
  return items
})

const original = computed(() => {
  const v = props.video
  if (v.video_download_url) return v.video_download_url
  return /\.mp4(\?|$)/i.test(v.source_video_url || '') ? v.source_video_url : ''
})
const originalNote = computed(() => props.video.video_download_note || '原片暂不可下载')
</script>

<template>
  <div class="dl" :class="`dl--${size}`" role="group" aria-label="下载">
    <a
      v-for="g in gifs"
      :key="g.key"
      class="dl__btn"
      :href="g.href"
      :download="g.file"
      :title="g.title"
      rel="noopener"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 19h14" />
      </svg>
      {{ g.label }}
    </a>
    <a
      v-if="original"
      class="dl__btn dl__btn--primary"
      :href="original"
      :download="fileNameOf(original, 'original.mp4')"
      title="下载原片 mp4"
      rel="noopener"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 19h14" />
      </svg>
      下载原片
    </a>
    <span v-else class="dl__btn dl__btn--off" :title="originalNote">原片不可下载</span>
  </div>
</template>

<style scoped>
.dl {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dl__btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.dl__btn svg {
  width: 13px;
  height: 13px;
  flex: none;
}

.dl__btn:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.dl__btn--primary {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

.dl__btn--primary:hover {
  background: var(--accent-ink);
  border-color: var(--accent-ink);
  color: #fff;
}

.dl__btn--off {
  color: var(--muted-2);
  border-style: dashed;
  cursor: help;
}

.dl--detail .dl__btn {
  padding: 8px 14px;
  font-size: 13.5px;
}

.dl--detail .dl__btn svg {
  width: 15px;
  height: 15px;
}
</style>
