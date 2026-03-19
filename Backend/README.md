# Backend API

Express.js backend API for the ecommerce application with admin panel support, powered by Supabase.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

**Note**: This project requires Node.js 14+ and npm 6+. If you encounter version issues, consider updating Node.js.

### 2. Environment Configuration

Create a `.env` file in the Backend directory with the following variables:

```env
PORT=5000
ADMIN_PANEL_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Supabase Setup:**

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to Settings → API
3. Copy your:
   - Project URL → `SUPABASE_URL`
   - `service_role` key (secret) → `SUPABASE_SERVICE_ROLE_KEY`
   - `anon` `public` key → `SUPABASE_ANON_KEY`

**Important**: The service role key bypasses Row Level Security. Keep it secret and never expose it to the client!

### 3. Database Setup

Create the required tables in your Supabase database. See `SUPABASE_MIGRATION.md` for SQL scripts.

### 4. Run Server

```bash
npm start
```

Or with nodemon for development:

```bash
npm run dev
```

The server will run on `http://localhost:5000` (or the port specified in `.env`)

## API Endpoints

### Admin Authentication

- `POST /api/admin/auth/login` - Login with Supabase access token
- `GET /api/admin/auth/verify` - Verify current admin session
- `POST /api/admin/auth/logout` - Logout

### Admin Users

- `GET /api/admin/users` - Get all users (with pagination and filters)
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Soft delete user

### Admin Products

- `GET /api/admin/products` - Get all products (with pagination and filters)
- `GET /api/admin/products/:id` - Get product by ID
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Admin Orders

- `GET /api/admin/orders` - Get all orders (with pagination and filters)
- `GET /api/admin/orders/:id` - Get order by ID
- `PUT /api/admin/orders/:id` - Update order status

## Authentication

All admin endpoints (except `/api/admin/auth/login`) require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <supabase_access_token>
```

The middleware verifies:
1. The Supabase JWT token is valid
2. The user exists in the database
3. The user has `role: "admin"` in their user record

## Security

- CORS is configured to only allow requests from the admin panel URL
- All admin routes are protected by authentication middleware
- Admin role is verified on every request
- Uses Supabase Row Level Security (RLS) for database access control
- Input validation should be added for production use

## Creating Admin User

Run the script to create a demo admin user:

```bash
node scripts/createAdminUser.js
```

This will create:
- Email: `admin@demo.com`
- Password: `Admin123!@#`
