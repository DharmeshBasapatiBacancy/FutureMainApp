import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { vendorAPI } from '../../services/api';

const VendorProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await vendorAPI.getMe();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
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

  if (error) return <Alert severity="error">{error}</Alert>;

  const v = data?.vendor || {};

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Account</Typography>
              <Typography><strong>Email:</strong> {v.email}</Typography>
              <Typography><strong>Display Name:</strong> {v.displayName || v.first_name || '—'}</Typography>
              <Typography><strong>Role:</strong> {v.role}</Typography>
              <Typography><strong>Status:</strong> {v.status || v.vendorInfo?.status || '—'}</Typography>
              <Typography><strong>Verified:</strong> {v.verified || v.vendorInfo?.verified ? 'Yes' : 'No'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Business</Typography>
              <Typography><strong>Business Name:</strong> {v.businessName || v.vendorInfo?.business_name || '—'}</Typography>
              <Typography><strong>Business Email:</strong> {v.businessEmail || v.vendorInfo?.business_email || '—'}</Typography>
              <Typography><strong>Business Phone:</strong> {v.businessPhone || v.vendorInfo?.business_phone || '—'}</Typography>
              <Typography><strong>Commission Rate:</strong> {v.commissionRate ?? v.vendorInfo?.commission_rate ?? 10}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Stats</Typography>
              <Typography><strong>Rating:</strong> {(v.rating ?? v.vendorInfo?.rating ?? 0).toFixed(1)}</Typography>
              <Typography><strong>Total Sales:</strong> ${Number(v.totalSales ?? v.vendorInfo?.total_sales ?? 0).toFixed(2)}</Typography>
              <Typography><strong>Total Products:</strong> {data?.stats?.totalProducts ?? 0}</Typography>
              <Typography><strong>Total Orders:</strong> {data?.stats?.totalOrders ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VendorProfile;
