import { useCallback, useEffect, useState } from 'react'
import type { BookmarkImportResult, Site, SiteCategory } from '@/types'

const STORAGE_KEY = 'inav-imported-sites'

// ---- 持久化 ----

function loadFromStorage(): Site[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

function saveToStorage(sites: Site[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(sites))
	} catch {}
}

// ---- 书签 HTML 解析 ----

function guessCategoryFromFolder(folderName: string): SiteCategory {
	const name = folderName.toLowerCase()
	if (/ai|gpt|llm|claude|gemini/.test(name)) return 'AI'
	if (/dev|code|git|api|程序|开发|技术/.test(name)) return '开发工具'
	if (/design|ui|ux|设计|figma/.test(name)) return '设计'
	if (/doc|文档|manual|reference|参考/.test(name)) return '文档参考'
	if (/learn|学习|course|教程|tutorial/.test(name)) return '学习'
	if (/tool|效率|util|工具/.test(name)) return '效率'
	if (/video|music|game|娱乐|影视/.test(name)) return '娱乐'
	return '其他'
}

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

function parseBookmarkHtml(
	html: string,
	existingIds: Set<string>,
): BookmarkImportResult {
	const parser = new DOMParser()
	const doc = parser.parseFromString(html, 'text/html')

	const sites: Site[] = []
	let skipped = 0

	// 递归遍历 <DL> 树，追踪当前文件夹名
	function walkDl(dl: Element, folderName: string) {
		const children = Array.from(dl.children)
		for (const child of children) {
			if (child.tagName === 'DT') {
				const h3 = child.querySelector(':scope > H3')
				const a = child.querySelector(':scope > A')
				const subDl = child.querySelector(':scope > DL')

				if (h3 && subDl) {
					// 这是一个文件夹，递归进入
					walkDl(subDl, h3.textContent?.trim() || folderName)
				} else if (a) {
					const url = a.getAttribute('href') ?? ''
					const name = a.textContent?.trim() ?? ''

					// 跳过非 http(s) 链接（javascript:, file:, etc.）
					if (!url.startsWith('http://') && !url.startsWith('https://')) {
						skipped++
						continue
					}

					const domain = extractDomain(url)
					const baseId = slugify(name) || slugify(domain)
					let id = baseId
					let suffix = 1
					while (existingIds.has(id)) {
						id = `${baseId}-${suffix}`
						suffix++
					}
					existingIds.add(id)

					const iconUrl = domain
						? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
						: undefined

					sites.push({
						id,
						name: name || domain,
						url,
						description: `从书签导入 — ${domain}`,
						iconUrl,
						category: guessCategoryFromFolder(folderName),
						source: 'imported',
						addedAt: new Date().toISOString(),
						tags: folderName && folderName !== '书签栏' ? [folderName] : [],
					})
				}
			}
		}
	}

	const rootDl = doc.querySelector('DL')
	if (rootDl) {
		walkDl(rootDl, '其他')
	}

	return { imported: sites.length, skipped, sites }
}

// ---- Hook ----

export interface UseBookmarksReturn {
	importedSites: Site[]
	/** 解析 HTML 书签文件内容并追加（不重复）到已有列表 */
	importFromHtml: (html: string) => BookmarkImportResult
	/** 删除单条导入站点 */
	removeImported: (id: string) => void
	/** 清空所有导入站点 */
	clearImported: () => void
	/** 导出所有站点（内置 + 导入）为 JSON 文件 */
	exportToJson: (builtinSites: Site[]) => void
	/** 导出为浏览器可识别的 HTML 书签文件 */
	exportToHtml: (builtinSites: Site[]) => void
}

export function useBookmarks(): UseBookmarksReturn {
	const [importedSites, setImportedSites] = useState<Site[]>(() =>
		loadFromStorage(),
	)

	// 每次 importedSites 变化时同步到 localStorage
	useEffect(() => {
		saveToStorage(importedSites)
	}, [importedSites])

	const importFromHtml = useCallback(
		(html: string): BookmarkImportResult => {
			const existingIds = new Set(importedSites.map((s) => s.id))
			const result = parseBookmarkHtml(html, existingIds)

			setImportedSites((prev) => [...prev, ...result.sites])
			return result
		},
		[importedSites],
	)

	const removeImported = useCallback((id: string) => {
		setImportedSites((prev) => prev.filter((s) => s.id !== id))
	}, [])

	const clearImported = useCallback(() => {
		setImportedSites([])
	}, [])

	const exportToJson = useCallback(
		(builtinSites: Site[]) => {
			const all = [...builtinSites, ...importedSites]
			const blob = new Blob([JSON.stringify(all, null, 2)], {
				type: 'application/json',
			})
			triggerDownload(blob, 'inav-sites.json')
		},
		[importedSites],
	)

	const exportToHtml = useCallback(
		(builtinSites: Site[]) => {
			const all = [...builtinSites, ...importedSites]

			// 按分类分组
			const grouped = new Map<string, Site[]>()
			for (const site of all) {
				const cat = site.category
				if (!grouped.has(cat)) grouped.set(cat, [])
				grouped.get(cat)?.push(site)
			}

			const folderHtml = Array.from(grouped.entries())
				.map(([cat, sites]) => {
					const items = sites
						.map(
							(s) =>
								`    <DT><A HREF="${escapeHtml(s.url)}">${escapeHtml(s.name)}</A>`,
						)
						.join('\n')
					return `  <DT><H3>${escapeHtml(cat)}</H3>\n  <DL><p>\n${items}\n  </DL><p>`
				})
				.join('\n')

			const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>iNav 导出书签</H1>
<DL><p>
${folderHtml}
</DL><p>`

			const blob = new Blob([html], { type: 'text/html' })
			triggerDownload(blob, 'inav-bookmarks.html')
		},
		[importedSites],
	)

	return {
		importedSites,
		importFromHtml,
		removeImported,
		clearImported,
		exportToJson,
		exportToHtml,
	}
}

// ---- 工具函数 ----

function triggerDownload(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}
