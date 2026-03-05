import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import './index.css'

import { router } from './route'

const rootElement = document.getElementById('root')

if (!rootElement) {
	throw new Error(
		'[iNav] 挂载失败：未找到 #root 元素，请检查 index.html 是否包含 <div id="root">',
	)
}

createRoot(rootElement).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)
