import { useCallback, useMemo, useState } from 'react'
import {
	DEFAULT_SEARCH_ENGINES,
	type SearchEngineConfig,
} from '@/components/molecules/SearchBar'

/* ============================================================
   useEngineOrder
   管理搜索引擎的「顺序」与「启用状态」，持久化到 localStorage。

   存储格式（STORAGE_KEY）：
   [{ id, enabled }, ...]   — 仅存顺序和启用状态，不存搜索 URL
   这样若默认引擎信息（名称 / URL）在代码里更新，用户依然能拿到最新值。
   ============================================================ */

const STORAGE_KEY = 'inav:engine-order'

interface StoredItem {
	id: string
	enabled: boolean
}

// ---- 从 localStorage 读取并合并到 DEFAULT_SEARCH_ENGINES ----

function loadEngines(): SearchEngineConfig[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return DEFAULT_SEARCH_ENGINES

		const stored: StoredItem[] = JSON.parse(raw)

		// 按存储顺序重排，同时合并最新的默认引擎数据
		const ordered: SearchEngineConfig[] = []
		for (const item of stored) {
			const base = DEFAULT_SEARCH_ENGINES.find((e) => e.id === item.id)
			if (base) {
				ordered.push({ ...base, enabled: item.enabled })
			}
		}

		// 把存储里没有的新引擎追加到末尾（代码新增了引擎时自动出现）
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
		const stored: StoredItem[] = engines.map((e) => ({
			id: e.id,
			enabled: e.enabled,
		}))
		localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
	} catch {
		// localStorage 不可用时静默失败
	}
}

// ---- Hook ----

export interface UseEngineOrderReturn {
	/** 所有引擎（含禁用的），按用户排序 */
	engines: SearchEngineConfig[]
	/** 仅启用的引擎，供 NavGrid 渲染卡片 */
	enabledEngines: SearchEngineConfig[]
	/** 切换某个引擎的启用状态 */
	toggleEngine: (id: string) => void
	/** 将 fromIndex 的引擎移动到 toIndex */
	moveEngine: (fromIndex: number, toIndex: number) => void
	/** 恢复默认顺序和全部启用 */
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
			// 至少保留 1 个启用，避免全部禁用后搜索卡片消失
			const next = engines.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
			const enabledCount = next.filter((e) => e.enabled).length
			if (enabledCount === 0) return // 禁止全部禁用
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
		try {
			localStorage.removeItem(STORAGE_KEY)
		} catch {
			// ignore
		}
		persist(DEFAULT_SEARCH_ENGINES.map((e) => ({ ...e, enabled: true })))
	}, [persist])

	const enabledEngines = useMemo(
		() => engines.filter((e) => e.enabled),
		[engines],
	)

	return { engines, enabledEngines, toggleEngine, moveEngine, resetToDefault }
}
