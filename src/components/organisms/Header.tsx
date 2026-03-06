import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router'
import { Button } from '@/components/atoms/Button'
import {
	CommandIcon,
	GitHubIcon,
	InfoIcon,
	MoonIcon,
	NavLogoIcon,
	PlusIcon,
	SunIcon,
} from '@/components/atoms/Icons'
import { SearchBar } from '@/components/molecules/SearchBar'
import { useTheme } from '@/hooks/useTheme'

/* ============================================================
   Header
   - 左：Logo（NavLink 跳首页）
   - 中：搜索框（flex-1）
   - 右：⌘K 命令面板 | 布局切换 | 添加站点 | 主题 | 信息面板
   ============================================================ */

// ---- 主题切换 ----

function ThemeToggle() {
	const { isDark, toggleTheme } = useTheme()
	return (
		<Button
			variant="icon"
			size="md"
			onClick={toggleTheme}
			aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
			aria-pressed={isDark}
		>
			<span
				className="relative flex items-center justify-center"
				style={{ width: 16, height: 16 }}
			>
				<span
					className="absolute inset-0 flex items-center justify-center transition-all duration-300"
					style={{
						opacity: isDark ? 0 : 1,
						transform: isDark
							? 'rotate(-90deg) scale(0.5)'
							: 'rotate(0deg) scale(1)',
					}}
				>
					<SunIcon size={16} />
				</span>
				<span
					className="absolute inset-0 flex items-center justify-center transition-all duration-300"
					style={{
						opacity: isDark ? 1 : 0,
						transform: isDark
							? 'rotate(0deg) scale(1)'
							: 'rotate(90deg) scale(0.5)',
					}}
				>
					<MoonIcon size={16} />
				</span>
			</span>
		</Button>
	)
}

// ---- 信息气泡 ----

interface InfoPopoverProps {
	siteCount: number
}

function InfoPopover({ siteCount }: InfoPopoverProps) {
	const [open, setOpen] = useState(false)
	const [time, setTime] = useState(() => new Date())
	const ref = useRef<HTMLDivElement>(null)

	// 每秒更新时间
	useEffect(() => {
		const id = setInterval(() => setTime(new Date()), 1000)
		return () => clearInterval(id)
	}, [])

	// 点击外部关闭
	useEffect(() => {
		if (!open) return
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [open])

	const hours = time.getHours().toString().padStart(2, '0')
	const minutes = time.getMinutes().toString().padStart(2, '0')
	const seconds = time.getSeconds().toString().padStart(2, '0')
	const dateStr = time.toLocaleDateString('zh-CN', {
		month: 'long',
		day: 'numeric',
		weekday: 'short',
	})

	return (
		<div ref={ref} className="relative">
			<Button
				variant="icon"
				size="md"
				onClick={() => setOpen((v) => !v)}
				aria-label="显示信息面板"
				aria-expanded={open}
			>
				<InfoIcon size={16} />
			</Button>

			{open && (
				<div
					className="
						absolute right-0 top-full mt-2 z-50
						w-52
						popover
						animate-in
					"
					role="dialog"
					aria-label="信息面板"
				>
					{/* 时间 */}
					<div className="px-4 py-3 border-b border-border">
						<div className="font-mono text-xl font-semibold text-foreground tabular-nums tracking-tight">
							{hours}:{minutes}:{seconds}
						</div>
						<div className="text-xs text-muted-foreground mt-0.5">
							{dateStr}
						</div>
					</div>

					{/* 站点数量 */}
					<div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
						<span className="text-xs text-muted-foreground">收录站点</span>
						<span className="text-sm font-semibold text-foreground tabular-nums">
							{siteCount}
						</span>
					</div>

					{/* 快捷键说明 */}
					<div className="px-4 py-2.5 border-b border-border space-y-1.5">
						<div className="flex items-center justify-between">
							<span className="text-[11px] text-muted-foreground">
								命令面板
							</span>
							<div className="flex items-center gap-0.5">
								<kbd className="kbd">⌘</kbd>
								<kbd className="kbd">K</kbd>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-[11px] text-muted-foreground">
								聚焦搜索
							</span>
							<span className="text-[11px] text-muted-foreground">任意键</span>
						</div>
					</div>

					{/* GitHub 链接 */}
					<a
						href="https://github.com/dogxii/inav"
						target="_blank"
						rel="noopener noreferrer"
						className="
							flex items-center gap-2
							px-4 py-2.5
							text-xs text-muted-foreground
							hover:bg-muted hover:text-foreground
							transition-colors duration-100
							no-underline
						"
					>
						<GitHubIcon size={13} />
						<span>查看源码</span>
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
							className="ml-auto opacity-40"
							aria-hidden="true"
						>
							<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
							<polyline points="15 3 21 3 21 9" />
							<line x1="10" y1="14" x2="21" y2="3" />
						</svg>
					</a>
				</div>
			)}
		</div>
	)
}

// ---- Logo ----

function Logo() {
	return (
		<div className="flex items-center gap-2 shrink-0">
			<NavLogoIcon size={26} />
			<div>
				<p className="text-sm font-bold text-foreground leading-none tracking-tight">
					iNav
				</p>
				<p className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">
					快速导航站
				</p>
			</div>
		</div>
	)
}

// ---- ⌘K 命令面板触发按钮 ----

interface CmdKButtonProps {
	onClick: () => void
}

function CmdKButton({ onClick }: CmdKButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label="打开命令面板 (⌘K)"
			className="
				hidden sm:flex items-center gap-1.5
				h-9 px-2.5
				rounded-lg border border-border
				text-xs text-muted-foreground
				bg-surface
				hover:bg-muted hover:text-foreground hover:border-primary/30
				transition-all duration-100
				focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
				shrink-0
			"
		>
			<CommandIcon size={13} />
			<span className="hidden md:inline">命令面板</span>
			<div className="flex items-center gap-0.5 ml-0.5">
				<kbd className="kbd">⌘K</kbd>
			</div>
		</button>
	)
}

// ---- Header Props ----

export interface HeaderProps {
	searchValue: string
	onSearchChange: (v: string) => void
	searchInputRef: React.RefObject<HTMLInputElement | null>
	siteCount: number
	onOpenCommandPalette: () => void
	onAddSite?: () => void
	/** 点击 Logo 时重置搜索词和分类筛选 */
	onReset: () => void
}

// ---- Header 主组件 ----

export function Header({
	searchValue,
	onSearchChange,
	searchInputRef,
	siteCount,
	onOpenCommandPalette,
	onAddSite,
	onReset,
}: HeaderProps) {
	return (
		<header className="sticky top-0 z-50 glass border-b border-border">
			<div className="w-full flex items-center gap-2 h-12 px-4 sm:px-6">
				{/* 左：Logo — 点击重置搜索和分类 */}
				<NavLink
					to="/"
					onClick={onReset}
					className="text-foreground no-underline shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
					aria-label="iNav 首页，点击清除搜索"
				>
					<Logo />
				</NavLink>

				{/* 中：搜索框（flex-1） */}
				<div className="flex-1 min-w-0 mx-2">
					<SearchBar
						value={searchValue}
						onChange={onSearchChange}
						inputRef={searchInputRef}
						placeholder="搜索站点..."
					/>
				</div>

				{/* 右：工具区 */}
				<div className="flex items-center gap-1 shrink-0">
					{/* ⌘K 命令面板 */}
					<CmdKButton onClick={onOpenCommandPalette} />

					{/* 分割线 */}
					<div
						className="hidden sm:block h-5 w-px bg-border mx-0.5"
						aria-hidden="true"
					/>

					{/* 添加站点（仅 ALLOW_CUSTOM_SITES 时显示） */}
					{onAddSite && (
						<Button
							variant="primary"
							size="sm"
							onClick={onAddSite}
							aria-label="添加站点"
							className="gap-1.5"
						>
							<PlusIcon size={14} />
							<span className="hidden sm:inline">添加</span>
						</Button>
					)}

					{/* 分割线 */}
					<div className="h-5 w-px bg-border mx-0.5" aria-hidden="true" />

					{/* 主题切换 */}
					<ThemeToggle />

					{/* 信息面板 */}
					<InfoPopover siteCount={siteCount} />
				</div>
			</div>
		</header>
	)
}
