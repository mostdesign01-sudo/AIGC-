<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  upperUrl: string
  lowerUrl: string
  alt: string
  eager?: boolean
}>()

const upperFailed = ref(false)
const lowerFailed = ref(false)
</script>

<template>
  <div class="pair" role="group" :aria-label="`${alt} · 上下两段 2× GIF`">
    <figure class="frame">
      <img
        v-if="!upperFailed"
        :src="upperUrl"
        :alt="`${alt} 上半`"
        width="720"
        height="406"
        decoding="async"
        :loading="eager ? 'eager' : 'lazy'"
        @error="upperFailed = true"
      />
      <div v-else class="ph">GIF 待上传</div>
      <figcaption>上半 · 720×406 · 2×</figcaption>
    </figure>
    <figure class="frame">
      <img
        v-if="!lowerFailed"
        :src="lowerUrl"
        :alt="`${alt} 下半`"
        width="720"
        height="406"
        decoding="async"
        loading="lazy"
        @error="lowerFailed = true"
      />
      <div v-else class="ph">GIF 待上传</div>
      <figcaption>下半 · 720×406 · 2×</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.pair {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #111;
  border-radius: 4px;
  overflow: hidden;
}

.frame {
  margin: 0;
  position: relative;
  aspect-ratio: 720 / 406;
  background: #111;
}

.frame img,
.ph {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ph {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a867c;
  font-size: 13px;
  letter-spacing: 0.08em;
}

figcaption {
  position: absolute;
  left: 8px;
  bottom: 8px;
  margin: 0;
  padding: 2px 7px;
  background: rgba(0, 0, 0, 0.72);
  color: #f4f0e6;
  font-size: 11px;
  letter-spacing: 0.06em;
}
</style>
