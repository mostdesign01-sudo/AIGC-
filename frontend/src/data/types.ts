export const CATEGORY_SLUGS = [
  'ai-short-film',
  'ai-ad',
  'fashion',
  'props-transition',
  'ar-material',
  'ai-tool',
  'new-model',
  '3d-render',
  'ip-character',
] as const

export type CategorySlug = (typeof CATEGORY_SLUGS)[number]

export interface CategoryDef {
  slug: CategorySlug
  name: string
  sortOrder: number
}

export interface SourceLink {
  label: string
  url: string
}

export interface ReleaseMedia {
  /** GitHub Release tag, e.g. vol11-gifs */
  releaseTag: string
  /** Source clip filename on that release */
  video?: string
  /**
   * Landscape: exactly two files, upper then lower (`*-a.gif`, `*-b.gif`).
   * Vertical: one file.
   */
  gifs?: string[]
}

export interface CatalogItem {
  title: string
  why: string
  dateLabel?: string
  sources: SourceLink[]
  media?: ReleaseMedia
}

export interface CategorySlot {
  slug: CategorySlug
  /** Empty coverage slot for this window */
  empty?: boolean
  emptyNote?: string
  items: CatalogItem[]
}

export interface BriefPick {
  id: string
  category: CategorySlug
  title: string
  why: string
  credit: string
  sources: SourceLink[]
  orientation: 'landscape' | 'vertical'
  media: ReleaseMedia
}

export interface Issue {
  vol: number
  volLabel: string
  series: string
  timezone: 'Asia/Shanghai'
  publishedOn: string
  windowStart: string
  windowEnd: string
  summary: string
  brief: BriefPick[]
  slots: CategorySlot[]
}
