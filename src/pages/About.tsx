import { NavLink } from 'react-router'
import { Button } from '@/components/atoms/Button'
import {
	BookmarkIcon,
	CommandIcon,
	EditIcon,
	GitHubIcon,
	NavLogoIcon,
	ZapIcon,
} from '@/components/atoms/Icons'
import sitesData from '@/data/sites.json'
import { useTheme } from '@/hooks/useTheme'
import type { Site } from '@/types'

const ALL_SITES = sitesData as Site[]

/* ============================================================
   技术栈数据
   ============================================================ */

interface TechItem {
	name: string
	description: string
	badge: string
	href: string
}

const TECH_STACK: TechItem[] = [
	{
		name: 'React 19',
		description:
			'函数组件 + Hooks，useDeferredValue 并发特性优化搜索渲染性能，无需手写防抖',
		badge: '框架',
		href: 'https://react.dev',
	},
	{
		name: 'TypeScript 5',
		description:
			'strict 模式，全量类型定义，零 any，编译期捕获大多数运行时错误',
		badge: '语言',
		href: 'https://www.typescriptlang.org',
	},
	{
		name: 'Vite 7',
		description:
			'基于原生 ESM 的极速构建工具，HMR 毫秒级热更新，生产构建 Tree-shaking',
		badge: '构建',
		href: 'https://vitejs.dev',
	},
	{
		name: 'Tailwind CSS v4',
		description:
			'Utility-first CSS，配合 CSS Variables @theme 实现零配置 Design Token',
		badge: '样式',
		href: 'https://tailwindcss.com',
	},
	{
		name: 'React Router v7',
		description:
			'createBrowserRouter + 懒加载路由，NavLink 自动 active 状态，ScrollRestoration',
		badge: '路由',
		href: 'https://reactrouter.com',
	},
	{
		name: 'Biome',
		description:
			'Rust 编写的超快 Linter + Formatter，替代 ESLint + Prettier，统一代码规范',
		badge: '工具链',
		href: 'https://biomejs.dev',
	},
]

/* ============================================================
   亮点 Feature
   ============================================================ */

interface Feature {
	icon: React.ReactNode
	title: string
	description: string
	tag: string
}

const FEATURES: Feature[] = [
	{
		icon: <ZapIcon size={15} />,
		title: '零闪烁主题切换（FOUC 消除）',
		description:
			'在 <head> 注入同步 JS 脚本，FCP 之前读取 localStorage / OS 偏好并设置 data-theme，彻底消除主题切换白闪；结合 CSS Variables 实现 150ms 平滑过渡动画。',
		tag: '性能',
	},
	{
		icon: (
			<svg
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
			</svg>
		),
		title: 'useDeferredValue 搜索优化',
		description:
			'利用 React 19 并发渲染特性，输入框更新（高优先级）立即响应，过滤计算（低优先级）在空闲帧执行；搜索结果关键词高亮采用正则分片渲染，完全无防抖延迟感。',
		tag: '并发',
	},
	{
		icon: <CommandIcon size={15} />,
		title: '命令面板（Command Palette）',
		description:
			'⌘K 唤起全局命令面板，实时模糊搜索全部站点并按相关度评分排序（名称完全匹配 > 前缀匹配 > 包含匹配 > 描述/标签匹配），键盘上下导航，Enter 在新标签页跳转，Esc 关闭。',
		tag: '交互',
	},
	{
		icon: <EditIcon size={15} />,
		title: '站点全生命周期管理',
		description:
			'支持手动添加、编辑、删除、置顶自定义站点，带表单实时验证（URL 格式、字段长度、URL 去重）；右键 / 长按（移动端）弹出上下文菜单，支持复制链接等快捷操作。',
		tag: '功能',
	},
	{
		icon: <BookmarkIcon size={15} />,
		title: '浏览器书签导入/导出',
		description:
			'解析 Netscape 标准书签 HTML（Chrome/Firefox 通用），递归遍历文件夹树并按文件夹名猜测分类，自动生成 favicon；支持导出为 JSON 或标准书签 HTML 格式。',
		tag: '数据',
	},
	{
		icon: (
			<svg
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<circle cx="12" cy="5" r="1" />
				<path d="M9 20l3-8 3 8M6 8l6 2 6-2" />
			</svg>
		),
		title: '原子设计 + 全量 TypeScript',
		description:
			'Atoms → Molecules → Organisms 三层组件架构，共享 Icon Library 统一 SVG 管理；Props 全量类型定义，zero any，严格区分 UI Props 与逻辑 Hook 返回类型。',
		tag: '架构',
	},
]

/* ============================================================
   性能指标
   ============================================================ */

const METRICS = [
	{ value: '100', label: 'Accessibility', desc: 'Lighthouse 满分' },
	{ value: '0ms', label: 'FOUC', desc: '主题切换无闪烁' },
	{ value: '21KB', label: '主 Chunk', desc: 'Gzip，懒加载后' },
	{ value: '100%', label: 'TypeScript', desc: 'strict 覆盖率' },
]

/* ============================================================
   About 专属 Header
   ============================================================ */

function SunIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2" />
			<path d="M12 20v2" />
			<path d="m4.93 4.93 1.41 1.41" />
			<path d="m17.66 17.66 1.41 1.41" />
			<path d="M2 12h2" />
			<path d="M20 12h2" />
			<path d="m6.34 17.66-1.41 1.41" />
			<path d="m19.07 4.93-1.41 1.41" />
		</svg>
	)
}

function MoonIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
		</svg>
	)
}

function AboutHeader() {
	const { isDark, toggleTheme } = useTheme()

	return (
		<header className="sticky top-0 z-50 glass border-b border-border">
			<div className="mx-auto max-w-4xl flex items-center gap-3 h-12 px-4 sm:px-6">
				<NavLink
					to="/"
					className="text-foreground no-underline shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
					aria-label="iNav 首页"
				>
					<div className="flex items-center gap-2">
						<NavLogoIcon size={26} />
						<span className="text-sm font-bold text-foreground leading-none tracking-tight">
							iNav
						</span>
					</div>
				</NavLink>

				<div className="flex-1" />

				<Button
					variant="icon"
					size="md"
					onClick={toggleTheme}
					aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
					aria-pressed={isDark}
				>
					<span
						className="relative flex items-center justify-center"
						style={{ width: 16, height: 16 }}
					>
						<span
							className="absolute inset-0 flex items-center justify-center transition-all duration-300"
							style={{
								opacity: isDark ? 0 : 1,
								transform: isDark
									? 'rotate(-90deg) scale(0.5)'
									: 'rotate(0deg) scale(1)',
							}}
						>
							<SunIcon />
						</span>
						<span
							className="absolute inset-0 flex items-center justify-center transition-all duration-300"
							style={{
								opacity: isDark ? 1 : 0,
								transform: isDark
									? 'rotate(0deg) scale(1)'
									: 'rotate(90deg) scale(0.5)',
							}}
						>
							<MoonIcon />
						</span>
					</span>
				</Button>
			</div>
		</header>
	)
}

/* ============================================================
   About 主组件
   ============================================================ */

export default function About() {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			<AboutHeader />
			<main
				aria-label="关于 iNav"
				className="flex-1 page-enter mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 space-y-12"
			>
				{/* ---- Hero ---- */}
				<section className="space-y-4">
					<div className="flex items-start gap-4">
						<div className="shrink-0 mt-0.5">
							<NavLogoIcon size={36} />
						</div>
						<div className="space-y-2">
							<h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight">
								关于 iNav
							</h1>
							<p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
								基于 React 19 + TypeScript
								的个人导航站，采用原子设计模式构建组件库，专注于{' '}
								<strong className="text-foreground font-medium">
									极致的使用体验
								</strong>
								——快速跳转、键盘优先、零配置持久化，让常用网站的访问如丝般顺滑。
							</p>
							<div className="flex items-center gap-3 pt-1">
								<a
									href="https://github.com/dogxii/inav"
									target="_blank"
									rel="noopener noreferrer"
									className="
										inline-flex items-center gap-1.5
										px-3 py-1.5 rounded-lg
										bg-foreground text-background
										text-xs font-medium
										hover:opacity-90 active:opacity-80
										transition-opacity duration-100
										focus-visible:outline-none focus-visible:ring-2
										focus-visible:ring-primary focus-visible:ring-offset-2
										no-underline
									"
									aria-label="在 GitHub 上查看源码（在新标签页中打开）"
								>
									<GitHubIcon size={13} />
									查看源码
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="10"
										height="10"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
									>
										<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
										<polyline points="15 3 21 3 21 9" />
										<line x1="10" y1="14" x2="21" y2="3" />
									</svg>
								</a>
								<NavLink
									to="/"
									className="
										inline-flex items-center gap-1.5
										px-3 py-1.5 rounded-lg
										border border-border
										text-xs font-medium text-muted-foreground
										hover:text-foreground hover:bg-muted
										transition-colors duration-100
										focus-visible:outline-none focus-visible:ring-2
										focus-visible:ring-primary focus-visible:ring-offset-2
										no-underline
									"
								>
									返回首页
								</NavLink>
							</div>
						</div>
					</div>
				</section>

				{/* ---- 性能指标 ---- */}
				<section aria-labelledby="metrics-heading">
					<h2
						id="metrics-heading"
						className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4"
					>
						性能指标
					</h2>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{METRICS.map(({ value, label, desc }) => (
							<div
								key={label}
								className="card p-4 text-center flex flex-col gap-1"
							>
								<div className="text-2xl font-bold text-primary tabular-nums tracking-tight">
									{value}
								</div>
								<div className="text-xs font-semibold text-foreground">
									{label}
								</div>
								<div className="text-[11px] text-muted-foreground">{desc}</div>
							</div>
						))}
					</div>
				</section>

				{/* ---- 技术亮点 ---- */}
				<section aria-labelledby="features-heading">
					<h2
						id="features-heading"
						className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4"
					>
						技术亮点
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{FEATURES.map(({ icon, title, description, tag }) => (
							<div
								key={title}
								className="card p-4 flex flex-col gap-2.5 group hover:border-primary/40 transition-colors duration-200"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-2">
										<span className="text-primary shrink-0 opacity-80">
											{icon}
										</span>
										<h3 className="text-xs font-semibold text-foreground leading-tight">
											{title}
										</h3>
									</div>
									<span className="badge badge-primary shrink-0">{tag}</span>
								</div>
								<p className="text-[11px] text-muted-foreground leading-relaxed">
									{description}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* ---- 技术栈 ---- */}
				<section aria-labelledby="tech-heading">
					<h2
						id="tech-heading"
						className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4"
					>
						技术栈
					</h2>
					<div className="card overflow-hidden">
						<table className="w-full text-sm" aria-label="项目技术栈">
							<thead>
								<tr className="border-b border-border">
									<th
										scope="col"
										className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-1/4"
									>
										技术
									</th>
									<th
										scope="col"
										className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-1/6"
									>
										类别
									</th>
									<th
										scope="col"
										className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide"
									>
										说明
									</th>
								</tr>
							</thead>
							<tbody>
								{TECH_STACK.map(({ name, description, badge, href }, index) => (
									<tr
										key={name}
										className={[
											'transition-colors duration-100 hover:bg-muted/40',
											index !== TECH_STACK.length - 1
												? 'border-b border-border'
												: '',
										]
											.filter(Boolean)
											.join(' ')}
									>
										<td className="px-4 py-3">
											<a
												href={href}
												target="_blank"
												rel="noopener noreferrer"
												className="
													text-sm font-medium text-foreground
													hover:text-primary transition-colors duration-100
													no-underline inline-flex items-center gap-1
												"
											>
												{name}
											</a>
										</td>
										<td className="px-4 py-3">
											<span className="badge badge-primary">{badge}</span>
										</td>
										<td className="px-4 py-3 text-[11px] text-muted-foreground leading-relaxed">
											{description}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				{/* ---- 快速开始 ---- */}
				<section aria-labelledby="dev-heading">
					<h2
						id="dev-heading"
						className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4"
					>
						快速开始
					</h2>
					<div className="card overflow-hidden">
						<div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
							<span className="text-[11px] font-mono text-muted-foreground">
								Terminal
							</span>
							<div className="flex gap-1.5" aria-hidden="true">
								<div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
								<div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
								<div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
							</div>
						</div>
						<pre className="p-4 text-xs font-mono bg-muted/20 text-foreground overflow-x-auto leading-relaxed scrollbar-thin">
							<code>{`# 克隆仓库
git clone https://github.com/dogxii/inav.git && cd inav

# 安装依赖（推荐 bun）
bun install

# 启动开发服务器（默认 http://localhost:5173）
bun dev

# 类型检查 + 生产构建
bun run build`}</code>
						</pre>
					</div>
				</section>

				{/* ---- 使用指南 ---- */}
				<section aria-labelledby="usage-heading">
					<h2
						id="usage-heading"
						className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4"
					>
						快捷键
					</h2>
					<div className="card overflow-hidden divide-y divide-border">
						{[
							{
								keys: ['⌘', 'K'],
								label: '打开命令面板',
								desc: '快速搜索并跳转任意站点',
							},
							{
								keys: ['任意键'],
								label: '聚焦搜索框',
								desc: '在非输入状态下按任意可打印字符',
							},
							{
								keys: ['↑', '↓'],
								label: '列表导航',
								desc: '在命令面板 / 搜索引擎下拉中移动焦点',
							},
							{
								keys: ['↵'],
								label: '打开站点',
								desc: '在命令面板中确认并在新标签页跳转',
							},
							{
								keys: ['Esc'],
								label: '关闭面板',
								desc: '关闭命令面板、表单、弹窗',
							},
						].map(({ keys, label, desc }) => (
							<div
								key={label}
								className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors duration-100"
							>
								<div>
									<p className="text-xs font-medium text-foreground">{label}</p>
									<p className="text-[11px] text-muted-foreground mt-0.5">
										{desc}
									</p>
								</div>
								<div className="flex items-center gap-1 shrink-0">
									{keys.map((k) => (
										<kbd key={k} className="kbd">
											{k}
										</kbd>
									))}
								</div>
							</div>
						))}
					</div>
				</section>
			</main>
			;
			<footer className="border-t border-border">
				<div className="mx-auto max-w-4xl px-4 sm:px-6 h-10 flex items-center justify-between">
					<span className="text-xs text-muted-foreground tabular-nums">
						{ALL_SITES.length} 个内置站点
					</span>
					<nav aria-label="页脚导航" className="flex items-center gap-4">
						<NavLink
							to="/"
							end
							className={({ isActive }) =>
								[
									'text-xs no-underline transition-colors duration-100',
									isActive
										? 'text-foreground font-medium'
										: 'text-muted-foreground hover:text-foreground',
								].join(' ')
							}
						>
							首页
						</NavLink>
						<NavLink
							to="/about"
							className={({ isActive }) =>
								[
									'text-xs no-underline transition-colors duration-100',
									isActive
										? 'text-foreground font-medium'
										: 'text-muted-foreground hover:text-foreground',
								].join(' ')
							}
						>
							关于
						</NavLink>
					</nav>
				</div>
			</footer>
		</div>
	)
}
