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
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { customersAPI } from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [page, search, statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      };
      const response = await customersAPI.getAll(params);
      setCustomers(response.data.customers || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching customers:', error);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      setError(error.response ? 'Failed to fetch customers' : `Cannot reach the backend at ${apiUrl}. Make sure the backend server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (customer) => {
    try {
      const response = await customersAPI.getById(customer.id);
      setSelectedCustomer(response.data.customer);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setError('Failed to fetch customer details');
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      await customersAPI.update(selectedCustomer.id, {
        firstName: selectedCustomer.firstName || selectedCustomer.first_name,
        lastName: selectedCustomer.lastName || selectedCustomer.last_name,
        displayName: selectedCustomer.displayName || selectedCustomer.display_name,
        accountStatus: selectedCustomer.accountStatus || selectedCustomer.account_status,
      });
      setEditDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      setError('Failed to update customer');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'deleted':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Customers
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, name..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Customers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Orders</TableCell>
              <TableCell>Total Spent</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                    {customer.displayName || customer.display_name || 
                     `${customer.firstName || customer.first_name || ''} ${customer.lastName || customer.last_name || ''}`.trim() || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.accountStatus || customer.account_status || 'active'}
                      color={getStatusColor(customer.accountStatus || customer.account_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{customer.totalOrders || 0}</TableCell>
                  <TableCell>${(customer.totalSpent || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(customer.created_at || customer.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleView(customer)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(customer)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Customer Details</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Personal Information</Typography>
                    <Typography><strong>Email:</strong> {selectedCustomer.email}</Typography>
                    <Typography><strong>Name:</strong> {selectedCustomer.displayName || selectedCustomer.display_name || 'N/A'}</Typography>
                    <Typography><strong>First Name:</strong> {selectedCustomer.firstName || selectedCustomer.first_name || 'N/A'}</Typography>
                    <Typography><strong>Last Name:</strong> {selectedCustomer.lastName || selectedCustomer.last_name || 'N/A'}</Typography>
                    <Typography><strong>Status:</strong> {selectedCustomer.accountStatus || selectedCustomer.account_status || 'N/A'}</Typography>
                    <Typography><strong>Email Verified:</strong> {selectedCustomer.emailVerified || selectedCustomer.email_verified ? 'Yes' : 'No'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Statistics</Typography>
                    <Typography><strong>Total Orders:</strong> {selectedCustomer.totalOrders || 0}</Typography>
                    <Typography><strong>Total Spent:</strong> ${(selectedCustomer.totalSpent || 0).toFixed(2)}</Typography>
                    <Typography><strong>Joined:</strong> {new Date(selectedCustomer.created_at || selectedCustomer.createdAt).toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="First Name"
                value={selectedCustomer.firstName || selectedCustomer.first_name || ''}
                onChange={(e) => setSelectedCustomer({ ...selectedCustomer, firstName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Last Name"
                value={selectedCustomer.lastName || selectedCustomer.last_name || ''}
                onChange={(e) => setSelectedCustomer({ ...selectedCustomer, lastName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Display Name"
                value={selectedCustomer.displayName || selectedCustomer.display_name || ''}
                onChange={(e) => setSelectedCustomer({ ...selectedCustomer, displayName: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Account Status</InputLabel>
                <Select
                  value={selectedCustomer.accountStatus || selectedCustomer.account_status || 'active'}
                  label="Account Status"
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, accountStatus: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="deleted">Deleted</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;

