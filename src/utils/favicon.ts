const PROXY_BASE = 'https://ico.dogxi.me/icon'

export function extractDomain(url: string): string {
	try {
		return new URL(url).hostname
	} catch {
		return ''
	}
}

/** 生成 favicon URL，经由 ico.dogxi.me 代理获取 Google 图标 */
export function getFaviconUrl(urlOrDomain: string): string | undefined {
	const domain = urlOrDomain.includes('://')
		? extractDomain(urlOrDomain)
		: urlOrDomain.trim()

	if (!domain) return undefined

	return `${PROXY_BASE}?domain=${domain}`
}
