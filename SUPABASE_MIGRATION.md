# Firebase to Supabase Migration Guide

This project has been migrated from Firebase to Supabase. This document outlines the changes and setup instructions.

## What Changed

### Backend
- ✅ Replaced Firebase Admin SDK with Supabase client
- ✅ Replaced Firestore queries with Supabase PostgreSQL queries
- ✅ Updated authentication to use Supabase Auth
- ✅ All routes now use Supabase database

### Admin Panel
- ✅ Replaced Firebase client SDK with Supabase client
- ✅ Updated login flow to use Supabase Auth
- ✅ Updated all API calls to work with Supabase

## Database Schema

You'll need to create the following tables in your Supabase database:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer', -- 'customer', 'admin', 'vendor', 'support'
  account_status TEXT DEFAULT 'active', -- 'active', 'suspended', 'deleted'
  email_verified BOOLEAN DEFAULT false,
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  category_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published products
CREATE POLICY "Anyone can read published products" ON products
  FOR SELECT USING (status = 'published');

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'
  total_amount DECIMAL(10, 2),
  items JSONB,
  status_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins can read all orders
CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note down your project URL and API keys:
   - Project URL (found in Settings → API)
   - Anon/Public Key (found in Settings → API)
   - Service Role Key (found in Settings → API) - **Keep this secret!**

### 2. Set Up Database

1. Go to SQL Editor in Supabase dashboard
2. Run the SQL scripts above to create the tables
3. Adjust the RLS policies as needed for your use case

### 3. Configure Backend

Create `Backend/.env`:
```env
PORT=5000
ADMIN_PANEL_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### 4. Configure Admin Panel

Create `Admin/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Create Admin User

Run the script to create a demo admin user:
```bash
cd Backend
node scripts/createAdminUser.js
```

Or manually:
1. Create a user in Supabase Auth (Authentication → Users → Add User)
2. Insert a record in the `users` table with `role = 'admin'`

### 6. Install Dependencies

```bash
# Backend
cd Backend
npm install

# Admin Panel
cd Admin
npm install
```

### 7. Start Servers

```bash
# Backend (terminal 1)
cd Backend
npm start

# Admin Panel (terminal 2)
cd Admin
npm run dev
```

## Key Differences from Firebase

1. **Database**: Firestore (NoSQL) → PostgreSQL (SQL)
   - Queries use SQL syntax
   - Field names use snake_case instead of camelCase
   - Relationships use foreign keys

2. **Authentication**: 
   - Firebase Auth → Supabase Auth
   - Uses JWT tokens instead of Firebase ID tokens
   - Session management is handled by Supabase

3. **Real-time**: 
   - Firestore real-time listeners → Supabase Realtime subscriptions
   - (Not implemented in admin panel yet, but available)

4. **Storage**: 
   - Firebase Storage → Supabase Storage
   - (Not implemented yet, but available)

## Demo Admin Credentials

After running the create admin script:
- **Email**: `admin@demo.com`
- **Password**: `Admin123!@#`

## Troubleshooting

### "relation 'users' does not exist"
- Make sure you've created the tables in Supabase SQL Editor

### "Invalid API key"
- Check that your `.env` files have the correct Supabase credentials

### "User not found" after login
- Make sure the user exists in both Supabase Auth and the `users` table
- Verify the user has `role = 'admin'` in the database

### RLS (Row Level Security) blocking queries
- Check your RLS policies in Supabase
- For development, you can temporarily disable RLS, but re-enable it for production

## Next Steps

- [ ] Set up proper RLS policies for production
- [ ] Migrate existing data from Firebase (if any)
- [ ] Set up Supabase Storage for file uploads
- [ ] Configure email templates in Supabase
- [ ] Set up database backups

