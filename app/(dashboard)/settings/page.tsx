// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Save, Bell, Building, User, CheckCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function SettingsPage() {
  const { t } = useI18n()
  const [companyName, setCompanyName] = useState("FELIZ ENTERPRISE")
  const [companyEmail, setCompanyEmail] = useState("info@felizaruba.com")
  const [companyPhone, setCompanyPhone] = useState("+297 000-0000")
  const [companyAddress, setCompanyAddress] = useState("Aruba")
  const [companyRuc, setCompanyRuc] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadSettings = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", "2b58cc88-82a4-444b-86d3-e5b952320d5a")
      .single()

    if (data) {
      setCompanyName(data.name || "FELIZ ENTERPRISE")
      setCompanyEmail(data.email || "info@felizaruba.com")
      setCompanyPhone(data.phone || "+297 000-0000")
      setCompanyAddress(data.address || "Aruba")
      setCompanyRuc(data.ruc || "")
    }

    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true")
    }
  }

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      const { data } = await supabase.from("companies").select("*").eq("id", "2b58cc88-82a4-444b-86d3-e5b952320d5a").single()
      if (!isMounted) return
      if (data) {
        setCompanyName(data.name || "FELIZ ENTERPRISE")
        setCompanyEmail(data.email || "info@felizaruba.com")
        setCompanyPhone(data.phone || "+297 000-0000")
        setCompanyAddress(data.address || "Aruba")
        setCompanyRuc(data.ruc || "")
      }
      const savedNotifications = localStorage.getItem("notifications")
      if (savedNotifications !== null) {
        setNotifications(savedNotifications === "true")
      }
    }
    fetch()
    return () => { isMounted = false }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    
    await supabase
      .from("companies")
      .update({
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddress,
        ruc: companyRuc
      })
      .eq("id", "2b58cc88-82a4-444b-86d3-e5b952320d5a")

    localStorage.setItem("notifications", notifications ? "true" : "false")
    
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t("settings.title")}</h1>
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{t("settings.saved")}</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">{t("settings.companyInfo")}</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">{t("settings.companyName")}</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">{t("settings.companyRuc")}</label>
                  <input
                    type="text"
                    value={companyRuc}
                    onChange={(e) => setCompanyRuc(e.target.value)}
                    placeholder={t("settings.companyRuc")}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">{t("settings.email")}</label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">{t("settings.phone")}</label>
                  <input
                    type="tel"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">{t("settings.address")}</label>
                <textarea
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">{t("settings.preferences")}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{t("settings.notifications")}</p>
                    <p className="text-sm text-slate-500">{t("settings.notificationAlert")}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-14 h-7 rounded-full relative transition-colors ${notifications ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${notifications ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("settings.saving")}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{t("settings.save")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}