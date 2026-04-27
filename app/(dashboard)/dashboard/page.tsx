// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { FileText, Users, DollarSign, Clock, FilePlus, UserPlus, ClipboardList, ArrowUpRight, TrendingUp, TrendingDown, Target, Calendar, BarChart3, Download } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { exportAllData } from "@/lib/excel-export"

const getData = async (filters = {}) => {
  const { dateFrom, dateTo } = filters
  const [{ data: invoices }, { data: clientsData }, { data: quotes }, allInvoicesResp, allClientsResp] = await Promise.all([
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name, created_at"),
    supabase.from("quotes").select("*").order("created_at", { ascending: false }),
    supabase.from("invoices").select("*"),
    supabase.from("clients").select("id")
  ])

  const clientsMap = {}
  clientsData?.forEach(c => { clientsMap[c.id] = c.name })

  // Apply date filters
  let filteredInvoices = (allInvoicesResp.data || [])
  if (dateFrom) {
    filteredInvoices = filteredInvoices.filter(inv => inv.created_at && new Date(inv.created_at) >= new Date(dateFrom + 'T00:00:00'))
  }
  if (dateTo) {
    filteredInvoices = filteredInvoices.filter(inv => inv.created_at && new Date(inv.created_at) <= new Date(dateTo + 'T23:59:59'))
  }

  const totalRevenue = filteredInvoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.total || 0), 0)

  const pendingAmount = filteredInvoices
    .filter(inv => inv.status === "pending")
    .reduce((sum, inv) => sum + (inv.total || 0), 0)

  const pendingCount = filteredInvoices.filter(inv => inv.status === "pending").length

  // Monthly revenue data for chart (using filtered invoices)
  const monthlyData = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleDateString("es-ES", { month: "short" })
    monthlyData[key] = 0
  }
  
  filteredInvoices.forEach(inv => {
    if (inv.status === "paid" && inv.created_at) {
      const d = new Date(inv.created_at)
      const key = d.toLocaleDateString("es-ES", { month: "short" })
      if (monthlyData[key] !== undefined) {
        monthlyData[key] += inv.total || 0
      }
    }
  })

  const revenueChartData = Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount: Math.round(amount)
  }))

  // Invoices by status (using filtered)
  const statusCounts = { paid: 0, pending: 0, draft: 0 }
  filteredInvoices.forEach(inv => {
    if (statusCounts[inv.status] !== undefined) statusCounts[inv.status]++
    else statusCounts.draft++
  })

  const statusChartData = [
    { name: "Paid", value: statusCounts.paid, color: "#10b981" },
    { name: "Pending", value: statusCounts.pending, color: "#f59e0b" },
    { name: "Draft", value: statusCounts.draft, color: "#94a3b8" }
  ].filter(d => d.value > 0)

  // Client growth (filtered by date)
  let filteredClients = clientsData || []
  if (dateFrom) {
    filteredClients = filteredClients.filter(c => c.created_at && new Date(c.created_at) >= new Date(dateFrom + 'T00:00:00'))
  }
  if (dateTo) {
    filteredClients = filteredClients.filter(c => c.created_at && new Date(c.created_at) <= new Date(dateTo + 'T23:59:59'))
  }
  const newClientsThisMonth = filteredClients.filter(c => {
    const d = new Date(c.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Average invoice value (using filtered)
  const paidInvoices = filteredInvoices.filter(inv => inv.status === "paid")
  const avgInvoiceValue = paidInvoices.length ? Math.round(totalRevenue / paidInvoices.length) : 0

  // Previous month revenue for comparison (using filtered)
  const prevMonthRevenue = filteredInvoices.filter(inv => {
    if (inv.status !== "paid" || !inv.created_at) return false
    const d = new Date(inv.created_at)
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getMonth() === prevMonth.getMonth() && d.getFullYear() === prevMonth.getFullYear()
  }).reduce((sum, inv) => sum + (inv.total || 0), 0)

  const revenueGrowth = prevMonthRevenue > 0 ? Math.round(((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0

  // Recent invoices (filtered)
  const recentInvoicesData = filteredInvoices.slice(0, 10)

  // Get dates for notifications (filter by date range too)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get all quotes except rejected (include converted for delivery/pickup)
  let activeQuotes = (quotes || []).filter(q => q.status !== 'rejected')
  
  // Filter notifications by date range if specified
  if (dateFrom) {
    activeQuotes = activeQuotes.filter(q => {
      if (!q.delivery_date && !q.pickup_date) return true
      const d = q.delivery_date || q.pickup_date
      return new Date(d + 'T00:00:00') >= new Date(dateFrom + 'T00:00:00')
    })
  }
  if (dateTo) {
    activeQuotes = activeQuotes.filter(q => {
      if (!q.delivery_date && !q.pickup_date) return true
      const d = q.delivery_date || q.pickup_date
      return new Date(d + 'T00:00:00') <= new Date(dateTo + 'T23:59:59')
    })
  }
  
  // Delivery notifications - show upcoming 7 days (only pending)
  const deliveryNotifications = activeQuotes.filter(q => {
    if (!q.delivery_date || q.delivery_status === 'completed') return false
    const d = new Date(q.delivery_date + 'T00:00:00')
    d.setHours(0, 0, 0, 0)
    const daysDiff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
    return daysDiff >= 0 && daysDiff <= 7
  }).sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date))

  // Pickup notifications - show upcoming 7 days (only pending)
  const pickupNotifications = activeQuotes.filter(q => {
    if (!q.pickup_date || q.pickup_status === 'completed') return false
    const d = new Date(q.pickup_date + 'T00:00:00')
    d.setHours(0, 0, 0, 0)
    const daysDiff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
    return daysDiff >= 0 && daysDiff <= 7
  }).sort((a, b) => new Date(a.pickup_date) - new Date(b.pickup_date))

  return {
    stats: {
      totalInvoices: filteredInvoices.length,
      totalClients: filteredClients.length,
      totalRevenue,
      pendingInvoices: pendingCount,
      pendingAmount,
      newClientsThisMonth,
      avgInvoiceValue,
      revenueGrowth,
      totalQuotes: quotes?.length || 0,
      acceptedQuotes: (quotes || []).filter(q => q.status === "accepted").length,
      convertedQuotes: (quotes || []).filter(q => q.status === "converted").length
    },
    recentInvoices: invoices?.slice(0, 5) || [],
    recentQuotes: quotes?.slice(0, 3) || [],
    clients: clientsMap,
    revenueChartData,
    statusChartData
  }
}

export default function DashboardPage() {
  const { t } = useI18n()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [datePreset, setDatePreset] = useState("all")
  const [stats, setStats] = useState({
    totalInvoices: 0, totalClients: 0, totalRevenue: 0, pendingInvoices: 0,
    pendingAmount: 0, newClientsThisMonth: 0, avgInvoiceValue: 0, revenueGrowth: 0,
    totalQuotes: 0, acceptedQuotes: 0, convertedQuotes: 0, deliveryCount: 0, pickupCount: 0
  })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [clients, setClients] = useState({})
  const [revenueChartData, setRevenueChartData] = useState([])
  const [statusChartData, setStatusChartData] = useState([])

  const getAlertType = (dateStr) => {
    if (!dateStr) return ''
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(dateStr + 'T00:00:00')
    d.setHours(0, 0, 0, 0)
    const daysDiff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
    if (daysDiff < 0) return 'overdue'
    if (daysDiff === 0) return 'today'
    if (daysDiff === 1) return 'tomorrow'
    return 'upcoming'
  }

  const applyPreset = (preset) => {
    setDatePreset(preset)
    const today = new Date()
    let from = ""
    let to = ""
    
    switch(preset) {
      case "today":
        from = today.toISOString().split('T')[0]
        to = today.toISOString().split('T')[0]
        break
      case "week":
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        from = weekStart.toISOString().split('T')[0]
        to = today.toISOString().split('T')[0]
        break
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        from = monthStart.toISOString().split('T')[0]
        to = today.toISOString().split('T')[0]
        break
      case "lastMonth":
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
        from = lastMonthStart.toISOString().split('T')[0]
        to = lastMonthEnd.toISOString().split('T')[0]
        break
      case "all":
      default:
        from = ""
        to = ""
    }
    
    setDateFrom(from)
    setDateTo(to)
    
    // Apply filters immediately after setting dates
    getData({ dateFrom: from, dateTo: to }).then(data => {
      setStats(data.stats)
      setRecentInvoices(data.recentInvoices)
      setClients(data.clients)
      setRevenueChartData(data.revenueChartData)
      setStatusChartData(data.statusChartData)
    })
  }

  const applyFilters = (from = dateFrom, to = dateTo) => {
    getData({ dateFrom: from, dateTo: to }).then(data => {
      setStats(data.stats)
      setRecentInvoices(data.recentInvoices)
      setClients(data.clients)
      setRevenueChartData(data.revenueChartData)
      setStatusChartData(data.statusChartData)
    })
  }

  useEffect(() => {
    getData({ dateFrom, dateTo }).then(data => {
      setStats(data.stats)
      setRecentInvoices(data.recentInvoices)
      setClients(data.clients)
      setRevenueChartData(data.revenueChartData)
      setStatusChartData(data.statusChartData)
    })
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "AWG", minimumFractionDigits: 0 }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date + 'T00:00:00')
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case "paid": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: t("invoices.paid") }
      case "pending": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: t("invoices.pendingStatus") }
      default: return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", label: t("invoices.draft") }
    }
  }

  const statCards = [
    { label: t("dashboard.totalInvoices"), value: stats.totalInvoices, icon: FileText, color: "blue" },
    { label: t("dashboard.totalClients"), value: stats.totalClients, icon: Users, color: "violet", sub: `+${stats.newClientsThisMonth} ${t("dashboard.clientsThisMonth")}` },
    { label: t("dashboard.revenue"), value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "emerald", trend: stats.revenueGrowth },
    { label: t("dashboard.pending"), value: formatCurrency(stats.pendingAmount), icon: Clock, color: "amber", sub: `${stats.pendingInvoices} ${t("dashboard.invoices")}` }
  ]

  const colorMap = { blue: "#3b82f6", violet: "#8b5cf6", emerald: "#10b981", amber: "#f59e0b" }

  return (
    <div className="p-2 md:p-6 max-w-7xl mx-auto">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={() => applyPreset("today")} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm font-medium transition ${datePreset === "today" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{t("dashboard.today")}</button>
            <button onClick={() => applyPreset("week")} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm font-medium transition ${datePreset === "week" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{t("dashboard.thisWeek")}</button>
            <button onClick={() => applyPreset("month")} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm font-medium transition ${datePreset === "month" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{t("dashboard.thisMonth")}</button>
            <button onClick={() => applyPreset("all")} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm font-medium transition ${datePreset === "all" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{t("dashboard.all")}</button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-slate-500">{t("dashboard.from")}:</span>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setDatePreset("custom"); applyFilters(e.target.value, dateTo) }} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-full sm:w-auto" />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-slate-500">{t("dashboard.to")}:</span>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setDatePreset("custom"); applyFilters(dateFrom, e.target.value) }} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-full sm:w-auto" />
          </div>
          <button onClick={applyFilters} className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">{t("dashboard.apply")}</button>
        </div>
      </div>

      <div className="flex justify-between items-start mb-8 gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-slate-900">{t("dashboard.title")}</h1>
          <p className="text-slate-500 mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <button
          onClick={exportAllData}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition whitespace-nowrap text-sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{t("dashboard.exportExcel")}</span>
          <span className="sm:hidden">Excel</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={stat.label} className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: colorMap[stat.color] }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${colorMap[stat.color]}20` }}>
              <stat.icon className="w-5 h-5" style={{ color: colorMap[stat.color] }} />
            </div>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              {stat.trend !== undefined && (stat.trend >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />)}
            </div>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            {stat.sub && <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-6"><BarChart3 className="w-5 h-5 text-slate-400" />{t("analytics.revenueTrend")}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `AWG ${v}`} />
                <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-6">{t("analytics.invoicesByStatus")}</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {statusChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Target className="w-5 h-5 text-blue-600" /></div>
            <span className="text-sm text-slate-500">{t("analytics.avgInvoiceValue")}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.avgInvoiceValue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center"><FileText className="w-5 h-5 text-violet-600" /></div>
            <span className="text-sm text-slate-500">Total Quotes</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalQuotes}</p>
          <p className="text-xs text-slate-400 mt-1">{stats.acceptedQuotes} accepted, {stats.convertedQuotes} converted</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
            <span className="text-sm text-slate-500">{t("analytics.growthRate")}</span>
          </div>
          <p className={`text-2xl font-bold ${stats.revenueGrowth >= 0 ? "text-emerald-600" : "text-red-600"}`}>{stats.revenueGrowth >= 0 ? "+" : ""}{stats.revenueGrowth}%</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Calendar className="w-5 h-5 text-amber-600" /></div>
            <span className="text-sm text-slate-500">{t("analytics.avgPaymentDays")}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">--</p>
        </div>
      </div>

      {/* Recent & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">{t("dashboard.recentInvoices")}</h2>
            <Link href="/invoices" className="text-sm text-blue-600 hover:text-blue-700 font-medium">{t("dashboard.viewAll")} →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentInvoices.length > 0 ? recentInvoices.map(inv => {
              const status = getStatusStyle(inv.status)
              return (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="p-4 flex items-center justify-between hover:bg-slate-50 transition group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                      #{inv.invoice_number || inv.id.slice(0, 4)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 group-hover:text-blue-600">{clients[inv.client_id] || "Client"}</p>
                      <p className="text-sm text-slate-400">{formatDate(inv.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(inv.total)}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>{status.label}</span>
                  </div>
                </Link>
              )
            }) : (
              <div className="p-8 text-center text-slate-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p>{t("dashboard.noInvoices")}</p>
                <Link href="/invoices/create" className="text-blue-600 text-sm font-medium mt-2 inline-block">{t("dashboard.createFirst")} →</Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">{t("dashboard.quickActions")}</h2>
          </div>
          <div className="p-4 space-y-2">
            <Link href="/invoices/create" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition group">
              <FilePlus className="w-5 h-5" /><span className="font-medium">{t("invoices.newInvoice")}</span>
              <ArrowUpRight className="w-4 h-4 ml-auto text-blue-400 group-hover:translate-x-1 transition" />
            </Link>
            <Link href="/quotes/create" className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition group">
              <FileText className="w-5 h-5" /><span className="font-medium">{t("quotes.newQuote")}</span>
              <ArrowUpRight className="w-4 h-4 ml-auto text-violet-400 group-hover:translate-x-1 transition" />
            </Link>
            <Link href="/clients/create" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition group">
              <UserPlus className="w-5 h-5" /><span className="font-medium">{t("clients.newClient")}</span>
              <ArrowUpRight className="w-4 h-4 ml-auto text-emerald-400 group-hover:translate-x-1 transition" />
            </Link>
            <Link href="/invoices" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition group">
              <ClipboardList className="w-5 h-5" /><span className="font-medium">{t("nav.invoices")}</span>
              <ArrowUpRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}