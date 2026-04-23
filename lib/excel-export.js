import * as XLSX from "xlsx"
import { supabase } from "@/lib/supabase/client"

export function exportToExcel(data, filename) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
  XLSX.writeFile(workbook, filename + ".xlsx")
}

export async function exportAllData() {
  const { data: invoices } = await supabase.from("invoices").select("*").order("created_at", { ascending: false })
  const { data: quotes } = await supabase.from("quotes").select("*").order("created_at", { ascending: false })
  const { data: clients } = await supabase.from("clients").select("*").order("created_at", { ascending: false })
  const { data: products } = await supabase.from("products").select("*").order("categoria")

  const workbook = XLSX.utils.book_new()

  if (invoices?.length) {
    const invoiceData = invoices.map(inv => ({
      Number: inv.invoice_number || inv.id?.slice(0, 8),
      Status: inv.status,
      Total: inv.total,
      Date: inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "",
      Notes: inv.notes || ""
    }))
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(invoiceData), "Invoices")
  }

  if (quotes?.length) {
    const quoteData = quotes.map(q => ({
      Reference: q.reference || "FELIZ-" + q.quote_number,
      Status: q.status,
      Total: q.total,
      EventDate: q.event_date ? new Date(q.event_date).toLocaleDateString() : "",
      EventType: q.event_type || "",
      EventLocation: q.event_location || "",
      Date: q.created_at ? new Date(q.created_at).toLocaleDateString() : ""
    }))
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(quoteData), "Quotes")
  }

  if (clients?.length) {
    const clientData = clients.map(c => ({
      Name: c.name,
      Email: c.email || "",
      Phone: c.phone || "",
      Address: c.address || "",
      Date: c.created_at ? new Date(c.created_at).toLocaleDateString() : ""
    }))
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(clientData), "Clients")
  }

  if (products?.length) {
    const productData = products.map(p => ({
      Name: p.name,
      Category: p.categoria || "General",
      PricePerDay: p.precio_dia || p.price,
      Available: p.cantidad_total || 0,
      Description: p.description || ""
    }))
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(productData), "Products")
  }

  const date = new Date().toISOString().split("T")[0]
  XLSX.writeFile(workbook, `FelizEnterprise_Export_${date}.xlsx`)
}