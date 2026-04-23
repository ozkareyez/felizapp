-- Add columns to products table for event rental business
ALTER TABLE products ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'General';
ALTER TABLE products ADD COLUMN IF NOT EXISTS precio_dia DECIMAL(12,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cantidad_total INT DEFAULT 0;