<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BriefItem from '../components/BriefItem.vue'
import CategoryCard from '../components/CategoryCard.vue'
import { releasePageUrl } from '../data/assets'
import {
  CURRENT_VOL,
  getIssue,
  issueDateLabel,
  issueWindowLabel,
  listIssues,
  validateIssue,
} from '../data/issues'

const volFromUrl = () => new URLSearchParams(window.location.search).get('vol')

const issue = ref(getIssue(volFromUrl()))
const issues = listIssues()
const problems = computed(() => validateIssue(issue.value))

function openVol(vol: number) {
  const url = new URL(window.location.href)
  if (vol === CURRENT_VOL) url.searchParams.delete('vol')
  else url.searchParams.set('vol', String(vol))
  window.history.replaceState({}, '', url)
  issue.value = getIssue(vol)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  issue,
  (current) => {
    document.title = `${current.volLabel} · ${current.series}`
  },
  { immediate: true },
)
</script>

<template>
  <div class="page">
    <header class="top">
      <p class="brand">{{ issue.series }}</p>
      <nav class="vols" aria-label="期号">
        <button
          v-for="item in issues"
          :key="item.vol"
          type="button"
          :class="{ on: item.vol === issue.vol }"
          @click="openVol(item.vol)"
        >
          {{ item.volLabel }}
          <em v-if="item.vol === CURRENT_VOL">当期</em>
        </button>
      </nav>
    </header>

    <main>
      <section class="mast">
        <p class="series">AIGC 创意双周报 · 创意灵感</p>
        <div class="vol-row">
          <h1>{{ issue.volLabel }}</h1>
          <p class="when">
            <time :datetime="issue.publishedOn">{{ issueDateLabel(issue) }}</time>
            <span>收录窗口 {{ issueWindowLabel(issue) }}</span>
            <span>{{ issue.timezone }}</span>
          </p>
        </div>
        <p class="summary">{{ issue.summary }}</p>
      </section>

      <section id="brief" class="brief">
        <header class="sec">
          <h2>创意简报</h2>
          <p>入选 {{ issue.brief.length }} 条。横版各叠两张 2× GIF（上/下，720×406），可直接拖进简报。</p>
        </header>
        <BriefItem
          v-for="(pick, i) in issue.brief"
          :key="pick.id"
          :pick="pick"
          :index="i + 1"
          :eager="i === 0"
        />
      </section>

      <section id="cats" class="cats">
        <header class="sec">
          <h2>九类覆盖</h2>
          <p>先看灵感，再点源或下载。没有成片的条目保留源链接。</p>
        </header>
        <div class="grid">
          <CategoryCard v-for="coverage in issue.slots" :key="coverage.slug" :coverage="coverage" />
        </div>
      </section>
    </main>

    <footer class="foot">
      <p>
        成片与 GIF 放在 GitHub Releases
        <a :href="releasePageUrl(issue.brief[0]?.media.releaseTag ?? `vol${issue.vol}-gifs`)" target="_blank" rel="noopener noreferrer">
          {{ issue.brief[0]?.media.releaseTag ?? `vol${issue.vol}-gifs` }}
        </a>
        。横版命名 <code>*-a.gif</code> / <code>*-b.gif</code>，竖版一张。
      </p>
      <p v-if="problems.length" class="warn">{{ problems.join('；') }}</p>
    </footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
}

.top {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(239, 232, 220, 0.94);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #1a1612;
}

.brand {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.vols {
  display: flex;
  gap: 6px;
}

.vols button {
  border: 1px solid #1a1612;
  background: transparent;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
}

.vols button.on {
  background: #1a1612;
  color: #f6f1e6;
}

.vols em {
  font-style: normal;
  margin-left: 4px;
  color: #c8f042;
}

main {
  max-width: 920px;
  margin: 0 auto;
  padding: 28px 16px 48px;
}

.series {
  margin: 0 0 8px;
  letter-spacing: 0.22em;
  font-size: 12px;
  color: #6f6a62;
}

.vol-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

h1 {
  margin: 0;
  font-family: var(--display);
  font-size: clamp(56px, 16vw, 96px);
  line-height: 0.9;
  letter-spacing: 0.02em;
}

.when {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  text-align: right;
}

.summary {
  margin: 22px 0 8px;
  font-size: 16px;
  line-height: 1.85;
  max-width: 40em;
}

.sec {
  padding: 8px 0 4px;
}

.sec h2 {
  margin: 0 0 6px;
  font-family: var(--display);
  font-size: 28px;
}

.sec p {
  margin: 0;
  color: #6f6a62;
  font-size: 13px;
}

.brief {
  margin-top: 36px;
}

.cats {
  margin-top: 40px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 16px;
}

.foot {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 16px 48px;
  font-size: 13px;
  color: #6f6a62;
}

.foot a {
  color: #161513;
}

.warn {
  color: #c41230;
}

@media (min-width: 720px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 980px) {
  .grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .top {
    flex-direction: column;
    align-items: flex-start;
  }

  .when {
    text-align: left;
  }
}
</style>
