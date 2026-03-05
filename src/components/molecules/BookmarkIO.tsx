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

/* ---- Toast 简易通知 ---- */

interface ToastState {
	message: string
	type: 'success' | 'error'
}

/* ---- 主组件 ---- */

interface BookmarkIOProps {
	builtinSites: Site[]
	importedCount: number
	bookmarks: Pick<
		UseBookmarksReturn,
		'importFromHtml' | 'clearImported' | 'exportToJson' | 'exportToHtml'
	>
}

export function BookmarkIO({
	builtinSites,
	importedCount,
	bookmarks,
}: BookmarkIOProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [toast, setToast] = useState<ToastState | null>(null)
	const [importing, setImporting] = useState(false)
	const [showExportMenu, setShowExportMenu] = useState(false)
	const [showClearConfirm, setShowClearConfirm] = useState(false)

	function showToast(message: string, type: ToastState['type']) {
		setToast({ message, type })
		setTimeout(() => setToast(null), 3000)
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file) return

		setImporting(true)
		const reader = new FileReader()

		reader.onload = (evt) => {
			const html = evt.target?.result as string
			try {
				const result = bookmarks.importFromHtml(html)
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
				// 重置 input，允许重复选择同一文件
				if (fileInputRef.current) fileInputRef.current.value = ''
			}
		}

		reader.onerror = () => {
			showToast('文件读取失败', 'error')
			setImporting(false)
		}

		reader.readAsText(file, 'utf-8')
	}

	return (
		<div className="relative flex items-center gap-1">
			{/* 隐藏的文件输入 */}
			<input
				ref={fileInputRef}
				type="file"
				accept=".html,.htm"
				className="sr-only"
				aria-label="选择书签 HTML 文件"
				onChange={handleFileChange}
			/>

			{/* 导入按钮 */}
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

			{/* 导出按钮 */}
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
							className="absolute right-0 top-full mt-1 z-50 w-44 bg-surface border border-border rounded-lg overflow-hidden animate-in"
							role="menu"
						>
							<button
								type="button"
								role="menuitem"
								className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors duration-100 text-left"
								onClick={() => {
									bookmarks.exportToJson(builtinSites)
									setShowExportMenu(false)
								}}
							>
								<DownloadIcon />
								导出为 JSON
							</button>
							<button
								type="button"
								role="menuitem"
								className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors duration-100 text-left"
								onClick={() => {
									bookmarks.exportToHtml(builtinSites)
									setShowExportMenu(false)
								}}
							>
								<DownloadIcon />
								导出为书签 HTML
							</button>
						</div>
					</>
				)}
			</div>

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

			{/* Toast 通知 */}
			{toast && (
				<output
					aria-live="polite"
					className={[
						'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
						'flex items-center gap-2',
						'px-4 py-2.5 rounded-lg',
						'text-xs font-medium',
						'shadow-lg animate-in',
						toast.type === 'success'
							? 'bg-foreground text-background'
							: 'bg-error text-white',
					].join(' ')}
				>
					{toast.type === 'success' ? <CheckIcon /> : <CloseIcon />}
					{toast.message}
				</output>
			)}
		</div>
	)
}
