import { computed, reactive, readonly } from 'vue'
import bundled from './feed.json'
import type { CreativeVideo, Feed, WeekSummary, WeeklySlot } from './types'

/**
 * 数据来源：
 *  1. 构建时打包进来的 feed.json（scripts/build_feed.py 产出）——永远可用，Vercel 静态部署零依赖。
 *  2. 可选：VITE_API_BASE 指向 FastAPI 后端时，加载后用 /api/v1/creative/feed 覆盖，拿到实时数据。
 */
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, '') || ''

interface FeedState {
  feed: Feed
  source: 'bundled' | 'api'
  loading: boolean
  error: string | null
}

const state = reactive<FeedState>({
  feed: bundled as unknown as Feed,
  source: 'bundled',
  loading: false,
  error: null,
})

let refreshed = false

export async function refreshFromApi(force = false): Promise<void> {
  if (!API_BASE || (refreshed && !force)) return
  refreshed = true
  state.loading = true
  state.error = null
  try {
    const res = await fetch(`${API_BASE}/api/v1/creative/feed`, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as Feed
    if (Array.isArray(data.videos)) {
      state.feed = data
      state.source = 'api'
    }
  } catch (err) {
    state.error = err instanceof Error ? err.message : String(err)
  } finally {
    state.loading = false
  }
}

export function useFeed() {
  const feed = computed(() => state.feed)
  const videos = computed(() => state.feed.videos)
  const videosById = computed(() => new Map(state.feed.videos.map((v) => [v.id, v])))
  const categories = computed(() => state.feed.categories)
  const categoryName = (slug: string) => categories.value.find((c) => c.slug === slug)?.name ?? slug
  const slotLabel = (slot: WeeklySlot) => state.feed.slot_labels[slot]

  const days = computed(() => state.feed.days)
  const weeks = computed(() => state.feed.weeks)

  const videosOnDay = (date: string): CreativeVideo[] => videos.value.filter((v) => v.collected_date === date)
  const videosInWeek = (weekId: string): CreativeVideo[] => videos.value.filter((v) => v.week_id === weekId)
  const weekById = (weekId: string): WeekSummary | undefined => weeks.value.find((w) => w.week_id === weekId)

  /** 首页优先展示：有完整（至少一条）选择的最近一周；没有则退到当前周。 */
  const featuredWeek = computed<WeekSummary | undefined>(() => {
    const withPicks = weeks.value.find((w) => w.picks.some((p) => p.video_id && videosById.value.has(p.video_id)))
    return withPicks ?? weeks.value[0]
  })

  const videoById = (id: string) => videosById.value.get(id)

  return {
    state: readonly(state),
    feed,
    videos,
    categories,
    categoryName,
    slotLabel,
    days,
    weeks,
    videosOnDay,
    videosInWeek,
    weekById,
    featuredWeek,
    videoById,
    refreshFromApi,
    apiConfigured: Boolean(API_BASE),
  }
}
