// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, FileCheck, Download, MessageCircle, Check, X, Calendar, Hash, Banknote, ChevronRight, MapPin, Tag } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { generateQuotePDF } from "@/lib/pdf-generator"

export default function QuoteDetailPage() {
  const { t, locale } = useI18n()
  const { id } = useParams()
  const [quote, setQuote] = useState(null)
  const [items, setItems] = useState([])
  const [client, setClient] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      const { data: quoteData } = await supabase.from("quotes").select("*").eq("id", id).single()
      const { data: itemsData } = await supabase.from("quote_items").select("*").eq("quote_id", id)
      const { data: clientData } = await supabase.from("clients").select("*").eq("id", quoteData?.client_id).single()
      if (isMounted) {
        setQuote(quoteData)
        setItems(itemsData || [])
        setClient(clientData)
      }
    }
    if (id) fetch()
    return () => { isMounted = false }
  }, [id])

  if (!quote) return <div className="p-8 flex items-center justify-center min-h-[400px]"><div className="text-muted-foreground">{t("common.loading")}</div></div>

  const getRentalDays = () => {
    if (quote.rental_days) return quote.rental_days
    if (quote.delivery_date && quote.pickup_date) {
      const delivery = new Date(quote.delivery_date)
      const pickup = new Date(quote.pickup_date)
      const diffTime = pickup - delivery
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays > 0 ? diffDays : 1
    }
    return 1
  }

  const rentalDays = getRentalDays()
  const itemTotal = (item) => item.quantity * (item.unit_price || item.price) * rentalDays
  const subtotal = items.reduce((sum, item) => sum + itemTotal(item), 0)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "AWG" }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })
  }

  const formatDateISO = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('es-ES')
  }

  const shareOnWhatsApp = async () => {
    await generateQuotePDF(quote, items, client, rentalDays, locale)
    setTimeout(() => {
      let text = `*${t("quotes.title").toUpperCase()} ${quote.reference || quote.quote_number}*\n\n`
      if (client?.name) text += `*${t("invoices.client")}:* ${client.name}\n`
      if (quote.event_type) text += `*${t("whatsapp.eventType")}:* ${quote.event_type}\n`
      if (quote.event_location) text += `*${t("whatsapp.location")}:* ${quote.event_location}\n`
      if (quote.delivery_date) text += `*${t("whatsapp.delivery")}:* ${formatDateISO(quote.delivery_date)}\n`
      if (quote.pickup_date) text += `*${t("whatsapp.pickup")}:* ${formatDateISO(quote.pickup_date)}\n`
      if (rentalDays) text += `*${t("whatsapp.rentalDays")}:* ${rentalDays}\n\n`
      text += `*${t("whatsapp.total")}: AWG ${quote.total || subtotal}*\n\n`
      text += `${t("whatsapp.pdfDownloaded")}\n\n`
      text += `${t("common.brandName")} - Aruba`
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
    }, 1500)
  }

  const approveQuote = async () => {
    await supabase.from("quotes").update({ status: "accepted" }).eq("id", id)
    setQuote({ ...quote, status: "accepted" })
  }

  const rejectQuote = async () => {
    if (!confirm(t("quotes.rejectConfirm"))) return
    await supabase.from("quotes").update({ status: "rejected" }).eq("id", id)
    setQuote({ ...quote, status: "rejected" })
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case "accepted": return { bg: "#a6ce38", label: t("quotes.accepted") }
      case "rejected": return { bg: "#ef4444", label: t("quotes.rejected") }
      case "pending": return { bg: "#f59e0b", label: t("quotes.pendingStatus") }
      case "converted": return { bg: "#00a1e4", label: t("quotes.converted") }
      default: return { bg: "#94a3b8", label: t("quotes.draft") }
    }
  }

  const status = getStatusStyle(quote.status)
  const bankInfo = {
    bank: "CBA",
    account: "100102010",
    holder: "FELIZ ENTERPRISE",
    method: t("quotes.transferMethod")
  }

  return (
    <div className="invoice-doc p-2 md:p-8 max-w-4xl mx-auto space-y-5">

      {/* Back */}
      <div>
        <Link href="/quotes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
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
            <h3>10° Aniversario</h3>
            <p>Celebrando una década creando momentos inolvidables en Aruba</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="invoice-card">

        {/* ── HEADER ── */}
        <div className="invoice-header">
          <div className="invoice-header-top">
            <div>
              <h1 className="invoice-header-title">{t("quotes.quoteLabel")}</h1>
              <p className="invoice-header-sub">{t("common.brandName")}</p>
              <p className="invoice-header-number">
                <Hash className="w-3 h-3 inline -mt-0.5 mr-1 opacity-60" />
                {quote.quote_number || quote.reference || quote.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <span
              className="shrink-0 px-4 py-2 rounded-full text-xs font-bold text-white border-2 border-transparent"
              style={{ backgroundColor: status.bg }}
            >
              {status.label}
            </span>
          </div>
          <div className="invoice-header-meta">
            <span className="invoice-meta-item">
              <Calendar />
              {t("quotes.issued")} <strong>{formatDate(quote.created_at)}</strong>
            </span>
            {quote.valid_until && (
              <span className="invoice-meta-item">
                <Calendar />
                {t("quotes.validUntilLabel")} <strong>{formatDate(quote.valid_until)}</strong>
              </span>
            )}
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
              <p className="invoice-section-label">{t("quotes.from")}</p>
              <p className="party-name">FELIZ ENTERPRISE</p>
              <p className="party-detail">
                info@felizaruba.com<br />
                +297 000-0000<br />
                Aruba
              </p>
            </div>
            <div className="party-card to">
              <p className="invoice-section-label">{t("quotes.to")}</p>
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

        {/* ── EVENT DETAILS ── */}
        {(quote.event_type || quote.event_location || quote.delivery_date || quote.pickup_date) && (
          <div className="px-8 py-5 border-t border-[var(--border)]">
            <div className="info-grid">
              <p className="invoice-section-label">{t("quotes.eventLabel")}</p>
              <div className="info-grid-items">
                {quote.event_type && (
                  <div className="info-grid-item">
                    <label><Tag className="w-3 h-3 inline mr-1" />{t("quotes.typeLabel")}</label>
                    <span>{quote.event_type}</span>
                  </div>
                )}
                {quote.event_location && (
                  <div className="info-grid-item">
                    <label><MapPin className="w-3 h-3 inline mr-1" />{t("quotes.locationLabel")}</label>
                    <span>{quote.event_location}</span>
                  </div>
                )}
                {quote.delivery_date && (
                  <div className="info-grid-item">
                    <label>{t("quotes.deliveryLabel")}</label>
                    <span>{formatDate(quote.delivery_date)}</span>
                  </div>
                )}
                {quote.pickup_date && (
                  <div className="info-grid-item">
                    <label>{t("quotes.pickupLabel")}</label>
                    <span>{formatDate(quote.pickup_date)}</span>
                  </div>
                )}
                <div className="info-grid-item">
                  <label>{t("quotes.daysLabel")}</label>
                  <span className="big">{rentalDays}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTES ── */}
        {quote.notes && (
          <div className="px-8 py-5 border-t border-[var(--border)]">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--secondary) 50%, transparent)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("quotes.notesSection")}</p>
              <p className="text-sm text-foreground">{quote.notes}</p>
            </div>
          </div>
        )}

        {/* ── ITEMS TABLE ── */}
        <div className="px-8 py-5 border-t border-[var(--border)]">
          <p className="invoice-section-label mb-3">{t("invoices.description")}</p>
          <div className="invoice-table-wrap">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>{t("invoices.description")}</th>
                  <th className="text-center">{t("quotes.daysColumn")}</th>
                  <th className="text-center">{t("invoices.quantity")}</th>
                  <th className="text-right">{t("invoices.price")}/día</th>
                  <th className="text-right">{t("invoices.total")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="description">{item.description}</td>
                    <td className="center">{rentalDays}</td>
                    <td className="center">{item.quantity}</td>
                    <td className="price">{formatCurrency(item.unit_price || item.price || 0)}</td>
                    <td className="amount">{formatCurrency(itemTotal(item))}</td>
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
                <span className="invoice-summary-label">{t("quotes.rentalDaysSummary")}</span>
                <span className="invoice-summary-value">{rentalDays}</span>
              </div>
              <div className="invoice-summary-row">
                <span className="invoice-summary-label">{t("invoices.subtotal")}</span>
                <span className="invoice-summary-value">{formatCurrency(subtotal)}</span>
              </div>
              <div className="invoice-summary-total">
                <span className="label">{t("invoices.total")}</span>
                <span className="value">{formatCurrency(quote.total || subtotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAYMENT INFO ── */}
        <div className="px-8 py-5 border-t border-[var(--border)]">
          <div className="invoice-payment-box">
            <p className="invoice-payment-title">
              <Banknote className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              {t("quotes.paymentInfo")}
            </p>
            <div className="invoice-payment-grid">
              <span className="key">{t("quotes.methodLabel")}</span>
              <span className="value">{bankInfo.method}</span>
              <span className="key">{t("quotes.bankLabel")}</span>
              <span className="value">{bankInfo.bank}</span>
              <span className="key">{t("quotes.accountNo")}</span>
              <span className="value">{bankInfo.account}</span>
              <span className="key">{t("quotes.accountHolder")}</span>
              <span className="value">{bankInfo.holder}</span>
            </div>
          </div>
        </div>

        {/* ── THANK YOU ── */}
        <div className="px-8 py-4 border-t border-[var(--border)]">
          <p className="invoice-thanks">{t("quotes.thanks")}</p>
        </div>

        {/* ── ACTIONS ── */}
        <div className="invoice-actions">
          <div className="flex flex-wrap gap-3">
            {quote.status === "pending" && (
              <>
                <button onClick={approveQuote} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition" style={{ backgroundColor: 'var(--success)' }}>
                  <Check className="w-4 h-4" />
                  {t("quotes.approve")}
                </button>
                <button onClick={rejectQuote} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition" style={{ backgroundColor: '#ef4444' }}>
                  <X className="w-4 h-4" />
                  {t("quotes.reject")}
                </button>
              </>
            )}
            {quote.status !== "pending" && (
              <Link href={`/quotes/${id}/edit`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition text-sm">
                <Edit className="w-4 h-4" />
                {t("common.edit")}
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {quote.status !== "converted" && (
              <Link href={`/quotes/${id}/convert`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition" style={{ backgroundColor: 'var(--success)' }}>
                <FileCheck className="w-4 h-4" />
                {t("quotes.convertToInvoice")}
              </Link>
            )}
            <button
              onClick={() => generateQuotePDF(quote, items, client, rentalDays, locale)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white transition-all"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Download className="w-4 h-4" />
              {t("quotes.pdf")}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={shareOnWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-4 h-4" />
              {t("quotes.whatsapp")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
