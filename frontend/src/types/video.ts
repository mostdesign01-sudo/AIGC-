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
}