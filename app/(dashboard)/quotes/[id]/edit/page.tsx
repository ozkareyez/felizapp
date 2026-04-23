// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function EditQuotePage() {
  const { t } = useI18n()
  const { id } = useParams()
  const router = useRouter()
  const [quote, setQuote] = useState(null)
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [clientId, setClientId] = useState("")
  const [items, setItems] = useState([{ product_id: "", description: "", quantity: 1, price: 0 }])
  const [validUntil, setValidUntil] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    getData()
  }, [id])

  const getData = async () => {
    const [{ data: quoteData }, { data: clientsData }, { data: itemsData }, { data: productsData }] = await Promise.all([
      supabase.from("quotes").select("*").eq("id", id).single(),
      supabase.from("clients").select("*"),
      supabase.from("quote_items").select("*").eq("quote_id", id),
      supabase.from("products").select("*").order("categoria")
    ])

    setQuote(quoteData)
    setClients(clientsData || [])
    setProducts(productsData || [])
    setClientId(quoteData?.client_id || "")
    setValidUntil(quoteData?.valid_until || "")
    setNotes(quoteData?.notes || "")
    
    if (itemsData && itemsData.length > 0) {
      setItems(itemsData.map(i => ({
        product_id: "",
        description: i.description,
        quantity: i.quantity,
        price: i.unit_price || i.price
      })))
    }
    setInitialLoad(false)
  }

  const productsByCategory = products.reduce((acc, p) => {
    const cat = p.categoria || "Otros"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const addItem = () => {
    setItems([...items, { product_id: "", description: "", quantity: 1, price: 0 }])
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
    
    if (field === "product_id" && value) {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].description = product.name
        newItems[index].price = product.precio_dia || product.price || 0
      }
    }
    
    setItems(newItems)
  }

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "AWG" }).format(amount || 0)
  }

  const handleUpdate = async () => {
    if (!clientId) {
      alert("Selecciona un cliente")
      return
    }

    const validItems = items.filter(i => i.description.trim() !== "")
    if (validItems.length === 0) {
      alert("Agrega al menos un item")
      return
    }

    setLoading(true)

    try {
      const { error: quoteError } = await supabase
        .from("quotes")
        .update({
          client_id: clientId,
          total,
          valid_until: validUntil || null,
          notes: notes || null,
          status: quote?.status || "pending"
        })
        .eq("id", id)

      if (quoteError) {
        console.error(quoteError)
        alert(quoteError.message)
        return
      }

      await supabase.from("quote_items").delete().eq("quote_id", id)

      const itemsToInsert = validItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.price,
        quote_id: id
      }))

      const { error: itemsError } = await supabase
        .from("quote_items")
        .insert(itemsToInsert)

      if (itemsError) {
        console.error(itemsError)
        alert(itemsError.message)
        return
      }

      alert("Cotización actualizada")
      router.push(`/quotes/${id}`)
    } catch (err) {
      console.error(err)
      alert("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    const { error } = await supabase
      .from("quotes")
      .update({ status: newStatus })
      .eq("id", id)

    if (!error) {
      setQuote({ ...quote, status: newStatus })
    }
  }

  if (initialLoad) return <div className="p-6">{t("common.loading")}</div>

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/quotes/${id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t("invoices.editInvoice")} #{quote?.quote_number}</h1>
        <select
          value={quote?.status || "pending"}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2"
        >
          <option value="draft">{t("quotes.draft")}</option>
          <option value="pending">{t("quotes.pendingStatus")}</option>
          <option value="accepted">{t("quotes.accepted")}</option>
          <option value="rejected">{t("quotes.rejected")}</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">{t("invoices.selectClient")}</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">Elige un cliente...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-900">{t("invoices.lineItems")}</h2>
          <button onClick={addItem} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
            <Plus className="w-4 h-4" />
            {t("invoices.addItem")}
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl">
              <div className="flex-1">
                <select
                  value={item.product_id}
                  onChange={(e) => updateItem(i, "product_id", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {Object.entries(productsByCategory).map(([cat, prods]) => (
                    <optgroup key={cat} label={cat}>
                      {prods.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.precio_dia || p.price)}/día</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <input
                placeholder={t("invoices.description")}
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 bg-white text-slate-900"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                className="w-20 border border-slate-200 rounded-lg px-3 py-2.5 text-center bg-white text-slate-900"
                min="1"
              />
              <input
                type="number"
                value={item.price}
                onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                className="w-28 border border-slate-200 rounded-lg px-3 py-2.5 text-right bg-white text-slate-900"
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

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">{t("quotes.validUntil")}</label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white"
          />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white resize-none"
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>{t("invoices.total")}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {loading ? "Guardando..." : t("common.save")}
        </button>
        <button
          onClick={() => router.push(`/quotes/${id}`)}
          className="px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  )
}