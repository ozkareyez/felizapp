// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { FileText, Eye, Pencil, Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState({})
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const getData = async () => {
    const { data: invoicesData } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })

    const { data: clientsData } = await supabase
      .from("clients")
      .select("id, name")

    const clientsMap = {}
    ;(clientsData || []).forEach(c => { clientsMap[c.id] = c.name })
    setClients(clientsMap)
    setInvoices(invoicesData || [])
  }

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      const [{ data: invoicesData }, { data: clientsData }] = await Promise.all([
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name")
      ])
      const clientsMap = {}
      ;(clientsData || []).forEach(c => { clientsMap[c.id] = c.name })
      if (isMounted) {
        setClients(clientsMap)
        setInvoices(invoicesData || [])
      }
    }
    fetch()
    return () => { isMounted = false }
  }, [])

  const filteredInvoices = invoices.filter(inv => {
    const clientName = clients[inv.client_id] || ""
    const matchesSearch = clientName.toLowerCase().includes(search.toLowerCase()) || 
      (inv.invoice_number || "").includes(search)
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage)

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date + 'T00:00:00')
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "AWG",
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case "paid": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Pagada" }
      case "pending": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pendiente" }
      default: return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", label: "Borrador" }
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Facturas</h1>
          <p className="text-slate-500 mt-1">Gestiona todas tus facturas</p>
        </div>
        <Link 
          href="/invoices/create"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25"
        >
          <span className="text-lg">+</span>
          Nueva Factura
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o número..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagada</option>
            <option value="draft">Borrador</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-4">{filteredInvoices.length} factura(s) encontrada(s)</p>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Número</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedInvoices.map((inv) => {
                const status = getStatusStyle(inv.status)
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-medium text-slate-900">
                        #{inv.invoice_number || inv.id.slice(0, 6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 font-semibold text-xs">
                          {(clients[inv.client_id] || "C")[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{clients[inv.client_id] || "Cargando..."}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatDate(inv.created_at)}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">{formatCurrency(inv.total)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/invoices/${inv.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/invoices/${inv.id}/edit`} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition">
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay facturas</h3>
            <p className="text-slate-500 mb-4">No se encontraron facturas con los filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginatedInvoices.map((inv) => {
          const status = getStatusStyle(inv.status)
          return (
            <Link key={inv.id} href={`/invoices/${inv.id}`} className="block bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-mono text-sm font-medium text-slate-900">
                    #{inv.invoice_number || inv.id.slice(0, 6).toUpperCase()}
                  </span>
                  <p className="text-sm text-slate-500 mt-1">{formatDate(inv.created_at)}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 font-semibold text-xs">
                    {(clients[inv.client_id] || "C")[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-900 text-sm">{clients[inv.client_id] || "Cliente"}</span>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(inv.total)}</span>
              </div>
            </Link>
          )
        })}

        {filteredInvoices.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay facturas</h3>
            <p className="text-slate-500 mb-4">No se encontraron resultados</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            const isNear = Math.abs(page - currentPage) <= 2
            const isFirst = page === 1
            const isLast = page === totalPages
            
            if (!isNear && !isFirst && !isLast) {
              if (page === 2 || page === totalPages - 1) {
                return <span key={page} className="px-2 text-slate-400">...</span>
              }
              return null
            }
            
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-slate-300 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {page}
              </button>
            )
          })}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}