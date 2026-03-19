import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { vendorAPI } from '../../services/api';

const VendorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await vendorAPI.getMe();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const { vendor, stats = {} } = data || {};
  const cards = [
    { title: 'Total Products', value: stats.totalProducts ?? 0, icon: <InventoryIcon />, color: '#1976d2' },
    { title: 'Total Orders', value: stats.totalOrders ?? 0, icon: <ShoppingCartIcon />, color: '#2e7d32' },
    { title: 'Total Sales', value: `$${Number(vendor?.totalSales || vendor?.vendorInfo?.total_sales || 0).toFixed(2)}`, icon: <MoneyIcon />, color: '#ed6c02' },
    { title: 'Status', value: vendor?.status || vendor?.vendorInfo?.status || 'N/A', icon: <StoreIcon />, color: '#9c27b0' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome, {vendor?.businessName || vendor?.displayName || vendor?.email}
      </Typography>

      <Grid container spacing={3}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">{c.title}</Typography>
                  <Box sx={{ color: c.color }}>{c.icon}</Box>
                </Box>
                <Typography variant="h4">{c.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>Business Info</Typography>
        <Typography><strong>Business Name:</strong> {vendor?.businessName || vendor?.vendorInfo?.business_name || '—'}</Typography>
        <Typography><strong>Email:</strong> {vendor?.email}</Typography>
        <Typography><strong>Phone:</strong> {vendor?.businessPhone || vendor?.vendorInfo?.business_phone || '—'}</Typography>
        <Typography><strong>Commission Rate:</strong> {vendor?.commissionRate ?? vendor?.vendorInfo?.commission_rate ?? 10}%</Typography>
      </Paper>
    </Box>
  );
};

export default VendorDashboard;
