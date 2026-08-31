import { CATEGORIES, categoryName } from '../categories'
import { CATEGORY_SLUGS, type Issue } from '../types'
import { vol11 } from './vol11'

export const CURRENT_VOL = 11

const registry: Record<number, Issue> = {
  [vol11.vol]: vol11,
}

export function listIssues(): Issue[] {
  return Object.values(registry).sort((a, b) => b.vol - a.vol)
}

export function getIssue(vol: number | string | null | undefined): Issue {
  const n = Number(vol)
  if (Number.isFinite(n) && registry[n]) return registry[n]
  return registry[CURRENT_VOL]
}

export function issueWindowLabel(issue: Issue): string {
  return `${fmtDot(issue.windowStart)} → ${fmtDot(issue.windowEnd)}`
}

export function issueDateLabel(issue: Issue): string {
  return `${fmtZh(issue.publishedOn)} 刊`
}

export function fmtDot(iso: string): string {
  return iso.replaceAll('-', '.')
}

export function fmtZh(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${y}年${Number(m)}月${Number(d)}日`
}

export function validateIssue(issue: Issue): string[] {
  const errors: string[] = []
  if (issue.brief.length < 3 || issue.brief.length > 5) {
    errors.push(`${issue.volLabel} 简报条数应为 3–5，当前 ${issue.brief.length}`)
  }
  const slugs = issue.slots.map((s) => s.slug)
  for (const slug of CATEGORY_SLUGS) {
    if (!slugs.includes(slug)) errors.push(`${issue.volLabel} 缺少类型 ${categoryName(slug)}`)
  }
  if (issue.slots.length !== CATEGORIES.length) {
    errors.push(`${issue.volLabel} 类型槽应为 ${CATEGORIES.length}，当前 ${issue.slots.length}`)
  }
  issue.brief.forEach((pick) => {
    if (pick.orientation === 'landscape' && pick.media.gifs?.length !== 2) {
      errors.push(`${pick.title} 横版必须正好 2 张 GIF（上/下）`)
    }
    if (pick.orientation === 'vertical' && pick.media.gifs?.length !== 1) {
      errors.push(`${pick.title} 竖版必须正好 1 张 GIF`)
    }
  })
  return errors
}

export { categoryName }
