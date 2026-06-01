// @ts-nocheck
"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export default function RegisterPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">FE</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{t("common.brandName")}</h1>
          <p className="text-slate-400 mt-2">{t("common.brandSlogan")}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">{t("auth.createAccount")}</h2>
          
          <div className="space-y-4">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all"
            >
              {t("auth.startNow")}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t("auth.hasAccount")} <Link href="/login" className="text-blue-600 hover:underline">{t("auth.login")}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}