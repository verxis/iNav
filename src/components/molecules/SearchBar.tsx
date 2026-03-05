import { useCallback, useEffect, useRef, useState } from 'react'
import { Input } from '@/components/atoms/Input'
import type { SearchBarProps, SearchEngine } from '@/types'

/* ---- 默认搜索引擎 ---- */

export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
	{
		id: 'google',
		name: 'Google',
		searchUrl: 'https://www.google.com/search?q={q}',
		iconUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
	},
	{
		id: 'bing',
		name: 'Bing',
		searchUrl: 'https://www.bing.com/search?q={q}',
		iconUrl: 'https://www.google.com/s2/favicons?domain=bing.com&sz=32',
	},
	{
		id: 'duckduckgo',
		name: 'DuckDuckGo',
		searchUrl: 'https://duckduckgo.com/?q={q}',
		iconUrl: 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=32',
	},
	{
		id: 'github-search',
		name: 'GitHub',
		searchUrl: 'https://github.com/search?q={q}',
		iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=32',
	},
]

/* ---- 图标 ---- */

function SearchIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
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
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.35-4.35" />
		</svg>
	)
}

function ClearIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
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
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	)
}

function ExternalIcon() {
	return (
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
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
			<polyline points="15 3 21 3 21 9" />
			<line x1="10" y1="14" x2="21" y2="3" />
		</svg>
	)
}

/* ---- 搜索引擎图标（带 fallback） ---- */

function EngineIcon({ engine }: { engine: SearchEngine }) {
	const [err, setErr] = useState(false)

	if (!engine.iconUrl || err) {
		return (
			<span className="h-4 w-4 shrink-0 flex items-center justify-center rounded-sm bg-muted text-muted-foreground text-[10px] font-bold">
				{engine.name[0]}
			</span>
		)
	}

	return (
		<img
			src={engine.iconUrl}
			alt=""
			width={16}
			height={16}
			className="h-4 w-4 shrink-0 rounded-sm object-contain"
			onError={() => setErr(true)}
			loading="eager"
			decoding="async"
		/>
	)
}

/* ---- 搜索引擎下拉 ---- */

interface EngineDropdownProps {
	query: string
	engines: SearchEngine[]
	focusedIndex: number
	onClose: () => void
}

function EngineDropdown({
	query,
	engines,
	focusedIndex,
	onClose,
}: EngineDropdownProps) {
	function buildUrl(engine: SearchEngine): string {
		return engine.searchUrl.replace('{q}', encodeURIComponent(query.trim()))
	}

	return (
		<div
			className="absolute left-0 right-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg overflow-hidden animate-in"
			role="menu"
			aria-label="在搜索引擎中搜索"
		>
			<div className="px-3 py-1.5 border-b border-border">
				<span className="text-[11px] text-muted-foreground">
					在以下引擎中搜索
					<span className="ml-1 font-medium text-foreground">
						&ldquo;{query.trim()}&rdquo;
					</span>
				</span>
			</div>
			{engines.map((engine, i) => (
				<a
					key={engine.id}
					href={buildUrl(engine)}
					target="_blank"
					rel="noopener noreferrer"
					role="menuitem"
					data-focused={i === focusedIndex ? 'true' : undefined}
					onClick={onClose}
					className={[
						'flex items-center gap-2.5 px-3 py-2',
						'text-xs text-foreground no-underline',
						'transition-colors duration-75',
						i === focusedIndex ? 'bg-muted' : 'hover:bg-muted',
					].join(' ')}
				>
					<EngineIcon engine={engine} />
					<span className="font-medium">{engine.name}</span>
					<span className="ml-auto text-muted-foreground shrink-0">
						<ExternalIcon />
					</span>
				</a>
			))}
		</div>
	)
}

/* ---- 主组件 ---- */

export function SearchBar({
	value,
	onChange,
	placeholder = '搜索站点...',
	inputRef,
	searchEngines = DEFAULT_SEARCH_ENGINES,
}: SearchBarProps) {
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const [focusedEngineIndex, setFocusedEngineIndex] = useState(0)
	const containerRef = useRef<HTMLDivElement>(null)
	const showDropdown =
		dropdownOpen && value.trim().length > 0 && searchEngines.length > 0

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(e.target.value)
			// 有输入内容时自动打开下拉
			if (e.target.value.trim()) {
				setDropdownOpen(true)
				setFocusedEngineIndex(0)
			} else {
				setDropdownOpen(false)
			}
		},
		[onChange],
	)

	const handleClear = useCallback(() => {
		onChange('')
		setDropdownOpen(false)
		requestAnimationFrame(() => {
			inputRef?.current?.focus()
		})
	}, [onChange, inputRef])

	// 键盘导航：Tab / 方向键在引擎间切换，Esc 关闭下拉
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (!showDropdown) return

			if (e.key === 'ArrowDown') {
				e.preventDefault()
				setFocusedEngineIndex((i) => (i + 1) % searchEngines.length)
			} else if (e.key === 'ArrowUp') {
				e.preventDefault()
				setFocusedEngineIndex(
					(i) => (i - 1 + searchEngines.length) % searchEngines.length,
				)
			} else if (e.key === 'Escape') {
				setDropdownOpen(false)
			} else if (e.key === 'Enter') {
				// Enter 时跳转到当前高亮引擎
				const engine = searchEngines[focusedEngineIndex]
				if (engine) {
					const url = engine.searchUrl.replace(
						'{q}',
						encodeURIComponent(value.trim()),
					)
					window.open(url, '_blank', 'noopener,noreferrer')
					setDropdownOpen(false)
				}
			}
		},
		[showDropdown, searchEngines, focusedEngineIndex, value],
	)

	// 点击外部关闭下拉
	useEffect(() => {
		if (!dropdownOpen) return
		const handler = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setDropdownOpen(false)
			}
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [dropdownOpen])

	const handleFocus = useCallback(() => {
		if (value.trim()) {
			setDropdownOpen(true)
		}
	}, [value])

	return (
		<div ref={containerRef} className="relative w-full">
			<search className="w-full">
				<label htmlFor="site-search" className="sr-only">
					搜索导航站
				</label>
				<Input
					ref={inputRef}
					id="site-search"
					type="search"
					value={value}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					onFocus={handleFocus}
					placeholder={placeholder}
					autoComplete="off"
					leftIcon={<SearchIcon />}
					rightIcon={
						value ? (
							<button
								type="button"
								onClick={handleClear}
								aria-label="清除搜索内容"
								className="flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
							>
								<ClearIcon />
							</button>
						) : null
					}
				/>
			</search>

			{showDropdown && (
				<EngineDropdown
					query={value}
					engines={searchEngines}
					focusedIndex={focusedEngineIndex}
					onClose={() => setDropdownOpen(false)}
				/>
			)}
		</div>
	)
}
