<script setup lang="ts">
import { computed } from 'vue'
import { releaseAssetUrl } from '../data/assets'
import { categoryName } from '../data/categories'
import type { BriefPick } from '../data/types'
import DownloadBar from './DownloadBar.vue'
import GifPair from './GifPair.vue'

const props = defineProps<{ pick: BriefPick; index: number; eager?: boolean }>()

const gifs = computed(() => {
  const tag = props.pick.media.releaseTag
  const names = props.pick.media.gifs ?? []
  return names.map((name) => releaseAssetUrl(tag, name))
})
</script>

<template>
  <article class="pick">
    <header>
      <p class="kicker">
        <span>0{{ index }}</span>
        {{ categoryName(pick.category) }}
      </p>
      <h3>{{ pick.title }}</h3>
      <p class="why">{{ pick.why }}</p>
      <p class="credit">{{ pick.credit }}</p>
    </header>

    <GifPair
      v-if="pick.orientation === 'landscape' && gifs.length === 2"
      :upper-url="gifs[0]"
      :lower-url="gifs[1]"
      :alt="pick.title"
      :eager="eager"
    />
    <figure v-else-if="gifs.length === 1" class="single">
      <img :src="gifs[0]" :alt="pick.title" width="720" height="406" />
    </figure>

    <DownloadBar :media="pick.media" :sources="pick.sources" />
  </article>
</template>

<style scoped>
.pick {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 0 28px;
  border-top: 1px solid #1a1612;
}

.kicker {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6f6a62;
}

.kicker span {
  color: #c41230;
  margin-right: 8px;
  letter-spacing: 0.04em;
}

h3 {
  margin: 0 0 8px;
  font-family: var(--display);
  font-size: clamp(26px, 6vw, 36px);
  line-height: 1.2;
  font-weight: 700;
}

.why {
  margin: 0 0 6px;
  font-size: 16px;
  line-height: 1.7;
  max-width: 36em;
}

.credit {
  margin: 0 0 4px;
  font-size: 13px;
  color: #6f6a62;
  line-height: 1.6;
}

.single {
  margin: 0;
  aspect-ratio: 720 / 406;
  background: #111;
  overflow: hidden;
}

.single img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
