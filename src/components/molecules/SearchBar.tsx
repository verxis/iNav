import { useCallback } from 'react'
import { Input } from '@/components/atoms/Input'
import type { SearchBarProps } from '@/types'

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

/* ---- 默认搜索引擎（供外部 NavGrid / Home 使用） ---- */

export interface SearchEngineConfig {
	id: string
	name: string
	searchUrl: string
	iconUrl: string
	/** 是否在搜索卡片中显示，默认 true */
	enabled: boolean
}

export const DEFAULT_SEARCH_ENGINES: SearchEngineConfig[] = [
	{
		id: 'google',
		name: 'Google',
		searchUrl: 'https://www.google.com/search?q={q}',
		iconUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
		enabled: true,
	},
	{
		id: 'bing',
		name: 'Bing',
		searchUrl: 'https://www.bing.com/search?q={q}',
		iconUrl: 'https://www.google.com/s2/favicons?domain=bing.com&sz=32',
		enabled: true,
	},
	{
		id: 'duckduckgo',
		name: 'DuckDuckGo',
		searchUrl: 'https://duckduckgo.com/?q={q}',
		iconUrl: 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=32',
		enabled: true,
	},
	{
		id: 'github-search',
		name: 'GitHub',
		searchUrl: 'https://github.com/search?q={q}',
		iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=32',
		enabled: true,
	},
]

/* ---- 主组件 ---- */

export function SearchBar({
	value,
	onChange,
	placeholder = '搜索站点...',
	inputRef,
}: SearchBarProps) {
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(e.target.value)
		},
		[onChange],
	)

	const handleClear = useCallback(() => {
		onChange('')
		requestAnimationFrame(() => {
			inputRef?.current?.focus()
		})
	}, [onChange, inputRef])

	return (
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
	)
}
