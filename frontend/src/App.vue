<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Workbench from './views/Workbench.vue'
import Preview from './views/Preview.vue'
import Library from './views/Library.vue'
import BestOf from './views/BestOf.vue'

type Page = 'workbench' | 'preview' | 'library' | 'best'

const page = ref<Page>('workbench')
const issueLabel = ref('')

function onIssueMeta(label: string) {
  issueLabel.value = label
}

function goPreview() {
  page.value = 'preview'
}

onMounted(() => {
  document.title = 'AIGC创意双周报 · 工作台'
})
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="mark"></span>
        <div>
          <strong>AIGC创意双周报</strong>
          <em>创意灵感工作台</em>
        </div>
      </div>
      <nav>
        <button :class="{ on: page === 'workbench' }" @click="page = 'workbench'">当期工作台</button>
        <button :class="{ on: page === 'preview' }" @click="page = 'preview'">出报预览</button>
        <button :class="{ on: page === 'library' }" @click="page = 'library'">素材库</button>
        <button :class="{ on: page === 'best' }" @click="page = 'best'">双周最佳</button>
      </nav>
      <div class="meta">{{ issueLabel }}</div>
    </header>

    <Workbench v-if="page === 'workbench'" @meta="onIssueMeta" @preview="goPreview" />
    <Preview v-else-if="page === 'preview'" @meta="onIssueMeta" />
    <Library v-else-if="page === 'library'" @meta="onIssueMeta" />
    <BestOf v-else @meta="onIssueMeta" />
  </div>
</template>

<style scoped>
.shell { min-height: 100vh; }
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 28px;
  background: #0c0c0c;
  color: #fff;
}
.brand { display: flex; align-items: center; gap: 10px; min-width: 220px; }
.mark {
  width: 12px;
  height: 28px;
  background: var(--aurora);
}
.brand strong { display: block; font-size: 15px; letter-spacing: 0.04em; }
.brand em { display: block; font-style: normal; font-size: 12px; color: #9a9a9a; }
nav { display: flex; gap: 4px; flex: 1; }
nav button {
  border: 0;
  background: transparent;
  color: #bdbdbd;
  padding: 8px 14px;
  font-size: 14px;
}
nav button.on { color: #0c0c0c; background: var(--aurora); }
.meta { font-size: 13px; color: #8d8d8d; }
@media (max-width: 800px) {
  .topbar { flex-wrap: wrap; }
  .meta { width: 100%; }
}
</style>
