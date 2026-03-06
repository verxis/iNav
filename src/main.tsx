import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import './index.css'

import { router } from './route'

const rootElement = document.getElementById('root')

if (!rootElement) {
	throw new Error('[iNav] 挂载失败：未找到 #root 元素')
}

createRoot(rootElement).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)

requestAnimationFrame(() => {
	requestAnimationFrame(() => {
		// 首帧后启用主题过渡，避免初始渲染触发颜色动画
		document.body.classList.add('theme-ready')

		// 移除 index.html 骨架屏
		document.getElementById('shell-header')?.remove()
		document.getElementById('shell-main')?.remove()

		rootElement.classList.add('app-ready')
	})
})
