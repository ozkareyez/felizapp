// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Download } from "lucide-react"
import { generateInvoicePDF } from "@/lib/pdf-generator"

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [client, setClient] = useState(null)

  const getInvoice = async () => {
    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single()

    const { data: itemsData } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("id", invoiceData?.client_id)
      .single()

    setInvoice(invoiceData)
    setItems(itemsData || [])
    setClient(clientData)
  }

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      const { data: invoiceData } = await supabase.from("invoices").select("*").eq("id", id).single()
      const { data: itemsData } = await supabase.from("invoice_items").select("*").eq("invoice_id", id)
      const { data: clientData } = await supabase.from("clients").select("*").eq("id", invoiceData?.client_id).single()
      if (isMounted) {
        setInvoice(invoiceData)
        setItems(itemsData || [])
        setClient(clientData)
      }
    }
    if (id) fetch()
    return () => { isMounted = false }
  }, [id])

  if (!invoice) return <div className="p-8 flex items-center justify-center min-h-[400px]"><div className="text-slate-400">Cargando...</div></div>

  const rentalDays = invoice.rental_days || 1
  const subtotal = items.reduce((sum, item) => sum + item.quantity * (item.unit_price || item.price || 0) * rentalDays, 0)

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "AWG" }).format(amount || 0)
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case "paid": return { bg: "bg-emerald-500", label: "Pagada" }
      case "pending": return { bg: "bg-amber-500", label: "Pendiente" }
      default: return { bg: "bg-slate-400", label: "Borrador" }
    }
  }

  const status = getStatusStyle(invoice.status)

  const togglePaidStatus = async () => {
    const newStatus = invoice.status === "paid" ? "pending" : "paid"
    await supabase.from("invoices").update({ status: newStatus }).eq("id", id)
    setInvoice({ ...invoice, status: newStatus })
  }

  return (
    <div className="p-2 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/invoices" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
          Volver a facturas
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">FACTURA</h1>
                <button 
                  onClick={togglePaidStatus}
                  className={`px-4 py-2 rounded-full text-sm font-bold cursor-pointer hover:opacity-80 transition border-2 ${invoice.status === 'paid' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-amber-500 text-white border-amber-500'}`}
                >
                  {invoice.status === 'paid' ? '✓ Pagada' : '○ Pendiente'}
                </button>
              </div>
              <p className="text-slate-500 font-mono">#{invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Fecha de emisión</p>
              <p className="font-medium text-slate-900">{formatDate(invoice.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div className="p-5 rounded-xl bg-slate-50/50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">De</p>
            <p className="font-bold text-slate-900">Tu Empresa</p>
            <p className="text-sm text-slate-600 mt-1">info@tuempresa.com</p>
            <p className="text-sm text-slate-600">Calle Example 123</p>
            <p className="text-sm text-slate-600">28001 Madrid</p>
          </div>
          <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">Para</p>
            {client ? (
              <>
                <p className="font-bold text-slate-900">{client.name}</p>
                {client.email && <p className="text-sm text-slate-600 mt-1">{client.email}</p>}
                {client.phone && <p className="text-sm text-slate-600">{client.phone}</p>}
                {client.address && <p className="text-sm text-slate-600">{client.address}</p>}
              </>
            ) : <p className="text-slate-400">Cargando...</p>}
          </div>
        </div>

        <div className="px-8 pb-8">
          {(invoice.delivery_date || invoice.pickup_date) && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">Detalles del Alquiler</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {invoice.delivery_date && <div><span className="text-blue-600">Entrega:</span> <span className="text-blue-900">{formatDate(invoice.delivery_date)}</span></div>}
                {invoice.pickup_date && <div><span className="text-blue-600">Recogida:</span> <span className="text-blue-900">{formatDate(invoice.pickup_date)}</span></div>}
                <div><span className="text-blue-600">Días:</span> <span className="text-blue-900 font-bold">{rentalDays}</span></div>
              </div>
            </div>
          )}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Descripción</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Días</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Cantidad</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Precio/Día</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 text-slate-900">{item.description}</td>
                    <td className="px-5 py-4 text-center text-slate-600">{rentalDays}</td>
                    <td className="px-5 py-4 text-center text-slate-600">{item.quantity}</td>
                    <td className="px-5 py-4 text-right text-slate-600">{formatCurrency(item.unit_price || item.price || 0)}</td>
                    <td className="px-5 py-4 text-right font-medium text-slate-900">{formatCurrency(item.quantity * (item.unit_price || item.price || 0) * rentalDays)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-72">
              <div className="flex justify-between py-2 px-4 bg-slate-50/50 rounded-t-xl border border-slate-200 border-b-0">
                <span className="text-slate-500 text-sm">Días de alquiler:</span>
                <span className="font-medium text-slate-900">{rentalDays}</span>
              </div>
              <div className="flex justify-between py-2 px-4 bg-slate-50/50 border border-slate-200 border-b-0">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-4 px-4 bg-gradient-to-r from-blue-600 to-violet-600 rounded-b-xl text-white">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatCurrency(invoice.total || subtotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <Link href={`/invoices/${id}/edit`} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <button 
            onClick={() => generateInvoicePDF(invoice, items, client, rentalDays)}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  )
}