import { useCallback, useEffect, useState } from 'react'
import type { ThemeMode, UseThemeReturn } from '@/types'

const STORAGE_KEY = 'inav-theme'

function getSystemTheme(): 'light' | 'dark' {
	if (typeof window === 'undefined') return 'light'
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
	if (mode === 'system') return getSystemTheme()
	return mode
}

function applyThemeToDom(resolved: 'light' | 'dark'): void {
	const root = document.documentElement
	root.dataset.theme = resolved
	root.style.colorScheme = resolved
}

function getStoredMode(): ThemeMode | null {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
		return null
	} catch {
		return null
	}
}

// system 模式清除存储，让 index.html 内联脚本 fallback 到 OS 偏好
function saveMode(mode: ThemeMode): void {
	try {
		if (mode === 'system') {
			localStorage.removeItem(STORAGE_KEY)
		} else {
			localStorage.setItem(STORAGE_KEY, mode)
		}
	} catch {}
}

export function useTheme(): UseThemeReturn {
	const [mode, setModeState] = useState<ThemeMode>(() => getStoredMode() ?? 'system')

	const resolvedTheme = resolveTheme(mode)

	// system 模式下监听 OS 深色模式变化
	useEffect(() => {
		if (mode !== 'system') return
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleChange = () => {
			applyThemeToDom(getSystemTheme())
			setModeState('system')
		}
		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [mode])

	useEffect(() => {
		applyThemeToDom(resolveTheme(mode))
		saveMode(mode)
	}, [mode])

	const setTheme = useCallback((newMode: ThemeMode) => {
		setModeState(newMode)
	}, [])

	const toggleTheme = useCallback(() => {
		setModeState((prevMode) => {
			const prevResolved = resolveTheme(prevMode)
			return prevResolved === 'dark' ? 'light' : 'dark'
		})
	}, [])

	return {
		mode,
		resolvedTheme,
		isDark: resolvedTheme === 'dark',
		setTheme,
		toggleTheme,
	}
}
