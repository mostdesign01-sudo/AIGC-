<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Video } from '../types'
import { errorMessage, getBestOf } from '../api/client'

const emit = defineEmits<{ meta: [label: string] }>()
const videos = ref<Video[]>([])
const note = ref('')
const error = ref('')

onMounted(async () => {
  emit('meta', '双周最佳 · 热度发现')
  try {
    const res = await getBestOf(14, 12)
    videos.value = res.data
    note.value = res.note || ''
  } catch (err) {
    error.value = errorMessage(err)
  }
})

function formatPlay(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n || 0)
}
</script>

<template>
  <main class="best">
    <h1>双周最佳</h1>
    <p>过去 14 天按播放量取 12 条，用来发现高热，<strong>不是</strong>出报入选的 3 条。</p>
    <p class="note">{{ note }}</p>
    <p v-if="error" class="err">{{ error }}</p>
    <ol>
      <li v-for="(v, i) in videos" :key="v.id">
        <em>{{ i + 1 }}</em>
        <img v-if="v.display_cover" :src="v.display_cover" :alt="v.title" />
        <div>
          <b>{{ v.title }}</b>
          <small>{{ v.author }} · ▶ {{ formatPlay(v.play_count) }}</small>
        </div>
      </li>
    </ol>
  </main>
</template>

<style scoped>
.best { max-width: 800px; margin: 0 auto; padding: 28px 20px; }
h1 { margin: 0 0 8px; }
p { color: var(--muted); }
.note { font-size: 13px; }
.err { color: var(--warn); }
ol { list-style: none; padding: 0; }
li {
  display: grid;
  grid-template-columns: 28px 88px 1fr;
  gap: 12px;
  align-items: center;
  background: #fff;
  border: 1px solid var(--line);
  padding: 10px;
  margin-top: 8px;
}
em { font-style: normal; font-weight: 700; color: var(--aurora); }
img { width: 88px; height: 56px; object-fit: cover; }
small { display: block; color: var(--muted); }
</style>
