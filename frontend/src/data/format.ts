const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** 2026-09-17 → 9月17日 · 周四 */
export function formatDay(iso: string, withWeekday = true): string {
  const d = parseDate(iso)
  const base = `${d.getMonth() + 1}月${d.getDate()}日`
  return withWeekday ? `${base} · 周${WEEKDAYS[d.getDay()]}` : base
}

/** 2026-09-17 → 2026 年 9 月 17 日 */
export function formatDayLong(iso: string): string {
  const d = parseDate(iso)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${WEEKDAYS[d.getDay()]}`
}

/** 2026-W38 → 第 38 周 */
export function formatWeekShort(weekId: string): string {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekId)
  return m ? `第 ${Number(m[2])} 周` : weekId
}

/** 2026-W38 + 范围 → 2026 年第 38 周 · 9.14 – 9.20 */
export function formatWeek(weekId: string, start?: string, end?: string): string {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekId)
  const head = m ? `${m[1]} 年第 ${Number(m[2])} 周` : weekId
  if (!start || !end) return head
  const s = parseDate(start)
  const e = parseDate(end)
  return `${head} · ${s.getMonth() + 1}.${s.getDate()} – ${e.getMonth() + 1}.${e.getDate()}`
}

export function formatRange(start: string, end: string): string {
  const s = parseDate(start)
  const e = parseDate(end)
  return `${s.getMonth() + 1}.${s.getDate()} – ${e.getMonth() + 1}.${e.getDate()}`
}

const PLATFORM_NAMES: Record<string, string> = {
  youtube: 'YouTube',
  bilibili: 'Bilibili',
  x: 'X',
  douyin: '抖音',
  xiaohongshu: '小红书',
  vimeo: 'Vimeo',
  instagram: 'Instagram',
  github: 'GitHub Release',
  web: '官方 / 网页',
}

export function platformName(platform: string): string {
  return PLATFORM_NAMES[platform] ?? platform
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** 简介三段：背景 / 制作 / 创意构思。没有结构化字段时返回空数组（回退到 intro_zh）。 */
export interface IntroSection {
  key: 'background' | 'production' | 'concept'
  label: string
  text: string
}

export function introSections(v: {
  intro_background?: string
  intro_production?: string
  intro_concept?: string
}): IntroSection[] {
  const out: IntroSection[] = []
  if (v.intro_background) out.push({ key: 'background', label: '背景', text: v.intro_background })
  if (v.intro_production) out.push({ key: 'production', label: '制作', text: v.intro_production })
  if (v.intro_concept) out.push({ key: 'concept', label: '创意', text: v.intro_concept })
  return out
}

/** https://…/releases/download/<tag>/xxx-a.gif → xxx-a.gif */
export function fileNameOf(url: string, fallback = 'download'): string {
  try {
    const name = new URL(url).pathname.split('/').filter(Boolean).pop()
    return name ? decodeURIComponent(name) : fallback
  } catch {
    return fallback
  }
}
