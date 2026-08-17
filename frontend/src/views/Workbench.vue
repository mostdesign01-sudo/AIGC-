<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Category, IssueCoverage, Video } from '../types'
import {
  createCategory,
  errorMessage,
  generateGif,
  getCategories,
  getCrawlerStatus,
  getCurrentIssue,
  gifDownloadUrl,
  ingestLink,
  patchVideo,
  runCrawler,
  selectItem,
  unselectItem,
  updateCategory,
  updateIssue,
  uploadMedia,
} from '../api/client'

const emit = defineEmits<{
  meta: [label: string]
  preview: []
}>()

const loading = ref(false)
const error = ref('')
const data = ref<IssueCoverage | null>(null)
const categories = ref<Category[]>([])
const activeSlug = ref('')
const weekFilter = ref<0 | 1 | 2>(0)
const editing = ref<Video | null>(null)
const draftIntro = ref('')
const draftTitle = ref('')
const showCollect = ref(false)
const collectTab = ref<'link' | 'upload'>('link')
const linkForm = ref({ url: '', title: '', intro: '', cover_url: '', item_kind: 'video', category_id: 0 })
const uploadForm = ref({ title: '', intro: '', item_kind: 'video', category_id: 0 })
const uploadFile = ref<File | null>(null)
const showTypes = ref(false)
const newTypeName = ref('')
const crawlerPlatform = ref('bilibili')
const crawlerRunning = ref(false)
const platforms = ref<Record<string, string>>({})
const busyId = ref<number | null>(null)

const issue = computed(() => data.value?.issue)
const slots = computed(() => data.value?.slots || [])
const activeSlot = computed(() => slots.value.find((s) => s.category.slug === activeSlug.value) || slots.value[0])
const uncategorized = computed(() => data.value?.uncategorized || [])

const visibleItems = computed(() => {
  const items = activeSlot.value?.items || []
  if (!weekFilter.value || !issue.value) return items
  return items.filter((v) => itemWeek(v) === weekFilter.value)
})

function itemWeek(video: Video): 1 | 2 {
  if (!issue.value?.start_date || !video.collected_at) return 1
  const start = new Date(issue.value.start_date)
  const day = new Date(video.collected_at)
  const diff = Math.floor((day.getTime() - start.getTime()) / 86400000)
  return diff < 7 ? 1 : 2
}

function coverOf(video: Video): string {
  return video.display_cover || video.gif_url || ''
}

async function reload() {
  loading.value = true
  error.value = ''
  try {
    const [cov, cats, status] = await Promise.all([
      getCurrentIssue(),
      getCategories(),
      getCrawlerStatus().catch(() => null),
    ])
    data.value = cov
    categories.value = cats
    if (status) {
      crawlerRunning.value = status.running
      platforms.value = status.supported_platforms || {}
    }
    if (!activeSlug.value && cov.slots[0]) activeSlug.value = cov.slots[0].category.slug
    emit('meta', `${cov.issue.vol_label} · ${cov.issue.date_label}`)
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

async function saveSummary() {
  if (!issue.value) return
  data.value = await updateIssue(issue.value.id, { summary: issue.value.summary })
}

function openEdit(video: Video) {
  editing.value = video
  draftTitle.value = video.title
  draftIntro.value = video.intro || video.ai_summary || ''
}

async function saveEdit() {
  if (!editing.value) return
  await patchVideo(editing.value.id, { title: draftTitle.value, intro: draftIntro.value })
  editing.value = null
  await reload()
}

async function changeCategory(video: Video, categoryId: number) {
  await patchVideo(video.id, { category_id: categoryId })
  await reload()
}

async function toggleSelect(video: Video) {
  if (!issue.value) return
  busyId.value = video.id
  try {
    if (video.selected) await unselectItem(issue.value.id, video.id)
    else await selectItem(issue.value.id, video.id)
    await reload()
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    busyId.value = null
  }
}

async function makeGif(video: Video) {
  busyId.value = video.id
  try {
    await generateGif(video.id)
    await reload()
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    busyId.value = null
  }
}

async function submitLink() {
  try {
    await ingestLink({
      ...linkForm.value,
      category_id: linkForm.value.category_id || undefined,
    })
    showCollect.value = false
    await reload()
  } catch (err) {
    error.value = errorMessage(err)
  }
}

async function submitUpload() {
  if (!uploadFile.value) {
    error.value = '请选择文件'
    return
  }
  const form = new FormData()
  form.append('file', uploadFile.value)
  form.append('title', uploadForm.value.title)
  form.append('intro', uploadForm.value.intro)
  form.append('item_kind', uploadForm.value.item_kind)
  if (uploadForm.value.category_id) form.append('category_id', String(uploadForm.value.category_id))
  try {
    await uploadMedia(form)
    showCollect.value = false
    await reload()
  } catch (err) {
    error.value = errorMessage(err)
  }
}

async function triggerCrawl() {
  try {
    await runCrawler(crawlerPlatform.value)
    crawlerRunning.value = true
  } catch (err) {
    error.value = errorMessage(err)
  }
}

async function addType() {
  if (!newTypeName.value.trim()) return
  await createCategory({ name: newTypeName.value.trim() })
  newTypeName.value = ''
  await reload()
}

async function toggleType(cat: Category) {
  await updateCategory(cat.id, { name: cat.name, is_active: !cat.is_active, slug: cat.slug })
  await reload()
}

onMounted(reload)
</script>

<template>
  <main class="page" v-if="data && issue">
    <section class="hero">
      <div>
        <p class="kicker">AIGC 创意双周报 · 创意灵感</p>
        <h1>{{ issue.vol_label }}</h1>
        <p class="dates">{{ issue.date_label }}</p>
      </div>
      <div class="gaps" :class="{ ready: data.ready_for_brief }">
        <div>
          <b>{{ data.filled_count }}/{{ data.required_count }}</b>
          <span>类型覆盖</span>
        </div>
        <div>
          <b>{{ data.selected_count }}/{{ data.selected_needed }}</b>
          <span>入选简报</span>
        </div>
        <p v-if="data.ready_for_brief">可以出报</p>
        <p v-else>
          还差 {{ data.category_gap }} 类
          <template v-if="data.selected_gap"> · 入选还差 {{ data.selected_gap }} 条</template>
        </p>
      </div>
    </section>

    <p v-if="error" class="banner">{{ error }}</p>

    <section class="summary-box">
      <label>本期综述</label>
      <textarea v-model="issue.summary" rows="3" placeholder="写一段近半月的观察，会出现在出报预览顶部。" />
      <button class="ghost" @click="saveSummary">保存综述</button>
    </section>

    <section class="toolbar">
      <button class="primary" @click="showCollect = true">收录素材</button>
      <div class="crawl">
        <select v-model="crawlerPlatform">
          <option v-for="(name, key) in platforms" :key="key" :value="key">{{ name }}</option>
        </select>
        <button @click="triggerCrawl" :disabled="crawlerRunning">
          {{ crawlerRunning ? '抓取中…' : '抓取到当期' }}
        </button>
      </div>
      <div class="weeks">
        <button :class="{ on: weekFilter === 0 }" @click="weekFilter = 0">双周全部</button>
        <button :class="{ on: weekFilter === 1 }" @click="weekFilter = 1">第 1 周</button>
        <button :class="{ on: weekFilter === 2 }" @click="weekFilter = 2">第 2 周</button>
      </div>
      <button class="ghost" @click="showTypes = true">管理类型</button>
      <button class="ghost" @click="emit('preview')">看出报预览</button>
    </section>

    <section class="slots">
      <button
        v-for="slot in slots"
        :key="slot.category.id"
        :class="['slot', { on: activeSlot?.category.id === slot.category.id, empty: !slot.filled, picked: slot.has_selected }]"
        @click="activeSlug = slot.category.slug"
      >
        <em>{{ slot.filled ? slot.item_count : '空' }}</em>
        <strong>{{ slot.category.name }}</strong>
        <span v-if="slot.has_selected">已入选</span>
        <span v-else-if="!slot.filled">待收</span>
      </button>
    </section>

    <section v-if="uncategorized.length" class="inbox">
      <h3>未分类（抓取/旧素材）</h3>
      <div class="row" v-for="item in uncategorized" :key="item.id">
        <img v-if="coverOf(item)" :src="coverOf(item)" alt="" />
        <div>
          <b>{{ item.title }}</b>
          <small>{{ item.source_label }}</small>
        </div>
        <select @change="changeCategory(item, Number(($event.target as HTMLSelectElement).value))">
          <option value="">分到类型</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </section>

    <section class="list" v-if="activeSlot">
      <header>
        <h2>{{ activeSlot.category.name }}</h2>
        <p>{{ activeSlot.item_count }} 条 · {{ weekFilter ? `第 ${weekFilter} 周` : '双周' }}</p>
      </header>
      <article v-for="item in visibleItems" :key="item.id" :class="{ selected: item.selected }">
        <div class="thumb">
          <img v-if="coverOf(item)" :src="coverOf(item)" :alt="item.title" />
          <div v-else class="ph">无封面</div>
          <i v-if="item.duration_label">{{ item.duration_label }}</i>
        </div>
        <div class="body">
          <h3>{{ item.category?.name || '未分类' }} | {{ item.title }}</h3>
          <p>{{ item.brief_intro || '还没有介绍，点编辑补上「怎么做 / 创意点 / 能用在哪」。' }}</p>
          <p class="meta">
            {{ item.source_label }}
            <a v-if="item.url" :href="item.url" target="_blank" rel="noreferrer">原链</a>
            <span v-if="item.ai_summary && item.intro">AI 摘要已保留</span>
          </p>
        </div>
        <div class="acts">
          <button :disabled="busyId === item.id" @click="toggleSelect(item)">
            {{ item.selected ? `取消入选 #${item.selected_rank}` : '入选简报' }}
          </button>
          <button @click="openEdit(item)">编辑文案</button>
          <button v-if="item.local_media_path" :disabled="busyId === item.id" @click="makeGif(item)">
            {{ item.gif_status === 'ready' ? '重出 GIF' : '生成 2x GIF' }}
          </button>
          <a v-if="item.gif_status === 'ready'" :href="gifDownloadUrl(item.id)">下载 GIF</a>
        </div>
      </article>
      <p v-if="!visibleItems.length" class="empty">这一类还是空的，先收录一条。</p>
    </section>
  </main>
  <p v-else-if="loading" class="empty">加载当期…</p>
  <p v-else class="empty">{{ error || '无法加载当期' }}</p>

  <div v-if="editing" class="mask" @click.self="editing = null">
    <div class="modal">
      <h3>编辑介绍</h3>
      <input v-model="draftTitle" />
      <textarea v-model="draftIntro" rows="6" placeholder="讲清怎么做的 / 创意点 / 能用在哪" />
      <p v-if="editing.ai_summary" class="hint">AI 摘要：{{ editing.ai_summary }}</p>
      <div class="row-end">
        <button @click="editing = null">取消</button>
        <button class="primary" @click="saveEdit">保存</button>
      </div>
    </div>
  </div>

  <div v-if="showCollect" class="mask" @click.self="showCollect = false">
    <div class="modal">
      <h3>收录到当期</h3>
      <div class="tabs">
        <button :class="{ on: collectTab === 'link' }" @click="collectTab = 'link'">粘贴外链</button>
        <button :class="{ on: collectTab === 'upload' }" @click="collectTab = 'upload'">上传视频/图</button>
      </div>
      <template v-if="collectTab === 'link'">
        <input v-model="linkForm.url" placeholder="https://" />
        <input v-model="linkForm.title" placeholder="标题" />
        <input v-model="linkForm.cover_url" placeholder="封面图 URL（可选）" />
        <textarea v-model="linkForm.intro" rows="4" placeholder="介绍" />
        <select v-model.number="linkForm.category_id">
          <option :value="0">选择类型</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="linkForm.item_kind">
          <option value="video">视频</option>
          <option value="tool">AI创意工具</option>
          <option value="model">AI创意模型</option>
        </select>
        <button class="primary" @click="submitLink">收入当期</button>
      </template>
      <template v-else>
        <input type="file" accept="video/*,image/*" @change="uploadFile = ($event.target as HTMLInputElement).files?.[0] || null" />
        <input v-model="uploadForm.title" placeholder="标题" />
        <textarea v-model="uploadForm.intro" rows="4" placeholder="介绍" />
        <select v-model.number="uploadForm.category_id">
          <option :value="0">选择类型</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <button class="primary" @click="submitUpload">上传并收入</button>
      </template>
    </div>
  </div>

  <div v-if="showTypes" class="mask" @click.self="showTypes = false">
    <div class="modal">
      <h3>类型配置</h3>
      <p class="hint">默认 9 类可改名、停用，也可加新类。不要写死在代码里。</p>
      <div class="row" v-for="c in categories" :key="c.id">
        <b>{{ c.name }}</b>
        <small>{{ c.slug }}</small>
        <button @click="toggleType(c)">{{ c.is_active ? '停用' : '启用' }}</button>
      </div>
      <input v-model="newTypeName" placeholder="新类型名称" />
      <button class="primary" @click="addType">添加类型</button>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 1180px; margin: 0 auto; padding: 28px 20px 80px; }
.hero { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; margin-bottom: 24px; }
.kicker { letter-spacing: 0.18em; font-size: 12px; color: var(--muted); margin: 0 0 8px; }
h1 { font-size: 56px; margin: 0; letter-spacing: 0.04em; }
.dates { margin: 8px 0 0; color: var(--muted); }
.gaps {
  min-width: 240px;
  background: #fff;
  border: 1px solid var(--line);
  padding: 16px 18px;
}
.gaps.ready { border-color: var(--aurora); box-shadow: 0 0 0 3px var(--aurora-dim); }
.gaps div { display: flex; justify-content: space-between; margin-bottom: 6px; }
.gaps b { font-size: 22px; }
.gaps p { margin: 10px 0 0; color: var(--warn); }
.gaps.ready p { color: var(--ok); }
.banner { background: #fff3e8; color: var(--warn); padding: 10px 14px; }
.summary-box, .toolbar, .slots, .list, .inbox { margin-top: 22px; }
.summary-box { display: grid; gap: 8px; }
textarea, input, select {
  width: 100%;
  border: 1px solid var(--line);
  background: #fff;
  padding: 10px 12px;
  font-size: 14px;
}
.toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.primary, .ghost, .toolbar button, .acts button, .modal button {
  border: 1px solid var(--ink);
  background: #fff;
  padding: 8px 14px;
}
.primary { background: var(--aurora); border-color: var(--aurora); color: #111; }
.weeks button.on, .tabs button.on { background: #111; color: #fff; }
.slots { display: grid; grid-template-columns: repeat(9, minmax(0, 1fr)); gap: 8px; }
.slot {
  border: 1px solid var(--line);
  background: #fff;
  padding: 10px 8px;
  text-align: left;
  min-height: 92px;
}
.slot.empty { background: #fff8f2; border-style: dashed; }
.slot.picked { outline: 2px solid var(--aurora); }
.slot.on { background: #111; color: #fff; }
.slot em { display: block; font-size: 18px; font-style: normal; }
.slot strong { display: block; font-size: 12px; margin: 6px 0 4px; }
.slot span { font-size: 11px; color: var(--muted); }
.slot.on span { color: var(--aurora); }
.list article, .inbox .row {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 16px;
  background: #fff;
  border: 1px solid var(--line);
  padding: 12px;
  margin-top: 10px;
}
.list article.selected { border-color: var(--aurora); }
.thumb { position: relative; background: #111; min-height: 160px; }
.thumb img { width: 100%; height: 160px; object-fit: cover; }
.thumb i {
  position: absolute; right: 6px; bottom: 6px;
  background: #000; color: #fff; font-size: 11px; font-style: normal; padding: 2px 6px;
}
.ph { color: #888; display: grid; place-items: center; height: 160px; }
.body h3 { margin: 0 0 8px; font-size: 16px; }
.body p { margin: 0 0 8px; color: #333; line-height: 1.6; }
.meta { font-size: 12px; color: var(--muted); display: flex; gap: 10px; }
.acts { display: flex; flex-direction: column; gap: 8px; min-width: 120px; }
.inbox img { width: 64px; height: 64px; object-fit: cover; }
.empty { text-align: center; color: var(--muted); padding: 40px; }
.mask {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: grid; place-items: center; z-index: 30;
}
.modal { width: min(560px, 92vw); background: #fff; padding: 20px; display: grid; gap: 10px; }
.hint { color: var(--muted); font-size: 12px; }
.row-end, .tabs { display: flex; gap: 8px; }
@media (max-width: 900px) {
  .slots { grid-template-columns: repeat(3, 1fr); }
  .list article { grid-template-columns: 1fr; }
  h1 { font-size: 40px; }
}
</style>
