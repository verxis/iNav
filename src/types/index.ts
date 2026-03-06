import type React from 'react'
import type { SiteCategory } from '@/data/categories'

// SiteCategory is defined in data/categories.ts alongside SITE_CATEGORIES array.
// To add/rename/remove a category, only edit that file.
export type { SiteCategory } from '@/data/categories'

export interface Site {
	id: string
	name: string
	url: string
	description: string
	iconUrl?: string
	category: SiteCategory
	pinned?: boolean
	tags?: string[]
	/** builtin = 内置 | imported = 书签导入 | custom = 用户添加 */
	source?: 'builtin' | 'imported' | 'custom'
	addedAt?: string
}

export interface BookmarkImportResult {
	imported: number
	skipped: number
	sites: Site[]
}

export interface SearchEngine {
	id: string
	name: string
	/** 搜索 URL 模板，{q} 替换为关键词 */
	searchUrl: string
	iconUrl?: string
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type CommandItemType = 'site' | 'action' | 'category'

export interface CommandItem {
	id: string
	type: CommandItemType
	label: string
	description?: string
	url?: string
	iconUrl?: string
	category?: SiteCategory
	onSelect?: () => void
	shortcut?: string[]
}

export interface Toast {
	id: string
	message: string
	type: 'success' | 'error' | 'info'
	duration?: number
}

export interface SiteFormData {
	name: string
	url: string
	description: string
	category: SiteCategory
	iconUrl?: string
	pinned?: boolean
	tags?: string[]
}

export interface UseThemeReturn {
	mode: ThemeMode
	resolvedTheme: 'light' | 'dark'
	isDark: boolean
	setTheme: (mode: ThemeMode) => void
	/** 在 light/dark 之间直接切换（不经过 system） */
	toggleTheme: () => void
}

export interface FilterState {
	query: string
	category: SiteCategory | null
}

/* ---- 组件 Props ---- */

export interface NavCardProps {
	site: Site
	className?: string
}

export interface BadgeProps {
	children: React.ReactNode
	variant?: 'default' | 'primary' | 'active'
	className?: string
	onClick?: () => void
}

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
	size?: 'sm' | 'md' | 'lg'
	loading?: boolean
	children: React.ReactNode
}

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	leftIcon?: React.ReactNode
	rightIcon?: React.ReactNode
	error?: string
	ref?: React.Ref<HTMLInputElement>
}

export interface SearchBarProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	inputRef?: React.RefObject<HTMLInputElement | null>
}

export interface CategoryFilterProps {
	categories: SiteCategory[]
	activeCategory: SiteCategory | null
	onChange: (category: SiteCategory | null) => void
}

export interface NavGridProps {
	sites: Site[]
	searchQuery?: string
	onEdit?: (site: Site) => void
	onDelete?: (site: Site) => void
	onTogglePin?: (site: Site) => void
}

export interface SiteCardProps {
	site: Site
	className?: string
	searchQuery?: string
	/** 搜索时显示的快捷键编号（1-9） */
	rank?: number
	onEdit?: (site: Site) => void
	onDelete?: (site: Site) => void
	onTogglePin?: (site: Site) => void
}

/* ---- 工具类型 ---- */

export type RequiredFields<T, K extends keyof T> = Omit<T, K> &
	Required<Pick<T, K>>

export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T

export type ArrayElement<T extends readonly unknown[]> =
	T extends readonly (infer E)[] ? E : never
