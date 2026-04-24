// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import Link from "next/link"

export default function ConvertQuotePage() {
  const { t } = useI18n()
  const { id } = useParams()
  const router = useRouter()
  const [quote, setQuote] = useState(null)
  const [items, setItems] = useState([])
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (id) getData()
  }, [id])

  const getData = async () => {
    const [{ data: quoteData }, { data: itemsData }, { data: clientData }] = await Promise.all([
      supabase.from("quotes").select("*").eq("id", id).single(),
      supabase.from("quote_items").select("*").eq("quote_id", id),
      supabase.from("clients").select("*")
    ])

    setQuote(quoteData)
    setItems(itemsData || [])
    setClient(clientData?.find(c => c.id === quoteData?.client_id))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "AWG" }).format(amount || 0)
  }

  const handleConvert = async () => {
    if (quote?.status === "converted") {
      alert("Esta cotización ya fue convertida")
      return
    }

    setLoading(true)

    try {
      // Try to get last invoice number, but continue if column doesn't exist
      let invoiceNumber = "0001"
      try {
        const { data: lastInvoice } = await supabase
          .from("invoices")
          .select("invoice_number")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (lastInvoice?.invoice_number) {
          const num = parseInt(lastInvoice.invoice_number) || 0
          invoiceNumber = String(num + 1).padStart(4, "0")
        }
      } catch (e) {}

      // Build invoice data - only use columns that exist
      const invoiceData = {
        client_id: quote.client_id,
        company_id: quote.company_id,
        total: quote.total,
        status: "pending"
      }

      // Add invoice_number if available
      invoiceData.invoice_number = invoiceNumber

      if (quote.notes) invoiceData.notes = quote.notes
      if (quote.delivery_date) invoiceData.delivery_date = quote.delivery_date
      if (quote.pickup_date) invoiceData.pickup_date = quote.pickup_date
      if (quote.rental_days) invoiceData.rental_days = quote.rental_days
      if (quote.subtotal) invoiceData.subtotal = quote.subtotal
      if (quote.tax_amount) invoiceData.tax_amount = quote.tax_amount
      if (quote.event_type) invoiceData.event_type = quote.event_type
      if (quote.event_location) invoiceData.event_location = quote.event_location

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([invoiceData])
        .select()
        .single()

      if (invoiceError) {
        console.error(invoiceError)
        setResult({ success: false, message: invoiceError.message })
        setLoading(false)
        return
      }

      const itemsToInsert = items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price || item.price,
        invoice_id: invoice.id
      }))

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert)

      if (itemsError) {
        console.error(itemsError)
        setResult({ success: false, message: itemsError.message })
        setLoading(false)
        return
      }

      await supabase
        .from("quotes")
        .update({ status: "converted" })
        .eq("id", id)

      setResult({ success: true, invoiceNumber, invoiceId: invoice.id })
    } catch (err) {
      console.error(err)
      setResult({ success: false, message: "Error inesperado" })
    } finally {
      setLoading(false)
    }
  }

  if (!quote) return <div className="p-8 flex items-center justify-center min-h-[400px]"><div className="text-slate-400">{t("common.loading")}</div></div>

  if (quote.status === "converted") {
    return (
      <div className="p-2 md:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href={`/quotes/${id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("quotes.converted")}</h2>
          <p className="text-slate-500 mb-6">Esta cotización ya fue convertida a factura.</p>
          <Link href={`/invoices`} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
            <FileText className="w-5 h-5" />
            Ver Facturas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/quotes/${id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">{t("quotes.convertToInvoice")}</h1>

      {result && !result.success && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{result.message}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Resumen de la Cotización</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">{t("quotes.quoteNumber")}</p>
            <p className="font-semibold text-slate-900">#{quote.quote_number}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">{t("invoices.client")}</p>
            <p className="font-semibold text-slate-900">{client?.name || "Cargando..."}</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t("invoices.description")}</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">{t("invoices.quantity")}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">{t("invoices.price")}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">{t("invoices.total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-slate-900">{item.description}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl px-6 py-4 text-white">
            <span className="text-lg font-semibold">{t("invoices.total")}: </span>
            <span className="text-xl font-bold">{formatCurrency(quote.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-amber-800">
          <strong>Nota:</strong> Al convertir, se creará una nueva factura con el número de factura siguiente. 
          La cotización cambiará a estado &quot;Convertida&quot;.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleConvert}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            "Convertiendo..."
          ) : (
            <>
              <FileText className="w-5 h-5" />
              {t("quotes.convertToInvoice")}
            </>
          )}
        </button>
        <button
          onClick={() => router.push(`/quotes/${id}`)}
          className="px-6 py-4 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all"
        >
          {t("common.cancel")}
        </button>
      </div>

      {result?.success && (
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">¡Factura Creada!</h2>
          <p className="text-green-700 mb-4">
            La cotización ha sido convertida a factura #{result.invoiceNumber}
          </p>
          <div className="flex gap-3 justify-center">
            <Link 
              href={`/invoices/${result.invoiceId}`} 
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition"
            >
              <FileText className="w-5 h-5" />
              Ver Factura
            </Link>
            <Link 
              href="/invoices" 
              className="inline-flex items-center gap-2 border border-green-300 text-green-700 px-6 py-3 rounded-xl font-medium hover:bg-green-100 transition"
            >
              Ver Todas las Facturas
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}