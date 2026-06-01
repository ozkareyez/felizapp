// @ts-nocheck
"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function CreateClientPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useI18n()

  const handleCreate = async () => {
    if (!name.trim()) {
      alert(t("clients.nameRequired"))
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from("clients")
      .insert([{
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        company_id: "2b58cc88-82a4-444b-86d3-e5b952320d5a"
      }])

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Error: " + error.message)
    } else {
      router.push("/clients")
    }
  }

  return (
    <div className="p-2 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/clients" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
          {t("clients.backToList")}
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">{t("clients.createTitle")}</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">{t("clients.name")} *</label>
          <input
            type="text"
            placeholder={t("clients.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">{t("clients.email")}</label>
          <input
            type="email"
            placeholder={t("clients.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">{t("clients.phone")}</label>
          <input
            type="tel"
            placeholder={t("clients.phonePlaceholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">{t("clients.address")}</label>
          <textarea
            placeholder={t("clients.addressPlaceholder")}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {loading ? t("clients.creating") : t("clients.newClient")}
        </button>
        <Link
          href="/clients"
          className="px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all"
        >
          {t("common.cancel")}
        </Link>
      </div>
    </div>
  )
}