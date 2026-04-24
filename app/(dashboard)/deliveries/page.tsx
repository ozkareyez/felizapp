// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { ArrowLeft, Truck, RotateCcw, Check, X, Calendar, MapPin, User, Package } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function DeliveriesPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("delivery")
  const [deliveryItems, setDeliveryItems] = useState([])
  const [pickupItems, setPickupItems] = useState([])
  const [clients, setClients] = useState({})
  const [filter, setFilter] = useState("pending")
  const [dateFilter, setDateFilter] = useState("today")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: quotesData }, { data: clientsData }] = await Promise.all([
      supabase.from("quotes").select("*").order("delivery_date", { ascending: true }),
      supabase.from("clients").select("id, name")
    ])

    const clientsMap = {}
    clientsData?.forEach(c => { clientsMap[c.id] = c.name })
    setClients(clientsMap)

    const activeQuotes = (quotesData || []).filter(q => 
      q.status === "accepted" || q.status === "converted"
    )

    const deliveries = activeQuotes.filter(q => q.delivery_date).sort((a, b) => 
      new Date(a.delivery_date) - new Date(b.delivery_date)
    )
    const pickups = activeQuotes.filter(q => q.pickup_date).sort((a, b) => 
      new Date(a.pickup_date) - new Date(b.pickup_date)
    )

    setDeliveryItems(deliveries)
    setPickupItems(pickups)
    setLoading(false)
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
  }

  const getAlertType = (dateStr) => {
    if (!dateStr) return "upcoming"
    const d = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return "overdue"
    if (diffDays === 0) return "today"
    if (diffDays === 1) return "tomorrow"
    return "upcoming"
  }

  const markDeliveryComplete = async (id) => {
    await supabase.from("quotes").update({ delivery_status: 'completed' }).eq("id", id)
    setDeliveryItems(prev => prev.filter(q => q.id !== id))
  }

  const markPickupComplete = async (id) => {
    await supabase.from("quotes").update({ pickup_status: 'completed' }).eq("id", id)
    setPickupItems(prev => prev.filter(q => q.id !== id))
  }

  const items = activeTab === "delivery" ? deliveryItems : pickupItems
  
  // Contador para HOY
  const todayCount = items.filter(i => {
    const dateField = activeTab === "delivery" ? i.delivery_date : i.pickup_date
    const status = activeTab === "delivery" ? i.delivery_status : i.pickup_status
    const today = new Date().toISOString().split('T')[0]
    return dateField === today && (!status || status !== "completed")
  }).length
  
  // Contador total pendiente
  const allPendingCount = items.filter(i => {
    const status = activeTab === "delivery" ? i.delivery_status : i.pickup_status
    return !status || status !== "completed"
  }).length

  const filteredItems = items.filter(item => {
    const dateField = activeTab === "delivery" ? item.delivery_date : item.pickup_date
    const statusField = activeTab === "delivery" ? item.delivery_status : item.pickup_status
    
    if (filter === "completed") {
      return statusField === "completed"
    }
    
    if (dateFilter === "today") {
      const today = new Date().toISOString().split('T')[0]
      return dateField === today && (!statusField || statusField !== "completed")
    }
    
    return !statusField || statusField !== "completed"
  })

  const pendingCount = dateFilter === "today" ? todayCount : allPendingCount

  const completedCount = items.filter(i => {
    const status = activeTab === "delivery" ? i.delivery_status : i.pickup_status
    return status === "completed"
  }).length

  if (loading) {
    return (
      <div className="p-2 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
          Volver al dashboard
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("delivery")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === "delivery"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Truck className="w-5 h-5" />
              Entregas
              {pendingCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("pickup")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === "pickup"
                  ? "bg-orange-50 text-orange-700 border-b-2 border-orange-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              Recolecciones
              {pendingCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-2 border-b border-slate-200 flex gap-2 flex-wrap items-center">
          <span className="text-xs text-slate-500 font-medium">Fecha:</span>
          <button
            onClick={() => setDateFilter("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              dateFilter === "today"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setDateFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              dateFilter === "all"
                ? "bg-slate-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todas
          </button>
          
          <span className="ml-auto text-xs text-slate-500 font-medium">Estado:</span>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Pend.
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === "completed"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Compl.
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === "all"
                ? "bg-slate-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todas
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay {filter === "pending" ? "pendientes" : filter === "completed" ? "completadas" : ""}</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const dateField = activeTab === "delivery" ? item.delivery_date : item.pickup_date
              const statusField = activeTab === "delivery" ? item.delivery_status : item.pickup_status
              const alertType = getAlertType(dateField)
              const isCompleted = statusField === "completed"
              
              const alertStyles = {
                overdue: "bg-red-50 border-red-200",
                today: "bg-orange-50 border-orange-200",
                tomorrow: "bg-amber-50 border-amber-200",
                upcoming: "bg-blue-50 border-blue-200"
              }
              
              const alertColors = {
                overdue: "bg-red-500",
                today: "bg-orange-500",
                tomorrow: "bg-amber-500",
                upcoming: "bg-blue-500"
              }

              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                    isCompleted 
                      ? "bg-slate-50 opacity-60" 
                      : alertStyles[alertType]
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link 
                        href={`/quotes/${item.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 truncate"
                      >
                        {item.reference || item.quote_number || 'Cotización'}
                      </Link>
                      {!isCompleted && (
                        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${alertColors[alertType]}`}>
                          {alertType === "overdue" ? "Atrasado" : alertType === "today" ? "Hoy" : alertType === "tomorrow" ? "Mañana" : "Próximo"}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {clients[item.client_id] || 'Cliente'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {item.event_location || 'Sin ubicación'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(dateField)}
                      </span>
                      {item.event_type && (
                        <span className="px-2 py-0.5 bg-slate-200 rounded text-xs">
                          {item.event_type}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/quotes/${item.id}`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Ver cotización"
                    >
                      <Package className="w-5 h-5" />
                    </Link>
                    {!isCompleted && (
                      <button
                        onClick={() => activeTab === "delivery" ? markDeliveryComplete(item.id) : markPickupComplete(item.id)}
                        className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                        title="Marcar como completado"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}