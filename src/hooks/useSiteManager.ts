import { useCallback, useEffect, useState } from 'react'
import type { Site, SiteCategory } from '@/types'

/* ============================================================
   useSiteManager
   管理"用户自定义站点"（有别于内置 sites.json 和书签导入）
   - CRUD：添加、编辑、删除单个站点
   - 置顶 / 取消置顶
   - 批量清除
   - localStorage 持久化（key: inav-custom-sites）
   ============================================================ */

const STORAGE_KEY = 'inav-custom-sites'

// ---- 持久化工具 ----

function loadCustomSites(): Site[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? (parsed as Site[]) : []
	} catch {
		return []
	}
}

function saveCustomSites(sites: Site[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(sites))
	} catch {}
}

// ---- ID 生成 ----

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w\u4e00-\u9fa5-]/g, '')
		.slice(0, 40)
}

function extractDomain(url: string): string {
	try {
		return new URL(url).hostname
	} catch {
		return ''
	}
}

function generateId(name: string, url: string, existingIds: Set<string>): string {
	const base = slugify(name) || slugify(extractDomain(url)) || 'site'
	let id = `custom-${base}`
	let suffix = 1
	while (existingIds.has(id)) {
		id = `custom-${base}-${suffix}`
		suffix++
	}
	return id
}

// ---- 自动生成 iconUrl ----

function autoIconUrl(url: string): string | undefined {
	const domain = extractDomain(url)
	if (!domain) return undefined
	return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

// ---- 新站点数据结构 ----

/** 添加/编辑站点时的输入 payload（不含 id / source / addedAt） */
export interface SitePayload {
	name: string
	url: string
	description: string
	category: SiteCategory
	iconUrl?: string
	pinned?: boolean
	tags?: string[]
}

// ---- 验证 ----

export interface ValidationError {
	field: keyof SitePayload
	message: string
}

export function validateSitePayload(payload: Partial<SitePayload>): ValidationError[] {
	const errors: ValidationError[] = []

	if (!payload.name?.trim()) {
		errors.push({ field: 'name', message: '站点名称不能为空' })
	} else if (payload.name.trim().length > 50) {
		errors.push({ field: 'name', message: '站点名称不超过 50 个字符' })
	}

	if (!payload.url?.trim()) {
		errors.push({ field: 'url', message: 'URL 不能为空' })
	} else {
		try {
			const u = new URL(payload.url.trim())
			if (u.protocol !== 'http:' && u.protocol !== 'https:') {
				errors.push({ field: 'url', message: '仅支持 http / https 链接' })
			}
		} catch {
			errors.push({ field: 'url', message: 'URL 格式不正确' })
		}
	}

	if (!payload.description?.trim()) {
		errors.push({ field: 'description', message: '描述不能为空' })
	} else if (payload.description.trim().length > 100) {
		errors.push({ field: 'description', message: '描述不超过 100 个字符' })
	}

	if (!payload.category) {
		errors.push({ field: 'category', message: '请选择分类' })
	}

	return errors
}

// ---- Hook 返回类型 ----

export interface UseSiteManagerReturn {
	/** 所有自定义站点 */
	customSites: Site[]
	/** 添加一个新站点，自动生成 id / iconUrl / addedAt */
	addSite: (payload: SitePayload) => Site
	/** 编辑已有站点（通过 id 查找） */
	updateSite: (id: string, payload: Partial<SitePayload>) => void
	/** 删除站点 */
	removeSite: (id: string) => void
	/** 切换置顶状态 */
	togglePin: (id: string) => void
	/** 清空所有自定义站点 */
	clearCustomSites: () => void
	/** 检查 URL 是否已存在（去重提示） */
	isUrlDuplicate: (url: string, excludeId?: string) => boolean
}

// ---- Hook 实现 ----

export function useSiteManager(): UseSiteManagerReturn {
	const [customSites, setCustomSites] = useState<Site[]>(() => loadCustomSites())

	// 持久化到 localStorage
	useEffect(() => {
		saveCustomSites(customSites)
	}, [customSites])

	const addSite = useCallback(
		(payload: SitePayload): Site => {
			const existingIds = new Set(customSites.map((s) => s.id))

			// 自动补充 iconUrl（如用户未提供）
			const iconUrl =
				payload.iconUrl?.trim() || autoIconUrl(payload.url) || undefined

			const site: Site = {
				id: generateId(payload.name, payload.url, existingIds),
				name: payload.name.trim(),
				url: payload.url.trim(),
				description: payload.description.trim(),
				category: payload.category,
				iconUrl,
				pinned: payload.pinned ?? false,
				tags: payload.tags ?? [],
				source: 'custom' as Site['source'],
				addedAt: new Date().toISOString(),
			}

			setCustomSites((prev) => [site, ...prev])
			return site
		},
		[customSites],
	)

	const updateSite = useCallback(
		(id: string, payload: Partial<SitePayload>) => {
			setCustomSites((prev) =>
				prev.map((site) => {
					if (site.id !== id) return site

					// 如果 url 变了且没有手动提供 iconUrl，重新生成
					const newUrl = payload.url?.trim() ?? site.url
					const iconUrl =
						payload.iconUrl !== undefined
							? payload.iconUrl?.trim() || undefined
							: newUrl !== site.url
								? autoIconUrl(newUrl) || site.iconUrl
								: site.iconUrl

					return {
						...site,
						...payload,
						name: payload.name?.trim() ?? site.name,
						url: newUrl,
						description: payload.description?.trim() ?? site.description,
						iconUrl,
					}
				}),
			)
		},
		[],
	)

	const removeSite = useCallback((id: string) => {
		setCustomSites((prev) => prev.filter((s) => s.id !== id))
	}, [])

	const togglePin = useCallback((id: string) => {
		setCustomSites((prev) =>
			prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)),
		)
	}, [])

	const clearCustomSites = useCallback(() => {
		setCustomSites([])
	}, [])

	const isUrlDuplicate = useCallback(
		(url: string, excludeId?: string): boolean => {
			const normalized = url.trim().toLowerCase().replace(/\/$/, '')
			return customSites.some((s) => {
				if (s.id === excludeId) return false
				return s.url.trim().toLowerCase().replace(/\/$/, '') === normalized
			})
		},
		[customSites],
	)

	return {
		customSites,
		addSite,
		updateSite,
		removeSite,
		togglePin,
		clearCustomSites,
		isUrlDuplicate,
	}
}
