// @ts-nocheck
"use client"

import { I18nProvider } from "@/lib/i18n"
import { ThemeProvider } from "@/lib/theme-context"

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <I18nProvider defaultLocale="es">
        {children}
      </I18nProvider>
    </ThemeProvider>
  )
}
