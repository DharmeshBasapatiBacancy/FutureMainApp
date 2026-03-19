import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { dashboardAPI, ordersAPI, customersAPI, vendorsAPI, productsAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalCustomers: 0,
    totalVendors: 0,
    totalProducts: 0, 
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, customersData, vendorsData, productsData, ordersData] = await Promise.all([
          dashboardAPI.getStats(),
          customersAPI.getAll({ limit: 1 }),
          vendorsAPI.getAll({ limit: 1 }),
          productsAPI.getAll({ limit: 1 }),
          ordersAPI.getAll({ limit: 10 }),
        ]);

        // Calculate total revenue from orders
        const allOrders = ordersData.data.orders || [];
        const totalRevenue = allOrders.reduce((sum, order) => {
          return sum + (parseFloat(order.total_amount || order.totalAmount || 0));
        }, 0);

        setStats({
          totalUsers: usersData.totalUsers || 0,
          totalCustomers: customersData.data.pagination?.total || 0,
          totalVendors: vendorsData.data.pagination?.total || 0,
          totalProducts: productsData.data.pagination?.total || 0,
          totalOrders: ordersData.data.pagination?.total || 0,
          totalRevenue: totalRevenue,
        });
        setRecentOrders(allOrders.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Customers', value: stats.totalCustomers, color: '#1976d2', icon: '👥' },
    { title: 'Total Vendors', value: stats.totalVendors, color: '#2e7d32', icon: '🏪' },
    { title: 'Total Products', value: stats.totalProducts, color: '#9c27b0', icon: '📦' },
    { title: 'Total Orders', value: stats.totalOrders, color: '#ed6c02', icon: '🛒' },
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: '#d32f2f', icon: '💰' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={card.title}>
            <Paper
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                color: 'white',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{card.icon}</span>
                {card.title}
              </Typography>
              <Typography variant="h4">{card.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Orders
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_number || order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.user?.email || order.user?.displayName || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status || 'pending'}
                        color={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'cancelled'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.payment_status || 'pending'}
                        color={
                          order.payment_status === 'paid'
                            ? 'success'
                            : order.payment_status === 'failed'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${order.total_amount || order.totalAmount || 0}</TableCell>
                    <TableCell>
                      {order.created_at || order.createdAt
                        ? new Date(order.created_at || order.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;

