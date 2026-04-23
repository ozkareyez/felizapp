// @ts-nocheck
"use client"

import { I18nProvider } from "@/lib/i18n"

export function Providers({ children }) {
  return (
    <I18nProvider defaultLocale="es">
      {children}
    </I18nProvider>
  )
}
