import { jsPDF } from "jspdf"

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

const footerText = "Factura generada conforme a la regulación fiscal de Aruba - DIMP (Departamento Impuesto y Aduana). BBO registrado bajo la Landsverordening Belasting op Bedrijfsomzetten | FELIZ ENTERPRISE © 2026"

export async function generateInvoicePDF(invoice, items, client, rentalDays = 1) {
  const doc = new jsPDF()
  
  // Colors
  const primaryBlue = [41, 128, 185]
  const grayLight = [248, 248, 248]
  const grayBorder = [200, 200, 200]
  const textDark = [50, 50, 50]
  const textGray = [120, 120, 120]
  
  // ========== HEADER ==========
  // Top decorative line
  doc.setFillColor(...primaryBlue)
  doc.rect(0, 0, 210, 6, "F")
  
  // Company info
  doc.setTextColor(...textDark)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(companyInfo.name, 15, 18)
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...textGray)
  doc.text("Telf: " + companyInfo.phone, 15, 24)
  doc.text("Email: " + companyInfo.email, 15, 29)
  doc.text("RUC: " + companyInfo.ruc, 15, 34)
  
  // Invoice box on right
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(135, 10, 60, 25, 2, 2, "F")
  
  doc.setTextColor(...textDark)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("FACTURA", 165, 18, { align: "center" })
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("No. " + (invoice.invoice_number || "0000"), 165, 25, { align: "center" })
  doc.text("Fecha: " + new Date(invoice.created_at).toLocaleDateString("es-ES"), 165, 31, { align: "center" })
  
  // Separator line
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.line(15, 40, 195, 40)
  
  // ========== BODY ==========
  // Left box - Client
  doc.setFillColor(...grayLight)
  doc.roundedRect(15, 48, 90, 42, 3, 3, "F")
  doc.setDrawColor(...grayBorder)
  doc.setLineWidth(0.3)
  doc.roundedRect(15, 48, 90, 42, 3, 3, "S")
  
  // Box title
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(15, 48, 90, 8, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("CLIENTE", 60, 53, { align: "center" })
  
  // Client details
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(client?.name || "N/A", 20, 64)
  
  doc.setFontSize(9)
  doc.setTextColor(...textGray)
  if (client?.address) {
    doc.text(client.address, 20, 71)
  }
  if (client?.phone) {
    doc.text("Tel: " + client.phone, 20, 78)
  }
  if (client?.email) {
    doc.text(client.email, 20, 85)
  }
  
  // Right box - Event details
  doc.setFillColor(...grayLight)
  doc.roundedRect(110, 48, 85, 42, 3, 3, "F")
  doc.setDrawColor(...grayBorder)
  doc.roundedRect(110, 48, 85, 42, 3, 3, "S")
  
  // Box title
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(110, 48, 85, 8, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("DETALLES DEL EVENTO", 152.5, 53, { align: "center" })
  
  // Event details
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  let detailY = 64
  
  if (invoice.event_type) {
    doc.text("Tipo: " + invoice.event_type, 115, detailY)
    detailY += 7
  }
  if (invoice.event_location) {
    doc.text("Ubicación: " + invoice.event_location, 115, detailY)
    detailY += 7
  }
  if (invoice.delivery_date) {
    doc.text("Entrega: " + new Date(invoice.delivery_date).toLocaleDateString("es-ES"), 115, detailY)
    detailY += 7
  }
  if (invoice.pickup_date) {
    doc.text("Recogida: " + new Date(invoice.pickup_date).toLocaleDateString("es-ES"), 115, detailY)
    detailY += 7
  }
  doc.text("Días de alquiler: " + rentalDays, 115, detailY)
  
  // ========== ITEMS TABLE ==========
  let tableY = 100
  
  // Table header with blue background
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(15, tableY, 180, 9, 2, 2, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("Descripción", 20, tableY + 6)
  doc.text("Cant", 100, tableY + 6)
  doc.text("P.Unit", 125, tableY + 6)
  doc.text("Importe", 175, tableY + 6)
  
  // Items rows
  tableY += 12
  let alternate = false
  let calculatedTotal = 0
  
  items.forEach((item) => {
    // Alternate row colors
    if (alternate) {
      doc.setFillColor(250, 250, 250)
      doc.rect(15, tableY - 3, 180, 8, "F")
    }
    
    const price = item.unit_price || item.price || 0
    const quantity = item.quantity || 1
    const itemTotal = price * quantity * rentalDays
    calculatedTotal += itemTotal
    
    doc.setTextColor(...textDark)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    
    const desc = item.description ? item.description.substring(0, 40) : "Sin descripción"
    doc.text(desc, 20, tableY)
    doc.text(String(quantity), 100, tableY)
    doc.text("AWG " + price.toFixed(2), 125, tableY)
    doc.text("AWG " + itemTotal.toFixed(2), 175, tableY)
    
    tableY += 8
    alternate = !alternate
  })
  
  // Total section
  tableY += 5
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.8)
  doc.line(120, tableY, 195, tableY)
  tableY += 8
  
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...textDark)
  doc.text("TOTAL:", 130, tableY)
  doc.text("AWG " + (invoice.total || calculatedTotal).toFixed(2), 175, tableY)
  
  // ========== BANK DATA ==========
  tableY += 18
  
  // Bank data box
  doc.setFillColor(...grayLight)
  doc.roundedRect(15, tableY, 180, 35, 3, 3, "F")
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, tableY, 180, 35, 3, 3, "S")
  
  doc.setTextColor(...primaryBlue)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("DATOS BANCARIOS", 105, tableY + 10, { align: "center" })
  
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text("Banco: " + bankInfo.bank, 105, tableY + 18, { align: "center" })
  doc.text("No. Cuenta: " + bankInfo.account, 105, tableY + 25, { align: "center" })
  doc.text("Titular: " + bankInfo.accountName, 105, tableY + 32, { align: "center" })
  
  // ========== FOOTER ==========
  doc.setFontSize(6)
  doc.setTextColor(...textGray)
  doc.text(footerText, 105, 292, { align: "center", maxWidth: 180 })
  
  // Bottom decorative line
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.line(15, 296, 195, 296)
  
  // Save
  doc.save("Factura-" + (invoice.invoice_number || "0000") + ".pdf")
}

export async function generateQuotePDF(quote, items, client, rentalDays = 1) {
  const doc = new jsPDF()
  
  // Colors
  const primaryBlue = [41, 128, 185]
  const grayLight = [248, 248, 248]
  const grayBorder = [200, 200, 200]
  const textDark = [50, 50, 50]
  const textGray = [120, 120, 120]
  
  // ========== HEADER ==========
  // Top decorative line
  doc.setFillColor(...primaryBlue)
  doc.rect(0, 0, 210, 6, "F")
  
  // Company info
  doc.setTextColor(...textDark)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(companyInfo.name, 15, 18)
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...textGray)
  doc.text("Telf: " + companyInfo.phone, 15, 24)
  doc.text("Email: " + companyInfo.email, 15, 29)
  doc.text("RUC: " + companyInfo.ruc, 15, 34)
  
  // Quote box on right
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(130, 10, 65, 30, 2, 2, "F")
  
  doc.setTextColor(...textDark)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("COTIZACIÓN", 162.5, 18, { align: "center" })
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("No. " + (quote.quote_number || quote.reference || "FELIZ-000"), 162.5, 26, { align: "center" })
  doc.text("Fecha: " + new Date(quote.created_at).toLocaleDateString("es-ES"), 162.5, 33, { align: "center" })
  
  if (quote.valid_until) {
    doc.text("Válido: " + new Date(quote.valid_until).toLocaleDateString("es-ES"), 162.5, 40, { align: "center" })
  }
  
  // Separator line
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.line(15, 46, 195, 46)
  
  // ========== BODY ==========
  // Left box - Client
  doc.setFillColor(...grayLight)
  doc.roundedRect(15, 54, 90, 48, 3, 3, "F")
  doc.setDrawColor(...grayBorder)
  doc.setLineWidth(0.3)
  doc.roundedRect(15, 54, 90, 48, 3, 3, "S")
  
  // Box title
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(15, 54, 90, 8, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("CLIENTE", 60, 59, { align: "center" })
  
  // Client details
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(client?.name || "N/A", 20, 70)
  
  doc.setFontSize(9)
  doc.setTextColor(...textGray)
  if (client?.address) {
    doc.text(client.address, 20, 78)
  }
  if (client?.phone) {
    doc.text("Tel: " + client.phone, 20, 86)
  }
  if (client?.email) {
    doc.text(client.email, 20, 94)
  }
  
  // Right box - Event details
  doc.setFillColor(...grayLight)
  doc.roundedRect(110, 54, 85, 48, 3, 3, "F")
  doc.setDrawColor(...grayBorder)
  doc.roundedRect(110, 54, 85, 48, 3, 3, "S")
  
  // Box title
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(110, 54, 85, 8, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("DETALLES DEL EVENTO", 152.5, 59, { align: "center" })
  
  // Event details
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  let eventY = 70
  
  if (quote.event_type) {
    doc.text("Tipo: " + quote.event_type, 115, eventY)
    eventY += 7
  }
  if (quote.event_location) {
    doc.text("Ubicación: " + quote.event_location, 115, eventY)
    eventY += 7
  }
  if (quote.delivery_date) {
    doc.text("Entrega: " + new Date(quote.delivery_date).toLocaleDateString("es-ES"), 115, eventY)
    eventY += 7
  }
  if (quote.pickup_date) {
    doc.text("Recogida: " + new Date(quote.pickup_date).toLocaleDateString("es-ES"), 115, eventY)
    eventY += 7
  }
  doc.text("Días de alquiler: " + rentalDays, 115, eventY + 7)
  
  // ========== ITEMS TABLE ==========
  let tableY = 112
  
  // Table header
  doc.setFillColor(...primaryBlue)
  doc.roundedRect(15, tableY, 180, 9, 2, 2, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("Descripción", 20, tableY + 6)
  doc.text("Cant", 100, tableY + 6)
  doc.text("P.Unit", 125, tableY + 6)
  doc.text("Importe", 175, tableY + 6)
  
  // Items rows
  tableY += 12
  let alternate = false
  let calculatedTotal = 0
  
  items.forEach((item) => {
    if (alternate) {
      doc.setFillColor(250, 250, 250)
      doc.rect(15, tableY - 3, 180, 8, "F")
    }
    
    const price = item.unit_price || item.price || 0
    const quantity = item.quantity || 1
    const itemTotal = price * quantity * rentalDays
    calculatedTotal += itemTotal
    
    doc.setTextColor(...textDark)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    
    const desc = item.description ? item.description.substring(0, 40) : "Sin descripción"
    doc.text(desc, 20, tableY)
    doc.text(String(quantity), 100, tableY)
    doc.text("AWG " + price.toFixed(2), 125, tableY)
    doc.text("AWG " + itemTotal.toFixed(2), 175, tableY)
    
    tableY += 8
    alternate = !alternate
  })
  
  // Total
  tableY += 5
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.8)
  doc.line(120, tableY, 195, tableY)
  tableY += 8
  
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...textDark)
  doc.text("TOTAL:", 130, tableY)
  doc.text("AWG " + (quote.total || calculatedTotal).toFixed(2), 175, tableY)
  
  // ========== BANK DATA ==========
  tableY += 18
  
  doc.setFillColor(...grayLight)
  doc.roundedRect(15, tableY, 180, 35, 3, 3, "F")
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, tableY, 180, 35, 3, 3, "S")
  
  doc.setTextColor(...primaryBlue)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("DATOS BANCARIOS", 105, tableY + 10, { align: "center" })
  
  doc.setTextColor(...textDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text("Banco: " + bankInfo.bank, 105, tableY + 18, { align: "center" })
  doc.text("No. Cuenta: " + bankInfo.account, 105, tableY + 25, { align: "center" })
  doc.text("Titular: " + bankInfo.accountName, 105, tableY + 32, { align: "center" })
  
  // ========== FOOTER ==========
  doc.setFontSize(6)
  doc.setTextColor(...textGray)
  doc.text(footerText, 105, 280, { align: "center", maxWidth: 180 })
  
  // Save
  doc.save("Cotizacion-" + (quote.quote_number || quote.reference || "FELIZ-000") + ".pdf")
}