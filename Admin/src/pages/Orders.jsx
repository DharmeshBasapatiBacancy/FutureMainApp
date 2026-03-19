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
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Pagination,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { ordersAPI } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getAll({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setOrders(response.data.orders || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (order) => {
    try {
      const response = await ordersAPI.getById(order.id);
      setSelectedOrder(response.data.order);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details');
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };

  const handleStatusUpdate = async (orderId, newStatus, additionalData = {}) => {
    try {
      await ordersAPI.update(orderId, { status: newStatus, ...additionalData });
      setEditDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      setError('Failed to update order status');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Orders</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            label="Filter by Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Tracking</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_number || order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.user?.email || order.user?.displayName || 'N/A'}</TableCell>
                    <TableCell>${order.total_amount || order.totalAmount || 0}</TableCell>
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
                    <TableCell>{order.tracking_number || 'N/A'}</TableCell>
                    <TableCell>
                      {order.created_at || order.createdAt
                        ? new Date(order.created_at || order.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleView(order)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(order)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
            />
          </Box>
        )}
      </Paper>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography><strong>Order Number:</strong> {selectedOrder.order_number || selectedOrder.id}</Typography>
              <Typography><strong>Status:</strong> {selectedOrder.status}</Typography>
              <Typography><strong>Payment Status:</strong> {selectedOrder.payment_status || 'pending'}</Typography>
              <Typography><strong>Total:</strong> ${selectedOrder.total_amount || selectedOrder.totalAmount || 0}</Typography>
              <Typography><strong>Subtotal:</strong> ${selectedOrder.subtotal || 0}</Typography>
              <Typography><strong>Shipping:</strong> ${selectedOrder.shipping_cost || 0}</Typography>
              <Typography><strong>Tax:</strong> ${selectedOrder.tax_amount || 0}</Typography>
              <Typography><strong>Tracking Number:</strong> {selectedOrder.tracking_number || 'N/A'}</Typography>
              <Typography><strong>Shipping Method:</strong> {selectedOrder.shipping_method || 'N/A'}</Typography>
              <Typography><strong>Payment Method:</strong> {selectedOrder.payment_method || 'N/A'}</Typography>
              <Typography><strong>Date:</strong> {selectedOrder.created_at || selectedOrder.createdAt ? new Date(selectedOrder.created_at || selectedOrder.createdAt).toLocaleString() : 'N/A'}</Typography>
              {selectedOrder.notes && (
                <Typography><strong>Notes:</strong> {selectedOrder.notes}</Typography>
              )}
              {selectedOrder.items && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Items:</Typography>
                  {selectedOrder.items.map((item, index) => (
                    <Typography key={index}>
                      {item.name || 'Product'} - Qty: {item.quantity} - ${item.price || 0}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Order Status</InputLabel>
              <Select
                value={selectedOrder?.status || ''}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                label="Order Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={selectedOrder?.payment_status || 'pending'}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, payment_status: e.target.value })}
                label="Payment Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Tracking Number"
              value={selectedOrder?.tracking_number || ''}
              onChange={(e) => setSelectedOrder({ ...selectedOrder, tracking_number: e.target.value })}
              fullWidth
            />
            <TextField
              label="Shipping Method"
              value={selectedOrder?.shipping_method || ''}
              onChange={(e) => setSelectedOrder({ ...selectedOrder, shipping_method: e.target.value })}
              fullWidth
            />
            <TextField
              label="Notes"
              value={selectedOrder?.notes || ''}
              onChange={(e) => setSelectedOrder({ ...selectedOrder, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              handleStatusUpdate(selectedOrder.id, selectedOrder.status, {
                payment_status: selectedOrder.payment_status,
                tracking_number: selectedOrder.tracking_number,
                shipping_method: selectedOrder.shipping_method,
                notes: selectedOrder.notes,
              });
            }} 
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;

