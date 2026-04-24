// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Users, Package, Settings, Menu, X, Quote, ChevronDown, Truck, RotateCcw } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { supabase } from "@/lib/supabase/client"

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const { t, isHydrated } = useI18n()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [deliveryCount, setDeliveryCount] = useState(0)
  const [pickupCount, setPickupCount] = useState(0)

  useEffect(() => {
    const fetchCounts = async () => {
      const today = new Date().toISOString().split('T')[0]
      
      const { data: quotes } = await supabase
        .from("quotes")
        .select("delivery_date, delivery_status, pickup_date, pickup_status")
        .in("status", ["accepted", "converted"])

      if (quotes) {
        const deliveriesToday = quotes.filter(q => {
          if (!q.delivery_date || q.delivery_status === 'completed') return false
          return q.delivery_date === today
        }).length

        const pickupsToday = quotes.filter(q => {
          if (!q.pickup_date || q.pickup_status === 'completed') return false
          return q.pickup_date === today
        }).length

        setDeliveryCount(deliveriesToday)
        setPickupCount(pickupsToday)
      }
    }

    fetchCounts()
  }, [])

  const navItems = [
    { href: "/dashboard", label: isHydrated ? t("nav.dashboard") : "Loading...", icon: LayoutDashboard },
    { href: "/invoices", label: isHydrated ? t("nav.invoices") : "Loading...", icon: FileText },
    { href: "/quotes", label: isHydrated ? t("nav.quotes") : "Loading...", icon: Quote },
    { href: "/deliveries", label: isHydrated ? "Entregas" : "Loading...", icon: Truck, deliveryCount, pickupCount },
    { href: "/clients", label: isHydrated ? t("nav.clients") : "Loading...", icon: Users },
    { href: "/products", label: isHydrated ? t("nav.products") : "Loading...", icon: Package },
    { href: "/settings", label: isHydrated ? t("nav.settings") : "Loading...", icon: Settings },
  ]

  const renderNavItem = (item) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
          isActive 
            ? "bg-blue-50 text-blue-700 font-medium" 
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          <span suppressHydrationWarning>{item.label}</span>
        </div>
        {item.href === "/deliveries" && (deliveryCount > 0 || pickupCount > 0) && (
          <div className="flex gap-1">
            {deliveryCount > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                {deliveryCount}
              </span>
            )}
            {pickupCount > 0 && (
              <span className="px-1.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                {pickupCount}
              </span>
            )}
          </div>
        )}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
        transform transition-transform duration-200 lg:transform-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FE</span>
            </div>
            <span className="font-bold text-slate-900">FELIZ ENTERPRISE</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl p-4 text-white">
            <p className="text-sm font-medium">Professional Plan</p>
            <p className="text-xs opacity-80 mt-1">All features unlocked</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 relative">
            <Menu className="w-6 h-6" />
            {(deliveryCount > 0 || pickupCount > 0) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {deliveryCount + pickupCount}
              </span>
            )}
          </button>
          <span className="font-bold text-slate-900">FELIZ ENTERPRISE</span>
          <Link href="/deliveries" className="p-2 text-slate-600 relative">
            <Truck className="w-5 h-5" />
            {(deliveryCount > 0 || pickupCount > 0) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {deliveryCount + pickupCount}
              </span>
            )}
          </Link>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-3 items-center justify-end gap-4 sticky top-0 z-30">
          <LanguageSwitcher />
        </header>

        <div className="p-2 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
