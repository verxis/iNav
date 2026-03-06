import { useCallback, useMemo, useState } from 'react'
import {
	DEFAULT_SEARCH_ENGINES,
	type SearchEngineConfig,
} from '@/components/molecules/SearchBar'

const STORAGE_KEY = 'inav:engine-order'

interface StoredItem {
	id: string
	enabled: boolean
}

function loadEngines(): SearchEngineConfig[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return DEFAULT_SEARCH_ENGINES

		const stored: StoredItem[] = JSON.parse(raw)

		const ordered: SearchEngineConfig[] = []
		for (const item of stored) {
			const base = DEFAULT_SEARCH_ENGINES.find((e) => e.id === item.id)
			if (base) ordered.push({ ...base, enabled: item.enabled })
		}

		// 新增引擎追加到末尾
		for (const base of DEFAULT_SEARCH_ENGINES) {
			if (!ordered.find((e) => e.id === base.id)) {
				ordered.push({ ...base, enabled: true })
			}
		}

		return ordered
	} catch {
		return DEFAULT_SEARCH_ENGINES
	}
}

function saveEngines(engines: SearchEngineConfig[]) {
	try {
		const stored: StoredItem[] = engines.map((e) => ({ id: e.id, enabled: e.enabled }))
		localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
	} catch {}
}

export interface UseEngineOrderReturn {
	engines: SearchEngineConfig[]
	enabledEngines: SearchEngineConfig[]
	toggleEngine: (id: string) => void
	moveEngine: (fromIndex: number, toIndex: number) => void
	resetToDefault: () => void
}

export function useEngineOrder(): UseEngineOrderReturn {
	const [engines, setEngines] = useState<SearchEngineConfig[]>(loadEngines)

	const persist = useCallback((next: SearchEngineConfig[]) => {
		setEngines(next)
		saveEngines(next)
	}, [])

	const toggleEngine = useCallback(
		(id: string) => {
			const next = engines.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
			// 至少保留 1 个启用
			if (next.filter((e) => e.enabled).length === 0) return
			persist(next)
		},
		[engines, persist],
	)

	const moveEngine = useCallback(
		(fromIndex: number, toIndex: number) => {
			if (fromIndex === toIndex) return
			if (fromIndex < 0 || toIndex < 0) return
			if (fromIndex >= engines.length || toIndex >= engines.length) return

			const next = [...engines]
			const [moved] = next.splice(fromIndex, 1)
			if (moved) next.splice(toIndex, 0, moved)
			persist(next)
		},
		[engines, persist],
	)

	const resetToDefault = useCallback(() => {
		try { localStorage.removeItem(STORAGE_KEY) } catch {}
		persist(DEFAULT_SEARCH_ENGINES.map((e) => ({ ...e, enabled: true })))
	}, [persist])

	const enabledEngines = useMemo(() => engines.filter((e) => e.enabled), [engines])

	return { engines, enabledEngines, toggleEngine, moveEngine, resetToDefault }
}
