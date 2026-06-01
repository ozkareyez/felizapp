// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Download, Calendar, Hash, Banknote, ChevronRight } from "lucide-react"
import { generateInvoicePDF } from "@/lib/pdf-generator"
import { useI18n } from "@/lib/i18n"

export default function InvoiceDetailPage() {
  const { t, locale } = useI18n()
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [client, setClient] = useState(null)

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

  if (!invoice) return <div className="p-8 flex items-center justify-center min-h-[400px]"><div className="text-muted-foreground">{t("common.loading")}</div></div>

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
      case "paid": return { bg: "bg-[var(--success)]", label: t("invoices.statusPaid") }
      case "pending": return { bg: "bg-amber-500", label: t("invoices.statusPending") }
      default: return { bg: "bg-slate-400", label: t("invoices.draft") }
    }
  }

  const togglePaidStatus = async () => {
    const newStatus = invoice.status === "paid" ? "pending" : "paid"
    await supabase.from("invoices").update({ status: newStatus }).eq("id", id)
    setInvoice({ ...invoice, status: newStatus })
  }

  const status = getStatusStyle(invoice.status)
  const bankInfo = {
    bank: "CBA",
    account: "100102010",
    holder: "FELIZ ENTERPRISE",
    method: t("invoices.transfer")
  }

  return (
    <div className="invoice-doc p-2 md:p-8 max-w-4xl mx-auto space-y-5">

      {/* Back */}
      <div>
        <Link href="/invoices" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm">
          <ArrowLeft className="w-4 h-4" />
          {t("invoices.backToList")}
        </Link>
      </div>

      {/* Anniversary Banner */}
      <div className="anniv-banner">
        <div className="confetti">
          <span className="confetti-dot"></span>
          <span className="confetti-dot"></span>
          <span className="confetti-dot"></span>
          <span className="confetti-dot"></span>
          <span className="confetti-dot"></span>
          <span className="confetti-dot"></span>
          <span className="confetti-dot"></span>
          <span className="confetti-dot"></span>
        </div>
        <div className="stars">
          <span className="star">✦</span>
          <span className="star">★</span>
          <span className="star">✦</span>
          <span className="star">★</span>
        </div>
        <div className="anniv-banner-content">
          <div className="anniv-badge-circle">
            <span className="num">10</span>
          </div>
          <div className="anniv-text">
            <h3>{t("invoices.anniversary")}</h3>
            <p>{t("invoices.anniversaryText")}</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="invoice-card">

        {/* ── HEADER ── */}
        <div className="invoice-header">
          <div className="invoice-header-top">
            <div>
              <h1 className="invoice-header-title">{t("pdf.invoice")}</h1>
              <p className="invoice-header-sub">{t("common.brandName")}</p>
              <p className="invoice-header-number">
                <Hash className="w-3 h-3 inline -mt-0.5 mr-1 opacity-60" />
                {invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <button
              onClick={togglePaidStatus}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 transition border-2 ${
                invoice.status === 'paid'
                  ? 'bg-[var(--success)] text-white border-[var(--success)]'
                  : 'bg-amber-500 text-white border-amber-500'
              }`}
            >
              {invoice.status === 'paid' ? '✓ ' + status.label : '○ ' + status.label}
            </button>
          </div>
          <div className="invoice-header-meta">
            <span className="invoice-meta-item">
              <Calendar />
              {t("pdf.issued")} <strong>{formatDate(invoice.created_at)}</strong>
            </span>
            <span className="invoice-meta-item">
              <Banknote />
              AWG
            </span>
          </div>
        </div>

        {/* ── PARTIES ── */}
        <div className="px-8 py-5 border-t border-[var(--border)]">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="party-card from">
              <p className="invoice-section-label">{t("pdf.from")}</p>
              <p className="party-name">{t("common.brandName")}</p>
              <p className="party-detail">
                info@felizaruba.com<br />
                +297 000-0000<br />
                Aruba
              </p>
            </div>
            <div className="party-card to">
              <p className="invoice-section-label">{t("pdf.to")}</p>
              {client ? (
                <>
                  <p className="party-name">{client.name}</p>
                  <p className="party-detail">
                    {client.email && <>{client.email}<br /></>}
                    {client.phone && <>{client.phone}<br /></>}
                    {client.address || ''}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm mt-1">{t("common.loading")}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── RENTAL DETAILS ── */}
        {(invoice.delivery_date || invoice.pickup_date) && (
          <div className="px-8 py-5 border-t border-[var(--border)]">
            <div className="info-grid">
              <p className="invoice-section-label">{t("invoices.rental")}</p>
              <div className="info-grid-items">
                {invoice.delivery_date && (
                  <div className="info-grid-item">
                    <label>{t("pdf.delivery")}</label>
                    <span>{formatDate(invoice.delivery_date)}</span>
                  </div>
                )}
                {invoice.pickup_date && (
                  <div className="info-grid-item">
                    <label>{t("pdf.pickup")}</label>
                    <span>{formatDate(invoice.pickup_date)}</span>
                  </div>
                )}
                <div className="info-grid-item">
                    <label>{t("invoices.days")}</label>
                  <span className="big">{rentalDays}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ITEMS TABLE ── */}
        <div className="px-8 py-5 border-t border-[var(--border)]">
          <p className="invoice-section-label mb-3">{t("invoices.items")}</p>
          <div className="invoice-table-wrap">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>{t("common.description")}</th>
                  <th className="text-center">{t("invoices.days")}</th>
                  <th className="text-center">{t("common.quantity")}</th>
                  <th className="text-right">{t("common.price")}</th>
                  <th className="text-right">{t("common.subtotal")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="description">{item.description}</td>
                    <td className="center">{rentalDays}</td>
                    <td className="center">{item.quantity}</td>
                    <td className="price">{formatCurrency(item.unit_price || item.price || 0)}</td>
                    <td className="amount">{formatCurrency(item.quantity * (item.unit_price || item.price || 0) * rentalDays)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SUMMARY ── */}
        <div className="px-8 py-5 border-t border-[var(--border)]">
          <div className="max-w-xs ml-auto">
            <div className="invoice-summary-box">
              <div className="invoice-summary-row">
                <span className="invoice-summary-label">{t("invoices.rentalDays")}</span>
                <span className="invoice-summary-value">{rentalDays}</span>
              </div>
              <div className="invoice-summary-row">
                <span className="invoice-summary-label">{t("common.subtotal")}</span>
                <span className="invoice-summary-value">{formatCurrency(subtotal)}</span>
              </div>
              <div className="invoice-summary-total">
                <span className="label">{t("common.total")}</span>
                <span className="value">{formatCurrency(invoice.total || subtotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAYMENT INFO ── */}
        <div className="px-8 py-5 border-t border-[var(--border)]">
          <div className="invoice-payment-box">
            <p className="invoice-payment-title">
              <Banknote className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              {t("invoices.paymentInfo")}
            </p>
            <div className="invoice-payment-grid">
              <span className="key">{t("invoices.method")}</span>
              <span className="value">{bankInfo.method}</span>
              <span className="key">{t("invoices.bank")}</span>
              <span className="value">{bankInfo.bank}</span>
              <span className="key">{t("invoices.accountNo")}</span>
              <span className="value">{bankInfo.account}</span>
              <span className="key">{t("invoices.accountHolder")}</span>
              <span className="value">{bankInfo.holder}</span>
            </div>
          </div>
        </div>

        {/* ── THANK YOU ── */}
        <div className="px-8 py-4 border-t border-[var(--border)]">
          <p className="invoice-thanks">{t("invoices.thanks")}</p>
        </div>

        {/* ── ACTIONS ── */}
        <div className="invoice-actions">
          <Link href={`/invoices/${id}/edit`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition text-sm">
            <Edit className="w-4 h-4" />
            {t("common.edit")}
          </Link>
          <button
            onClick={() => generateInvoicePDF(invoice, items, client, rentalDays, locale)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white transition-all"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Download className="w-4 h-4" />
            {t("invoices.downloadPdf")}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
