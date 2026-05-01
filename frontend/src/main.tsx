import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // 初始化 i18n
import { registerPwaServiceWorker } from './registerPwaServiceWorker'
import App from './App.tsx'

registerPwaServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
