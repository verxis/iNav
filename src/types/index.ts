import type React from 'react'

// 站点分类
export type SiteCategory =
	| 'AI'
	| '开发工具'
	| '设计'
	| '文档参考'
	| '学习'
	| '效率'
	| '娱乐'
	| '其他'

export interface Site {
	/** 唯一标识符，用作 React key */
	id: string
	name: string
	url: string
	description: string
	/** Duckduckgo: https://icons.duckduckgo.com/ip3/domain.ico */
	iconUrl?: string
	category: SiteCategory
	pinned?: boolean
	tags?: string[]
	/** builtin = 内置数据；imported = 从书签导入；custom = 用户手动添加 */
	source?: 'builtin' | 'imported' | 'custom'
	/** 添加时间（ISO 字符串），用于排序 */
	addedAt?: string
}

/** 书签导入结果 */
export interface BookmarkImportResult {
	imported: number
	skipped: number
	sites: Site[]
}

/** 搜索引擎配置 */
export interface SearchEngine {
	id: string
	name: string
	/** 搜索 URL 模板，{q} 占位符替换为关键词 */
	searchUrl: string
	iconUrl?: string
}

export type ThemeMode = 'light' | 'dark' | 'system'

/** 命令面板条目类型 */
export type CommandItemType = 'site' | 'action' | 'category'

/** 命令面板条目 */
export interface CommandItem {
	id: string
	type: CommandItemType
	label: string
	description?: string
	url?: string
	iconUrl?: string
	/** 分类标签（用于 site 类型） */
	category?: SiteCategory
	/** 执行该条目的回调（用于 action 类型） */
	onSelect?: () => void
	/** 键盘快捷键提示 */
	shortcut?: string[]
}

/** Toast 通知 */
export interface Toast {
	id: string
	message: string
	type: 'success' | 'error' | 'info'
	duration?: number
}

/** 站点表单数据（添加/编辑时使用） */
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
	/** 搜索关键词，对 name / description / tags 做模糊匹配 */
	query: string
	/** null 表示"全部" */
	category: SiteCategory | null
}

/* ---- 组件 Props ---- */

export interface NavCardProps {
	site: Site
	className?: string
}

/** variant: default=灰色 / primary=蓝色 / active=选中态 */
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
	/** 外部传入 ref，用于键盘快捷键聚焦 */
	inputRef?: React.RefObject<HTMLInputElement | null>
}

export interface CategoryFilterProps {
	categories: SiteCategory[]
	/** null = 全部 */
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
	/** 搜索时显示的快捷键编号（1-9），用于 Ctrl+N 快速打开 */
	rank?: number
	onEdit?: (site: Site) => void
	onDelete?: (site: Site) => void
	onTogglePin?: (site: Site) => void
}

/* ---- 工具类型 ---- */

/** 将对象的指定字段变为必填 */
export type RequiredFields<T, K extends keyof T> = Omit<T, K> &
	Required<Pick<T, K>>

/** 深度可选，常用于测试数据工厂函数 */
export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T

/** 提取数组元素类型，例：ArrayElement<Site[]> = Site */
export type ArrayElement<T extends readonly unknown[]> =
	T extends readonly (infer E)[] ? E : never
