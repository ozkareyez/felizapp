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
    eventDetailsSection: "DETALLES", subtotal: "Subtotal", transfer: "Transferencia bancaria",
    thanks: "— Gracias por su confianza —"
  },
  en: {
    invoice: "INVOICE", quote: "QUOTE", from: "FROM", to: "TO",
    description: "Description", quantity: "Qty", unitPrice: "Price", amount: "Amount", total: "TOTAL",
    bankData: "PAYMENT DETAILS", bank: "Bank", account: "Account No.", accountHolder: "Account Holder",
    validUntil: "Valid until", delivery: "Delivery", pickup: "Pickup", rentalDays: "Rental days",
    eventType: "Event Type", location: "Location", noDescription: "No description",
    invoiceFile: "Invoice-", quoteFile: "Quote-", date: "Date", method: "Method",
    invoiceLabel: "FELIZ ENTERPRISE", invoiceNumber: "No.",
    eventDetailsSection: "DETAILS", subtotal: "Subtotal", transfer: "Bank transfer",
    thanks: "— Thank you for your trust —"
  }
}

const C = {
  bg: [255, 255, 255],
  card: [248, 248, 248],
  cardLight: [250, 250, 250],
  border: [217, 217, 217],
  divider: [234, 234, 234],
  primary: [53, 104, 232],
  primaryDark: [66, 100, 240],
  secondary: [210, 24, 242],
  secondaryLight: [233, 0, 255],
  green: [166, 206, 56],
  text: [34, 34, 34],
  textSecondary: [102, 102, 102],
  textMuted: [153, 153, 153],
  white: [255, 255, 255],
  tableHeader: [210, 24, 242],
  tableHeaderText: [255, 255, 255],
  tableRowAlt: [250, 250, 250],
  signature: [68, 68, 68],
  success: [40, 167, 69],
}

function drawSolidRounded(doc, x, y, w, h, r, color) {
  doc.setFillColor(...color)
  roundedRect(doc, x, y, w, h, r, "F")
}



function roundedRect(doc, x, y, w, h, r, style) {
  if (r < 0) r = 0
  doc.roundedRect(x, y, w, h, r, r, style)
}

function drawCard(doc, x, y, w, h, r = 3) {
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

function drawBlueTexture(doc) {
  const gs = doc.GState ? new doc.GState({ opacity: 0.035 }) : null
  if (gs) doc.setGState(gs)

  doc.setFillColor(...C.primary)

  for (let x = 10; x < 210; x += 16) {
    for (let y = 10; y < 297; y += 16) {
      doc.circle(x, y, 0.4, "F")
    }
  }

  doc.setFillColor(...C.secondary)

  for (let x = 10; x < 210; x += 64) {
    for (let y = 10; y < 297; y += 64) {
      doc.circle(x, y, 0.9, "F")
    }
  }

  if (gs) doc.setGState(new doc.GState({ opacity: 1 }))
}




function drawHeader(doc, title, number, dateLabel, dateStr, validUntilStr, logoBase64, locale = "es") {
  doc.setFillColor(...C.bg)
  doc.rect(0, 0, 210, 297, "F")

  drawBlueTexture(doc)

  doc.setFillColor(...C.secondary)
  doc.rect(0, 0, 210, 4, "F")

  // Logo bigger
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 18, 8, 32, 32)
  }

  doc.setTextColor(...C.textSecondary)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(number || "", 18, 48)

  // Title — bigger font
  doc.setTextColor(...C.primary)
  doc.setFontSize(29)
  doc.setFont("helvetica", "bold")
  doc.text(title, 190, 26, { align: "right" })

  doc.setTextColor(...C.textSecondary)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(dateLabel + " " + dateStr, 190, 40, { align: "right" })

  if (validUntilStr) {
    doc.text(validUntilStr, 190, 50, { align: "right" })
  }

  doc.setDrawColor(...C.divider)
  doc.setLineWidth(0.5)
  doc.line(20, 54, 190, 54)
}

function drawPartyBox(doc, x, y, w, label, name, details, highlight = false) {
  const lines = details.filter(Boolean).length
  const lineH = 5.5
  const h = 26 + lines * lineH + 4
  const r = 2

  doc.setFillColor(...(highlight ? C.cardLight : C.card))
  roundedRect(doc, x, y, w, h, r, "F")
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.5)
  roundedRect(doc, x, y, w, h, r, "S")

  const contentX = x + 10
  doc.setTextColor(...C.textSecondary)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text(label, contentX, y + 10)

  doc.setTextColor(...C.text)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text(truncate(doc, name, w - 20), contentX, y + 20)

  if (lines > 0) {
    doc.setTextColor(...C.textSecondary)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    let dy = y + 29
    details.filter(Boolean).forEach(d => {
      doc.text(truncate(doc, d, w - 20), contentX, dy)
      dy += lineH
    })
  }
  return h
}

function drawEventBox(doc, y, data, rentalDays, lbl) {
  const rows = []
  if (data.event_type) rows.push([lbl.eventType, data.event_type])
  if (data.event_location) rows.push([lbl.location, data.event_location])
  if (data.delivery_date) rows.push([lbl.delivery, new Date(data.delivery_date).toLocaleDateString("es-ES")])
  if (data.pickup_date) rows.push([lbl.pickup, new Date(data.pickup_date).toLocaleDateString("es-ES")])
  rows.push([lbl.rentalDays, String(rentalDays)])

  const nCols = 2
  const pairsPerCol = Math.ceil(rows.length / nCols)
  const lineH = 6
  const h = 20 + pairsPerCol * lineH
  const r = 2

  doc.setFillColor(...C.card)
  roundedRect(doc, 20, y, 170, h, r, "F")
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.5)
  roundedRect(doc, 20, y, 170, h, r, "S")

  doc.setTextColor(...C.textSecondary)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.eventDetailsSection, 26, y + 8)

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  const colX = [26, 100]

  rows.forEach(([label, value], idx) => {
    const col = Math.floor(idx / pairsPerCol)
    const row = idx % pairsPerCol
    const yy = y + 16 + row * lineH
    const xx = colX[col]
    doc.setTextColor(...C.textSecondary)
    doc.text(label + ":", xx, yy)
    doc.setTextColor(...C.text)
    doc.setFont("helvetica", "bold")
    const maxVW = col === 0 ? 68 : 60
    doc.text(truncate(doc, value, maxVW), xx + (col === 0 ? 28 : 25), yy)
    doc.setFont("helvetica", "normal")
  })
  return h
}

function drawTable(doc, startY, items, rentalDays, lbl) {
  const margin = 20
  const totalW = 170
  const colX = [margin, margin + 70, margin + 94, margin + 116, margin + 146]
  const colW = [70, 24, 22, 30, 24]
  const r = 2

  let calcTotal = 0
  const rowH = 8

  // Header rounded box
  drawSolidRounded(doc, margin, startY, totalW, 9, r, C.secondary)
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.5)
  roundedRect(doc, margin, startY, totalW, 9, r, "S")
  doc.setTextColor(...C.tableHeaderText)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  ;[lbl.description, "Días", lbl.quantity, lbl.unitPrice, lbl.amount].forEach((h, i) => {
    const a = i === 0 ? "left" : "center"
    const x = i === 0 ? colX[i] + 5 : colX[i] + colW[i] / 2
    doc.text(h, x, startY + 6.5, { align: a })
  })

  // Items box
  const itemsY = startY + 14
  const itemsH = items.length * rowH + 6
  doc.setFillColor(...C.white)
  roundedRect(doc, margin, itemsY, totalW, itemsH, r, "F")
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.5)
  roundedRect(doc, margin, itemsY, totalW, itemsH, r, "S")

  let y = itemsY + 3

  items.forEach((item, idx) => {
    const rowBg = idx % 2 === 0 ? C.white : C.tableRowAlt
    doc.setFillColor(...rowBg)
    doc.rect(margin + 0.5, y, totalW - 1, rowH, "F")

    doc.setDrawColor(...C.divider)
    doc.setLineWidth(0.3)
    doc.line(margin + 1, y + rowH, margin + totalW - 1, y + rowH)

    const price = item.unit_price || item.price || 0
    const qty = item.quantity || 1
    const itemTotal = price * qty * rentalDays
    calcTotal += itemTotal

    doc.setTextColor(...C.text)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    const desc = truncate(doc, item.description || lbl.noDescription, colW[0] - 8)
    doc.text(desc, colX[0] + 4, y + 6)

    doc.text(String(rentalDays), colX[1] + colW[1] / 2, y + 6, { align: "center" })
    doc.text(String(qty), colX[2] + colW[2] / 2, y + 6, { align: "center" })

    doc.setFont("helvetica", "bold")
    doc.text("AWG " + price.toFixed(2), colX[3] + colW[3] / 2, y + 6, { align: "center" })
    doc.text("AWG " + itemTotal.toFixed(2), colX[4] + colW[4] / 2, y + 6, { align: "center" })

    y += rowH
  })

  return { endY: y + 3, calculatedTotal: calcTotal }
}

function drawSummary(doc, x, y, rentalDays, subtotal, total, lbl) {
  const w = 95
  const r = 2

  const rowH = 10
  let yy = y

  // Rows box
  const rowsH = 2 * (rowH + 1)
  doc.setFillColor(...C.white)
  roundedRect(doc, x, yy, w, rowsH, r, "F")
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.5)
  roundedRect(doc, x, yy, w, rowsH, r, "S")

  const drawRow = (label, value) => {
    doc.setTextColor(...C.textSecondary)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(truncate(doc, label, w / 2 - 4), x + 8, yy + rowH - 3)
    doc.setTextColor(...C.text)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.text(value, x + w - 8, yy + rowH - 3, { align: "right" })
    yy += rowH + 1
  }

  drawRow(lbl.rentalDays, String(rentalDays))
  drawRow(lbl.subtotal, "AWG " + subtotal.toFixed(2))

  // Total box
  yy += 2
  drawSolidRounded(doc, x, yy, w, 12, r, C.primary)
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.5)
  roundedRect(doc, x, yy, w, 12, r, "S")
  doc.setTextColor(...C.white)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.total, x + 8, yy + 8)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("AWG " + (total || subtotal).toFixed(2), x + w - 8, yy + 8, { align: "right" })
}

function drawPaymentInfo(doc, y, lbl) {
  const r = 2
  const h = 36
  doc.setFillColor(...C.card)
  roundedRect(doc, 20, y, 170, h, r, "F")
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.5)
  roundedRect(doc, 20, y, 170, h, r, "S")

  doc.setTextColor(...C.text)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.bankData, 28, y + 9)

  const rows = [
    [lbl.method, lbl.transfer],
    [lbl.bank, bankInfo.bank],
    [lbl.account, bankInfo.account],
    [lbl.accountHolder, bankInfo.accountName]
  ]
  let py = y + 17
  doc.setFontSize(8)
  rows.forEach(([k, v]) => {
    doc.setTextColor(...C.textSecondary)
    doc.setFont("helvetica", "normal")
    doc.text(k + ":", 28, py)
    doc.setTextColor(...C.text)
    doc.setFont("helvetica", "bold")
    doc.text(truncate(doc, v, 95), 66, py)
    py += 4
  })
}

function drawThankYou(doc, y, lbl) {
  doc.setDrawColor(...C.divider)
  doc.setLineWidth(0.3)
  doc.line(80, y, 130, y)

  doc.setTextColor(...C.secondary)
  doc.setFontSize(10)
  doc.setFont("helvetica", "italic")
  doc.text(lbl.thanks, 105, y + 7, { align: "center" })
}

function drawFooter(doc, ft) {
  // Gradient zigzag ribbon
  const zigTop = 278
  const gs = doc.GState ? new doc.GState({ opacity: 0.07 }) : null
  if (gs) doc.setGState(gs)

  for (let x = 0; x < 210; x += 6) {
    doc.setFillColor(...(x % 12 < 6 ? C.secondary : C.primary))
    const zig = zigTop + (x % 12 < 6 ? 5 : -2)
    doc.circle(x, zig, 3, "F")
  }
  if (gs) doc.setGState(new doc.GState({ opacity: 1 }))

  doc.setFontSize(7)
  doc.setTextColor(...C.textMuted)
  doc.text(truncate(doc, ft, 160), 105, 291, { align: "center" })
  doc.setDrawColor(...C.divider)
  doc.setLineWidth(0.3)
  doc.line(20, 294, 190, 294)
}

// =============================================================
// PDF GENERATORS
// =============================================================
export async function generateInvoicePDF(invoice, items, client, rentalDays = 1, locale = "es") {
  const doc = new jsPDF()
  const lbl = labels[locale] || labels.es
  const ft = footerText[locale] || footerText.es
  const company = await getCompanyInfo()
  const logoBase64 = await getLogoBase64()
  const dateStr = new Date(invoice.created_at).toLocaleDateString(locale === "en" ? "en-US" : "es-ES")

  drawHeader(doc, lbl.invoice,
    lbl.invoiceNumber + " " + (invoice.invoice_number || invoice.id?.slice(0, 8)?.toUpperCase() || "0000"),
    lbl.date + ":", dateStr, null, logoBase64, locale)

  let y = 52

  const details = [company.email, company.phone, company.address]
  const h1 = drawPartyBox(doc, 20, y, 82, lbl.from, company.name, details, false)
  drawPartyBox(doc, 108, y, 82, lbl.to,
    client?.name || "N/A",
    [client?.email, client?.phone, client?.address].filter(Boolean), true)
  y += Math.max(h1, 24) + 3

  if (invoice.delivery_date || invoice.pickup_date || invoice.event_type) {
    y += 1
    y += drawEventBox(doc, y, invoice, rentalDays, lbl)
    y += 3
  }

  y += 1

  const tableResult = drawTable(doc, y, items, rentalDays, lbl)
  y = tableResult.endY + 4

  const subtotal = items.reduce((sum, item) => sum + (item.unit_price || item.price || 0) * (item.quantity || 1) * rentalDays, 0)
  drawSummary(doc, 95, y, rentalDays, subtotal, invoice.total || subtotal, lbl)
  y += 38

  drawPaymentInfo(doc, y, lbl)
  y += 40

  drawThankYou(doc, y, lbl)
  y += 10

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
    lbl.date + ":", dateStr, validUntilStr, logoBase64, locale)

  let y = 52

  const details = [company.email, company.phone, company.address]
  const h1 = drawPartyBox(doc, 20, y, 82, lbl.from, company.name, details, false)
  drawPartyBox(doc, 108, y, 82, lbl.to,
    client?.name || "N/A",
    [client?.email, client?.phone, client?.address].filter(Boolean), true)
  y += Math.max(h1, 24) + 3

  if (quote.event_type || quote.event_location || quote.delivery_date || quote.pickup_date) {
    y += 1
    y += drawEventBox(doc, y, quote, rentalDays, lbl)
    y += 3
  }

  y += 1

  const tableResult = drawTable(doc, y, items, rentalDays, lbl)
  y = tableResult.endY + 4

  const subtotal = items.reduce((sum, item) => sum + (item.unit_price || item.price || 0) * (item.quantity || 1) * rentalDays, 0)
  drawSummary(doc, 95, y, rentalDays, subtotal, quote.total || subtotal, lbl)
  y += 38

  drawPaymentInfo(doc, y, lbl)
  y += 40

  drawThankYou(doc, y, lbl)
  y += 10

  drawFooter(doc, ft)

  doc.save(lbl.quoteFile + (quote.quote_number || quote.reference || "FELIZ-000") + ".pdf")
}
