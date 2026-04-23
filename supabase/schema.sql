-- SpeedInvoice Aruba - Database Schema
-- Currency: AWG (Aruban Florin)
-- Language: Spanish/English

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- COMPANIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CLIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  contact_person TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2),
  unit TEXT DEFAULT 'unit',
  sku TEXT,
  is_active BOOLEAN DEFAULT true,
  categoria TEXT,
  precio_dia DECIMAL(12, 2),
  cantidad_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  total DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  terms TEXT,
  delivery_date DATE,
  pickup_date DATE,
  rental_days INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICE ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  total DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'accepted', 'rejected', 'converted')),
  valid_until DATE,
  notes TEXT,
  terms TEXT,
  reference TEXT,
  event_location TEXT,
  event_type TEXT,
  delivery_date DATE,
  pickup_date DATE,
  rental_days INTEGER DEFAULT 1,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'completed')),
  pickup_status TEXT DEFAULT 'pending' CHECK (pickup_status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUOTE ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);

-- =====================================================
-- DISABLE RLS FOR DEVELOPMENT (ENABLE FOR PRODUCTION)
-- =====================================================
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSERT DEFAULT COMPANY FOR ARUBA CLIENT
-- =====================================================
INSERT INTO companies (id, name, email, phone, address, tax_id)
VALUES (
  '2b58cc88-82a4-444b-86d3-e5b952320d5a',
  'Your Company Name',
  'info@yourcompany.com',
  '+297 123 4567',
  'Oranjestad, Aruba',
  '123456789'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Sample Clients
INSERT INTO clients (company_id, name, email, phone, address) VALUES
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Hotel Aruba Sunset', 'reservations@hotelaruba.com', '+297 582 1234', 'Palm Beach 12, Aruba'),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Aruba Diving Adventures', 'info@arubadiving.com', '+297 586 5678', 'Eagle Beach, Aruba'),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Restaurante Papagayo', 'contacto@papagayo.ar', '+297 583 9012', 'Oranjestad, Aruba')
ON CONFLICT DO NOTHING;

-- Sample Products/Services
INSERT INTO products (company_id, name, description, price, unit) VALUES
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Consultoría Empresarial', 'Servicios de consultoría profesional por hora', 150.00, 'hour'),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Desarrollo Web', 'Creación de sitio web profesional', 2500.00, 'project'),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Mantenimiento Mensual', 'Mantenimiento mensual de sistemas', 500.00, 'month'),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Diseño Gráfico', 'Servicios de diseño profesional', 75.00, 'hour')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTIONS FOR AUTO-NUMBERING
-- =====================================================

-- Function to get next invoice number
CREATE OR REPLACE FUNCTION get_next_invoice_number()
RETURNS TEXT AS $$
DECLARE
  last_number TEXT;
  next_num INT;
BEGIN
  SELECT COALESCE(MAX(invoice_number), '0000') INTO last_number
  FROM invoices WHERE invoice_number ~ '^\d{4}$';
  
  next_num := COALESCE(last_number::INT, 0) + 1;
  RETURN LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to get next quote number
CREATE OR REPLACE FUNCTION get_next_quote_number()
RETURNS TEXT AS $$
DECLARE
  last_number TEXT;
  next_num INT;
BEGIN
  SELECT COALESCE(MAX(quote_number), '0000') INTO last_number
  FROM quotes WHERE quote_number ~ '^\d{4}$';
  
  next_num := COALESCE(last_number::INT, 0) + 1;
  RETURN LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR DASHBOARD
-- =====================================================

-- View: Invoice Summary by Status
CREATE OR REPLACE VIEW invoice_summary AS
SELECT 
  status,
  COUNT(*) as count,
  SUM(total) as total_amount
FROM invoices
GROUP BY status;

-- View: Revenue by Month (Last 12 months)
CREATE REPLACE VIEW monthly_revenue AS
SELECT 
  TO_CHAR(issue_date, 'YYYY-MM') as month,
  TO_CHAR(issue_date, 'Month') as month_name,
  COUNT(*) as invoice_count,
  SUM(total) as revenue
FROM invoices
WHERE status = 'paid'
  AND issue_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY TO_CHAR(issue_date, 'YYYY-MM'), TO_CHAR(issue_date, 'Month')
ORDER BY month;

-- View: Client Statistics
CREATE OR REPLACE VIEW client_stats AS
SELECT 
  c.id,
  c.name,
  COUNT(i.id) as total_invoices,
  SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_paid,
  SUM(CASE WHEN i.status = 'pending' THEN i.total ELSE 0 END) as total_pending
FROM clients c
LEFT JOIN invoices i ON c.id = i.client_id
GROUP BY c.id, c.name;

-- =====================================================
-- COMPLETE - Database is ready!
-- =====================================================