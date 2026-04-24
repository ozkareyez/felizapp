# AGENTS.md

## Dev Commands
```bash
npm run dev      # localhost:3000
npm run build   # Production build
npm run lint    # ESLint (0 errors acceptable)
```

## Required Setup
- `.env.local` with: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Company ID: `2b58cc88-82a4-444b-86d3-e5b952320d5a`

## Database
- Schema: `supabase/schema.sql` (run in Supabase SQL Editor)
- **Supabase caches schema** - if columns don't exist, run `ALTER TABLE` manually

## Critical Rules
- **NO TypeScript**: Every file MUST have `// @ts-nocheck` at top
- Company name: **FELIZ ENTERPRISE** (not SpeedInvoice)
- Currency: AWG (Aruban Florin)
- **No dark mode**

## Mobile Responsive
- Default padding: `p-2` (not p-4 or p-6) to fit mobile screens
- Use `flex-col sm:flex-row` for mobile-first layouts
- Inputs in forms: vertical stack on mobile, horizontal on desktop

## Code Conventions
- **useEffect**: Always use inline async + mounted flag:
  ```javascript
  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      const data = await fetchData()
      if (isMounted) setData(data)
    }
    fetch()
    return () => { isMounted = false }
  }, [])
  ```
- **Date parsing**: Avoid `+ 'T00:00:00'` pattern - causes Invalid Date. Use direct ISO:
  ```javascript
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long" })
  }
  ```

## Architecture
- Route Groups: `(auth)` = public, `(dashboard)` = protected
- Supabase client: `lib/supabase/client.ts`
- i18n: `lib/i18n.js` (Spanish default, English via t())
- PDF: `lib/pdf-generator.js` (jsPDF)

## Pages
| Path | Description |
|------|-------------|
| `/dashboard` | Analytics + date filters |
| `/invoices` | Invoice list with filters |
| `/invoices/[id]` | Invoice detail + toggle status |
| `/invoices/[id]/edit` | Edit invoice (labels: Cant., Precio) |
| `/invoices/create` | Create invoice |
| `/quotes` | Quote list with filters |
| `/quotes/[id]` | Quote detail + PDF + WhatsApp |
| `/quotes/[id]/edit` | Edit quote |
| `/quotes/[id]/convert` | Convert to invoice |
| `/deliveries` | Deliveries/collections (filters: Hoy/Todas) |
| `/clients` | Client management |
| `/products` | Product catalog |

## Database Fields
- `quotes`: `quote_number`, `reference`, `delivery_date`, `pickup_date`, `rental_days`, `delivery_status`, `pickup_status`
- `quote_items`: `unit_price` (NOT `price`)
- `invoices`: `invoice_number`, `delivery_date`, `pickup_date`
- `invoice_items`: `unit_price`