// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Package, ChevronDown } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function CreateQuotePage() {
  const { t } = useI18n()
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [clientId, setClientId] = useState("")
  const [items, setItems] = useState([{ product_id: "", description: "", quantity: 1, price: 0 }])
  const [rentalDays, setRentalDays] = useState(1)
  const [eventLocation, setEventLocation] = useState("")
  const [eventType, setEventType] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    const [{ data: clientsData }, { data: productsData }] = await Promise.all([
      supabase.from("clients").select("*"),
      supabase.from("products").select("*").order("categoria")
    ])
    setClients(clientsData || [])
    setProducts(productsData || [])
  }

  const formatDateLocal = (dateStr) => {
    if (!dateStr) return 'Sin fecha'
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('es-ES')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "AWG" }).format(amount || 0)
  }

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

    // If selecting a product, auto-fill from inventory
    if (field === "product_id" && value) {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].description = product.name
        newItems[index].price = product.precio_dia || product.price
      }
    }

    setItems(newItems)
  }

  // Group products by category
  const productsByCategory = products.reduce((acc, p) => {
    const cat = p.categoria || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const getSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.price * rentalDays)
    }, 0)
  }

  const total = getSubtotal()

  const handleCreate = async () => {
    if (!clientId) {
      alert("Selecciona un cliente")
      return
    }

    const validItems = items.filter(i => i.description && i.description.trim() !== "")
    if (validItems.length === 0) {
      alert("Agrega al menos un producto")
      return
    }

    setLoading(true)

    try {
      let reference = "FELIZ-001"
      try {
        const { data: lastQuote } = await supabase
          .from("quotes")
          .select("quote_number")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (lastQuote?.quote_number) {
          const num = parseInt(lastQuote.quote_number) || 0
          reference = `FELIZ-${String(num + 1).padStart(3, "0")}`
        }
      } catch (e) {}

      const quoteData = {
        client_id: clientId,
        company_id: "2b58cc88-82a4-444b-86d3-e5b952320d5a",
        total,
        quote_number: reference.replace("FELIZ-", ""),
        status: "pending",
        delivery_date: deliveryDate || null,
        pickup_date: pickupDate || null,
        rental_days: rentalDays
      }

      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert([quoteData])
        .select()
        .single()

      if (quoteError) {
        console.error(quoteError)
        alert(quoteError.message)
        setLoading(false)
        return
      }

      if (!quote?.id) {
        alert("No se pudo crear la cotización")
        setLoading(false)
        return
      }

      const updateData = {}
      if (eventLocation) updateData.event_location = eventLocation
      if (eventType) updateData.event_type = eventType
      if (validUntil) updateData.valid_until = validUntil
      if (notes) updateData.notes = notes
      if (reference) updateData.reference = reference

      if (Object.keys(updateData).length > 0) {
        try {
          await supabase.from("quotes").update(updateData).eq("id", quote.id)
        } catch (e) {
          console.log("Update error, but continuing...")
        }
      }

      const itemsToInsert = validItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.price,
        quote_id: quote.id
      }))

      const { error: itemsError } = await supabase
        .from("quote_items")
        .insert(itemsToInsert)

      if (itemsError) {
        console.error(itemsError)
        alert(itemsError.message)
        setLoading(false)
        return
      }

      alert(`Cotización ${reference} creada!`)
      router.push("/quotes")
    } catch (err) {
      console.error(err)
      alert("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const eventTypes = [
    "Fiesta Infantil",
    "Evento Corporativo",
    "Boda",
    "Reunión Familiar",
    "Evento Escolar",
    "Otro"
  ]

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/quotes" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />Back
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">New Quote - Happy Events</h1>

      {/* Client Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Client Information</h2>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Fechas de Alquiler</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Entrega</label>
            <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Recogida</label>
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Evento</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Seleccionar tipo...</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ubicación</label>
            <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Ubicación del evento" className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      {/* Rental Days Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Días de Alquiler</label>
            <input
              type="number"
              value={rentalDays}
              onChange={(e) => setRentalDays(Math.max(1, Number(e.target.value)))}
              className="w-32 border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-semibold"
              min="1"
            />
          </div>
          <div className="flex-1 text-sm text-slate-500">
            <p>Entrega: {formatDateLocal(deliveryDate)}</p>
            <p>Recogida: {formatDateLocal(pickupDate)}</p>
          </div>
        </div>
      </div>

      {/* Products Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-900">Productos</h2>
          <button onClick={addItem} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
            <Plus className="w-4 h-4" />Agregar Producto
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
                type="number"
                placeholder="Cant"
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                className="w-16 border border-slate-300 rounded-lg px-2 py-2 text-center bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
              <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-right bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
              <button onClick={() => removeItem(i)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" disabled={items.length === 1}>
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Valid Until & Notes */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Válido Hasta</label>
          <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>Total ({rentalDays} días de alquiler)</span>
          <span className="text-3xl font-bold">{formatCurrency(total)}</span>
        </div>
      </div>

      <button onClick={handleCreate} disabled={loading || !clientId} className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all">
        {loading ? "Creando..." : "Crear Cotización"}
      </button>
    </div>
  )
}