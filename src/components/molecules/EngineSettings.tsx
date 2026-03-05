import { useCallback, useRef, useState } from 'react'
import type { UseEngineOrderReturn } from '@/hooks/useEngineOrder'
import type { SearchEngineConfig } from '@/components/molecules/SearchBar'

/* ============================================================
   EngineSettings
   搜索引擎设置面板
   - 开关：启用 / 禁用某个引擎
   - 拖拽：上下拖动调整展示顺序
   - 重置：恢复默认
   ============================================================ */

// ---- 图标 ----

function GripIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<circle cx="9" cy="5" r="1" fill="currentColor" stroke="none" />
			<circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
			<circle cx="9" cy="19" r="1" fill="currentColor" stroke="none" />
			<circle cx="15" cy="5" r="1" fill="currentColor" stroke="none" />
			<circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
			<circle cx="15" cy="19" r="1" fill="currentColor" stroke="none" />
		</svg>
	)
}

function ResetIcon() {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
			<path d="M3 3v5h5" />
		</svg>
	)
}

function SettingsIcon() {
	return (
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	)
}

// ---- 引擎图标（带 fallback） ----

function EngineIcon({ engine }: { engine: SearchEngineConfig }) {
	const [err, setErr] = useState(false)
	if (!engine.iconUrl || err) {
		return (
			<span className="h-5 w-5 shrink-0 flex items-center justify-center rounded bg-muted text-muted-foreground text-[10px] font-bold select-none">
				{engine.name[0]}
			</span>
		)
	}
	return (
		<img
			src={engine.iconUrl}
			alt=""
			width={20}
			height={20}
			className="h-5 w-5 shrink-0 rounded object-contain"
			onError={() => setErr(true)}
			loading="eager"
			decoding="async"
		/>
	)
}

// ---- Toggle 开关 ----

interface ToggleProps {
	checked: boolean
	onChange: () => void
	disabled?: boolean
	label: string
}

function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			disabled={disabled}
			onClick={onChange}
			title={disabled ? '至少保留一个搜索引擎' : undefined}
			className={[
				'relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full',
				'transition-colors duration-200',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
				disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
				checked ? 'bg-primary' : 'bg-muted-foreground/30',
			].join(' ')}
		>
			<span
				className={[
					'inline-block h-3 w-3 transform rounded-full bg-white shadow-sm',
					'transition-transform duration-200',
					checked ? 'translate-x-4' : 'translate-x-0.5',
				].join(' ')}
			/>
		</button>
	)
}

// ---- 单行引擎条目 ----

interface EngineRowProps {
	engine: SearchEngineConfig
	index: number
	isDragging: boolean
	isDragOver: boolean
	isLastEnabled: boolean
	onToggle: () => void
	onDragStart: (index: number) => void
	onDragEnter: (index: number) => void
	onDragEnd: () => void
}

function EngineRow({
	engine,
	index,
	isDragging,
	isDragOver,
	isLastEnabled,
	onToggle,
	onDragStart,
	onDragEnter,
	onDragEnd,
}: EngineRowProps) {
	return (
		<div
			draggable
			onDragStart={() => onDragStart(index)}
			onDragEnter={() => onDragEnter(index)}
			onDragEnd={onDragEnd}
			onDragOver={(e) => e.preventDefault()}
			aria-label={`${engine.name}，拖拽以重新排序`}
			className={[
				'flex items-center gap-2.5 px-3 py-2.5 rounded-lg',
				'transition-all duration-100 select-none',
				'border',
				isDragOver
					? 'border-primary bg-primary/5 scale-[0.99]'
					: 'border-transparent',
				isDragging
					? 'opacity-40'
					: 'opacity-100',
				!engine.enabled ? 'opacity-50' : '',
			].join(' ')}
		>
			{/* 拖拽手柄 */}
			<span className="text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors">
				<GripIcon />
			</span>

			{/* 引擎图标 */}
			<EngineIcon engine={engine} />

			{/* 名称 */}
			<span className="flex-1 text-xs font-medium text-foreground truncate">
				{engine.name}
			</span>

			{/* 启用开关 */}
			<Toggle
				checked={engine.enabled}
				onChange={onToggle}
				disabled={isLastEnabled && engine.enabled}
				label={`${engine.enabled ? '禁用' : '启用'} ${engine.name}`}
			/>
		</div>
	)
}

// ---- 主组件 ----

interface EngineSettingsProps {
	engineOrder: UseEngineOrderReturn
}

export function EngineSettings({ engineOrder }: EngineSettingsProps) {
	const { engines, enabledEngines, toggleEngine, moveEngine, resetToDefault } = engineOrder

	const [open, setOpen] = useState(false)
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
	const panelRef = useRef<HTMLDivElement>(null)

	// 点击外部关闭
	const handleDocClick = useCallback((e: MouseEvent) => {
		if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
			setOpen(false)
		}
	}, [])

	const openPanel = useCallback(() => {
		setOpen(true)
		setTimeout(() => {
			document.addEventListener('mousedown', handleDocClick)
		}, 0)
	}, [handleDocClick])

	const closePanel = useCallback(() => {
		setOpen(false)
		document.removeEventListener('mousedown', handleDocClick)
	}, [handleDocClick])

	const handleToggleOpen = useCallback(() => {
		if (open) closePanel()
		else openPanel()
	}, [open, openPanel, closePanel])

	// 拖拽处理
	const handleDragStart = useCallback((index: number) => {
		setDraggingIndex(index)
	}, [])

	const handleDragEnter = useCallback((index: number) => {
		setDragOverIndex(index)
	}, [])

	const handleDragEnd = useCallback(() => {
		if (draggingIndex !== null && dragOverIndex !== null && draggingIndex !== dragOverIndex) {
			moveEngine(draggingIndex, dragOverIndex)
		}
		setDraggingIndex(null)
		setDragOverIndex(null)
	}, [draggingIndex, dragOverIndex, moveEngine])

	const isLastEnabled = enabledEngines.length === 1

	return (
		<div ref={panelRef} className="relative">
			{/* 触发按钮 */}
			<button
				type="button"
				onClick={handleToggleOpen}
				aria-label="搜索引擎设置"
				aria-expanded={open}
				title="搜索引擎设置"
				className={[
					'flex items-center justify-center',
					'h-7 w-7 rounded-md',
					'text-muted-foreground transition-colors duration-100',
					'hover:text-foreground hover:bg-muted',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
					open ? 'text-foreground bg-muted' : '',
				].join(' ')}
			>
				<SettingsIcon />
			</button>

			{/* 下拉面板 */}
			{open && (
				<div
					className="
						absolute right-0 top-full mt-2 z-50
						w-56
						popover animate-in
					"
					role="dialog"
					aria-label="搜索引擎排序设置"
				>
					{/* 标题栏 */}
					<div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
						<span className="text-xs font-semibold text-foreground">搜索引擎</span>
						<button
							type="button"
							onClick={resetToDefault}
							title="恢复默认"
							className="
								flex items-center gap-1 text-[11px] text-muted-foreground
								hover:text-foreground transition-colors duration-100
								focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded
							"
						>
							<ResetIcon />
							重置
						</button>
					</div>

					{/* 说明 */}
					<p className="px-3 pt-2 pb-1 text-[11px] text-muted-foreground leading-relaxed">
						拖拽调整顺序，点击开关显示 / 隐藏
					</p>

					{/* 引擎列表 */}
					<div className="px-1.5 pb-2 space-y-0.5">
						{engines.map((engine, i) => (
							<EngineRow
								key={engine.id}
								engine={engine}
								index={i}
								isDragging={draggingIndex === i}
								isDragOver={dragOverIndex === i}
								isLastEnabled={isLastEnabled}
								onToggle={() => toggleEngine(engine.id)}
								onDragStart={handleDragStart}
								onDragEnter={handleDragEnter}
								onDragEnd={handleDragEnd}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
