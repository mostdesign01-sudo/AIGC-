<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { IssueCoverage, Video } from '../types'
import { errorMessage, exportUrl, getCurrentIssue, gifDownloadUrl } from '../api/client'

const emit = defineEmits<{ meta: [label: string] }>()

const data = ref<IssueCoverage | null>(null)
const error = ref('')

const picks = computed(() => {
  const list = (data.value?.picks || []).slice().sort((a, b) => (a.selected_rank || 99) - (b.selected_rank || 99))
  return list
})

function mediaOf(item: Video): string {
  return item.gif_url || item.display_cover || ''
}

function headline(item: Video): string {
  const cat = item.category?.name || '未分类'
  return `${cat} | ${item.title}`
}

onMounted(async () => {
  try {
    data.value = await getCurrentIssue()
    emit('meta', `${data.value.issue.vol_label} · 出报预览`)
  } catch (err) {
    error.value = errorMessage(err)
  }
})
</script>

<template>
  <div class="preview" v-if="data">
    <aside class="export-bar">
      <p>导出给设计 / 文案</p>
      <a :href="exportUrl(data.issue.id, 'json')" target="_blank">JSON</a>
      <a :href="exportUrl(data.issue.id, 'markdown')" target="_blank">Markdown</a>
      <a :href="exportUrl(data.issue.id, 'zip')">图/GIF 打包</a>
      <p class="gap" v-if="!data.ready_for_brief">
        缺口：类型 {{ data.filled_count }}/{{ data.required_count }} · 入选 {{ data.selected_count }}/3
      </p>
    </aside>

    <article class="sheet">
      <header class="masthead">
        <p class="series">AIGC 创意双周报 · 创意灵感</p>
        <div class="vol-row">
          <h1>{{ data.issue.vol_label }}</h1>
          <time>{{ data.issue.end_date?.replaceAll('-', '.') }}</time>
        </div>
        <p class="summary">{{ data.issue.summary || '（综述还没写，回到工作台补一段近半月观察。）' }}</p>
        <div class="thumbs" v-if="picks.length">
          <img v-for="item in picks" :key="item.id" :src="mediaOf(item)" :alt="item.title" />
        </div>
      </header>

      <section class="cards">
        <figure v-for="item in picks" :key="item.id">
          <div class="frame">
            <img v-if="mediaOf(item)" :src="mediaOf(item)" :alt="item.title" />
            <div v-else class="ph"></div>
            <span class="play" aria-hidden="true"></span>
            <b v-if="item.duration_label">{{ item.duration_label }}</b>
          </div>
          <figcaption>
            <h2>{{ headline(item) }}</h2>
            <p>{{ item.brief_intro || '待写介绍：怎么做的 / 创意点 / 能用在哪。' }}</p>
            <a v-if="item.gif_status === 'ready'" :href="gifDownloadUrl(item.id)">下载 2x GIF</a>
          </figcaption>
        </figure>
        <p v-if="picks.length < 3" class="need">还没抽满 3 条，预览先留空位。</p>
      </section>
    </article>
    <p v-if="error" class="err">{{ error }}</p>
  </div>
</template>

<style scoped>
.preview {
  background: #eceae4;
  min-height: calc(100vh - 56px);
  padding: 28px 16px 80px;
}
.export-bar {
  max-width: 980px;
  margin: 0 auto 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 13px;
}
.export-bar a {
  padding: 6px 10px;
  background: #111;
  color: var(--aurora);
  text-decoration: none;
}
.gap, .err { color: var(--warn); }
.sheet {
  max-width: 980px;
  margin: 0 auto;
  background: #fff;
  padding: 36px 40px 48px;
  box-shadow: 0 10px 40px rgba(0,0,0,.06);
}
.series {
  letter-spacing: 0.22em;
  font-size: 12px;
  color: #7a7a7a;
  margin: 0 0 10px;
}
.vol-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
h1 {
  margin: 0;
  font-size: 64px;
  letter-spacing: 0.06em;
  color: #111;
}
time { font-size: 22px; color: #111; }
.summary {
  margin: 18px 0 20px;
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  max-width: 46em;
}
.thumbs { display: flex; gap: 8px; }
.thumbs img { width: 72px; height: 96px; object-fit: cover; background: #111; }
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-top: 36px;
}
figure { margin: 0; }
.frame {
  position: relative;
  background: #111;
  aspect-ratio: 3 / 4;
  overflow: hidden;
}
.frame img { width: 100%; height: 100%; object-fit: cover; }
.play {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 54px;
  height: 54px;
  margin: -27px 0 0 -27px;
  border-radius: 50%;
  background: rgba(255,255,255,.92);
}
.play::after {
  content: "";
  position: absolute;
  left: 21px;
  top: 17px;
  border-style: solid;
  border-width: 10px 0 10px 16px;
  border-color: transparent transparent transparent #111;
}
.frame b {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: rgba(0,0,0,.75);
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
}
figcaption h2 {
  font-size: 18px;
  margin: 14px 0 8px;
  line-height: 1.35;
}
figcaption p { margin: 0; color: #333; line-height: 1.7; font-size: 14px; }
figcaption a { display: inline-block; margin-top: 10px; color: #0a7; font-size: 12px; }
.need { grid-column: 1 / -1; color: var(--muted); }
@media (max-width: 800px) {
  .cards { grid-template-columns: 1fr; }
  h1 { font-size: 40px; }
  .sheet { padding: 20px; }
}
</style>
