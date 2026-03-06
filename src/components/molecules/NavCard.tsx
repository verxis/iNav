import { useCallback, useState } from 'react'
import { Badge } from '@/components/atoms/Badge'
import {
	CopyIcon,
	EditIcon,
	ExternalLinkIcon,
	PinIcon,
	PinOffIcon,
	TrashIcon,
} from '@/components/atoms/Icons'
import {
	buildSiteActions,
	ContextMenu,
	useContextMenu,
} from '@/components/molecules/ContextMenu'
import { ALLOW_HIDE_BUILTIN } from '@/config/features'
import type { SiteCardProps } from '@/types'

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
	return (
		AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]
	)
}

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

interface SiteIconProps {
	name: string
	iconUrl?: string
	size?: 'sm' | 'md'
}

function SiteIcon({ name, iconUrl, size = 'md' }: SiteIconProps) {
	const [imgOk, setImgOk] = useState(false)

	const initial = [...name][0]?.toUpperCase() ?? '?'
	const style = getAvatarStyle(name)
	const dim = size === 'md' ? 'h-8 w-8' : 'h-6 w-6'
	const textSize = size === 'md' ? 'text-sm' : 'text-xs'
	const px = size === 'md' ? 32 : 24

	const avatar = (
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

	if (!iconUrl) return avatar

	return (
		<div className={`${dim} relative shrink-0`}>
			{!imgOk && (
				<div
					className={[
						'absolute inset-0 flex items-center justify-center rounded-lg select-none',
						style.bg,
						style.text,
						textSize,
						'font-semibold',
					].join(' ')}
					aria-hidden="true"
				>
					{initial}
				</div>
			)}
			<img
				key={iconUrl}
				src={iconUrl}
				alt=""
				width={px}
				height={px}
				className={[
					'w-full h-full rounded-lg object-contain',
					'transition-opacity duration-150',
					imgOk ? 'opacity-100' : 'opacity-0',
				].join(' ')}
				onLoad={() => setImgOk(true)}
				onError={() => setImgOk(false)}
				loading="eager"
				decoding="async"
			/>
		</div>
	)
}

function SourceBadge({ source }: { source?: string }) {
	if (source === 'imported') {
		return (
			<span className="badge badge-warning text-[10px] px-1.5 py-0.5 leading-none">
				导入
			</span>
		)
	}
	if (source === 'custom') {
		// 绿色小草芽图标，代表「用户种下的站点」
		return (
			<span
				className="inline-flex items-center gap-0.5 text-[10px] leading-none"
				style={{ color: '#22c55e' }}
				title="自定义站点"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="10"
					height="10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					{/* 茎 */}
					<path d="M12 22V12" />
					{/* 左叶 */}
					<path d="M12 12C12 12 7 10 5 6c3 0 6 2 7 6z" />
					{/* 右叶 */}
					<path d="M12 12C12 12 17 10 19 6c-3 0-6 2-7 6z" />
				</svg>
			</span>
		)
	}
	return null
}

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

export function NavCard({
	site,
	className = '',
	searchQuery = '',
	rank,
	onEdit,
	onDelete,
	onTogglePin,
}: SiteCardProps) {
	const { name, url, description, iconUrl, category, pinned, source } = site

	const [copied, setCopied] = useState(false)

	const {
		menuState,
		onContextMenu,
		onTouchStart,
		onTouchEnd,
		onTouchMove,
		closeMenu,
	} = useContextMenu()

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

	const handleEdit = useCallback(
		(e?: React.MouseEvent) => {
			e?.preventDefault()
			e?.stopPropagation()
			onEdit?.(site)
		},
		[site, onEdit],
	)

	const handleDelete = useCallback(
		(e?: React.MouseEvent) => {
			e?.preventDefault()
			e?.stopPropagation()
			onDelete?.(site)
		},
		[site, onDelete],
	)

	const handleTogglePin = useCallback(
		(e?: React.MouseEvent) => {
			e?.preventDefault()
			e?.stopPropagation()
			onTogglePin?.(site)
		},
		[site, onTogglePin],
	)

	const canEdit = source === 'custom' || source === 'imported'
	const isBuiltin = source === 'builtin'

	const contextActions = buildSiteActions(
		{ url, pinned, source },
		{
			onOpen: () => window.open(url, '_blank', 'noopener,noreferrer'),
			onCopyUrl: () => handleCopy(),
			onEdit: onEdit && canEdit ? () => handleEdit() : undefined,
			// builtin 站点不在右键菜单中提供 pin
			onTogglePin:
				onTogglePin && !isBuiltin ? () => handleTogglePin() : undefined,
			// builtin 站点：右键菜单提供"本地隐藏"；custom/imported：右键菜单提供"删除"
			onDelete: onDelete
				? isBuiltin && ALLOW_HIDE_BUILTIN
					? () => handleDelete()
					: canEdit
						? () => handleDelete()
						: undefined
				: undefined,
		},
	)

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
				<div className="flex items-center gap-2.5">
					<SiteIcon name={name} iconUrl={iconUrl} />

					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-1.5 min-w-0">
							<span className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-100 leading-snug">
								{highlightText(name, searchQuery)}
							</span>
							<span className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity duration-100">
								<ExternalLinkIcon size={10} />
							</span>
						</div>
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

					<div
						className="
							shrink-0 flex items-center gap-0.5
							opacity-0 group-hover:opacity-100
							transition-opacity duration-100
						"
						onClick={(e) => e.preventDefault()}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
						}}
						role="toolbar"
						aria-label="快捷操作"
					>
						{/* builtin：复制 + 隐藏 */}
						{isBuiltin && (
							<>
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

								{onDelete && ALLOW_HIDE_BUILTIN && (
									<QuickAction
										icon={<TrashIcon size={12} />}
										label="本地隐藏"
										onClick={handleDelete}
										destructive
									/>
								)}
							</>
						)}

						{/* custom / imported：复制 + 编辑 + pin */}
						{!isBuiltin && (
							<>
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

								{onEdit && canEdit && (
									<QuickAction
										icon={<EditIcon size={12} />}
										label="编辑"
										onClick={handleEdit}
									/>
								)}

								{onTogglePin && (
									<QuickAction
										icon={
											pinned ? <PinOffIcon size={12} /> : <PinIcon size={12} />
										}
										label={pinned ? '取消置顶' : '置顶'}
										onClick={handleTogglePin}
									/>
								)}
							</>
						)}
					</div>
				</div>

				<p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
					{highlightText(description, searchQuery)}
				</p>

				<div className="mt-auto flex items-center justify-between pt-0.5">
					<Badge variant="primary" className="badge-desktop-md">
						{category}
					</Badge>
					{rank !== undefined && (
						<span
							className="
								inline-flex items-center justify-center
								h-4 min-w-4 px-1
								rounded text-[10px] font-semibold tabular-nums leading-none
								bg-muted text-muted-foreground
								border border-border
								select-none
							"
							title={`Ctrl+${rank} 打开`}
						>
							{rank}
						</span>
					)}
				</div>
			</a>

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
