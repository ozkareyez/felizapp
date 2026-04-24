// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, FileCheck, Download, Trash2, MessageCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { generateQuotePDF } from "@/lib/pdf-generator"

export default function QuoteDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const [quote, setQuote] = useState(null)
  const [items, setItems] = useState([])
  const [client, setClient] = useState(null)

  const getQuote = async () => {
    const { data: quoteData } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id)
      .single()

    const { data: itemsData } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", id)

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("id", quoteData?.client_id)
      .single()

    setQuote(quoteData)
    setItems(itemsData || [])
    setClient(clientData)
  }

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      const { data: quoteData } = await supabase.from("quotes").select("*").eq("id", id).single()
      const { data: itemsData } = await supabase.from("quote_items").select("*").eq("quote_id", id)
      const { data: clientData } = await supabase.from("clients").select("*").eq("id", quoteData?.client_id).single()
      if (isMounted) {
        setQuote(quoteData)
        setItems(itemsData || [])
        setClient(clientData)
      }
    }
    if (id) fetch()
    return () => { isMounted = false }
  }, [id])

  if (!quote) return <div className="p-8 flex items-center justify-center min-h-[400px]"><div className="text-slate-400">{t("common.loading")}</div></div>

  // Get rental days from database or calculate from dates
  const getRentalDays = () => {
    if (quote.rental_days) return quote.rental_days
    if (quote.delivery_date && quote.pickup_date) {
      const delivery = new Date(quote.delivery_date)
      const pickup = new Date(quote.pickup_date)
      const diffTime = pickup - delivery
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays > 0 ? diffDays : 1
    }
    return 1
  }

  const rentalDays = getRentalDays()
  const itemTotal = (item) => item.quantity * (item.unit_price || item.price) * rentalDays
  const subtotal = items.reduce((sum, item) => sum + itemTotal(item), 0)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "AWG" }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })
  }

  const formatDateISO = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('es-ES')
  }

  const shareOnWhatsApp = async () => {
    const fileName = `Cotizacion-${quote.reference || quote.quote_number || 'FELIZ'}.pdf`
    await generateQuotePDF(quote, items, client, rentalDays)
    setTimeout(() => {
      let text = `*COTIZACIÓN ${quote.reference || quote.quote_number}*\n\n`
      if (client?.name) text += `*Cliente:* ${client.name}\n`
      if (quote.event_type) text += `*Tipo de Evento:* ${quote.event_type}\n`
      if (quote.event_location) text += `*Ubicación:* ${quote.event_location}\n`
      if (quote.delivery_date) text += `*Entrega:* ${formatDateISO(quote.delivery_date)}\n`
      if (quote.pickup_date) text += `*Recogida:* ${formatDateISO(quote.pickup_date)}\n`
      if (rentalDays) text += `*Días de alquiler:* ${rentalDays}\n\n`
      text += `*TOTAL: AWG ${quote.total || subtotal}*\n\n`
      text += `El PDF se ha descargado. Por favor, envíalo como documento adjunto en WhatsApp.\n\n`
      text += `FELIZ ENTERPRISE - Aruba`
      
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
    }, 1500)
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case "accepted": return { bg: "bg-emerald-500", label: t("quotes.accepted") }
      case "rejected": return { bg: "bg-red-500", label: t("quotes.rejected") }
      case "pending": return { bg: "bg-amber-500", label: t("quotes.pendingStatus") }
      case "converted": return { bg: "bg-blue-500", label: t("quotes.converted") }
      default: return { bg: "bg-slate-400", label: t("quotes.draft") }
    }
  }

  const status = getStatusStyle(quote.status)

  return (
    <div className="p-2 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/quotes" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">QUOTE</h1>
                <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${status.bg}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-slate-500 font-mono">#{quote.quote_number || quote.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{t("common.date")}</p>
              <p className="font-medium text-slate-900">{formatDate(quote.created_at)}</p>
              {quote.valid_until && (
                <>
                  <p className="text-sm text-slate-500 mt-2">{t("quotes.validUntil")}</p>
                  <p className="font-medium text-slate-900">{formatDate(quote.valid_until)}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div className="p-5 rounded-xl bg-slate-50/50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t("invoices.from")}</p>
            <p className="font-bold text-slate-900">Your Company</p>
            <p className="text-sm text-slate-600 mt-1">info@company.com</p>
            <p className="text-sm text-slate-600">123 Business St</p>
            <p className="text-sm text-slate-600">Oranjestad, Aruba</p>
          </div>
          <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">{t("invoices.to")}</p>
            {client ? (
              <>
                <p className="font-bold text-slate-900">{client.name}</p>
                {client.email && <p className="text-sm text-slate-600 mt-1">{client.email}</p>}
                {client.phone && <p className="text-sm text-slate-600">{client.phone}</p>}
                {client.address && <p className="text-sm text-slate-600">{client.address}</p>}
              </>
            ) : <p className="text-slate-400">{t("common.loading")}</p>}
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Event Info */}
          {(quote.event_type || quote.event_location || quote.delivery_date || quote.pickup_date) && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">Detalles del Evento</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {quote.event_type && <div><span className="text-blue-600">Tipo:</span> <span className="text-blue-900">{quote.event_type}</span></div>}
                {quote.event_location && <div><span className="text-blue-600">Ubicación:</span> <span className="text-blue-900">{quote.event_location}</span></div>}
                {quote.delivery_date && <div><span className="text-blue-600">Entrega:</span> <span className="text-blue-900">{formatDate(quote.delivery_date)}</span></div>}
                {quote.pickup_date && <div><span className="text-blue-600">Recogida:</span> <span className="text-blue-900">{formatDate(quote.pickup_date)}</span></div>}
              </div>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">{t("invoices.description")}</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Días</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase">{t("invoices.quantity")}</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase">{t("invoices.price")}/día</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase">{t("invoices.total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 text-slate-900">{item.description}</td>
                    <td className="px-5 py-4 text-center text-slate-600">{rentalDays}</td>
                    <td className="px-5 py-4 text-center text-slate-600">{item.quantity}</td>
                    <td className="px-5 py-4 text-right text-slate-600">{formatCurrency(item.unit_price || item.price)}</td>
                    <td className="px-5 py-4 text-right font-medium text-slate-900">{formatCurrency(itemTotal(item))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {quote.notes && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-1">Notas:</p>
              <p className="text-sm text-slate-600">{quote.notes}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <div className="w-72">
              <div className="flex justify-between py-2 px-4 bg-slate-50/50 rounded-t-xl border border-slate-200 border-b-0">
                <span className="text-slate-500 text-sm">Días de alquiler:</span>
                <span className="font-medium text-slate-900">{rentalDays}</span>
              </div>
              <div className="flex justify-between py-2 px-4 bg-slate-50/50 border border-slate-200 border-b-0">
                <span className="text-slate-600">{t("invoices.subtotal")}</span>
                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-4 px-4 bg-gradient-to-r from-blue-600 to-violet-600 rounded-b-xl text-white">
                <span className="font-semibold">{t("invoices.total")}</span>
                <span className="font-bold text-lg">{formatCurrency(quote.total || subtotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-3">
            <Link href={`/quotes/${id}/edit`} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition">
              <Edit className="w-4 h-4" />
              {t("common.edit")}
            </Link>
          </div>
          <div className="flex gap-3">
            {quote.status !== "converted" && (
              <Link href={`/quotes/${id}/convert`} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                <FileCheck className="w-4 h-4" />
                {t("quotes.convertToInvoice")}
              </Link>
            )}
            <button 
              onClick={() => generateQuotePDF(quote, items, client, rentalDays)}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button 
              onClick={shareOnWhatsApp}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}