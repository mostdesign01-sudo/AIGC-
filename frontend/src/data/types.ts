export type Orientation = 'landscape' | 'vertical'
export type WeeklySlot = 'hottest' | 'influential' | 'creative'

export const WEEKLY_SLOTS: WeeklySlot[] = ['hottest', 'influential', 'creative']

export interface Category {
  slug: string
  name: string
}

export interface SlotLabel {
  label: string
  tagline: string
}

export interface CreativeVideo {
  id: string
  title: string
  url: string
  platform: string
  author: string
  orientation: Orientation
  category: string
  tags: string[]
  intro_zh: string
  /** 结构化简介：背景（谁做的 / 官方或提案 / 赛事发布语境） */
  intro_background?: string
  /** 结构化简介：制作（工具 / 模型 / 流程） */
  intro_production?: string
  /** 结构化简介：创意构思（核心点子与落点） */
  intro_concept?: string
  collected_date: string
  gif_a_url: string
  gif_b_url: string
  cover_url: string
  source_video_url: string
  /** 原片下载地址（GitHub Release 资产 <slug>.mp4） */
  video_download_url?: string
  /** 原片拿不到时的原因 */
  video_download_note?: string
  heat_score: number | null
  influence_score: number | null
  creativity_score: number | null
  source_notes: string
  week_id: string
  weekly_slot: WeeklySlot | null
}

export interface DaySummary {
  date: string
  week_id: string
  count: number
}

export interface WeekPick {
  slot: WeeklySlot
  label: string
  tagline: string
  video_id: string | null
}

export interface WeekSummary {
  week_id: string
  start: string
  end: string
  note: string
  picks: WeekPick[]
}

export interface Feed {
  generated_at: string
  timezone: string
  categories: Category[]
  slot_labels: Record<WeeklySlot, SlotLabel>
  videos: CreativeVideo[]
  days: DaySummary[]
  weeks: WeekSummary[]
}
