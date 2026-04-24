// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

export default function CreateInvoicePage() {
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState("")
  const [items, setItems] = useState([{ description: "", quantity: 1, price: 0 }])
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
    setItems([...items, { description: "", quantity: 1, price: 0 }])
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

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "AWG" }).format(amount || 0)
  }

  const handleCreate = async () => {
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
        alert("No se pudo obtener el ID de la factura")
        return
      }

      const itemsToInsert = validItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.price,
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

      alert(`Factura #${invoiceNumber} creada`)
      router.push("/invoices")
    } catch (err) {
      console.error(err)
      alert("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-2 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/invoices" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
          Volver a facturas
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">Nueva Factura</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Seleccionar Cliente</label>
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
        
        {clients.length === 0 && (
          <p className="text-sm text-slate-500 mt-3">
            No hay clientes. <Link href="/clients/create" className="text-blue-600 hover:underline">Crear cliente</Link>
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-900">Línea de-items</h2>
          <button 
            onClick={addItem} 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl">
              <input
                placeholder="Descripción del servicio o producto"
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <input
                type="number"
                placeholder="Cant"
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                className="w-20 border border-slate-200 rounded-lg px-3 py-2.5 text-center bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                min="1"
              />
              <input
                type="number"
                placeholder="Precio"
                value={item.price}
                onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                className="w-28 border border-slate-200 rounded-lg px-3 py-2.5 text-right bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

      <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Total de la Factura</span>
          <span className="text-3xl font-bold">{formatCurrency(total)}</span>
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={loading || !clientId}
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "Creando factura..." : "Crear Factura"}
      </button>
    </div>
  )
}