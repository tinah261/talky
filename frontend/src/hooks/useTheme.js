import { useState, useEffect } from 'react'

const THEME_KEY = 'talky_theme'

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY)
    return saved || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme: setThemeState, toggleTheme }
}