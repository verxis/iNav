import { NavCard } from '@/components/molecules/NavCard'
import type { NavGridProps } from '@/types'

/* ============================================================
   NavGrid
   - Grid 布局（仅网格，不支持列表模式）
   - 传递编辑 / 删除 / 置顶回调给 NavCard
   - 置顶项始终排首位
   - 改进骨架屏（shimmer 动画）
   - 空状态提示
   ============================================================ */

// ---- 图标 ----

function SearchEmptyIcon() {
	return (
		<svg
			width="32"
			height="32"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.35-4.35" />
			<path d="M11 8v6M8 11h6" />
		</svg>
	)
}

function EmptyBoxIcon() {
	return (
		<svg
			width="32"
			height="32"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
			<path d="m3.29 7 8.71 5 8.71-5" />
			<path d="M12 22V12" />
		</svg>
	)
}

// ---- 空状态 ----

interface EmptyStateProps {
	hasFilter: boolean
}

function EmptyState({ hasFilter }: EmptyStateProps) {
	return (
		<output
			aria-live="polite"
			className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center"
		>
			<div className="mb-4 text-muted-foreground opacity-40">
				{hasFilter ? <SearchEmptyIcon /> : <EmptyBoxIcon />}
			</div>
			<h3 className="text-sm font-semibold text-foreground mb-1">
				{hasFilter ? '没有找到匹配的站点' : '暂无站点'}
			</h3>
			<p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
				{hasFilter
					? '试试换个关键词，或者清除分类筛选'
					: '点击右上角「+ 添加」来添加你的第一个站点'}
			</p>
		</output>
	)
}

// ---- 骨架屏（shimmer 动画） ----

function SkeletonCard() {
	return (
		<div className="card p-3 flex flex-col gap-2.5" aria-hidden="true">
			<div className="flex items-center gap-2.5">
				<div className="h-8 w-8 shrink-0 rounded-lg animate-shimmer" />
				<div className="flex-1 space-y-1.5">
					<div className="h-3 w-2/3 rounded animate-shimmer" />
					<div className="h-2.5 w-1/3 rounded animate-shimmer delay-75" />
				</div>
			</div>
			<div className="space-y-1.5">
				<div className="h-2.5 w-full rounded animate-shimmer delay-100" />
				<div className="h-2.5 w-4/5 rounded animate-shimmer delay-150" />
			</div>
			<div className="mt-auto pt-0.5">
				<div className="h-4 w-14 rounded-full animate-shimmer delay-200" />
			</div>
		</div>
	)
}

// ---- 主组件 ----

export function NavGrid({
	sites,
	searchQuery,
	isStale = false,
	isLoading = false,
	hasFilter = false,
	onEdit,
	onDelete,
	onTogglePin,
}: NavGridProps & {
	isStale?: boolean
	isLoading?: boolean
	hasFilter?: boolean
}) {
	// ---- 加载态 ----
	if (isLoading) {
		return (
			<div
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
				aria-busy="true"
			>
				{Array.from({ length: 8 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
					<SkeletonCard key={i} />
				))}
			</div>
		)
	}

	// ---- 空状态 ----
	if (sites.length === 0) {
		return (
			<div className="grid grid-cols-1">
				<EmptyState hasFilter={hasFilter} />
			</div>
		)
	}

	// ---- 排序：置顶在前，其余保持原顺序 ----
	const sortedSites = [...sites].sort((a, b) => {
		if (a.pinned && !b.pinned) return -1
		if (!a.pinned && b.pinned) return 1
		return 0
	})

	// ---- 网格模式 ----
	return (
		<div
			className={[
				'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3',
				'transition-opacity duration-200',
				isStale ? 'opacity-60' : 'opacity-100',
			].join(' ')}
		>
			{sortedSites.map((site) => (
				<NavCard
					key={site.id}
					site={site}
					searchQuery={searchQuery}
					onEdit={onEdit}
					onDelete={onDelete}
					onTogglePin={onTogglePin}
				/>
			))}
		</div>
	)
}
