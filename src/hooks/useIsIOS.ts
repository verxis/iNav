import { useMemo } from 'react'

/**
 * Detects iOS (iPhone / iPad / iPod) via UA and platform.
 * Uses a stable memo so it's computed once per component mount.
 */
export function useIsIOS(): boolean {
	return useMemo(() => {
		if (typeof navigator === 'undefined') return false
		// iPadOS 13+ reports as MacIntel but supports touch
		const isMacLikeTouchable =
			navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
		return /iPhone|iPad|iPod/i.test(navigator.userAgent) || isMacLikeTouchable
	}, [])
}
