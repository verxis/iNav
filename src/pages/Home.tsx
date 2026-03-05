import {
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { NavLink } from 'react-router'
import { BookmarkIO } from '@/components/molecules/BookmarkIO'
import { CategoryFilter } from '@/components/molecules/CategoryFilter'
import { EngineSettings } from '@/components/molecules/EngineSettings'
import { CommandPalette } from '@/components/organisms/CommandPalette'
import { Header } from '@/components/organisms/Header'
import { NavGrid } from '@/components/organisms/NavGrid'
import { SiteFormModal } from '@/components/organisms/SiteFormModal'
import sitesData from '@/data/sites.json'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useEngineOrder } from '@/hooks/useEngineOrder'
import {
	type SitePayload,
	useSiteManager,
} from '@/hooks/useSiteManager'
import type { Site, SiteCategory } from '@/types'

const BUILTIN_SITES = sitesData as Site[]

/* ============================================================
   filterSites
   对 name / description / tags / url 做多字段模糊匹配
   ============================================================ */
function filterSites(
	sites: Site[],
	query: string,
	category: SiteCategory | null,
): Site[] {
	const q = query.trim().toLowerCase()

	return sites.filter((site) => {
		// 分类过滤
		if (category !== null && site.category !== category) return false
		// 无关键词时全量显示
		if (!q) return true

		return (
			site.name.toLowerCase().includes(q) ||
			site.description.toLowerCase().includes(q) ||
			(site.tags?.some((t) => t.toLowerCase().includes(q)) ?? false) ||
			site.url.toLowerCase().includes(q)
		)
	})
}

/* ============================================================
   Toast 轻通知（独立于 BookmarkIO，用于站点管理操作）
   ============================================================ */
interface ToastItem {
	id: string
	message: string
	type: 'success' | 'error' | 'info'
}

function useToast() {
	const [toasts, setToasts] = useState<ToastItem[]>([])

	const show = useCallback(
		(message: string, type: ToastItem['type'] = 'success') => {
			const id = Math.random().toString(36).slice(2)
			setToasts((prev) => [...prev, { id, message, type }])
			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id))
			}, 2800)
		},
		[],
	)

	return { toasts, show }
}

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
	if (toasts.length === 0) return null
	return (
		<div
			aria-live="polite"
			aria-atomic="false"
			className="fixed bottom-4 left-1/2 -translate-x-1/2 z-400 flex flex-col gap-2 items-center pointer-events-none"
		>
			{toasts.map((t) => (
				<div
					key={t.id}
					className={[
						'flex items-center gap-2 px-4 py-2.5',
						'rounded-lg text-xs font-medium',
						'shadow-lg animate-toast pointer-events-auto',
						t.type === 'success'
							? 'bg-foreground text-background'
							: t.type === 'error'
								? 'bg-error text-white'
								: 'bg-surface border border-border text-foreground',
					].join(' ')}
				>
					{t.type === 'success' && (
						<svg
							width="13"
							height="13"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					)}
					{t.message}
				</div>
			))}
		</div>
	)
}

/* ============================================================
   删除确认对话框
   ============================================================ */
interface DeleteConfirmProps {
	site: Site
	onConfirm: () => void
	onCancel: () => void
}

function DeleteConfirm({ site, onConfirm, onCancel }: DeleteConfirmProps) {
	// Esc 取消
	useEffect(() => {
		const h = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onCancel()
		}
		window.addEventListener('keydown', h)
		return () => window.removeEventListener('keydown', h)
	}, [onCancel])

	return (
		<>
			<div
				className="modal-overlay animate-fade-in"
				onClick={onCancel}
				aria-hidden="true"
			/>
			<div
				role="alertdialog"
				aria-modal="true"
				aria-labelledby="del-title"
				aria-describedby="del-desc"
				className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm animate-scale-up"
				style={{ zIndex: 300 }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="popover mx-4 p-5 space-y-4">
					<div>
						<h3
							id="del-title"
							className="text-sm font-semibold text-foreground mb-1"
						>
							删除站点
						</h3>
						<p
							id="del-desc"
							className="text-xs text-muted-foreground leading-relaxed"
						>
							确定要删除{' '}
							<strong className="text-foreground font-medium">
								{site.name}
							</strong>{' '}
							吗？此操作不可撤销。
						</p>
					</div>
					<div className="flex items-center justify-end gap-2">
						<button
							type="button"
							onClick={onCancel}
							className="
								h-8 px-3 text-xs font-medium rounded-lg
								text-muted-foreground hover:text-foreground
								hover:bg-muted transition-colors duration-100
								focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
							"
						>
							取消
						</button>
						<button
							type="button"
							// biome-ignore lint/a11y/useAutofocus: 删除确认按钮需要立即获焦
							autoFocus
							onClick={onConfirm}
							className="
								h-8 px-3 text-xs font-medium rounded-lg
								bg-error text-white
								hover:opacity-90 active:opacity-80
								transition-opacity duration-100
								focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error
							"
						>
							确认删除
						</button>
					</div>
				</div>
			</div>
		</>
	)
}

/* ============================================================
   Home 页面主组件
   ============================================================ */
export default function Home() {
	// ---- 搜索 & 分类状态 ----
	const [query, setQuery] = useState('')
	const [activeCategory, setActiveCategory] = useState<SiteCategory | null>(null)
	const deferredQuery = useDeferredValue(query)
	const searchInputRef = useRef<HTMLInputElement>(null)

	// ---- 搜索引擎顺序 & 启用状态 ----
	const engineOrder = useEngineOrder()

	// ---- 命令面板 ----
	const [cmdOpen, setCmdOpen] = useState(false)

	// ---- 站点管理（自定义站点） ----
	const {
		customSites,
		addSite,
		updateSite,
		removeSite,
		togglePin,
		isUrlDuplicate,
	} = useSiteManager()

	// ---- 书签导入/导出 ----
	const {
		importedSites,
		importFromHtml,
		clearImported,
		exportToJson,
		exportToHtml,
	} = useBookmarks()

	// ---- Toast 通知 ----
	const { toasts, show: showToast } = useToast()

	// ---- 站点表单（添加/编辑） ----
	const [formOpen, setFormOpen] = useState(false)
	const [editingSite, setEditingSite] = useState<Site | undefined>(undefined)

	// ---- 删除确认 ----
	const [deletingSite, setDeletingSite] = useState<Site | undefined>(undefined)

	// ---- 合并三类站点：内置 > 自定义 > 导入 ----
	const allSites = useMemo<Site[]>(() => {
		const builtinIds = new Set(BUILTIN_SITES.map((s) => s.id))
		const customIds = new Set(customSites.map((s) => s.id))

		// 去重：内置优先，自定义次之，导入最后
		const dedupedImported = importedSites.filter(
			(s) => !builtinIds.has(s.id) && !customIds.has(s.id),
		)

		return [
			...BUILTIN_SITES.map((s) => ({ ...s, source: 'builtin' as const })),
			...customSites,
			...dedupedImported,
		]
	}, [customSites, importedSites])

	// ---- 分类列表 ----
	const categories = useMemo<SiteCategory[]>(() => {
		const set = new Set(allSites.map((s) => s.category))
		return Array.from(set).sort()
	}, [allSites])

	// ---- 过滤 ----
	const filteredSites = useMemo(
		() => filterSites(allSites, deferredQuery, activeCategory),
		[allSites, deferredQuery, activeCategory],
	)

	const isStale = query !== deferredQuery
	const hasFilter = query.trim() !== '' || activeCategory !== null

	// ---- 事件处理 ----
	const handleSearchChange = useCallback((value: string) => {
		setQuery(value)
	}, [])

	const handleCategoryChange = useCallback((cat: SiteCategory | null) => {
		setActiveCategory(cat)
	}, [])

	// filteredSites ref：供键盘快捷键读取最新值，避免 closure 陈旧引用
	const filteredSitesRef = useRef<typeof filteredSites>([])
	filteredSitesRef.current = filteredSites

	// query ref：供 keydown handler 读取，避免 stale closure
	const queryRef = useRef(query)
	queryRef.current = query

	// enabledEngines ref：供键盘快捷键读取最新值
	const enabledEnginesRef = useRef(engineOrder.enabledEngines)
	enabledEnginesRef.current = engineOrder.enabledEngines

	/**
	 * 构建统一的「可打开条目」列表，顺序与网格渲染一致：
	 *   1. 过滤后的站点
	 *   2. 已启用的搜索引擎卡片（rank 紧接站点之后）
	 * 只有在有搜索词时才追加引擎卡片。
	 */
	const buildOpenableList = (q: string): Array<{ url: string; label: string }> => {
		const sites = filteredSitesRef.current
		const trimmed = q.trim()

		const result: Array<{ url: string; label: string }> = sites.map((s) => ({
			url: s.url,
			label: s.name,
		}))

		if (trimmed) {
			for (const engine of enabledEnginesRef.current) {
				result.push({
					url: engine.searchUrl.replace('{q}', encodeURIComponent(trimmed)),
					label: engine.name,
				})
			}
		}

		return result
	}

	// 任意可打印字符聚焦搜索框 + Enter 打开第一结果 + Ctrl/⌘+1-9 快速打开
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// ⌘K / Ctrl+K 打开命令面板
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault()
				setCmdOpen(true)
				return
			}

			// Ctrl/⌘+1~9：打开第 N 个条目（站点 + 引擎卡片统一编号）
			if ((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(e.key)) {
				const q = queryRef.current
				if (!q.trim()) return
				const idx = Number(e.key) - 1
				const list = buildOpenableList(q)
				const item = list[idx]
				if (item) {
					e.preventDefault()
					window.open(item.url, '_blank', 'noopener,noreferrer')
				}
				return
			}

			// Enter 在搜索框内：打开第一个条目
			if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.altKey) {
				const target = e.target as HTMLElement
				if (target === searchInputRef.current) {
					const q = queryRef.current
					if (!q.trim()) return
					e.preventDefault()
					const list = buildOpenableList(q)
					if (list.length > 0) {
						window.open(list[0].url, '_blank', 'noopener,noreferrer')
					}
				}
				return
			}

			if (e.metaKey || e.ctrlKey || e.altKey) return
			if (e.key.length !== 1) return

			const target = e.target as HTMLElement
			const isTyping =
				target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.isContentEditable
			if (isTyping) return

			searchInputRef.current?.focus()
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])

	// ---- 站点表单提交 ----
	const handleFormSubmit = useCallback(
		(payload: SitePayload, editId?: string) => {
			if (editId) {
				updateSite(editId, payload)
				showToast(`「${payload.name}」已更新`, 'success')
			} else {
				addSite(payload)
				showToast(`「${payload.name}」已添加`, 'success')
			}
		},
		[addSite, updateSite, showToast],
	)

	// ---- 编辑回调 ----
	const handleEdit = useCallback((site: Site) => {
		setEditingSite(site)
		setFormOpen(true)
	}, [])

	// ---- 删除回调 ----
	const handleDelete = useCallback((site: Site) => {
		setDeletingSite(site)
	}, [])

	const confirmDelete = useCallback(() => {
		if (!deletingSite) return
		removeSite(deletingSite.id)
		showToast(`「${deletingSite.name}」已删除`, 'success')
		setDeletingSite(undefined)
	}, [deletingSite, removeSite, showToast])

	// ---- 置顶回调 ----
	const handleTogglePin = useCallback(
		(site: Site) => {
			// 只有自定义和导入的站点支持置顶操作
			if (site.source === 'custom') {
				togglePin(site.id)
				showToast(site.pinned ? '已取消置顶' : `「${site.name}」已置顶`, 'success')
			}
		},
		[togglePin, showToast],
	)

	return (
		<div className="min-h-screen flex flex-col bg-background">
			{/* ---- Header ---- */}
			<Header
					searchValue={query}
					onSearchChange={handleSearchChange}
					searchInputRef={searchInputRef}
					siteCount={allSites.length}
					onOpenCommandPalette={() => setCmdOpen(true)}
					onAddSite={() => {
						setEditingSite(undefined)
						setFormOpen(true)
					}}
					onReset={() => {
						setQuery('')
						setActiveCategory(null)
						requestAnimationFrame(() => searchInputRef.current?.blur())
					}}
				/>

			{/* ---- 主内容 ---- */}
			<main
				aria-label="导航站主页"
				className="flex-1 page-enter mx-auto w-full max-w-7xl px-4 sm:px-6 py-3 space-y-3"
			>
				{/* 工具栏：分类筛选 + 书签导入导出 */}
				<div className="flex flex-col sm:flex-row sm:items-center gap-2">
					<div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
						<CategoryFilter
							categories={categories}
							activeCategory={activeCategory}
							onChange={handleCategoryChange}
						/>
					</div>
					<div className="shrink-0 flex items-center">
						<BookmarkIO
							builtinSites={BUILTIN_SITES}
							importedCount={importedSites.length}
							bookmarks={{
								importFromHtml,
								clearImported,
								exportToJson,
								exportToHtml,
							}}
						/>
					</div>
				</div>

				{/* 搜索结果信息 */}
				{hasFilter && (
					<div
						aria-live="polite"
						aria-atomic="true"
						className="text-xs text-muted-foreground"
					>
						{filteredSites.length > 0 ? (
							<>
								找到{' '}
								<strong className="text-foreground font-medium">
									{filteredSites.length}
								</strong>{' '}
								个结果
								{query.trim() && (
									<>
										，关键词：
										<strong className="text-foreground font-medium">
											&ldquo;{query.trim()}&rdquo;
										</strong>
									</>
								)}
								{activeCategory && (
									<>
										，分类：
										<strong className="text-foreground font-medium">
											{activeCategory}
										</strong>
									</>
								)}
							</>
						) : (
							<span>没有找到匹配的站点</span>
						)}
					</div>
				)}

				{/* 导航卡片网格 */}
				<section aria-label="导航站点">
					<NavGrid
						sites={filteredSites}
						searchQuery={deferredQuery}
						enabledEngines={engineOrder.enabledEngines}
						engineSettings={<EngineSettings engineOrder={engineOrder} />}
						isStale={isStale}
						hasFilter={hasFilter}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onTogglePin={handleTogglePin}
					/>
				</section>
			</main>

			{/* ---- Footer ---- */}
			<footer className="border-t border-border mt-auto">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 h-10 flex items-center justify-between">
					<span className="text-xs text-muted-foreground">
						{allSites.length} 个站点
						{customSites.length > 0 && (
							<span className="ml-1 text-muted-foreground/60">
								（{customSites.length} 自定义）
							</span>
						)}
						{importedSites.length > 0 && (
							<span className="ml-1 text-muted-foreground/60">
								（{importedSites.length} 导入）
							</span>
						)}
						{' · '}
						{categories.length} 个分类
					</span>
					<nav aria-label="页脚导航" className="flex items-center gap-4">
						<NavLink
							to="/"
							end
							className={({ isActive }) =>
								[
									'text-xs no-underline transition-colors duration-100',
									isActive
										? 'text-foreground font-medium'
										: 'text-muted-foreground hover:text-foreground',
								].join(' ')
							}
						>
							首页
						</NavLink>
						<NavLink
							to="/about"
							className={({ isActive }) =>
								[
									'text-xs no-underline transition-colors duration-100',
									isActive
										? 'text-foreground font-medium'
										: 'text-muted-foreground hover:text-foreground',
								].join(' ')
							}
						>
							关于
						</NavLink>
					</nav>
				</div>
			</footer>

			{/* ---- 命令面板 ---- */}
			<CommandPalette
				open={cmdOpen}
				onClose={() => setCmdOpen(false)}
				sites={allSites}
			/>

			{/* ---- 添加 / 编辑站点表单 ---- */}
			<SiteFormModal
				open={formOpen}
				editSite={editingSite}
				onClose={() => {
					setFormOpen(false)
					setEditingSite(undefined)
				}}
				onSubmit={handleFormSubmit}
				isUrlDuplicate={isUrlDuplicate}
			/>

			{/* ---- 删除确认对话框 ---- */}
			{deletingSite && (
				<DeleteConfirm
					site={deletingSite}
					onConfirm={confirmDelete}
					onCancel={() => setDeletingSite(undefined)}
				/>
			)}

			{/* ---- Toast 通知 ---- */}
			<ToastContainer toasts={toasts} />
		</div>
	)
}
