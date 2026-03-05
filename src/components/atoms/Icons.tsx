/* ============================================================
   iNav Icon Library
   统一 SVG 图标组件，避免各处重复定义
   所有图标默认 16×16，stroke-based，继承 currentColor
   ============================================================ */

interface IconProps {
	size?: number
	className?: string
	strokeWidth?: number
}

type SvgProps = React.SVGAttributes<SVGElement> & IconProps

function Icon({
	size = 16,
	className,
	strokeWidth = 2,
	children,
	...rest
}: SvgProps & { children: React.ReactNode }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
			{...rest}
		>
			{children}
		</svg>
	)
}

/* ---- 搜索 ---- */
export function SearchIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.35-4.35" />
		</Icon>
	)
}

/* ---- 关闭 / 清除 ---- */
export function XIcon(props: IconProps) {
	return (
		<Icon {...props} strokeWidth={props.strokeWidth ?? 2.5}>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</Icon>
	)
}

/* ---- 太阳（亮色模式） ---- */
export function SunIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2" />
			<path d="M12 20v2" />
			<path d="m4.93 4.93 1.41 1.41" />
			<path d="m17.66 17.66 1.41 1.41" />
			<path d="M2 12h2" />
			<path d="M20 12h2" />
			<path d="m6.34 17.66-1.41 1.41" />
			<path d="m19.07 4.93-1.41 1.41" />
		</Icon>
	)
}

/* ---- 月亮（暗色模式） ---- */
export function MoonIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
		</Icon>
	)
}

/* ---- GitHub ---- */
export function GitHubIcon(props: Omit<IconProps, 'strokeWidth'>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.size ?? 16}
			height={props.size ?? 16}
			viewBox="0 0 24 24"
			fill="currentColor"
			className={props.className}
			aria-hidden="true"
		>
			<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
		</svg>
	)
}

/* ---- 外链 ---- */
export function ExternalLinkIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
			<polyline points="15 3 21 3 21 9" />
			<line x1="10" y1="14" x2="21" y2="3" />
		</Icon>
	)
}

/* ---- 信息 ---- */
export function InfoIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 16v-4" />
			<path d="M12 8h.01" />
		</Icon>
	)
}

/* ---- 上传 ---- */
export function UploadIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="17 8 12 3 7 8" />
			<line x1="12" y1="3" x2="12" y2="15" />
		</Icon>
	)
}

/* ---- 下载 ---- */
export function DownloadIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7 10 12 15 17 10" />
			<line x1="12" y1="15" x2="12" y2="3" />
		</Icon>
	)
}

/* ---- 垃圾桶 ---- */
export function TrashIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
			<path d="M10 11v6M14 11v6" />
			<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
		</Icon>
	)
}

/* ---- 勾选 ---- */
export function CheckIcon(props: IconProps) {
	return (
		<Icon {...props} strokeWidth={props.strokeWidth ?? 2.5}>
			<polyline points="20 6 9 17 4 12" />
		</Icon>
	)
}

/* ---- 加号 ---- */
export function PlusIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M12 5v14" />
			<path d="M5 12h14" />
		</Icon>
	)
}

/* ---- 编辑（铅笔） ---- */
export function EditIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
			<path d="m15 5 4 4" />
		</Icon>
	)
}

/* ---- 置顶图钉 ---- */
export function PinIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<line x1="12" y1="17" x2="12" y2="22" />
			<path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
		</Icon>
	)
}

/* ---- 取消置顶 ---- */
export function PinOffIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<line x1="2" y1="2" x2="22" y2="22" />
			<line x1="12" y1="17" x2="12" y2="22" />
			<path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12" />
			<path d="M15 9.34V6h1a2 2 0 0 0 0-4H7.89" />
		</Icon>
	)
}

/* ---- 设置（齿轮） ---- */
export function SettingsIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
			<circle cx="12" cy="12" r="3" />
		</Icon>
	)
}

/* ---- 命令（⌘） ---- */
export function CommandIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
		</Icon>
	)
}

/* ---- 箭头向右 ---- */
export function ArrowRightIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M5 12h14" />
			<path d="m12 5 7 7-7 7" />
		</Icon>
	)
}

/* ---- 箭头向上 ---- */
export function ArrowUpIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="m5 12 7-7 7 7" />
			<path d="M12 19V5" />
		</Icon>
	)
}

/* ---- 更多 (三点) ---- */
export function MoreHorizontalIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="1" />
			<circle cx="19" cy="12" r="1" />
			<circle cx="5" cy="12" r="1" />
		</Icon>
	)
}

/* ---- 全局搜索 / 过滤 ---- */
export function FilterIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
		</Icon>
	)
}

/* ---- 星形收藏 ---- */
export function StarIcon(props: IconProps & { filled?: boolean }) {
	const { filled, ...rest } = props
	return (
		<Icon {...rest} fill={filled ? 'currentColor' : 'none'}>
			<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
		</Icon>
	)
}

/* ---- 链接 ---- */
export function LinkIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
		</Icon>
	)
}

/* ---- 刷新 ---- */
export function RefreshIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
			<path d="M3 3v5h5" />
			<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
			<path d="M16 16h5v5" />
		</Icon>
	)
}

/* ---- 复制 ---- */
export function CopyIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</Icon>
	)
}

/* ---- 闪电（性能/快速） ---- */
export function ZapIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
		</Icon>
	)
}

/* ---- iNav Logo (四格) ---- */
export function NavLogoIcon({
	size = 28,
	className,
}: {
	size?: number
	className?: string
}) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
			className={className}
		>
			<rect
				x="3"
				y="3"
				width="7"
				height="7"
				rx="1.5"
				fill="var(--color-primary)"
			/>
			<rect
				x="14"
				y="3"
				width="7"
				height="7"
				rx="1.5"
				fill="var(--color-primary)"
				opacity="0.65"
			/>
			<rect
				x="3"
				y="14"
				width="7"
				height="7"
				rx="1.5"
				fill="var(--color-primary)"
				opacity="0.4"
			/>
			<rect
				x="14"
				y="14"
				width="7"
				height="7"
				rx="1.5"
				fill="var(--color-primary)"
				opacity="0.2"
			/>
		</svg>
	)
}

/* ---- 书签 ---- */
export function BookmarkIcon(props: IconProps & { filled?: boolean }) {
	const { filled, ...rest } = props
	return (
		<Icon {...rest} fill={filled ? 'currentColor' : 'none'}>
			<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
		</Icon>
	)
}

/* ---- 键盘 ---- */
export function KeyboardIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect width="20" height="16" x="2" y="4" rx="2" ry="2" />
			<path d="M6 8h.001" />
			<path d="M10 8h.001" />
			<path d="M14 8h.001" />
			<path d="M18 8h.001" />
			<path d="M8 12h.001" />
			<path d="M12 12h.001" />
			<path d="M16 12h.001" />
			<path d="M7 16h10" />
		</Icon>
	)
}

/* ---- 文件夹 ---- */
export function FolderIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
		</Icon>
	)
}

/* ---- 地球 ---- */
export function GlobeIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="10" />
			<line x1="2" y1="12" x2="22" y2="12" />
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
		</Icon>
	)
}
