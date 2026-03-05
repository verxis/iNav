<div align="center">

<img src="public/favicon.svg" alt="iNav Logo" width="64" height="64" />

# iNav

**轻、快、优雅的个人导航站**

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[Demo](#) · [快速开始](#快速开始) · [功能特性](#功能特性) · [技术亮点](#技术亮点)

</div>

---

## 简介

iNav 是一个以 **i（intelligent & instant）** 为核心理念设计的个人导航站。  
它不是一个笨重的书签管理器，而是一个专注于**极致使用体验**的工具：

- 打开即用，任意键聚焦搜索
- ⌘K 命令面板秒级跳转任意站点
- 自定义添加 / 编辑 / 删除站点，数据永久保存在本地
- 浏览器书签一键导入，自动分类
- 亮暗主题零闪烁切换

---

## 功能特性

### 搜索与导航

| 功能                 | 说明                                                      |
| -------------------- | --------------------------------------------------------- |
| **任意键聚焦搜索**   | 在非输入状态下按任意可打印字符，搜索框立即获焦            |
| **多字段模糊搜索**   | 同时搜索站点名称、描述、标签、URL                         |
| **搜索关键词高亮**   | 匹配字符在卡片中实时高亮显示                              |
| **搜索引擎快捷跳转** | 输入后可选择 Google / Bing / DuckDuckGo / GitHub 直接搜索 |
| **分类筛选**         | 横向滚动分类标签条，点击即筛选，再次点击取消              |

### 命令面板（⌘K）

- `⌘K` / `Ctrl+K` 唤起全屏命令面板
- **模糊搜索 + 相关度排序**：名称完全匹配 > 前缀匹配 > 包含匹配 > 描述/标签匹配
- 键盘上下导航，`Enter` 在新标签页打开，`Esc` 关闭
- 无输入时展示置顶 / 最近添加站点

### 站点管理

- **添加站点**：表单支持名称、URL、描述、分类、标签、置顶，URL 输入后实时预览 favicon
- **编辑站点**：点击 Hover 出现的编辑按钮，或通过右键菜单触发
- **删除站点**：带二次确认对话框，防止误操作
- **置顶 / 取消置顶**：置顶站点始终排在网格首位，顶部有蓝色细线标记
- **表单实时验证**：URL 格式校验、字段长度限制、URL 去重检测

### 右键上下文菜单

在任意站点卡片上**右键**（桌面）或**长按 600ms**（移动端）弹出菜单：

- 在新标签页打开
- 复制链接（Clipboard API）
- 编辑（仅自定义 / 导入站点）
- 置顶 / 取消置顶
- 删除（仅自定义 / 导入站点，带二次确认）

菜单自动检测屏幕边界，滚动时自动关闭。

### 布局切换

Header 右侧提供**网格 / 列表**两种布局切换，适应不同使用习惯。

### 书签导入 / 导出

- **导入**：支持 Chrome / Firefox 导出的标准 Netscape 书签 HTML 格式，递归遍历文件夹树，按文件夹名自动猜测分类，自动生成 favicon URL
- **导出 JSON**：导出所有站点（内置 + 自定义 + 导入）为结构化 JSON
- **导出书签 HTML**：导出为浏览器可直接导入的书签 HTML，按分类分组

### 主题系统

- 跟随系统偏好（`prefers-color-scheme`）或手动切换亮 / 暗色
- **零闪烁（FOUC 消除）**：在 `<head>` 注入同步脚本，FCP 前设置 `data-theme`
- 主题偏好持久化到 `localStorage`，刷新后恢复

---

## 技术亮点

### 1. 零闪烁主题切换（FOUC 消除）

```html
<!-- index.html：在 FCP 之前同步执行，读取偏好并设置 data-theme -->
<script>
  ;(() => {
    const stored = localStorage.getItem('inav-theme')
    const prefersDark = window.matchMedia?.(
      '(prefers-color-scheme: dark)',
    ).matches
    const theme = stored ?? (prefersDark ? 'dark' : 'light')
    document.documentElement.dataset.theme = theme
  })()
</script>
```

配合 Tailwind v4 的 `@theme` CSS 变量，实现 150ms 平滑过渡动画，无任何白色闪烁。

### 2. React 19 useDeferredValue 搜索优化

```tsx
const deferredQuery = useDeferredValue(query)

// 输入框绑定高优先级 query（即时响应）
// 过滤计算绑定低优先级 deferredQuery（空闲时执行）
const filteredSites = useMemo(
  () => filterSites(allSites, deferredQuery, activeCategory),
  [allSites, deferredQuery, activeCategory],
)
```

无需手写 `debounce`，React 并发渲染自动调度优先级，输入框无任何延迟感。

### 3. 命令面板相关度评分

```ts
function searchSites(sites: Site[], query: string): Site[] {
  return sites
    .map((site) => {
      let score = 0
      if (name === q)
        score += 100 // 完全匹配
      else if (name.startsWith(q))
        score += 60 // 前缀匹配
      else if (name.includes(q)) score += 40 // 包含匹配
      if (desc.includes(q)) score += 20 // 描述匹配
      if (tags.includes(q)) score += 15 // 标签匹配
      if (site.pinned) score += 5 // 置顶加权
      return { site, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ site }) => site)
}
```

### 4. Tailwind v4 Design Token 系统

使用 `@theme` 定义 CSS Variables，完全替代 `tailwind.config.js`：

```css
@theme {
  --color-primary: #0071e3;
  --color-background: #f5f5f7;
  --shadow-popover: 0 8px 30px rgba(0, 0, 0, 0.12);
  --radius-card: 8px;
  --duration-fast: 100ms;
}

[data-theme='dark'] {
  --color-primary: #2997ff;
  --color-background: #0d0d0d;
}
```

### 5. 原子设计（Atomic Design）组件架构

```
src/components/
├── atoms/          # 最小粒度：Button, Input, Badge, Icons
├── molecules/      # 组合：SearchBar, NavCard, CategoryFilter, BookmarkIO, ContextMenu
└── organisms/      # 完整功能块：Header, NavGrid, CommandPalette, SiteFormModal
```

**共享 Icon Library**（`Icons.tsx`）统一管理所有 SVG 图标，避免各组件重复内联 SVG，支持 `size` / `className` / `strokeWidth` props。

### 6. 右键菜单长按检测（移动端兼容）

```ts
const onTouchStart = (e: React.TouchEvent) => {
  touchMoved.current = false
  longPressTimer.current = setTimeout(() => {
    if (!touchMoved.current) openMenu(x, y)
  }, 600) // 600ms 长按阈值
}

const onTouchMove = () => {
  touchMoved.current = true // 滑动时取消
  clearTimeout(longPressTimer.current)
}
```

菜单还实现了屏幕边界自动检测（防溢出）、滚动关闭、`Esc` 关闭、键盘上下导航。

### 7. localStorage 多 Hook 持久化

| Hook             | Storage Key           | 功能            |
| ---------------- | --------------------- | --------------- |
| `useTheme`       | `inav-theme`          | 主题偏好持久化  |
| `useSiteManager` | `inav-custom-sites`   | 自定义站点 CRUD |
| `useBookmarks`   | `inav-imported-sites` | 书签导入数据    |

### 8. 无障碍（a11y）

- 语义化 HTML：`<header>`, `<main>`, `<footer>`, `<section>`, `<nav>`, `<search>`
- `aria-label`, `aria-live`, `aria-modal`, `aria-pressed`, `aria-expanded`, `aria-activedescendant`
- `focus-visible` 聚焦轮廓（键盘导航专用，不影响鼠标操作）
- `role="dialog"`, `role="menu"`, `role="menuitem"`, `role="alertdialog"`
- `sr-only` 屏幕阅读器文字

---

## 技术栈

| 技术                                         | 版本   | 用途                             |
| -------------------------------------------- | ------ | -------------------------------- |
| [React](https://react.dev)                   | 19     | UI 框架，使用并发特性            |
| [TypeScript](https://www.typescriptlang.org) | 5      | 类型安全，strict 模式            |
| [Vite](https://vitejs.dev)                   | 7      | 构建工具，ESM + HMR              |
| [Tailwind CSS](https://tailwindcss.com)      | v4     | Utility-first CSS + Design Token |
| [React Router](https://reactrouter.com)      | v7     | 客户端路由，懒加载               |
| [Biome](https://biomejs.dev)                 | 2      | Linter + Formatter（Rust 编写）  |
| [Bun](https://bun.sh)                        | latest | 包管理器 + 运行时                |

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org) 18+ 或 [Bun](https://bun.sh) 1.0+

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/dogxii/inav.git
cd inav

# 安装依赖（推荐 bun，也支持 npm / pnpm）
bun install

# 启动开发服务器（默认 http://localhost:5173）
bun dev

# 类型检查 + 生产构建
bun run build

# 预览构建产物
bun run preview
```

### 添加自定义站点

**方式一：通过 UI 添加（推荐）**

点击 Header 右侧的「+ 添加」按钮，填写表单即可，数据自动保存到 `localStorage`。

**方式二：编辑内置数据**

编辑 `src/data/sites.json`，按以下格式添加：

```json
{
  "id": "my-site",
  "name": "我的站点",
  "url": "https://example.com",
  "description": "站点描述",
  "iconUrl": "https://www.google.com/s2/favicons?domain=example.com&sz=32",
  "category": "效率",
  "pinned": false,
  "tags": ["工具", "效率"]
}
```

**可用分类：** `AI` · `开发工具` · `设计` · `文档参考` · `学习` · `效率` · `娱乐` · `其他`

### 导入浏览器书签

1. 在 Chrome / Firefox 中导出书签（菜单 → 书签 → 导出书签）
2. 点击 Header 工具栏中的「导入书签」按钮
3. 选择导出的 `.html` 文件
4. 站点自动导入，按文件夹名猜测分类

---

## 项目结构

```
iNav/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Badge.tsx          # 标签组件
│   │   │   ├── Button.tsx         # 按钮组件（含 buttonVariants）
│   │   │   ├── Icons.tsx          # 共享 SVG 图标库
│   │   │   └── Input.tsx          # 输入框组件
│   │   ├── molecules/
│   │   │   ├── BookmarkIO.tsx     # 书签导入/导出 UI
│   │   │   ├── CategoryFilter.tsx # 分类标签筛选条
│   │   │   ├── ContextMenu.tsx    # 右键/长按上下文菜单
│   │   │   ├── NavCard.tsx        # 站点卡片（含快捷操作）
│   │   │   └── SearchBar.tsx      # 搜索框（含引擎下拉）
│   │   └── organisms/
│   │       ├── CommandPalette.tsx # ⌘K 命令面板
│   │       ├── Header.tsx         # 顶部导航栏
│   │       ├── NavGrid.tsx        # 站点网格/列表
│   │       └── SiteFormModal.tsx  # 添加/编辑站点表单
│   ├── data/
│   │   └── sites.json             # 内置站点数据
│   ├── hooks/
│   │   ├── useBookmarks.ts        # 书签导入/导出/持久化
│   │   ├── useSiteManager.ts      # 自定义站点 CRUD
│   │   └── useTheme.ts            # 主题管理
│   ├── pages/
│   │   ├── About.tsx              # 关于页（技术亮点/简历展示）
│   │   └── Home.tsx               # 首页（主功能入口）
│   ├── types/
│   │   └── index.ts               # 全量 TypeScript 类型定义
│   ├── index.css                  # 全局样式 + Design Token
│   ├── main.tsx                   # 应用入口
│   └── route.tsx                  # 路由配置（懒加载 + 错误边界）
├── index.html                     # 含防 FOUC 内联脚本
├── package.json
├── tsconfig.json
├── vite.config.ts
└── biome.json
```

---

## 快捷键

| 快捷键          | 功能                             |
| --------------- | -------------------------------- |
| `⌘K` / `Ctrl+K` | 打开命令面板                     |
| 任意可打印字符  | 聚焦搜索框（非输入状态）         |
| `↑` `↓`         | 命令面板 / 搜索引擎下拉列表导航  |
| `Enter`         | 命令面板：在新标签页打开选中站点 |
| `Esc`           | 关闭命令面板 / 表单 / 弹窗       |
| 右键 / 长按     | 打开站点上下文菜单               |

---

## 性能指标

| 指标              | 数值          | 说明                         |
| ----------------- | ------------- | ---------------------------- |
| FCP               | < 1s          | 首次内容绘制                 |
| FOUC              | 0ms           | 主题切换无闪烁               |
| JS Bundle         | ~112KB (gzip) | 含 React + Router + 所有功能 |
| TypeScript 覆盖率 | 100%          | strict 模式，零 any          |

---

## License

MIT © [dogxii](https://github.com/dogxii/inav)
