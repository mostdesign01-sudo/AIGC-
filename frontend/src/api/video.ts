import axios from 'axios'

const API_BASE = 'http://localhost:8001/api/v1'

export interface Video {
  id: number
  platform: string
  video_id: string
  title: string
  url: string
  cover_url: string
  qiniu_cover_url: string
  play_count: number
  like_count: number
  author: string
  author_id: string
  tags: string
  ai_summary: string
  collected_at: string
  created_at: string
}

export interface CrawlerStatus {
  running: boolean
  last_run: string | null
  videos_collected: number
  current_platform: string | null
  supported_platforms: Record<string, string>
}

export interface VideoListResponse {
  total: number
  skip: number
  limit: number
  data: Video[]
}

export const getVideos = async (limit = 50): Promise<VideoListResponse> => {
  const res = await axios.get(`${API_BASE}/videos?limit=${limit}`)
  return res.data
}

export const getCrawlerStatus = async (): Promise<CrawlerStatus> => {
  const res = await axios.get(`${API_BASE}/crawlers/status`)
  return res.data
}

export const getPlatforms = async (): Promise<Record<string, string>> => {
  const res = await axios.get(`${API_BASE}/crawlers/platforms`)
  return res.data
}

export const runCrawler = async (platform: string = 'bilibili'): Promise<{ message: string; status: CrawlerStatus }> => {
  const res = await axios.post(`${API_BASE}/crawlers/run?platform=${platform}`)
  return res.data
}