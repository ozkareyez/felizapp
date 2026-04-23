# AGENTS.md

## Dev Commands
```bash
npm run dev      # localhost:3000
npm run build    # Production build
npm run lint     # ESLint (0 errors, 32 warnings acceptable)
```

## Required Setup
- `.env.local` with: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Company ID: `2b58cc88-82a4-444b-86d3-e5b952320d5a`

## Database
- Schema: `supabase/schema.sql` (run in Supabase SQL Editor)
- **Supabase caches schema** - if columns don't exist, run `ALTER TABLE` manually

## Critical Rules
- **NO TypeScript**: Every file MUST have `// @ts-nocheck` at the top
- Company name: **FELIZ ENTERPRISE** (not SpeedInvoice)
- Currency: AWG (Aruban Florin)
- PDF content: **English** (not Spanish)
- Languages: Spanish default, English via i18n (`lib/i18n.js`)
- **No dark mode**

## Code Conventions (Vercel React Best Practices)
- **useEffect**: Always use inline async + mounted flag pattern:
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
- **useState init**: Use lazy initialization for expensive values (localStorage, computed)
- **Fetch deduplication**: Supabase `fetch` auto-deduplicates within request; use `React.cache()` for server-side
- **Parallel fetching**: Use `Promise.all()` for independent operations

## Architecture
- Route Groups: `(auth)` = public, `(dashboard)` = protected
- Supabase client: `lib/supabase/client.ts`
- PDF generator: `lib/pdf-generator.js` (uses jsPDF)

## Pages
| Path | Description |
|------|-------------|
| `/dashboard` | Analytics + date filters + delivery/pickup notifications |
| `/invoices` | List with filters, pagination (15/page), responsive cards |
| `/invoices/[id]` | Detail + click to toggle status (Pendiente/Pagada) |
| `/invoices/create` | Create invoice |
| `/invoices/[id]/edit` | Edit invoice |
| `/quotes` | List with filters, pagination |
| `/quotes/[id]` | Detail + PDF + WhatsApp share + Convert |
| `/quotes/[id]/convert` | Convert quote to invoice |
| `/clients` | Client management |
| `/products` | Product catalog with daily pricing |

## Key Features
- Date filters on dashboard (Today/Week/Month/Last Month/All)
- Delivery/pickup notifications with status tracking
- Quote → Invoice conversion (status: "converted")
- WhatsApp share (downloads PDF + opens chat)
- Excel export from dashboard

## Database Fields
- `quotes`: `quote_number`, `reference`, `delivery_date`, `pickup_date`, `rental_days`, `delivery_status`, `pickup_status`
- `quote_items`: `unit_price` (NOT `price`)
- `invoices`: `invoice_number`
- `invoice_items`: `unit_price`