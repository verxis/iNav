/**
 * Single source of truth for site categories.
 * To add / rename / remove a category, only edit SITE_CATEGORIES here.
 * The SiteCategory type in types/index.ts is derived from this array automatically.
 */
export const SITE_CATEGORIES = [
	'AI',
	'开源项目',
	'开发工具',
	'设计',
	'文档参考',
	'学习',
	'效率',
	'娱乐',
	'其他',
] as const

export type SiteCategory = (typeof SITE_CATEGORIES)[number]

/** Color classes for each category, used in CommandPalette and anywhere else. */
export const CATEGORY_COLOR: Record<SiteCategory, string> = {
	AI: 'text-violet-500',
	开源项目: 'text-emerald-500',
	开发工具: 'text-blue-500',
	设计: 'text-pink-500',
	文档参考: 'text-amber-500',
	学习: 'text-green-500',
	效率: 'text-cyan-500',
	娱乐: 'text-orange-500',
	其他: 'text-gray-400',
}
