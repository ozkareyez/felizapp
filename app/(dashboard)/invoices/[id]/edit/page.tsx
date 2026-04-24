// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, X } from "lucide-react"

export default function EditInvoicePage() {
  const { id } = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState(null)
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState("")
  const [items, setItems] = useState([{ description: "", quantity: 1, price: 0 }])
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    getData()
  }, [id])

  const getData = async () => {
    const [{ data: invoiceData }, { data: clientsData }, { data: itemsData }] = await Promise.all([
      supabase.from("invoices").select("*").eq("id", id).single(),
      supabase.from("clients").select("*"),
      supabase.from("invoice_items").select("*").eq("invoice_id", id)
    ])

    setInvoice(invoiceData)
    setClients(clientsData || [])
    setClientId(invoiceData?.client_id || "")
    
    if (itemsData && itemsData.length > 0) {
      setItems(itemsData.map(i => ({
        description: i.description,
        quantity: i.quantity,
        price: i.unit_price || i.price || 0
      })))
    }
    setInitialLoad(false)
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
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          client_id: clientId,
          total,
          status: invoice?.status || "pending"
        })
        .eq("id", id)

      if (invoiceError) {
        console.error(invoiceError)
        alert(invoiceError.message)
        return
      }

      await supabase.from("invoice_items").delete().eq("invoice_id", id)

      const itemsToInsert = validItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.price,
        invoice_id: id
      }))

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert)

      if (itemsError) {
        console.error(itemsError)
        alert(itemsError.message)
        return
      }

      alert("Factura actualizada")
      router.push(`/invoices/${id}`)
    } catch (err) {
      console.error(err)
      alert("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", id)

    if (!error) {
      setInvoice({ ...invoice, status: newStatus })
    }
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case "paid": return { bg: "bg-emerald-500", label: "Pagada" }
      case "pending": return { bg: "bg-amber-500", label: "Pendiente" }
      default: return { bg: "bg-slate-400", label: "Borrador" }
    }
  }

  const status = invoice ? getStatusStyle(invoice.status) : { bg: "bg-slate-400", label: "Borrador" }

  if (initialLoad) return <div className="p-8 flex items-center justify-center min-h-[400px]"><div className="text-slate-400">Cargando...</div></div>

  return (
    <div className="p-2 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/invoices/${id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
          Volver a factura
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Editar Factura #{invoice?.invoice_number || id.slice(0, 6).toUpperCase()}</h1>
          </div>
          <select
            value={invoice?.status || "pending"}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-4 py-2 rounded-lg border-2 font-medium cursor-pointer text-slate-900 bg-white ${invoice?.status === 'paid' ? 'border-emerald-500' : 'border-amber-500'}`}
          >
            <option value="draft">Borrador</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagada</option>
          </select>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-800">Items</h2>
              <button onClick={addItem} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Agregar item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center p-3 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl sm:rounded-none">
                  <input
                    placeholder="Descripción del servicio"
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    className="flex-1 w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex gap-2 w-full sm:w-auto items-end">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Cant.</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                        className="w-full sm:w-20 border border-slate-300 rounded-lg px-3 py-3 text-center text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Precio</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                        className="w-full sm:w-28 border border-slate-300 rounded-lg px-3 py-3 text-right text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <button 
                      onClick={() => removeItem(i)} 
                      className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition mt-5 sm:mt-0"
                      disabled={items.length === 1}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-slate-600">Total</span>
              <span className="text-slate-900">AWG {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            onClick={() => router.push(`/invoices/${id}`)}
            className="px-6 py-3 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}