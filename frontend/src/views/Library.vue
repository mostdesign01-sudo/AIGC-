<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Video } from '../types'
import { assignCurrent, errorMessage, getVideos } from '../api/client'

const emit = defineEmits<{ meta: [label: string] }>()
const videos = ref<Video[]>([])
const error = ref('')

onMounted(async () => {
  emit('meta', '素材库')
  try {
    const res = await getVideos({ limit: 200 })
    videos.value = res.data
  } catch (err) {
    error.value = errorMessage(err)
  }
})

async function take(video: Video) {
  try {
    await assignCurrent(video.id)
    video.issue_id = video.issue_id || 0
    const res = await getVideos({ limit: 200 })
    videos.value = res.data
  } catch (err) {
    error.value = errorMessage(err)
  }
}
</script>

<template>
  <main class="lib">
    <h1>素材库</h1>
    <p>抓取、手传、外链都会进这里。未挂期号的可以收入当期。</p>
    <p v-if="error" class="err">{{ error }}</p>
    <ul>
      <li v-for="v in videos" :key="v.id">
        <img v-if="v.display_cover" :src="v.display_cover" :alt="v.title" />
        <div>
          <b>{{ v.title }}</b>
          <small>{{ v.source_label }} · {{ v.category?.name || '未分类' }}</small>
        </div>
        <button v-if="!v.issue_id" @click="take(v)">收入当期</button>
        <span v-else>已在当期</span>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.lib { max-width: 860px; margin: 0 auto; padding: 28px 20px; }
h1 { margin: 0 0 8px; }
p { color: var(--muted); }
.err { color: var(--warn); }
ul { list-style: none; padding: 0; }
li {
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 12px;
  align-items: center;
  background: #fff;
  border: 1px solid var(--line);
  padding: 10px;
  margin-top: 8px;
}
img { width: 72px; height: 72px; object-fit: cover; }
small { display: block; color: var(--muted); }
button { border: 1px solid #111; background: #fff; padding: 6px 10px; }
</style>
