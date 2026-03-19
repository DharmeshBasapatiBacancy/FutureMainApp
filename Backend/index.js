const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - allow Admin panel and Android app (emulator + physical device)
const allowedOrigins = [
  process.env.ADMIN_PANEL_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://10.0.2.2:5000',
  'http://10.0.2.2:5173',
  'http://127.0.0.1:5000',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin === o) || origin.startsWith('http://192.168.') || origin.startsWith('http://10.0.')) {
      cb(null, true);
    } else {
      cb(null, true); // allow all in dev; restrict in production
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Admin routes
app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/vendor/auth', require('./routes/vendorAuth'));
app.use('/api/vendor', require('./routes/vendor'));
app.use('/api/admin/users', require('./routes/adminUsers'));
app.use('/api/admin/customers', require('./routes/adminCustomers'));
app.use('/api/admin/vendors', require('./routes/adminVendors'));
app.use('/api/admin/categories', require('./routes/adminCategories'));
app.use('/api/admin/products', require('./routes/adminProducts'));
app.use('/api/admin/orders', require('./routes/adminOrders'));

// Customer routes (Android app)
app.use('/api/customer/auth', require('./routes/customerAuth'));
app.use('/api/customer', require('./routes/customer'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} (accepting connections from all interfaces)`);
});
