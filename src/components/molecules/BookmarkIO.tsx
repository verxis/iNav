import { useRef, useState } from 'react'
import { Button } from '@/components/atoms/Button'
import type { UseBookmarksReturn } from '@/hooks/useBookmarks'
import type { Site } from '@/types'

/* ---- 图标 ---- */

function UploadIcon() {
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
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="17 8 12 3 7 8" />
			<line x1="12" y1="3" x2="12" y2="15" />
		</svg>
	)
}

function DownloadIcon() {
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
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7 10 12 15 17 10" />
			<line x1="12" y1="15" x2="12" y2="3" />
		</svg>
	)
}

function TrashIcon() {
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
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
			<path d="M10 11v6M14 11v6" />
			<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
		</svg>
	)
}

function CloseIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M18 6 6 18M6 6l12 12" />
		</svg>
	)
}

function CheckIcon() {
	return (
		<svg
			width="14"
			height="14"
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
	)
}

function EyeOffIcon() {
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
			<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
			<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
			<line x1="1" y1="1" x2="23" y2="23" />
		</svg>
	)
}

/* ---- 主组件 ---- */

interface BookmarkIOProps {
	/** 当前所有可见站点（内置未隐藏 + 自定义 + 导入），用于导出 */
	visibleSites: Site[]
	importedCount: number
	bookmarks: {
		/** 为 undefined 时隐藏导入入口（feature flag 控制） */
		importFromHtml?: UseBookmarksReturn['importFromHtml']
		clearImported: UseBookmarksReturn['clearImported']
		/** 为 undefined 时隐藏导出入口 */
		exportToJson?: UseBookmarksReturn['exportToJson']
		/** 为 undefined 时隐藏导出入口 */
		exportToHtml?: UseBookmarksReturn['exportToHtml']
	}
	/** 已本地隐藏的内置站点数量 */
	hiddenBuiltinCount?: number
	/** 恢复所有本地隐藏的内置站点（为 undefined 则不显示按钮） */
	onRestoreBuiltin?: () => void
	/** 外部 toast 回调（由 Home 统一管理） */
	onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

export function BookmarkIO({
	visibleSites,
	importedCount,
	bookmarks,
	hiddenBuiltinCount = 0,
	onRestoreBuiltin,
	onShowToast,
}: BookmarkIOProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [importing, setImporting] = useState(false)
	const [showExportMenu, setShowExportMenu] = useState(false)
	const [showClearConfirm, setShowClearConfirm] = useState(false)
	const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)

	function showToast(
		message: string,
		type: 'success' | 'error' | 'info' = 'success',
	) {
		onShowToast?.(message, type)
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file || !bookmarks.importFromHtml) return

		setImporting(true)
		const reader = new FileReader()

		reader.onload = (evt) => {
			const html = evt.target?.result as string
			try {
				// biome-ignore  lint/style/noNonNullAssertion: none
				const result = bookmarks.importFromHtml!(html)
				if (result.imported === 0) {
					showToast(
						result.skipped > 0
							? `没有新书签（已跳过 ${result.skipped} 条无效链接）`
							: '未在文件中找到有效书签',
						'error',
					)
				} else {
					showToast(
						`成功导入 ${result.imported} 个书签${result.skipped > 0 ? `（跳过 ${result.skipped} 条）` : ''}`,
						'success',
					)
				}
			} catch {
				showToast('文件解析失败，请确认是有效的书签 HTML 文件', 'error')
			} finally {
				setImporting(false)
				if (fileInputRef.current) fileInputRef.current.value = ''
			}
		}

		reader.onerror = () => {
			showToast('文件读取失败', 'error')
			setImporting(false)
		}

		reader.readAsText(file, 'utf-8')
	}

	const hasExport = Boolean(bookmarks.exportToJson || bookmarks.exportToHtml)
	const hasImport = Boolean(bookmarks.importFromHtml)

	return (
		<div className="relative flex items-center gap-1">
			{/* 隐藏的文件输入 */}
			{hasImport && (
				<input
					ref={fileInputRef}
					type="file"
					accept=".html,.htm"
					className="sr-only"
					aria-label="选择书签 HTML 文件"
					onChange={handleFileChange}
				/>
			)}

			{/* 导入按钮 */}
			{hasImport && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => fileInputRef.current?.click()}
					loading={importing}
					aria-label="导入浏览器书签"
					title="导入浏览器书签（HTML 格式）"
					className="gap-1.5 text-muted-foreground hover:text-foreground"
				>
					<UploadIcon />
					<span className="hidden sm:inline">导入书签</span>
				</Button>
			)}

			{/* 导出按钮 */}
			{hasExport && (
				<div className="relative">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowExportMenu((v) => !v)}
						aria-label="导出站点数据"
						title="导出站点数据"
						className="gap-1.5 text-muted-foreground hover:text-foreground"
					>
						<DownloadIcon />
						<span className="hidden sm:inline">导出</span>
					</Button>

					{showExportMenu && (
						<>
							{/* 点击外层关闭 */}
							<div
								className="fixed inset-0 z-40"
								onClick={() => setShowExportMenu(false)}
								aria-hidden="true"
							/>
							<div
								className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 z-50 w-52 bg-surface border border-border rounded-lg overflow-hidden shadow-md animate-in"
								role="menu"
							>
								{/* 导出范围说明 */}
								<div className="px-3 py-2 border-b border-border">
									<p className="text-[11px] text-muted-foreground leading-snug">
										导出全部可见站点
										<span className="ml-1 tabular-nums text-foreground font-medium">
											({visibleSites.length})
										</span>
									</p>
								</div>

								{bookmarks.exportToJson && (
									<button
										type="button"
										role="menuitem"
										className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors duration-100 text-left"
										onClick={() => {
											// biome-ignore  lint/style/noNonNullAssertion: none
											bookmarks.exportToJson!(visibleSites)
											setShowExportMenu(false)
											showToast(
												`已导出 ${visibleSites.length} 个站点（JSON）`,
												'success',
											)
										}}
									>
										<DownloadIcon />
										导出为 JSON
									</button>
								)}
								{bookmarks.exportToHtml && (
									<button
										type="button"
										role="menuitem"
										className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors duration-100 text-left"
										onClick={() => {
											// biome-ignore  lint/style/noNonNullAssertion: none
											bookmarks.exportToHtml!(visibleSites)
											setShowExportMenu(false)
											showToast(
												`已导出 ${visibleSites.length} 个站点（书签 HTML）`,
												'success',
											)
										}}
									>
										<DownloadIcon />
										导出为书签 HTML
									</button>
								)}
							</div>
						</>
					)}
				</div>
			)}

			{/* 清除导入（只有存在导入书签时显示） */}
			{importedCount > 0 && (
				<>
					{showClearConfirm ? (
						<div className="flex items-center gap-1 border border-border rounded-lg px-2 py-1 bg-surface animate-in">
							<span className="text-xs text-muted-foreground whitespace-nowrap">
								清除 {importedCount} 条导入？
							</span>
							<button
								type="button"
								onClick={() => {
									bookmarks.clearImported()
									setShowClearConfirm(false)
									showToast('已清除所有导入书签', 'success')
								}}
								className="text-error hover:opacity-80 transition-opacity"
								aria-label="确认清除"
							>
								<CheckIcon />
							</button>
							<button
								type="button"
								onClick={() => setShowClearConfirm(false)}
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="取消"
							>
								<CloseIcon />
							</button>
						</div>
					) : (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowClearConfirm(true)}
							aria-label={`清除 ${importedCount} 条导入书签`}
							title={`清除导入书签（${importedCount} 条）`}
							className="gap-1.5 text-muted-foreground hover:text-error"
						>
							<TrashIcon />
							<span className="hidden sm:inline tabular-nums">
								{importedCount}
							</span>
						</Button>
					)}
				</>
			)}

			{/* 恢复隐藏内置站点（只有存在隐藏站点时显示） */}
			{onRestoreBuiltin && hiddenBuiltinCount > 0 && (
				<>
					{showRestoreConfirm ? (
						<div className="flex items-center gap-1 border border-border rounded-lg px-2 py-1 bg-surface animate-in">
							<span className="text-xs text-muted-foreground whitespace-nowrap">
								恢复 {hiddenBuiltinCount} 个隐藏？
							</span>
							<button
								type="button"
								onClick={() => {
									onRestoreBuiltin()
									setShowRestoreConfirm(false)
									showToast(
										`已恢复 ${hiddenBuiltinCount} 个内置站点`,
										'success',
									)
								}}
								className="text-primary hover:opacity-80 transition-opacity"
								aria-label="确认恢复"
							>
								<CheckIcon />
							</button>
							<button
								type="button"
								onClick={() => setShowRestoreConfirm(false)}
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="取消"
							>
								<CloseIcon />
							</button>
						</div>
					) : (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowRestoreConfirm(true)}
							aria-label={`恢复 ${hiddenBuiltinCount} 个本地隐藏的内置站点`}
							title={`恢复隐藏的内置站点（${hiddenBuiltinCount} 个）`}
							className="gap-1.5 text-muted-foreground hover:text-primary"
						>
							<EyeOffIcon />
							<span className="hidden sm:inline tabular-nums">
								{hiddenBuiltinCount}
							</span>
						</Button>
					)}
				</>
			)}
		</div>
	)
}
