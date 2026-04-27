import { jsPDF } from "jspdf"

let cachedLogo = null

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

const companyInfo = {
  name: "FELIZ ENTERPRISE",
  address: "Aruba",
  phone: "+297 000-0000",
  email: "info@felizaruba.com",
  ruc: "000000000"
}

const bankInfo = {
  bank: "CBA",
  account: "100102010",
  accountName: "FELIZ ENTERPRISE"
}

const footerText = {
  es: "Factura generada conforme a la regulación fiscal de Aruba - DIMP | FELIZ ENTERPRISE © 2026",
  en: "Invoice generated according to Aruba tax regulations - DIMP | FELIZ ENTERPRISE © 2026"
}

const labels = {
  es: {
    invoice: "FACTURA", quote: "COTIZACIÓN", client: "CLIENTE", eventDetails: "DETALLES DEL EVENTO",
    description: "Descripción", quantity: "Cant", unitPrice: "P.Unit", amount: "Importe", total: "TOTAL",
    bankData: "DATOS BANCARIOS", bank: "Banco", account: "No. Cuenta", accountHolder: "Titular",
    validUntil: "Válido hasta", delivery: "Entrega", pickup: "Recogida", rentalDays: "Días de alquiler",
    eventType: "Tipo de Evento", location: "Ubicación", noDescription: "Sin descripción",
    invoiceFile: "Factura-", quoteFile: "Cotizacion-"
  },
  en: {
    invoice: "INVOICE", quote: "QUOTE", client: "CLIENT", eventDetails: "EVENT DETAILS",
    description: "Description", quantity: "Qty", unitPrice: "Unit Price", amount: "Amount", total: "TOTAL",
    bankData: "BANK DETAILS", bank: "Bank", account: "Account No.", accountHolder: "Account Holder",
    validUntil: "Valid until", delivery: "Delivery", pickup: "Pickup", rentalDays: "Rental days",
    eventType: "Event Type", location: "Location", noDescription: "No description",
    invoiceFile: "Invoice-", quoteFile: "Quote-"
  }
}

export async function generateInvoicePDF(invoice, items, client, rentalDays = 1, locale = "es") {
  const doc = new jsPDF()
  const lbl = labels[locale] || labels.es
  const ft = footerText[locale] || footerText.es
  
  const primaryBlue = [41, 128, 185]
  const grayLight = [248, 248, 248]
  const grayBorder = [200, 200, 200]
  const textDark = [50, 50, 50]
  const textGray = [120, 120, 120]

  const logoBase64 = await getLogoBase64()
  
 doc.setFillColor(...primaryBlue)
 doc.rect(0, 0, 210, 6, "F")

 if (logoBase64) {
   doc.addImage(logoBase64, "PNG", 10, 8, 18, 18)
   doc.setTextColor(...textDark)
   doc.setFontSize(14)
   doc.setFont("helvetica", "bold")
   doc.text(companyInfo.name, 32, 18)
   
   doc.setTextColor(...textDark)
   doc.setFontSize(8)
   doc.setFont("helvetica", "normal")
   doc.setTextColor(...textGray)
   doc.text("Telf: " + companyInfo.phone, 32, 24)
   doc.text("Email: " + companyInfo.email, 32, 29)
   doc.text("RUC: " + companyInfo.ruc, 32, 34)
 } else {
   doc.setTextColor(...textDark)
   doc.setFontSize(14)
   doc.setFont("helvetica", "bold")
   doc.text(companyInfo.name, 15, 18)
   
   doc.setTextColor(...textDark)
   doc.setFontSize(8)
   doc.setFont("helvetica", "normal")
   doc.setTextColor(...textGray)
   doc.text("Telf: " + companyInfo.phone, 15, 24)
   doc.text("Email: " + companyInfo.email, 15, 29)
   doc.text("RUC: " + companyInfo.ruc, 15, 34)
}
   
   doc.setFillColor(245, 245, 245)
  doc.roundedRect(135, 10, 60, 25, 2, 2, "F")
  
  doc.setTextColor(...textDark)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.invoice, 165, 18, { align: "center" })
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("No. " + (invoice.invoice_number || "0000"), 165, 25, { align: "center" })
  doc.text("Fecha: " + new Date(invoice.created_at).toLocaleDateString(locale === "en" ? "en-US" : "es-ES"), 165, 31, { align: "center" })
  
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.line(15, 40, 195, 40)
  
  doc.setFillColor(...grayLight)
  doc.roundedRect(15, 48, 90, 42, 3, 3, "F")
  doc.setDrawColor(...grayBorder)
  doc.setLineWidth(0.3)
  doc.roundedRect(15, 48, 90, 42, 3, 3, "S")
  
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(15, 48, 90, 8, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.client, 60, 53, { align: "center" })
  
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(client?.name || "N/A", 20, 64)
  
  doc.setFontSize(9)
  doc.setTextColor(...textGray)
  if (client?.address) doc.text(client.address, 20, 71)
  if (client?.phone) doc.text("Tel: " + client.phone, 20, 78)
  if (client?.email) doc.text(client.email, 20, 85)
  
  doc.setFillColor(...grayLight)
  doc.roundedRect(110, 48, 85, 42, 3, 3, "F")
  doc.setDrawColor(...grayBorder)
  doc.roundedRect(110, 48, 85, 42, 3, 3, "S")
  
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(110, 48, 85, 8, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.eventDetails, 152.5, 53, { align: "center" })
  
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  let detailY = 64
  
  if (invoice.event_type) { doc.text(lbl.eventType + ": " + invoice.event_type, 115, detailY); detailY += 7 }
  if (invoice.event_location) { doc.text(lbl.location + ": " + invoice.event_location, 115, detailY); detailY += 7 }
  if (invoice.delivery_date) { doc.text(lbl.delivery + ": " + new Date(invoice.delivery_date).toLocaleDateString(locale === "en" ? "en-US" : "es-ES"), 115, detailY); detailY += 7 }
  if (invoice.pickup_date) { doc.text(lbl.pickup + ": " + new Date(invoice.pickup_date).toLocaleDateString(locale === "en" ? "en-US" : "es-ES"), 115, detailY); detailY += 7 }
  doc.text(lbl.rentalDays + ": " + rentalDays, 115, detailY)
  
  let tableY = 100
  
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(15, tableY, 180, 9, 2, 2, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.description, 20, tableY + 6)
  doc.text(lbl.quantity, 100, tableY + 6)
  doc.text(lbl.unitPrice, 125, tableY + 6)
  doc.text(lbl.amount, 175, tableY + 6)
  
  tableY += 12
  let alternate = false
  let calculatedTotal = 0
  
  items.forEach((item) => {
    if (alternate) { doc.setFillColor(250, 250, 250); doc.rect(15, tableY - 3, 180, 8, "F") }
    const price = item.unit_price || item.price || 0
    const quantity = item.quantity || 1
    const itemTotal = price * quantity * rentalDays
    calculatedTotal += itemTotal
    doc.setTextColor(...textDark)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    const desc = item.description ? item.description.substring(0, 40) : lbl.noDescription
    doc.text(desc, 20, tableY)
    doc.text(String(quantity), 100, tableY)
    doc.text("AWG " + price.toFixed(2), 125, tableY)
    doc.text("AWG " + itemTotal.toFixed(2), 175, tableY)
    tableY += 8
    alternate = !alternate
  })
  
  tableY += 5
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.8)
  doc.line(120, tableY, 195, tableY)
  tableY += 8
  
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...textDark)
  doc.text(lbl.total + ":", 130, tableY)
  doc.text("AWG " + (invoice.total || calculatedTotal).toFixed(2), 175, tableY)
  
  tableY += 18
  
  doc.setFillColor(...grayLight)
  doc.roundedRect(15, tableY, 180, 35, 3, 3, "F")
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, tableY, 180, 35, 3, 3, "S")
  
  doc.setTextColor(...primaryBlue)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.bankData, 105, tableY + 10, { align: "center" })
  
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(lbl.bank + ": " + bankInfo.bank, 105, tableY + 18, { align: "center" })
  doc.text(lbl.account + ": " + bankInfo.account, 105, tableY + 25, { align: "center" })
  doc.text(lbl.accountHolder + ": " + bankInfo.accountName, 105, tableY + 32, { align: "center" })
  
  doc.setFontSize(6)
  doc.setTextColor(...textGray)
  doc.text(ft, 105, 292, { align: "center", maxWidth: 180 })
  
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.line(15, 296, 195, 296)
  
  doc.save(lbl.invoiceFile + (invoice.invoice_number || "0000") + ".pdf")
}

export async function generateQuotePDF(quote, items, client, rentalDays = 1, locale = "es") {
  const doc = new jsPDF()
  const lbl = labels[locale] || labels.es
  const ft = footerText[locale] || footerText.es
  
  const primaryBlue = [41, 128, 185]
  const grayLight = [248, 248, 248]
  const grayBorder = [200, 200, 200]
  const textDark = [50, 50, 50]
  const textGray = [120, 120, 120]
  
  const logoBase64 = await getLogoBase64()
  
 doc.setFillColor(...primaryBlue)
 doc.rect(0, 0, 210, 6, "F")

 if (logoBase64) {
   doc.addImage(logoBase64, "PNG", 10, 8, 18, 18)
   doc.setTextColor(...textDark)
   doc.setFontSize(14)
   doc.setFont("helvetica", "bold")
   doc.text(companyInfo.name, 32, 18)
   
   doc.setTextColor(...textDark)
   doc.setFontSize(8)
   doc.setFont("helvetica", "normal")
   doc.setTextColor(...textGray)
   doc.text("Telf: " + companyInfo.phone, 32, 24)
   doc.text("Email: " + companyInfo.email, 32, 29)
   doc.text("RUC: " + companyInfo.ruc, 32, 34)
 } else {
   doc.setTextColor(...textDark)
   doc.setFontSize(14)
   doc.setFont("helvetica", "bold")
   doc.text(companyInfo.name, 15, 18)
   
   doc.setTextColor(...textDark)
   doc.setFontSize(8)
   doc.setFont("helvetica", "normal")
   doc.setTextColor(...textGray)
   doc.text("Telf: " + companyInfo.phone, 15, 24)
   doc.text("Email: " + companyInfo.email, 15, 29)
   doc.text("RUC: " + companyInfo.ruc, 15, 34)
 }
   
   doc.setFillColor(245, 245, 245)
  doc.roundedRect(130, 10, 65, 30, 2, 2, "F")
  
  doc.setTextColor(...textDark)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.quote, 162.5, 18, { align: "center" })
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("No. " + (quote.quote_number || quote.reference || "FELIZ-000"), 162.5, 26, { align: "center" })
  doc.text("Fecha: " + new Date(quote.created_at).toLocaleDateString(locale === "en" ? "en-US" : "es-ES"), 162.5, 33, { align: "center" })
  
  if (quote.valid_until) {
    doc.text(lbl.validUntil + ": " + new Date(quote.valid_until).toLocaleDateString(locale === "en" ? "en-US" : "es-ES"), 162.5, 40, { align: "center" })
  }
  
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.line(15, 46, 195, 46)
  
  doc.setFillColor(...grayLight)
  doc.roundedRect(15, 54, 90, 48, 3, 3, "F")
  doc.setDrawColor(...grayBorder)
  doc.setLineWidth(0.3)
  doc.roundedRect(15, 54, 90, 48, 3, 3, "S")
  
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(15, 54, 90, 8, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.client, 60, 59, { align: "center" })
  
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(client?.name || "N/A", 20, 70)
  
  doc.setFontSize(9)
  doc.setTextColor(...textGray)
  if (client?.address) doc.text(client.address, 20, 78)
  if (client?.phone) doc.text("Tel: " + client.phone, 20, 86)
  if (client?.email) doc.text(client.email, 20, 94)
  
  doc.setFillColor(...grayLight)
  doc.roundedRect(110, 54, 85, 48, 3, 3, "F")
  doc.setDrawColor(...grayBorder)
  doc.roundedRect(110, 54, 85, 48, 3, 3, "S")
  
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(110, 54, 85, 8, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.eventDetails, 152.5, 59, { align: "center" })
  
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  let eventY = 70
  
  if (quote.event_type) { doc.text(lbl.eventType + ": " + quote.event_type, 115, eventY); eventY += 7 }
  if (quote.event_location) { doc.text(lbl.location + ": " + quote.event_location, 115, eventY); eventY += 7 }
  if (quote.delivery_date) { doc.text(lbl.delivery + ": " + new Date(quote.delivery_date).toLocaleDateString(locale === "en" ? "en-US" : "es-ES"), 115, eventY); eventY += 7 }
  if (quote.pickup_date) { doc.text(lbl.pickup + ": " + new Date(quote.pickup_date).toLocaleDateString(locale === "en" ? "en-US" : "es-ES"), 115, eventY); eventY += 7 }
  doc.text(lbl.rentalDays + ": " + rentalDays, 115, eventY + 7)
  
  let tableY = 112
  
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(15, tableY, 180, 9, 2, 2, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.description, 20, tableY + 6)
  doc.text(lbl.quantity, 100, tableY + 6)
  doc.text(lbl.unitPrice, 125, tableY + 6)
  doc.text(lbl.amount, 175, tableY + 6)
  
  tableY += 12
  let alternate = false
  let calculatedTotal = 0
  
  items.forEach((item) => {
    if (alternate) { doc.setFillColor(250, 250, 250); doc.rect(15, tableY - 3, 180, 8, "F") }
    const price = item.unit_price || item.price || 0
    const quantity = item.quantity || 1
    const itemTotal = price * quantity * rentalDays
    calculatedTotal += itemTotal
    doc.setTextColor(...textDark)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    const desc = item.description ? item.description.substring(0, 40) : lbl.noDescription
    doc.text(desc, 20, tableY)
    doc.text(String(quantity), 100, tableY)
    doc.text("AWG " + price.toFixed(2), 125, tableY)
    doc.text("AWG " + itemTotal.toFixed(2), 175, tableY)
    tableY += 8
    alternate = !alternate
  })
  
  tableY += 5
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.8)
  doc.line(120, tableY, 195, tableY)
  tableY += 8
  
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...textDark)
  doc.text(lbl.total + ":", 130, tableY)
  doc.text("AWG " + (quote.total || calculatedTotal).toFixed(2), 175, tableY)
  
  tableY += 18
  
  doc.setFillColor(...grayLight)
  doc.roundedRect(15, tableY, 180, 35, 3, 3, "F")
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, tableY, 180, 35, 3, 3, "S")
  
  doc.setTextColor(...primaryBlue)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text(lbl.bankData, 105, tableY + 10, { align: "center" })
  
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(lbl.bank + ": " + bankInfo.bank, 105, tableY + 18, { align: "center" })
  doc.text(lbl.account + ": " + bankInfo.account, 105, tableY + 25, { align: "center" })
  doc.text(lbl.accountHolder + ": " + bankInfo.accountName, 105, tableY + 32, { align: "center" })
  
  doc.setFontSize(6)
  doc.setTextColor(...textGray)
  doc.text(ft, 105, 280, { align: "center", maxWidth: 180 })
  
  doc.save(lbl.quoteFile + (quote.quote_number || quote.reference || "FELIZ-000") + ".pdf")
}