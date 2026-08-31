import type { CategoryDef } from './types'

/** Same 9 slugs as the closed workbench (`default_categories.json`). */
export const CATEGORIES: CategoryDef[] = [
  { slug: 'ai-short-film', name: 'AI创意短片', sortOrder: 1 },
  { slug: 'ai-ad', name: 'AI创意广告', sortOrder: 2 },
  { slug: 'fashion', name: '换装/时尚', sortOrder: 3 },
  { slug: 'props-transition', name: '道具/转场', sortOrder: 4 },
  { slug: 'ar-material', name: 'AR/物料', sortOrder: 5 },
  { slug: 'ai-tool', name: 'AI创意工具', sortOrder: 6 },
  { slug: 'new-model', name: '新模型表现', sortOrder: 7 },
  { slug: '3d-render', name: '3D/渲染', sortOrder: 8 },
  { slug: 'ip-character', name: 'IP/角色', sortOrder: 9 },
]

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug
}
