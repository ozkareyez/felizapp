// @ts-nocheck
"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/lib/theme-context"

export function ThemeToggle() {
  const { isDark, toggle, mounted } = useTheme()

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden group"
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${isDark ? 'bg-cyan-500/10' : 'bg-slate-100'}`} />
      <div className={`relative z-10 transition-all duration-300 group-hover:scale-110 ${isDark ? 'text-cyan-400' : 'text-slate-500'}`}>
        {isDark ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
      </div>
    </button>
  )
}
