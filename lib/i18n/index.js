"use client"

import { createContext, useContext, useState, useEffect } from "react"
import en from "./en.json"
import es from "./es.json"

const translations = { en, es }

const I18nContext = createContext()

export function I18nProvider({ children, defaultLocale = "es" }) {
  const [locale, setLocale] = useState(defaultLocale)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("locale")
    if (saved && translations[saved]) {
      requestAnimationFrame(() => {
        setLocale(saved)
      })
    }
    requestAnimationFrame(() => {
      setIsHydrated(true)
    })
  }, [])

  const t = (key) => {
    const keys = key.split(".")
    let value = translations[locale]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  const changeLocale = (newLocale) => {
    if (translations[newLocale]) {
      setLocale(newLocale)
      localStorage.setItem("locale", newLocale)
    }
  }

  return (
    <I18nContext.Provider value={{ t, locale, changeLocale, isHydrated }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
