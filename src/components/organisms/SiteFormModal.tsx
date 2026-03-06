import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/atoms/Button'
import {
	CheckIcon,
	GlobeIcon,
	RefreshIcon,
	XIcon,
} from '@/components/atoms/Icons'
import { SITE_CATEGORIES } from '@/data/categories'
import {
	type SitePayload,
	type ValidationError,
	validateSitePayload,
} from '@/hooks/useSiteManager'
import type { Site } from '@/types'
import { getFaviconUrl } from '@/utils/favicon'

/* ============================================================
   useFetchMeta
   通过 allorigins 代理抓取目标页面的 title / description。
   - 仅在添加模式下、URL 合法时触发
   - 500ms 防抖，避免频繁请求
   - 静默失败：网络错误或解析异常均不影响表单使用
   ============================================================ */

interface PageMeta {
	title: string
	description: string
}

async function fetchPageMeta(url: string): Promise<PageMeta | null> {
	try {
		// codetabs 代理：稳定、免费、无需 API Key
		const proxyUrl = `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`
		const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) })
		if (!res.ok) return null
		const html = await res.text()
		if (!html) return null

		const doc = new DOMParser().parseFromString(html, 'text/html')

		const title = doc.querySelector('title')?.textContent?.trim() ?? ''

		const description =
			doc
				.querySelector('meta[name="description"]')
				?.getAttribute('content')
				?.trim() ||
			doc
				.querySelector('meta[property="og:description"]')
				?.getAttribute('content')
				?.trim() ||
			doc
				.querySelector('meta[name="twitter:description"]')
				?.getAttribute('content')
				?.trim() ||
			''

		if (!title && !description) return null
		return { title, description }
	} catch {
		return null
	}
}

function isValidUrl(url: string): boolean {
	try {
		const u = new URL(url.trim())
		return u.protocol === 'http:' || u.protocol === 'https:'
	} catch {
		return false
	}
}

/* ============================================================
   SiteFormModal
   - 添加新站点 / 编辑已有站点
   - 实时表单验证
   - URL 输入后自动预填 favicon 预览
   - Esc 关闭，Enter 提交（非 textarea 时）
   ============================================================ */

// ---- favicon 预览（可点击编辑自定义 icon URL） ----

interface FaviconPreviewProps {
	siteUrl: string
	name: string
	customIconUrl: string
	onIconUrlChange: (url: string) => void
}

function FaviconPreview({
	siteUrl,
	name,
	customIconUrl,
	onIconUrlChange,
}: FaviconPreviewProps) {
	const [popoverOpen, setPopoverOpen] = useState(false)
	const [inputVal, setInputVal] = useState(customIconUrl)
	const [previewErr, setPreviewErr] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const popoverRef = useRef<HTMLDivElement>(null)

	// 派生实际显示的 icon URL：有自定义值用自定义，否则从 siteUrl 推断
	const autoIconUrl = (() => {
		try {
			const domain = new URL(siteUrl.trim()).hostname
			return domain ? (getFaviconUrl(domain) ?? '') : ''
		} catch {
			return ''
		}
	})()
	const displayUrl = customIconUrl || autoIconUrl

	// 打开 popover 时同步最新值并聚焦
	const openPopover = (e: React.MouseEvent) => {
		e.preventDefault()
		setInputVal(customIconUrl)
		setPreviewErr(false)
		setPopoverOpen(true)
		requestAnimationFrame(() => inputRef.current?.focus())
	}

	// 点击外部关闭
	useEffect(() => {
		if (!popoverOpen) return
		const handler = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node)
			) {
				setPopoverOpen(false)
			}
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [popoverOpen])

	const handleConfirm = () => {
		onIconUrlChange(inputVal.trim())
		setPopoverOpen(false)
	}

	const handleClear = () => {
		onIconUrlChange('')
		setInputVal('')
		setPopoverOpen(false)
	}

	// 图标内容（头像 or 图片）
	const [imgErr, setImgErr] = useState(false)
	// 当图标来源变化时重置错误状态；用稳定的 key 字符串触发，避免 lint 误报
	const iconSourceKey = `${customIconUrl}||${siteUrl}`
	// biome-ignore lint/correctness/useExhaustiveDependencies: iconSourceKey is intentionally used as a trigger
	useEffect(() => {
		setImgErr(false)
	}, [iconSourceKey])

	const iconContent =
		displayUrl && !imgErr ? (
			<img
				src={displayUrl}
				alt=""
				width={36}
				height={36}
				className="w-full h-full rounded-lg object-contain"
				onError={() => setImgErr(true)}
				loading="eager"
				decoding="async"
			/>
		) : (
			<span className="text-sm font-semibold text-muted-foreground select-none">
				{[...(name || '?')][0]?.toUpperCase() ?? '?'}
			</span>
		)

	return (
		<div className="relative shrink-0" ref={popoverRef}>
			{/* 可点击的图标按钮 */}
			<button
				type="button"
				onClick={openPopover}
				aria-label="自定义图标"
				title="点击自定义图标"
				className="
					group relative
					h-9 w-9 rounded-lg
					bg-muted border border-border
					flex items-center justify-center
					overflow-hidden
					hover:border-primary/50 hover:ring-2 hover:ring-primary/20
					transition-all duration-150
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
				"
			>
				{iconContent}
				{/* hover 遮罩提示 */}
				<span
					className="
					absolute inset-0 flex items-center justify-center
					bg-black/40 rounded-lg
					opacity-0 group-hover:opacity-100
					transition-opacity duration-150
				"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="17 8 12 3 7 8" />
						<line x1="12" y1="3" x2="12" y2="15" />
					</svg>
				</span>
			</button>

			{/* Popover */}
			{popoverOpen && (
				<div
					className="
						absolute left-0 top-full mt-2 z-50
						w-72 popover animate-in
					"
					role="dialog"
					aria-label="自定义图标 URL"
				>
					<div className="px-3 py-2.5 border-b border-border">
						<p className="text-xs font-medium text-foreground">自定义图标</p>
						<p className="text-[11px] text-muted-foreground mt-0.5">
							填入图片 URL，留空则自动获取
						</p>
					</div>
					<div className="px-3 py-2.5 space-y-2">
						{/* 预览 + 输入框 */}
						<div className="flex items-center gap-2">
							{/* 实时预览 */}
							<div className="h-8 w-8 shrink-0 rounded-md bg-muted border border-border flex items-center justify-center overflow-hidden">
								{inputVal.trim() && !previewErr ? (
									<img
										src={inputVal.trim()}
										alt=""
										width={32}
										height={32}
										className="w-full h-full object-contain"
										onError={() => setPreviewErr(true)}
									/>
								) : (
									<span className="text-xs font-semibold text-muted-foreground">
										{[...(name || '?')][0]?.toUpperCase() ?? '?'}
									</span>
								)}
							</div>
							<input
								ref={inputRef}
								type="url"
								value={inputVal}
								onChange={(e) => {
									setPreviewErr(false)
									setInputVal(e.target.value)
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault()
										handleConfirm()
									}
									if (e.key === 'Escape') {
										e.preventDefault()
										setPopoverOpen(false)
									}
								}}
								placeholder="https://example.com/icon.png"
								className="input-base px-2.5 py-1.5 text-xs flex-1 min-w-0"
								autoComplete="off"
								spellCheck={false}
							/>
						</div>
						{/* 操作按钮 */}
						<div className="flex items-center justify-between gap-2">
							<button
								type="button"
								onClick={handleClear}
								className="text-[11px] text-muted-foreground hover:text-error transition-colors"
							>
								恢复自动获取
							</button>
							<div className="flex gap-1.5">
								<button
									type="button"
									onClick={() => setPopoverOpen(false)}
									className="
										h-7 px-2.5 rounded-md text-xs
										text-muted-foreground hover:bg-muted
										transition-colors duration-100
									"
								>
									取消
								</button>
								<button
									type="button"
									onClick={handleConfirm}
									className="
										h-7 px-2.5 rounded-md text-xs font-medium
										bg-primary text-white hover:bg-primary/90
										transition-colors duration-100
									"
								>
									确认
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

// ---- 表单字段 ----

interface FieldProps {
	label: string
	htmlFor: string
	error?: string
	required?: boolean
	children: React.ReactNode
	hint?: string
}

function Field({
	label,
	htmlFor,
	error,
	required,
	children,
	hint,
}: FieldProps) {
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
				{label}
				{required && (
					<span className="ml-0.5 text-error" aria-hidden="true">
						*
					</span>
				)}
			</label>
			{children}
			{error && (
				<p role="alert" className="text-xs text-error leading-tight">
					{error}
				</p>
			)}
			{hint && !error && (
				<p className="text-[11px] text-muted-foreground leading-tight">
					{hint}
				</p>
			)}
		</div>
	)
}

// ---- 输入框样式 ----

const inputCls = (hasError: boolean) =>
	[
		'input-base px-3 py-2 text-base sm:text-sm',
		hasError ? 'border-error focus:border-error' : '',
	]
		.filter(Boolean)
		.join(' ')

// ---- 初始表单状态 ----

const EMPTY_FORM: SitePayload = {
	name: '',
	url: '',
	description: '',
	category: '其他',
	iconUrl: '',
	pinned: false,
	tags: [],
}

function siteToPayload(site: Site): SitePayload {
	return {
		name: site.name,
		url: site.url,
		description: site.description,
		category: site.category,
		iconUrl: site.iconUrl ?? '',
		pinned: site.pinned ?? false,
		tags: site.tags ?? [],
	}
}

// ---- 主组件 ----

export interface SiteFormModalProps {
	/** 传入则为编辑模式，否则为添加模式 */
	editSite?: Site
	/** 是否打开 */
	open: boolean
	onClose: () => void
	onSubmit: (payload: SitePayload, editId?: string) => void
	/** 检测 URL 是否重复（由父组件提供） */
	isUrlDuplicate?: (url: string, excludeId?: string) => boolean
	/**
	 * 编辑模式下，为 custom / imported 站点提供删除回调。
	 * 为 undefined 则不显示删除按钮（内置站点不可在此删除）。
	 */
	onDelete?: (site: Site) => void
}

export function SiteFormModal({
	editSite,
	open,
	onClose,
	onSubmit,
	isUrlDuplicate,
	onDelete,
}: SiteFormModalProps) {
	const isEdit = Boolean(editSite)
	const [form, setForm] = useState<SitePayload>(
		editSite ? siteToPayload(editSite) : EMPTY_FORM,
	)
	const [errors, setErrors] = useState<ValidationError[]>([])
	const [submitted, setSubmitted] = useState(false)
	const [tagInput, setTagInput] = useState('')
	const firstInputRef = useRef<HTMLInputElement>(null)

	// ---- 自动获取元数据状态 ----
	const [fetchStatus, setFetchStatus] = useState<
		'idle' | 'loading' | 'done' | 'error'
	>('idle')
	// 记录已抓取过的 URL，避免重复请求
	const fetchedUrlRef = useRef<string>('')
	// 防抖 timer
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// 打开时初始化 / 重置
	useEffect(() => {
		if (open) {
			const initial = editSite ? siteToPayload(editSite) : EMPTY_FORM
			setForm(initial)
			setErrors([])
			setSubmitted(false)
			setTagInput('')
			setFetchStatus('idle')
			fetchedUrlRef.current = ''
			if (debounceRef.current) clearTimeout(debounceRef.current)
			requestAnimationFrame(() => firstInputRef.current?.focus())
		}
	}, [open, editSite])

	// Esc 关闭
	useEffect(() => {
		if (!open) return
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault()
				onClose()
			}
		}
		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [open, onClose])

	// 表单变更
	const setField = useCallback(
		<K extends keyof SitePayload>(key: K, value: SitePayload[K]) => {
			setForm((prev) => ({ ...prev, [key]: value }))
			// 已提交过则实时重新校验
			if (submitted) {
				setErrors(validateSitePayload({ ...form, [key]: value }))
			}
		},
		[form, submitted],
	)

	/**
	 * 核心抓取逻辑，添加模式和编辑模式的刷新按钮共用。
	 * overwrite=true 时强制覆盖已有名称/描述（手动点刷新时使用）。
	 */
	const doFetchMeta = useCallback(async (url: string, overwrite = false) => {
		const trimmed = url.trim()
		if (!isValidUrl(trimmed)) return
		setFetchStatus('loading')
		fetchedUrlRef.current = trimmed
		const meta = await fetchPageMeta(trimmed)
		if (!meta) {
			setFetchStatus('error')
			return
		}
		setFetchStatus('done')
		setForm((prev) => ({
			...prev,
			name:
				overwrite || !prev.name.trim()
					? meta.title.slice(0, 50) || prev.name
					: prev.name,
			description:
				overwrite || !prev.description.trim()
					? meta.description.slice(0, 100) || prev.description
					: prev.description,
		}))
	}, [])

	/** 编辑模式下手动点击刷新按钮 */
	const handleRefreshMeta = useCallback(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		doFetchMeta(form.url, true)
	}, [form.url, doFetchMeta])

	/**
	 * URL 变更时触发自动获取（仅添加模式）。
	 * 防抖 600ms，只填入用户尚未输入的字段，不覆盖已有内容。
	 */
	const handleUrlChange = useCallback(
		(url: string) => {
			setField('url', url)
			if (isEdit) return

			if (debounceRef.current) clearTimeout(debounceRef.current)

			const trimmed = url.trim()
			if (!isValidUrl(trimmed)) {
				setFetchStatus('idle')
				return
			}
			if (trimmed === fetchedUrlRef.current) return

			debounceRef.current = setTimeout(() => {
				doFetchMeta(trimmed, false)
			}, 600)
		},
		[setField, isEdit, doFetchMeta],
	)

	// 获取某字段的错误信息
	const fieldError = (field: keyof SitePayload) =>
		errors.find((e) => e.field === field)?.message

	// 添加 tag
	const addTag = useCallback(() => {
		const tag = tagInput.trim()
		if (!tag) return
		if (!(form.tags ?? []).includes(tag)) {
			setField('tags', [...(form.tags ?? []), tag])
		}
		setTagInput('')
	}, [tagInput, form.tags, setField])

	// 删除 tag
	const removeTag = useCallback(
		(tag: string) => {
			setField(
				'tags',
				(form.tags ?? []).filter((t) => t !== tag),
			)
		},
		[form.tags, setField],
	)

	// 删除（编辑模式下 custom/imported 站点）
	const handleDelete = useCallback(() => {
		if (!editSite || !onDelete) return
		onClose()
		// 延迟一帧，确保 modal 关闭动画不冲突
		requestAnimationFrame(() => onDelete(editSite))
	}, [editSite, onDelete, onClose])

	// 提交
	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault()
			setSubmitted(true)

			const errs = validateSitePayload(form)

			// 额外检查 URL 重复
			if (!errs.find((e) => e.field === 'url') && isUrlDuplicate) {
				if (isUrlDuplicate(form.url, editSite?.id)) {
					errs.push({ field: 'url', message: '该 URL 已存在，请勿重复添加' })
				}
			}

			if (errs.length > 0) {
				setErrors(errs)
				return
			}

			onSubmit(form, editSite?.id)
			onClose()
		},
		[form, editSite, isUrlDuplicate, onSubmit, onClose],
	)

	const canDelete = isEdit && Boolean(onDelete) && Boolean(editSite)

	if (!open) return null

	return (
		<>
			{/* 遮罩 */}
			<div
				className="modal-overlay animate-fade-in"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* 面板 */}
			<div
				role="dialog"
				aria-modal="true"
				aria-label={isEdit ? '编辑站点' : '添加站点'}
				className="
					fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
					w-full max-w-lg
					animate-scale-up
				"
				style={{ zIndex: 300 }}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => {
					// Mirror the click behavior for keyboard users
					e.stopPropagation()
				}}
				tabIndex={-1}
			>
				<div className="popover mx-4 max-h-[90vh] flex flex-col">
					{/* Header */}
					<div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
						<div className="flex items-center gap-3">
							{/* 预览图标（可点击自定义） */}
							<FaviconPreview
								siteUrl={form.url}
								name={form.name}
								customIconUrl={form.iconUrl ?? ''}
								onIconUrlChange={(url) => setField('iconUrl', url)}
							/>
							<div>
								<h2 className="text-sm font-semibold text-foreground">
									{isEdit ? '编辑站点' : '添加站点'}
								</h2>
								<p className="text-[11px] text-muted-foreground mt-0.5">
									{form.name.trim() || (isEdit ? editSite?.name : '新站点')}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
							aria-label="关闭"
						>
							<XIcon size={16} />
						</button>
					</div>

					{/* 表单体 */}
					<form
						onSubmit={handleSubmit}
						noValidate
						className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-4"
					>
						{/* 站点名称 */}
						<Field
							label="站点名称"
							htmlFor="sf-name"
							required
							error={fieldError('name')}
						>
							<input
								ref={firstInputRef}
								id="sf-name"
								type="text"
								value={form.name}
								onChange={(e) => setField('name', e.target.value)}
								placeholder="如：GitHub"
								maxLength={50}
								className={inputCls(Boolean(fieldError('name')))}
								autoComplete="off"
							/>
						</Field>

						{/* URL */}
						<Field
							label="URL"
							htmlFor="sf-url"
							required
							error={fieldError('url')}
							hint={
								isEdit
									? '点击刷新按钮可重新获取标题与描述'
									: '输入链接后自动获取标题与描述'
							}
						>
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-muted-foreground">
									<GlobeIcon size={14} />
								</div>
								<input
									id="sf-url"
									type="url"
									value={form.url}
									onChange={(e) => handleUrlChange(e.target.value)}
									placeholder="https://example.com"
									className={[
										inputCls(Boolean(fieldError('url'))),
										'pl-8 pr-8',
									].join(' ')}
									autoComplete="url"
									autoCapitalize="none"
									spellCheck={false}
								/>
								{/* 右侧操作区：编辑模式显示刷新按钮，添加模式显示抓取状态 */}
								<div className="absolute inset-y-0 right-0 flex items-center pr-2">
									{isEdit ? (
										/* 编辑模式：刷新按钮 */
										<button
											type="button"
											onClick={handleRefreshMeta}
											disabled={
												fetchStatus === 'loading' || !isValidUrl(form.url)
											}
											aria-label="重新获取标题与描述"
											title="重新获取标题与描述"
											className="
												flex items-center justify-center
												h-5 w-5 rounded
												text-muted-foreground
												hover:text-foreground hover:bg-muted
												disabled:opacity-30 disabled:pointer-events-none
												transition-colors duration-100
												focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary
											"
										>
											{fetchStatus === 'loading' ? (
												<span className="h-3 w-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
											) : (
												<RefreshIcon size={12} />
											)}
										</button>
									) : (
										/* 添加模式：抓取状态图标 */
										fetchStatus !== 'idle' && (
											<div className="pointer-events-none flex items-center">
												{fetchStatus === 'loading' && (
													<span className="h-3.5 w-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
												)}
												{fetchStatus === 'done' && (
													<svg
														width="14"
														height="14"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2.5"
														strokeLinecap="round"
														strokeLinejoin="round"
														className="text-success"
														aria-label="已自动填入标题与描述"
													>
														<polyline points="20 6 9 17 4 12" />
													</svg>
												)}
												{fetchStatus === 'error' && (
													<svg
														width="13"
														height="13"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
														className="text-muted-foreground"
														aria-label="无法自动获取，请手动填写"
													>
														<circle cx="12" cy="12" r="10" />
														<line x1="12" y1="8" x2="12" y2="12" />
														<line x1="12" y1="16" x2="12.01" y2="16" />
													</svg>
												)}
											</div>
										)
									)}
								</div>
							</div>
							{/* 抓取成功提示 */}
							{!isEdit && fetchStatus === 'done' && (
								<p className="text-[11px] text-success leading-tight flex items-center gap-1">
									<svg
										width="10"
										height="10"
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
									已自动填入标题与描述，可手动修改
								</p>
							)}
						</Field>

						{/* 描述 */}
						<Field
							label="描述"
							htmlFor="sf-desc"
							required
							error={fieldError('description')}
						>
							<textarea
								id="sf-desc"
								value={form.description}
								onChange={(e) => setField('description', e.target.value)}
								placeholder="简短描述这个站点的用途..."
								maxLength={100}
								rows={2}
								className={[
									inputCls(Boolean(fieldError('description'))),
									'resize-none leading-relaxed',
								].join(' ')}
							/>
							<span className="text-[11px] text-muted-foreground self-end">
								{form.description.length}/100
							</span>
						</Field>

						{/* 分类 */}
						<Field
							label="分类"
							htmlFor="sf-category"
							required
							error={fieldError('category')}
						>
							<fieldset
								className="flex flex-wrap gap-1.5"
								aria-label="选择分类"
							>
								{SITE_CATEGORIES.map((cat) => (
									<button
										key={cat}
										type="button"
										onClick={() => setField('category', cat)}
										className={[
											'badge cursor-pointer transition-all duration-100',
											'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
											form.category === cat
												? 'badge-active'
												: 'badge-default hover:badge-primary',
										].join(' ')}
										aria-pressed={form.category === cat}
									>
										{cat}
									</button>
								))}
							</fieldset>
						</Field>

						{/* 标签（可选） */}
						<Field
							label="标签"
							htmlFor="sf-tags"
							hint="按 Enter 或逗号添加，用于搜索过滤"
						>
							<div className="space-y-2">
								{/* 已有标签 */}
								{(form.tags?.length ?? 0) > 0 && (
									<div className="flex flex-wrap gap-1.5">
										{(form.tags ?? []).map((tag) => (
											<span
												key={tag}
												className="badge badge-primary flex items-center gap-1"
											>
												{tag}
												<button
													type="button"
													onClick={() => removeTag(tag)}
													className="hover:text-error transition-colors"
													aria-label={`删除标签 ${tag}`}
												>
													<XIcon size={10} />
												</button>
											</span>
										))}
									</div>
								)}
								{/* 输入框 */}
								<input
									id="sf-tags"
									type="text"
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ',') {
											e.preventDefault()
											addTag()
										}
									}}
									placeholder="输入标签后按 Enter"
									className="input-base px-3 py-2 text-base sm:text-sm"
									autoComplete="off"
								/>
							</div>
						</Field>

						{/* 置顶开关 */}
						<div className="flex items-center justify-between py-1">
							<div>
								<p className="text-xs font-medium text-foreground">
									置顶此站点
								</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">
									置顶站点将始终排在网格首位
								</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={form.pinned}
								onClick={() => setField('pinned', !form.pinned)}
								className={[
									'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full',
									'transition-colors duration-200',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
									form.pinned ? 'bg-primary' : 'bg-muted-foreground/30',
								].join(' ')}
							>
								<span
									className={[
										'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm',
										'transition-transform duration-200',
										form.pinned ? 'translate-x-4.5' : 'translate-x-0.5',
									].join(' ')}
								/>
							</button>
						</div>
					</form>

					{/* Footer */}
					<div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-border shrink-0">
						{/* 左侧：删除按钮（仅编辑 custom/imported 时出现） */}
						{canDelete ? (
							<button
								type="button"
								onClick={handleDelete}
								className="
										flex items-center gap-1.5
										h-8 px-3 text-xs font-medium rounded-lg
										text-error hover:bg-error/10
										transition-colors duration-100
										focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error
									"
								aria-label="删除此站点"
							>
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
									<polyline points="3 6 5 6 21 6" />
									<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
									<path d="M10 11v6M14 11v6" />
									<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
								</svg>
								删除
							</button>
						) : (
							<Button variant="ghost" size="sm" type="button" onClick={onClose}>
								取消
							</Button>
						)}

						{/* 右侧：取消（删除模式下）+ 保存/添加 */}
						<div className="flex items-center gap-2">
							{canDelete && (
								<Button
									variant="ghost"
									size="sm"
									type="button"
									onClick={onClose}
								>
									取消
								</Button>
							)}
							<Button
								variant="primary"
								size="sm"
								type="submit"
								onClick={handleSubmit}
							>
								<CheckIcon size={14} />
								{isEdit ? '保存更改' : '添加站点'}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
