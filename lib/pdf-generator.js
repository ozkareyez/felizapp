// @ts-nocheck
import { jsPDF } from "jspdf"
import { createClient } from "@supabase/supabase-js"

let cachedLogo = null
let cachedCompany = null

export async function getLogoBase64() {
  if (cachedLogo) return cachedLogo
  try {
    const res = await fetch('/api/logo')
    const data = await res.json()
    cachedLogo = data.logo
    return cachedLogo
  } catch {
    return null
  }
}

async function getCompanyInfo() {
  if (cachedCompany) return cachedCompany
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", "2b58cc88-82a4-444b-86d3-e5b952320d5a")
      .single()
    if (data) {
      cachedCompany = {
        name: data.name || "FELIZ ENTERPRISE",
        address: data.address || "Aruba",
        phone: data.phone || "+297 000-0000",
        email: data.email || "info@felizaruba.com",
        ruc: data.tax_id || "000000000"
      }
      return cachedCompany
    }
  } catch {
    // Ignore errors
  }
  return {
    name: "FELIZ ENTERPRISE",
    address: "Aruba",
    phone: "+297 000-0000",
    email: "info@felizaruba.com",
    ruc: "000000000"
  }
}

const bankInfo = {
  bank: "CBA",
  account: "100102010",
  accountName: "FELIZ ENTERPRISE"
}

const footerText = {
  es: "Factura generada conforme a la regulacion fiscal de Aruba - DIMP | FELIZ ENTERPRISE © 2026 | Celebrando 10 años en Aruba",
  en: "Invoice generated according to Aruba tax regulations - DIMP | FELIZ ENTERPRISE © 2026 | Celebrating 10 years in Aruba"
}

const labels = {
  es: {
    invoice: "FACTURA", quote: "COTIZACIÓN", from: "DE", to: "PARA",
    description: "Descripción", quantity: "Cant", unitPrice: "Precio", amount: "Importe", total: "TOTAL",
    bankData: "DATOS DE PAGO", bank: "Banco", account: "No. Cuenta", accountHolder: "Beneficiario",
    validUntil: "Válido hasta", delivery: "Entrega", pickup: "Recogida", rentalDays: "Días de alquiler",
    eventType: "Tipo de Evento", location: "Ubicación", noDescription: "Sin descripción",
    invoiceFile: "Factura-", quoteFile: "Cotizacion-", date: "Fecha", method: "Método",
    invoiceLabel: "FELIZ ENTERPRISE", invoiceNumber: "No.",
    thanks: "Gracias por su confianza"
  },
  en: {
    invoice: "INVOICE", quote: "QUOTE", from: "FROM", to: "TO",
    description: "Description", quantity: "Qty", unitPrice: "Price", amount: "Amount", total: "TOTAL",
    bankData: "PAYMENT DETAILS", bank: "Bank", account: "Account No.", accountHolder: "Account Holder",
    validUntil: "Valid until", delivery: "Delivery", pickup: "Pickup", rentalDays: "Rental days",
    eventType: "Event Type", location: "Location", noDescription: "No description",
    invoiceFile: "Invoice-", quoteFile: "Quote-", date: "Date", method: "Method",
    invoiceLabel: "FELIZ ENTERPRISE", invoiceNumber: "No.",
    thanks: "Thank you for your trust"
  }
}

const C = {
  bg: [35, 30, 32],
  card: [42, 37, 38],
  cardLight: [52, 47, 48],
  border: [55, 50, 52],
  primary: [0, 161, 228],
  rose: [214, 51, 132],
  green: [166, 206, 56],
  text: [241, 245, 249],
  textMuted: [160, 160, 160],
  textDim: [110, 110, 110],
  white: [255, 255, 255],
}

function roundedRect(doc, x, y, w, h, r, style) {
  if (r < 0) r = 0
  doc.roundedRect(x, y, w, h, r, r, style)
}

function drawCard(doc, x, y, w, h, r = 8) {
  doc.setFillColor(...C.card)
  roundedRect(doc, x, y, w, h, r, "F")
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.3)
  roundedRect(doc, x, y, w, h, r, "S")
}

function truncate(doc, text, maxWidth) {
  if (doc.getTextWidth(text) <= maxWidth) return text
  let short = text
  while (short.length > 0 && doc.getTextWidth(short + '…') > maxWidth) {
    short = short.slice(0, -1)
  }
  return short + '…'
}

const ANNIV = {
  es: { title: "10° ANIVERSARIO", msg: "Celebrando una década creando momentos inolvidables en Aruba" },
  en: { title: "10th ANNIVERSARY", msg: "Celebrating a decade creating unforgettable moments in Aruba" }
}

function drawAnniversaryBanner(doc, y, locale = "es") {
  const a = ANNIV[locale] || ANNIV.es
  const w = 186, h = 24, r = 8
  const bx = 12
  const cy = y + h / 2

  // Rose background
  doc.setFillColor(...C.rose)
  roundedRect(doc, bx, y, w, h, r, "F")

  // Confetti dots
  const gs = doc.GState ? new doc.GState({ opacity: 0.35 }) : null
  if (gs) doc.setGState(gs)
  const confettiColors = [[255,215,0], [255,255,255], [166,206,56], [0,161,228], [255,200,200]]
  const dots = [
    [18, y+2], [30, y+20], [45, y+3], [58, y+21], [80, y+2],
    [98, y+22], [120, y+3], [142, y+20], [165, y+3], [182, y+19],
    [192, y+12], [26, y+12], [170, y+8], [108, y+5], [155, y+18]
  ]
  dots.forEach(([dx, dy], i) => {
    doc.setFillColor(...confettiColors[i % confettiColors.length])
    doc.circle(dx, dy, 1.2 + (i % 3), "F")
  })
  if (gs) doc.setGState(new doc.GState({ opacity: 1 }))

  // Decorative stars
  doc.setTextColor(...C.white)
  doc.setFontSize(6)
  doc.setFont("helvetica", "normal")
  if (gs) doc.setGState(gs)
  doc.text("✦", 20, y + 6)
  doc.text("★", 184, y + 6)
  doc.text("✦", 24, y + h - 4)
  doc.text("★", 180, y + h - 4)
  if (gs) doc.setGState(new doc.GState({ opacity: 1 }))

  // "10" circle badge
  const badgeX = 36, badgeR = 11
  doc.setFillColor(...C.white)
  if (gs) doc.setGState(new doc.GState({ opacity: 0.2 }))
  doc.circle(badgeX, cy, badgeR, "F")
  if (gs) doc.setGState(new doc.GState({ opacity: 1 }))
  doc.setTextColor(...C.white)
  doc.setFontSize(15)
  doc.setFont("helvetica", "bold")
  doc.text("10", badgeX, cy + 5, { align: "center" })

  // Title
  const titleX = badgeX + badgeR + 6
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(a.title, titleX, cy - 2)

  // Message
  doc.setFontSize(7)
  doc.setFont("helvetica", "italic")
  doc.text(truncate(doc, a.msg, 140), titleX, cy + 8)
}

function drawHeader(doc, title, number, dateLabel, dateStr, validUntilStr, logoBase64) {
  doc.setFillColor(...C.bg)
  doc.rect(0, 0, 210, 297, "F")

  doc.setFillColor(...C.rose)
  doc.rect(0, 0, 210, 4, "F")

  let titleX = 15
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 15, 8, 28, 28)
    titleX = 48
  }

  doc.setTextColor(...C.text)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text(title, titleX, 22)

  doc.setTextColor(...C.rose)
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.text("FELIZ ENTERPRISE", titleX, 29)

  doc.setTextColor(...C.textMuted)
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  doc.text(truncate(doc, number, 70), titleX, 36)

  doc.setTextColor(...C.textMuted)
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.text(dateLabel, 195, 16, { align: "right" })
  doc.setTextColor(...C.text)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(dateStr, 195, 23, { align: "right" })

  if (validUntilStr) {
    doc.setTextColor(...C.textMuted)
    doc.setFontSize(6.5)
    doc.setFont("helvetica", "normal")
    doc.text(truncate(doc, validUntilStr, 75), 195, 31, { align: "right" })
  }

  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.4)
  doc.line(15, 46, 195, 46)
}

function drawPartyBox(doc, x, y, w, label, name, details, highlight = false) {
  const lines = details.filter(Boolean).length
  const lineH = 5.5
  const padBottom = 4
  const h = 20 + lines * lineH + padBottom
  const r = 8

  if (highlight) {
    doc.setFillColor(30, 30, 30)
    roundedRect(doc, x, y, w, h, r, "F")
    doc.setDrawColor(50, 50, 50)
    doc.setLineWidth(0.3)
    roundedRect(doc, x, y, w, h, r, "S")
  } else {
    drawCard(doc, x, y, w, h, r)
  }

  const contentX = x + 10
  doc.setTextColor(...C.textMuted)
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.text(label, contentX, y + 9)

  doc.setTextColor(...C.text)
  doc.setFontSize(9.5)
  doc.setFont("helvetica", "bold")
  doc.text(truncate(doc, name, w - 20), contentX, y + 18)

  if (lines > 0) {
    doc.setTextColor(...C.textMuted)
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    let dy = y + 26
    details.filter(Boolean).forEach(d => {
      doc.text(truncate(doc, d, w - 20), contentX, dy)
      dy += lineH
    })
  }
  return h
}

function drawEventBox(doc, y, data, rentalDays, lbl) {
  const rows = []
  if (data.event_type) rows.push(["Tipo", data.event_type])
  if (data.event_location) rows.push(["Ubicación", data.event_location])
  if (data.delivery_date) rows.push([lbl.delivery, new Date(data.delivery_date).toLocaleDateString("es-ES")])
  if (data.pickup_date) rows.push([lbl.pickup, new Date(data.pickup_date).toLocaleDateString("es-ES")])
  rows.push([lbl.rentalDays, String(rentalDays)])

  const nCols = 2
  const pairsPerCol = Math.ceil(rows.length / nCols)
  const lineH = 5.5
  const h = 18 + pairsPerCol * lineH
  const r = 8

  doc.setFillColor(...C.card)
  roundedRect(doc, 15, y, 180, h, r, "F")
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.3)
  roundedRect(doc, 15, y, 180, h, r, "S")

  doc.setTextColor(...C.textMuted)
  doc.setFontSize(6)
  doc.setFont("helvetica", "bold")
  doc.text("DETALLES", 20, y + 8)

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  const colX = [20, 95]

  rows.forEach(([label, value], idx) => {
    const col = Math.floor(idx / pairsPerCol)
    const row = idx % pairsPerCol
    const yy = y + 16 + row * lineH
    const xx = colX[col]
    doc.setTextColor(...C.textMuted)
    doc.text(label + ":", xx, yy)
    doc.setTextColor(...C.text)
    doc.setFont("helvetica", "bold")
    const maxVW = col === 0 ? 68 : 75
    doc.text(truncate(doc, value, maxVW), xx + (col === 0 ? 28 : 25), yy)
    doc.setFont("helvetica", "normal")
  })
  return h
}

function drawTable(doc, startY, items, rentalDays, lbl) {
  const colX = [15, 93, 115, 137, 167]
  const colW = [78, 22, 22, 30, 28]
  const totalW = 180
  const r = 5

  doc.setFillColor(...C.rose)
  roundedRect(doc, 15, startY, totalW, 8, r, "F")
  doc.setTextColor(...C.white)
  doc.setFontSize(6)
  doc.setFont("helvetica", "bold")
  ;[lbl.description, "Días", lbl.quantity, lbl.unitPrice, lbl.amount].forEach((h, i) => {
    const a = i === 0 ? "left" : "center"
    const x = i === 0 ? colX[i] + 5 : colX[i] + colW[i] / 2
    doc.text(h, x, startY + 5.5, { align: a })
  })

  let y = startY + 10.5
  let calcTotal = 0
  const rowH = 7.5

  items.forEach((item, idx) => {
    doc.setFillColor(30, 30, 30)
    doc.rect(15, y - 3, totalW, rowH + 1, "F")
    const price = item.unit_price || item.price || 0
    const qty = item.quantity || 1
    const itemTotal = price * qty * rentalDays
    calcTotal += itemTotal

    doc.setTextColor(...C.text)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    const desc = truncate(doc, item.description || lbl.noDescription, colW[0] - 10)
    doc.text(desc, colX[0] + 5, y)

    doc.text(String(rentalDays), colX[1] + colW[1] / 2, y, { align: "center" })
    doc.text(String(qty), colX[2] + colW[2] / 2, y, { align: "center" })

    doc.setFont("helvetica", "bold")
    doc.text("AWG " + price.toFixed(2), colX[3] + colW[3] / 2, y, { align: "center" })
    doc.text("AWG " + itemTotal.toFixed(2), colX[4] + colW[4] / 2, y, { align: "center" })

    y += rowH + 1
  })

  y += 2
  doc.setDrawColor(...C.rose)
  doc.setLineWidth(0.4)
  doc.line(115, y, 195, y)
  y += 2

  return { endY: y, calculatedTotal: calcTotal }
}

function drawSummary(doc, x, y, rentalDays, subtotal, total, lbl) {
  const w = 100
  const r = 6

  ;[ [lbl.rentalDays, String(rentalDays)], ["Subtotal", "AWG " + subtotal.toFixed(2)] ].forEach(([label, value], i) => {
    const yy = y + i * 11
    doc.setFillColor(...C.card)
    roundedRect(doc, x, yy, w, 10, r, "F")
    doc.setDrawColor(...C.border)
    doc.setLineWidth(0.3)
    roundedRect(doc, x, yy, w, 10, r, "S")
    doc.setTextColor(...C.textMuted)
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    doc.text(truncate(doc, label, w / 2 - 5), x + 8, yy + 7)
    doc.setTextColor(...C.text)
    doc.setFont("helvetica", "bold")
    doc.text(value, x + w - 8, yy + 7, { align: "right" })
  })

  const y3 = y + 22
  doc.setFillColor(...C.rose)
  roundedRect(doc, x, y3, w, 13, r, "F")
  doc.setTextColor(...C.white)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.total, x + 8, y3 + 9)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("AWG " + (total || subtotal).toFixed(2), x + w - 8, y3 + 9, { align: "right" })
}

function drawPaymentInfo(doc, y, lbl) {
  const r = 6
  doc.setFillColor(30, 30, 30)
  roundedRect(doc, 15, y, 180, 30, r, "F")
  doc.setDrawColor(50, 50, 50)
  doc.setLineWidth(0.3)
  roundedRect(doc, 15, y, 180, 30, r, "S")

  doc.setTextColor(...C.text)
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.bankData, 105, y + 7, { align: "center" })

  const rows = [
    [lbl.method, "Transferencia bancaria"],
    [lbl.bank, bankInfo.bank],
    [lbl.account, bankInfo.account],
    [lbl.accountHolder, bankInfo.accountName]
  ]
  let py = y + 14
  doc.setFontSize(7.5)
  rows.forEach(([k, v]) => {
    doc.setTextColor(...C.textMuted)
    doc.setFont("helvetica", "normal")
    doc.text(k + ":", 28, py)
    doc.setTextColor(...C.text)
    doc.setFont("helvetica", "bold")
    doc.text(truncate(doc, v, 90), 65, py)
    py += 4.5
  })
}

function drawThankYou(doc, y) {
  doc.setTextColor(...C.rose)
  doc.setFontSize(9)
  doc.setFont("helvetica", "italic")
  doc.text("— Gracias por su confianza —", 105, y, { align: "center" })
}

function drawFooter(doc, ft) {
  doc.setFontSize(5.5)
  doc.setTextColor(...C.textDim)
  doc.text(truncate(doc, ft, 180), 105, 285, { align: "center" })
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.3)
  doc.line(15, 288, 195, 288)
}

// =============================================================
// PDF GENERATORS
// =============================================================
async function generate(doc, items, rentalDays, lbl) {
  let y = 54
  drawAnniversaryBanner(doc, y)
  y += 32
  return y
}

export async function generateInvoicePDF(invoice, items, client, rentalDays = 1, locale = "es") {
  const doc = new jsPDF()
  const lbl = labels[locale] || labels.es
  const ft = footerText[locale] || footerText.es
  const company = await getCompanyInfo()
  const logoBase64 = await getLogoBase64()
  const dateStr = new Date(invoice.created_at).toLocaleDateString(locale === "en" ? "en-US" : "es-ES")

  drawHeader(doc, lbl.invoice,
    lbl.invoiceNumber + " " + (invoice.invoice_number || invoice.id?.slice(0, 8)?.toUpperCase() || "0000"),
    lbl.date + ":", dateStr, null, logoBase64)

  let y = 54

  // Anniversary banner
  drawAnniversaryBanner(doc, y, locale)
  y += 28

  // Party boxes
  const details = [company.email, company.phone, company.address]
  const h1 = drawPartyBox(doc, 15, y, 88, lbl.from, company.name, details, false)
  drawPartyBox(doc, 107, y, 88, lbl.to,
    client?.name || "N/A",
    [client?.email, client?.phone, client?.address].filter(Boolean), true)
  y += Math.max(h1, 24) + 4

  // Event details
  if (invoice.delivery_date || invoice.pickup_date || invoice.event_type) {
    y += 2
    y += drawEventBox(doc, y, invoice, rentalDays, lbl)
    y += 4
  }

  y += 2

  // Table
  const tableResult = drawTable(doc, y, items, rentalDays, lbl)
  y = tableResult.endY + 6

  // Summary
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price || item.price || 0) * (item.quantity || 1) * rentalDays, 0)
  drawSummary(doc, 95, y, rentalDays, subtotal, invoice.total || subtotal, lbl)
  y += 38

  // Payment info
  drawPaymentInfo(doc, y, lbl)
  y += 34

  // Thank you
  drawThankYou(doc, y)
  y += 8

  // Footer
  drawFooter(doc, ft)

  doc.save(lbl.invoiceFile + (invoice.invoice_number || "0000") + ".pdf")
}

export async function generateQuotePDF(quote, items, client, rentalDays = 1, locale = "es") {
  const doc = new jsPDF()
  const lbl = labels[locale] || labels.es
  const ft = footerText[locale] || footerText.es
  const company = await getCompanyInfo()
  const logoBase64 = await getLogoBase64()
  const dateStr = new Date(quote.created_at).toLocaleDateString(locale === "en" ? "en-US" : "es-ES")
  const validUntilStr = quote.valid_until
    ? lbl.validUntil + ": " + new Date(quote.valid_until).toLocaleDateString(locale === "en" ? "en-US" : "es-ES")
    : null

  drawHeader(doc, lbl.quote,
    lbl.invoiceNumber + " " + (quote.quote_number || quote.reference || quote.id?.slice(0, 8)?.toUpperCase() || "FELIZ-000"),
    lbl.date + ":", dateStr, validUntilStr, logoBase64)

  let y = 54

  // Anniversary banner
  drawAnniversaryBanner(doc, y, locale)
  y += 28

  // Party boxes
  const details = [company.email, company.phone, company.address]
  const h1 = drawPartyBox(doc, 15, y, 88, lbl.from, company.name, details, false)
  drawPartyBox(doc, 107, y, 88, lbl.to,
    client?.name || "N/A",
    [client?.email, client?.phone, client?.address].filter(Boolean), true)
  y += Math.max(h1, 24) + 4

  // Event details
  if (quote.event_type || quote.event_location || quote.delivery_date || quote.pickup_date) {
    y += 2
    y += drawEventBox(doc, y, quote, rentalDays, lbl)
    y += 4
  }

  y += 2

  // Table
  const tableResult = drawTable(doc, y, items, rentalDays, lbl)
  y = tableResult.endY + 6

  // Summary
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price || item.price || 0) * (item.quantity || 1) * rentalDays, 0)
  drawSummary(doc, 95, y, rentalDays, subtotal, quote.total || subtotal, lbl)
  y += 38

  // Payment info
  drawPaymentInfo(doc, y, lbl)
  y += 34

  // Thank you
  drawThankYou(doc, y)
  y += 8

  // Footer
  drawFooter(doc, ft)

  doc.save(lbl.quoteFile + (quote.quote_number || quote.reference || "FELIZ-000") + ".pdf")
}
