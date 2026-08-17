export interface Category {
  id: number
  slug: string
  name: string
  sort_order: number
  is_active: boolean
  item_kind_hint: string
}

export interface Issue {
  id: number
  vol_number: number
  vol_label: string
  title: string
  start_date: string
  end_date: string
  date_label: string
  summary: string
  status: string
}

export interface Video {
  id: number
  platform: string
  source: string
  source_label: string
  video_id: string
  title: string
  description?: string
  url: string
  cover_url?: string
  qiniu_cover_url?: string
  display_cover?: string | null
  play_count: number
  like_count: number
  author?: string
  tags?: string
  ai_summary?: string
  intro: string
  brief_intro: string
  duration_seconds: number
  duration_label: string
  media_type: string
  item_kind: string
  media_url?: string | null
  gif_url?: string | null
  gif_status: string
  gif_error?: string | null
  selected: boolean
  selected_rank?: number | null
  orientation: string
  category_id?: number | null
  category?: Category | null
  issue_id?: number | null
  collected_at: string
  created_at: string
  local_media_path?: string | null
}

export interface CoverageSlot {
  category: Category
  filled: boolean
  item_count: number
  has_selected: boolean
  items: Video[]
}

export interface IssueCoverage {
  issue: Issue
  required_count: number
  filled_count: number
  missing_categories: Category[]
  selected_count: number
  selected_needed: number
  selected_gap: number
  category_gap: number
  ready_for_brief: boolean
  slots: CoverageSlot[]
  uncategorized: Video[]
  picks: Video[]
  export?: {
    vol: number
    vol_label: string
    title: string
    dates: string
    summary: string
    picks: Array<{
      rank: number
      category: string
      title: string
      headline: string
      intro: string
      cover?: string
      gif_url?: string
      duration?: string
      source?: string
      url?: string
    }>
  }
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
  skip?: number
  limit?: number
  data: Video[]
  note?: string
}
