<script setup lang="ts">
import { releaseAssetUrl } from '../data/assets'
import type { ReleaseMedia, SourceLink } from '../data/types'

const props = defineProps<{
  media?: ReleaseMedia
  sources: SourceLink[]
  gifLabels?: [string, string]
}>()

function asset(name: string): string {
  return releaseAssetUrl(props.media!.releaseTag, name)
}
</script>

<template>
  <div class="bar">
    <template v-if="media?.video">
      <a class="btn primary" :href="asset(media.video)" :download="media.video">下载视频</a>
    </template>
    <template v-else>
      <span class="none">暂无成片下载</span>
    </template>

    <template v-if="media?.gifs?.length === 2">
      <a class="btn" :href="asset(media.gifs[0])" :download="media.gifs[0]">
        {{ gifLabels?.[0] ?? '下载上半 GIF' }}
      </a>
      <a class="btn" :href="asset(media.gifs[1])" :download="media.gifs[1]">
        {{ gifLabels?.[1] ?? '下载下半 GIF' }}
      </a>
    </template>
    <a
      v-else-if="media?.gifs?.length === 1"
      class="btn"
      :href="asset(media.gifs[0])"
      :download="media.gifs[0]"
    >
      下载 GIF
    </a>

    <a
      v-for="src in sources"
      :key="src.url"
      class="link"
      :href="src.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ src.label }}
    </a>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #161513;
  color: #f6f1e6;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

.btn.primary {
  background: #c8f042;
  color: #161513;
}

.none {
  font-size: 13px;
  color: #6f6a62;
}

.link {
  font-size: 13px;
  color: #161513;
  text-underline-offset: 3px;
}
</style>
