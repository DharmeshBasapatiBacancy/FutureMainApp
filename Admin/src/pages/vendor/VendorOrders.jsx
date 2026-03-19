import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Pagination,
} from '@mui/material';
import { vendorAPI } from '../../services/api';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await vendorAPI.getOrders({ page, limit: 10 });
        setOrders(res.data.orders || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Orders</Typography>
      <Typography variant="body2" color="text.secondary">Orders that include your products</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No orders found</TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id?.slice(0, 8) || '—'}...</TableCell>
                  <TableCell>{formatDate(o.created_at)}</TableCell>
                  <TableCell>
                    <Chip label={o.status || 'pending'} size="small" color="default" />
                  </TableCell>
                  <TableCell>{o.payment_status || '—'}</TableCell>
                  <TableCell>${Number(o.total_amount || o.total || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
        </Box>
      )}
    </Box>
  );
};

export default VendorOrders;
