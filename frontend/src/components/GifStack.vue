<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CreativeVideo } from '../data/types'

/**
 * 关键 GIF 展示：
 *  - 横版：a 在上、b 在下，两张 720×406、2× 速度
 *  - 竖版：一张 360×640、2× 速度
 * card 模式下竖版放进与横版等高的深色画框（object-fit: contain），保证网格卡片高度一致。
 */
const props = withDefaults(
  defineProps<{
    video: CreativeVideo
    mode?: 'card' | 'detail'
    eager?: boolean
    showCaptions?: boolean
  }>(),
  { mode: 'card', eager: false, showCaptions: true },
)

const failedA = ref(false)
const failedB = ref(false)
watch(
  () => [props.video.gif_a_url, props.video.gif_b_url],
  () => {
    failedA.value = false
    failedB.value = false
  },
)

const isVertical = computed(() => props.video.orientation === 'vertical')
const loading = computed(() => (props.eager ? 'eager' : 'lazy'))
const alt = computed(() => props.video.title)
</script>

<template>
  <div
    v-if="!isVertical"
    class="stack stack--landscape"
    :class="[`stack--${mode}`]"
    role="group"
    :aria-label="`${alt} · 上下两段 2× GIF`"
  >
    <figure class="frame frame--wide">
      <img
        v-if="video.gif_a_url && !failedA"
        :src="video.gif_a_url"
        :alt="`${alt} · 上段`"
        width="720"
        height="406"
        decoding="async"
        :loading="loading"
        @error="failedA = true"
      />
      <div v-else class="ph">GIF 待上传</div>
      <figcaption v-if="showCaptions">上段 · 2×</figcaption>
    </figure>
    <figure class="frame frame--wide">
      <img
        v-if="video.gif_b_url && !failedB"
        :src="video.gif_b_url"
        :alt="`${alt} · 下段`"
        width="720"
        height="406"
        decoding="async"
        loading="lazy"
        @error="failedB = true"
      />
      <div v-else class="ph">GIF 待上传</div>
      <figcaption v-if="showCaptions">下段 · 2×</figcaption>
    </figure>
  </div>

  <div
    v-else
    class="stack stack--vertical"
    :class="[`stack--${mode}`]"
    role="group"
    :aria-label="`${alt} · 竖版 2× GIF`"
  >
    <figure class="frame frame--tall">
      <img
        v-if="video.gif_a_url && !failedA"
        class="backdrop"
        :src="video.gif_a_url"
        alt=""
        aria-hidden="true"
        decoding="async"
        :loading="loading"
      />
      <img
        v-if="video.gif_a_url && !failedA"
        class="portrait"
        :src="video.gif_a_url"
        :alt="alt"
        width="360"
        height="640"
        decoding="async"
        :loading="loading"
        @error="failedA = true"
      />
      <div v-else class="ph">GIF 待上传</div>
      <figcaption v-if="showCaptions">竖版 9:16 · 2×</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #0f1012;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.frame {
  margin: 0;
  position: relative;
  background: #0f1012;
  overflow: hidden;
}

.frame--wide {
  aspect-ratio: 720 / 406;
}

/* 与横版两段叠起来（720×812）等比，卡片高度一致 */
.stack--card .frame--tall {
  aspect-ratio: 720 / 812;
}

.stack--detail .frame--tall {
  aspect-ratio: 9 / 16;
  max-height: 78vh;
}

.frame img,
.ph {
  width: 100%;
  height: 100%;
  display: block;
}

.frame--wide img {
  object-fit: cover;
}

.frame--tall .backdrop {
  position: absolute;
  inset: -10%;
  width: 120%;
  height: 120%;
  object-fit: cover;
  filter: blur(28px) saturate(140%) brightness(0.55);
  transform: scale(1.1);
}

.frame--tall .portrait {
  position: relative;
  object-fit: contain;
  z-index: 1;
}

.stack--detail .frame--tall .portrait {
  object-fit: contain;
}

.ph {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a8d94;
  font-size: 13px;
  letter-spacing: 0.08em;
  background: repeating-linear-gradient(135deg, #15171a 0 12px, #101215 12px 24px);
}

figcaption {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 2;
  margin: 0;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.62);
  color: #f4f4f2;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  backdrop-filter: blur(4px);
}
</style>
