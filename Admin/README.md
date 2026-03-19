# Admin Panel

React-based admin panel for the ecommerce application, powered by Supabase.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the Admin directory with the following variables:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Supabase Setup:**

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to Settings → API
3. Copy your:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

### 3. Run Development Server

```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173`

## Features

- **Admin Authentication**: Only users with admin role can login (via Supabase Auth)
- **Dashboard**: Overview statistics and recent orders
- **User Management**: View, edit, and delete users
- **Product Management**: Create, read, update, and delete products
- **Order Management**: View orders and update order status

## Authentication

The admin panel uses Supabase Authentication for client-side login, then verifies the admin role through the backend API. Only users with `role: "admin"` in the database can access the admin panel.

## Backend API

The admin panel communicates with the backend API at the URL specified in `VITE_API_URL`. Make sure the backend server is running before using the admin panel.

## Demo Credentials

After setting up the database and running the admin creation script:

- **Email**: `admin@demo.com`
- **Password**: `Admin123!@#`

See `Backend/scripts/createAdminUser.js` or `SUPABASE_MIGRATION.md` for more details.
