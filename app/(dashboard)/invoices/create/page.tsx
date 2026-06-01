// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function CreateInvoicePage() {
  const { t } = useI18n()
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState("")
  const [items, setItems] = useState([{ description: "", quantity: "", unit_price: "" }])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getClients()
  }, [])

  const getClients = async () => {
    const { data } = await supabase.from("clients").select("*")
    setClients(data || [])
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: "", unit_price: "" }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      setItems(newItems)
    }
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const total = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const price = Number(item.unit_price) || 0
    return sum + (qty * price)
  }, 0)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "AWG" }).format(amount || 0)
  }

  const handleCreate = async () => {
    if (!clientId) {
      alert(t("invoices.selectClientFirst"))
      return
    }

    const validItems = items.filter(i => i.description.trim() !== "" && i.quantity)
    if (validItems.length === 0) {
      alert(t("invoices.addItemWithQty"))
      return
    }

    setLoading(true)

    try {
      const { data: lastInvoice } = await supabase
        .from("invoices")
        .select("invoice_number")
        .order("invoice_number", { ascending: false })
        .limit(1)
        .single()

      const nextNumber = lastInvoice?.invoice_number 
        ? parseInt(lastInvoice.invoice_number) + 1 
        : 1
      const invoiceNumber = String(nextNumber).padStart(4, "0")

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([{
          client_id: clientId,
          company_id: "2b58cc88-82a4-444b-86d3-e5b952320d5a",
          total,
          invoice_number: invoiceNumber,
          status: "pending"
        }])
        .select()
        .single()

      if (invoiceError) {
        console.error(invoiceError)
        alert(invoiceError.message)
        return
      }

      if (!invoice?.id) {
        alert(t("invoices.noInvoiceId"))
        return
      }

      const itemsToInsert = validItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        invoice_id: invoice.id
      }))

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert)

      if (itemsError) {
        console.error(itemsError)
        alert(itemsError.message)
        return
      }

      alert(t("invoices.createSuccess", { number: invoiceNumber }))
      router.push("/invoices")
    } catch (err) {
      console.error(err)
      alert(t("common.unexpectedError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-2 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/invoices" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">{t("invoices.createTitle")}</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">{t("invoices.selectClient")}</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">{t("invoices.chooseClient")}</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        
        {clients.length === 0 && (
          <p className="text-sm text-slate-500 mt-3">
            {t("invoices.noClientsCreate")} <Link href="/clients/create" className="text-blue-600 hover:underline">{t("invoices.createClientLink")}</Link>
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-900">{t("invoices.itemsLine")}</h2>
          <button 
            onClick={addItem} 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            {t("common.add")}
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl">
              <input
                placeholder={t("invoices.descriptionPlaceholder")}
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <input
                type="number"
                placeholder={t("invoices.qtyPlaceholder")}
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", e.target.value)}
                className="w-16 sm:w-20 border border-slate-200 rounded-lg px-2 py-2.5 text-center bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
                min="1"
              />
              <input
                type="number"
                placeholder={t("invoices.pricePlaceholder")}
                value={item.unit_price}
                onChange={(e) => updateItem(i, "unit_price", e.target.value)}
                className="w-24 sm:w-28 border border-slate-200 rounded-lg px-2 py-2.5 text-right bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
                min="0"
                step="0.01"
              />
              <button 
                onClick={() => removeItem(i)} 
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                disabled={items.length === 1}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-6 mb-8 text-white" style={{ background: 'linear-gradient(135deg, var(--rose), #b82070)' }}>
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">{t("invoices.invoiceTotal")}</span>
          <span className="text-3xl font-bold">{formatCurrency(total)}</span>
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={loading || !clientId}
        className="w-full py-4 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all" style={{ backgroundColor: 'var(--rose)' }}
      >
        {loading ? t("invoices.creating") : t("invoices.createInvoice")}
      </button>
    </div>
  )
}