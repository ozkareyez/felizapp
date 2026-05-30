// @ts-nocheck
"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

const ThemeContext = createContext()

function getInitialTheme() {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem("theme")
  if (stored) return stored === "dark"
  return false
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [isDark])

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem("theme", next ? "dark" : "light")
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggle, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
