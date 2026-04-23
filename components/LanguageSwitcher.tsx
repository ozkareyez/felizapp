// @ts-nocheck
"use client"

import { Globe } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { locale, changeLocale, t } = useI18n()

  return (
    <button
      onClick={() => changeLocale(locale === "es" ? "en" : "es")}
      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase font-medium">{locale}</span>
    </button>
  )
}
