import { useCallback, useState } from 'react'
import { Badge } from '@/components/atoms/Badge'
import {
	CopyIcon,
	EditIcon,
	ExternalLinkIcon,
	PinIcon,
	PinOffIcon,
} from '@/components/atoms/Icons'
import {
	ContextMenu,
	buildSiteActions,
	useContextMenu,
} from '@/components/molecules/ContextMenu'
import type { SiteCardProps } from '@/types'

/* ============================================================
   NavCard
   - 扁平化卡片设计（无阴影，hover 边框高亮）
   - 右键 / 长按弹出上下文菜单（编辑、置顶、删除、复制链接）
   - Hover 时显示快捷操作按钮
   - 搜索关键词高亮
   - 来源标记（imported / custom）
   - 置顶标记
   ============================================================ */

// ---- 工具函数 ----

function hashString(str: string): number {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 31 + str.charCodeAt(i)) | 0
	}
	return Math.abs(hash)
}

const AVATAR_COLORS = [
	{ bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400' },
	{ bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400' },
	{ bg: 'bg-green-500/15', text: 'text-green-600 dark:text-green-400' },
	{ bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400' },
	{ bg: 'bg-pink-500/15', text: 'text-pink-600 dark:text-pink-400' },
	{ bg: 'bg-teal-500/15', text: 'text-teal-600 dark:text-teal-400' },
	{ bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400' },
	{ bg: 'bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400' },
]

function getAvatarStyle(name: string) {
	return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]
}

// ---- 搜索高亮 ----

function highlightText(text: string, query: string): React.ReactNode {
	if (!query.trim()) return text
	try {
		const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const regex = new RegExp(`(${escaped})`, 'gi')
		const parts = text.split(regex)
		return parts.map((part, i) =>
			regex.test(part) ? (
				// biome-ignore lint/suspicious/noArrayIndexKey: highlight split
				<mark key={i} className="search-highlight not-italic font-medium">
					{part}
				</mark>
			) : (
				// biome-ignore lint/suspicious/noArrayIndexKey: highlight split
				<span key={i}>{part}</span>
			),
		)
	} catch {
		return text
	}
}

// ---- SiteIcon ----

interface SiteIconProps {
	name: string
	iconUrl?: string
	size?: 'sm' | 'md'
}

function SiteIcon({ name, iconUrl, size = 'md' }: SiteIconProps) {
	const [err, setErr] = useState(false)
	const initial = [...name][0]?.toUpperCase() ?? '?'
	const style = getAvatarStyle(name)
	const dim = size === 'md' ? 'h-8 w-8' : 'h-6 w-6'
	const textSize = size === 'md' ? 'text-sm' : 'text-xs'

	if (!iconUrl || err) {
		return (
			<div
				className={[
					'flex items-center justify-center shrink-0 rounded-lg select-none',
					dim,
					style.bg,
					style.text,
					textSize,
					'font-semibold',
				].join(' ')}
				aria-hidden="true"
			>
				{initial}
			</div>
		)
	}

	return (
		<img
			src={iconUrl}
			alt=""
			width={size === 'md' ? 32 : 24}
			height={size === 'md' ? 32 : 24}
			className={[dim, 'shrink-0 rounded-lg object-contain'].join(' ')}
			onError={() => setErr(true)}
			loading="lazy"
			decoding="async"
		/>
	)
}

// ---- 来源标记 ----

function SourceBadge({ source }: { source?: string }) {
	if (source === 'imported') {
		return (
			<span className="badge badge-warning text-[10px] px-1.5 py-0.5 leading-none">
				导入
			</span>
		)
	}
	if (source === 'custom') {
		return (
			<span className="inline-flex items-center gap-0.5 text-[10px] text-primary leading-none">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="9"
					height="9"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<line x1="12" y1="17" x2="12" y2="22" />
					<path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
				</svg>
			</span>
		)
	}
	return null
}

// ---- 快捷操作按钮（hover 时显示） ----

interface QuickActionProps {
	icon: React.ReactNode
	label: string
	onClick: (e: React.MouseEvent) => void
	destructive?: boolean
}

function QuickAction({ icon, label, onClick, destructive }: QuickActionProps) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			onClick={onClick}
			className={[
				'flex items-center justify-center',
				'h-6 w-6 rounded-md',
				'transition-colors duration-100',
				'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
				destructive
					? 'text-muted-foreground hover:text-error hover:bg-error/10'
					: 'text-muted-foreground hover:text-foreground hover:bg-muted',
			].join(' ')}
		>
			{icon}
		</button>
	)
}

// ---- 主组件 ----

export function NavCard({
	site,
	className = '',
	searchQuery = '',
	onEdit,
	onDelete,
	onTogglePin,
}: SiteCardProps) {
	const { name, url, description, iconUrl, category, pinned, source } = site

	const [copied, setCopied] = useState(false)

	const { menuState, onContextMenu, onTouchStart, onTouchEnd, onTouchMove, closeMenu } =
		useContextMenu()

	// 复制 URL
	const handleCopy = useCallback(
		async (e?: React.MouseEvent) => {
			e?.preventDefault()
			e?.stopPropagation()
			try {
				await navigator.clipboard.writeText(url)
				setCopied(true)
				setTimeout(() => setCopied(false), 1500)
			} catch {
				// clipboard 不可用时静默失败
			}
		},
		[url],
	)

	// 编辑
	const handleEdit = useCallback(
		(e?: React.MouseEvent) => {
			e?.preventDefault()
			e?.stopPropagation()
			onEdit?.(site)
		},
		[site, onEdit],
	)

	// 删除
	const handleDelete = useCallback(
		(e?: React.MouseEvent) => {
			e?.preventDefault()
			e?.stopPropagation()
			onDelete?.(site)
		},
		[site, onDelete],
	)

	// 置顶切换
	const handleTogglePin = useCallback(
		(e?: React.MouseEvent) => {
			e?.preventDefault()
			e?.stopPropagation()
			onTogglePin?.(site)
		},
		[site, onTogglePin],
	)

	// 上下文菜单动作列表
	const contextActions = buildSiteActions(
		{ url, pinned, source },
		{
			onOpen: () => window.open(url, '_blank', 'noopener,noreferrer'),
			onCopyUrl: () => handleCopy(),
			onEdit: onEdit ? () => handleEdit() : undefined,
			onTogglePin: onTogglePin ? () => handleTogglePin() : undefined,
			onDelete: onDelete ? () => handleDelete() : undefined,
		},
	)

	const canEdit = source === 'custom' || source === 'imported'

	return (
		<>
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={`${name} — ${description}（在新标签页中打开）`}
				className={[
					'card-interactive group relative flex flex-col gap-2 p-3',
					'no-underline text-foreground no-tap-highlight',
					'focus-visible:outline-none focus-visible:ring-2',
					'focus-visible:ring-primary focus-visible:ring-offset-2',
					className,
				]
					.filter(Boolean)
					.join(' ')}
				onContextMenu={onContextMenu}
				onTouchStart={onTouchStart}
				onTouchEnd={onTouchEnd}
				onTouchMove={onTouchMove}
			>
				{/* 图标 + 名称行 */}
				<div className="flex items-center gap-2.5">
					<SiteIcon name={name} iconUrl={iconUrl} />

					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-1.5 min-w-0">
							<h3 className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-100 leading-snug">
								{highlightText(name, searchQuery)}
							</h3>
							{/* hover 时出现外链图标 */}
							<span className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity duration-100">
								<ExternalLinkIcon size={10} />
							</span>
						</div>
						{/* 置顶 + 来源标记 */}
						{(pinned || source === 'imported' || source === 'custom') && (
							<div className="flex items-center gap-1 mt-0.5">
								{pinned && (
									<span className="inline-flex items-center gap-0.5 text-[10px] text-primary leading-none">
										<PinIcon size={9} />
									</span>
								)}
								<SourceBadge source={source} />
							</div>
						)}
					</div>

					{/* Hover 时的快捷操作区 */}
					<div
						className="
							shrink-0 flex items-center gap-0.5
							opacity-0 group-hover:opacity-100
							transition-opacity duration-100
						"
						onClick={(e) => e.preventDefault()}
					>
						{/* 复制链接 */}
						<QuickAction
							icon={
								copied ? (
									<svg
										width="12"
										height="12"
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
								) : (
									<CopyIcon size={12} />
								)
							}
							label={copied ? '已复制' : '复制链接'}
							onClick={handleCopy}
						/>

						{/* 编辑（仅 custom / imported） */}
						{onEdit && canEdit && (
							<QuickAction
								icon={<EditIcon size={12} />}
								label="编辑"
								onClick={handleEdit}
							/>
						)}

						{/* 置顶切换 */}
						{onTogglePin && (
							<QuickAction
								icon={
									pinned ? <PinOffIcon size={12} /> : <PinIcon size={12} />
								}
								label={pinned ? '取消置顶' : '置顶'}
								onClick={handleTogglePin}
							/>
						)}
					</div>
				</div>

				{/* 描述 */}
				<p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
					{highlightText(description, searchQuery)}
				</p>

				{/* 分类标签 */}
				<div className="mt-auto flex items-center justify-between pt-0.5">
					<Badge variant="primary">{category}</Badge>
				</div>
			</a>

			{/* 右键上下文菜单 */}
			{menuState.open && contextActions.length > 0 && (
				<ContextMenu
					x={menuState.x}
					y={menuState.y}
					actions={contextActions}
					onClose={closeMenu}
				/>
			)}
		</>
	)
}
