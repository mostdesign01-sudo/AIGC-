import axios from 'axios'
import type {
  Category,
  CrawlerStatus,
  IssueCoverage,
  Video,
  VideoListResponse,
} from '../types'

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
})

export async function getCurrentIssue(): Promise<IssueCoverage> {
  const res = await api.post('/issues/current')
  return res.data
}

export async function getIssue(id: number): Promise<IssueCoverage> {
  const res = await api.get(`/issues/${id}`)
  return res.data
}

export async function listIssues(): Promise<{ data: IssueCoverage['issue'][] }> {
  const res = await api.get('/issues')
  return res.data
}

export async function updateIssue(
  id: number,
  payload: { summary?: string; title?: string; status?: string },
): Promise<IssueCoverage> {
  const res = await api.patch(`/issues/${id}`, payload)
  return res.data
}

export async function getPreview(id: number): Promise<IssueCoverage> {
  const res = await api.get(`/issues/${id}/preview`)
  return res.data
}

export async function getCategories(): Promise<Category[]> {
  const res = await api.get('/categories')
  return res.data.data
}

export async function createCategory(payload: {
  name: string
  slug?: string
  item_kind_hint?: string
}): Promise<Category> {
  const res = await api.post('/categories', payload)
  return res.data
}

export async function updateCategory(
  id: number,
  payload: { name: string; slug?: string; sort_order?: number; is_active?: boolean; item_kind_hint?: string },
): Promise<Category> {
  const res = await api.put(`/categories/${id}`, payload)
  return res.data
}

export async function getVideos(params: {
  limit?: number
  skip?: number
  issue_id?: number
  category_id?: number
  platform?: string
  selected?: boolean
} = {}): Promise<VideoListResponse> {
  const res = await api.get('/videos', { params: { limit: 100, ...params } })
  return res.data
}

export async function getBestOf(days = 14, limit = 12): Promise<VideoListResponse> {
  const res = await api.get('/videos/best', { params: { days, limit } })
  return res.data
}

export async function patchVideo(id: number, payload: Partial<Video> & { category_id?: number | null }): Promise<Video> {
  const res = await api.patch(`/videos/${id}`, payload)
  return res.data
}

export async function assignCurrent(id: number): Promise<Video> {
  const res = await api.post(`/videos/${id}/assign-current`)
  return res.data
}

export async function selectItem(issueId: number, videoId: number): Promise<Video> {
  const res = await api.post(`/issues/${issueId}/items/${videoId}/select`)
  return res.data
}

export async function unselectItem(issueId: number, videoId: number): Promise<Video> {
  const res = await api.post(`/issues/${issueId}/items/${videoId}/unselect`)
  return res.data
}

export async function ingestLink(payload: {
  url: string
  title: string
  intro?: string
  category_id?: number
  cover_url?: string
  item_kind?: string
  duration_seconds?: number
}): Promise<Video> {
  const res = await api.post('/videos/from-link', payload)
  return res.data
}

export async function uploadMedia(form: FormData): Promise<Video> {
  const res = await api.post('/videos/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function generateGif(id: number): Promise<Video> {
  const res = await api.post(`/videos/${id}/gif`)
  return res.data
}

export function gifDownloadUrl(id: number): string {
  return `${API_BASE}/videos/${id}/gif`
}

export function exportUrl(issueId: number, format: 'json' | 'markdown' | 'zip'): string {
  return `${API_BASE}/issues/${issueId}/export?format=${format}`
}

export async function getCrawlerStatus(): Promise<CrawlerStatus> {
  const res = await api.get('/crawlers/status')
  return res.data
}

export async function runCrawler(platform = 'bilibili'): Promise<{ message: string }> {
  const res = await api.post(`/crawlers/run?platform=${platform}`)
  return res.data
}

export function errorMessage(err: unknown): string {
  const anyErr = err as { response?: { data?: { detail?: unknown } }; message?: string }
  const detail = anyErr.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d))).join('；')
  }
  return anyErr.message || '请求失败'
}
