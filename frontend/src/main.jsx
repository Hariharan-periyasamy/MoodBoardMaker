import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionGlobalConfig } from 'framer-motion'
import './index.css'
import App from './App.jsx'

// Respect user's system prefers-reduced-motion accessibility setting
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
MotionGlobalConfig.skipAnimations = prefersReducedMotion

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
