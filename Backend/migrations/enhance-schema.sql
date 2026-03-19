-- Enhanced Database Schema for Admin Modules
-- Run this in Supabase SQL Editor after the initial setup

-- ============================================
-- 1. Enhance Products Table
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS primary_image_url TEXT,
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ratings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS shipping JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS new_arrival BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS best_seller BOOLEAN DEFAULT false;

-- Update category_id to UUID if it was TEXT
-- Note: This assumes categories table will be created
-- ALTER TABLE products ALTER COLUMN category_id TYPE UUID USING category_id::uuid;

-- Create indexes for products
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- ============================================
-- 2. Enhance Orders Table
-- ============================================
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS shipping_method TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- ============================================
-- 3. Create Categories Table
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  image_url TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- Policy: Anyone can read active categories
CREATE POLICY "Anyone can read active categories" ON categories
  FOR SELECT USING (status = 'active');

-- Policy: Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- ============================================
-- 4. Create Vendors Table (Extended vendor info)
-- ============================================
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY REFERENCES users(id),
  business_name TEXT NOT NULL,
  business_email TEXT,
  business_phone TEXT,
  business_address JSONB DEFAULT '{}'::jsonb,
  tax_id TEXT,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- Default 10% commission
  rating DECIMAL(3, 2) DEFAULT 0,
  total_sales DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending_approval', -- 'active', 'suspended', 'pending_approval'
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read all vendors" ON vendors;
DROP POLICY IF EXISTS "Admins can manage vendors" ON vendors;
DROP POLICY IF EXISTS "Vendors can read own data" ON vendors;

-- Policy: Admins can read all vendors
CREATE POLICY "Admins can read all vendors" ON vendors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can manage vendors
CREATE POLICY "Admins can manage vendors" ON vendors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Vendors can read their own data
CREATE POLICY "Vendors can read own data" ON vendors
  FOR SELECT USING (auth.uid() = id);

-- Create indexes for vendors
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_verified ON vendors(verified);

-- ============================================
-- 5. Update Products to reference categories properly
-- ============================================
-- If category_id was TEXT, we need to handle migration
-- For now, we'll keep it flexible (can be TEXT or UUID)

-- ============================================
-- 6. Add function to generate order numbers
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
BEGIN
  new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) LOOP
    new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END LOOP;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

