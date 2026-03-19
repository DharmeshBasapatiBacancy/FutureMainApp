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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { vendorsAPI } from '../services/api';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, [page, search, statusFilter]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      };
      const response = await vendorsAPI.getAll(params);
      setVendors(response.data.vendors || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      setError(error.response ? 'Failed to fetch vendors' : `Cannot reach the backend at ${apiUrl}. Make sure the backend server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (vendor) => {
    try {
      const response = await vendorsAPI.getById(vendor.id);
      setSelectedVendor(response.data.vendor);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      setError('Failed to fetch vendor details');
    }
  };

  const handleCreate = () => {
    setSelectedVendor({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      businessName: '',
      businessEmail: '',
      businessPhone: '',
      businessAddress: {},
    });
    setCreateDialogOpen(true);
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorsAPI.delete(id);
        fetchVendors();
      } catch (error) {
        console.error('Error deleting vendor:', error);
        setError('Failed to delete vendor');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (createDialogOpen) {
        await vendorsAPI.create(selectedVendor);
        setCreateDialogOpen(false);
      } else {
        await vendorsAPI.update(selectedVendor.id, {
          firstName: selectedVendor.firstName,
          lastName: selectedVendor.lastName,
          displayName: selectedVendor.displayName,
          businessName: selectedVendor.businessName,
          businessEmail: selectedVendor.businessEmail,
          businessPhone: selectedVendor.businessPhone,
          businessAddress: selectedVendor.businessAddress,
          status: selectedVendor.status,
          verified: selectedVendor.verified,
          commissionRate: selectedVendor.commissionRate,
        });
        setEditDialogOpen(false);
        const updated = {
          ...selectedVendor,
          status: selectedVendor.status,
          vendorInfo: { ...(selectedVendor.vendorInfo || {}), status: selectedVendor.status },
        };
        setVendors((prev) =>
          prev.map((v) => (v.id === selectedVendor.id ? { ...v, ...updated } : v))
        );
      }
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      setError('Failed to save vendor');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'pending_approval':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Vendors</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Vendor
        </Button>
      </Box>

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
              placeholder="Search by email, name, business..."
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
                <MenuItem value="pending_approval">Pending Approval</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Vendors Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Business Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Total Sales</TableCell>
              <TableCell>Products</TableCell>
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
            ) : vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No vendors found
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>{vendor.businessName || vendor.vendorInfo?.business_name || 'N/A'}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={vendor.status || vendor.vendorInfo?.status || 'pending_approval'}
                      color={getStatusColor(vendor.status || vendor.vendorInfo?.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={vendor.verified || vendor.vendorInfo?.verified ? 'Yes' : 'No'}
                      color={vendor.verified || vendor.vendorInfo?.verified ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{(vendor.rating || vendor.vendorInfo?.rating || 0).toFixed(1)}</TableCell>
                  <TableCell>${(vendor.totalSales || vendor.vendorInfo?.total_sales || 0).toFixed(2)}</TableCell>
                  <TableCell>{vendor.totalProducts || 0}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleView(vendor)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(vendor)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(vendor.id)}
                      color="error"
                    >
                      <DeleteIcon />
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
        <DialogTitle>Vendor Details</DialogTitle>
        <DialogContent>
          {selectedVendor && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Business Information</Typography>
                    <Typography><strong>Business Name:</strong> {selectedVendor.businessName || selectedVendor.vendorInfo?.business_name || 'N/A'}</Typography>
                    <Typography><strong>Business Email:</strong> {selectedVendor.businessEmail || selectedVendor.vendorInfo?.business_email || selectedVendor.email}</Typography>
                    <Typography><strong>Business Phone:</strong> {selectedVendor.businessPhone || selectedVendor.vendorInfo?.business_phone || 'N/A'}</Typography>
                    <Typography><strong>Status:</strong> {selectedVendor.status || selectedVendor.vendorInfo?.status || 'N/A'}</Typography>
                    <Typography><strong>Verified:</strong> {selectedVendor.verified || selectedVendor.vendorInfo?.verified ? 'Yes' : 'No'}</Typography>
                    <Typography><strong>Commission Rate:</strong> {selectedVendor.commissionRate || selectedVendor.vendorInfo?.commission_rate || 10}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Statistics</Typography>
                    <Typography><strong>Rating:</strong> {(selectedVendor.rating || selectedVendor.vendorInfo?.rating || 0).toFixed(1)}</Typography>
                    <Typography><strong>Total Sales:</strong> ${(selectedVendor.totalSales || selectedVendor.vendorInfo?.total_sales || 0).toFixed(2)}</Typography>
                    <Typography><strong>Total Products:</strong> {selectedVendor.totalProducts || 0}</Typography>
                    <Typography><strong>Total Orders:</strong> {selectedVendor.totalOrders || 0}</Typography>
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

      {/* Create/Edit Dialog */}
      <Dialog 
        open={createDialogOpen || editDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>{createDialogOpen ? 'Create Vendor' : 'Edit Vendor'}</DialogTitle>
        <DialogContent>
          {selectedVendor && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {createDialogOpen && (
                <>
                  <TextField
                    label="Email"
                    type="email"
                    value={selectedVendor.email}
                    onChange={(e) => setSelectedVendor({ ...selectedVendor, email: e.target.value })}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={selectedVendor.password}
                    onChange={(e) => setSelectedVendor({ ...selectedVendor, password: e.target.value })}
                    fullWidth
                    required
                  />
                </>
              )}
              <TextField
                label="First Name"
                value={selectedVendor.firstName || ''}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, firstName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Last Name"
                value={selectedVendor.lastName || ''}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, lastName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Business Name"
                value={selectedVendor.businessName || selectedVendor.vendorInfo?.business_name || ''}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, businessName: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Business Email"
                type="email"
                value={selectedVendor.businessEmail || selectedVendor.vendorInfo?.business_email || ''}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, businessEmail: e.target.value })}
                fullWidth
              />
              <TextField
                label="Business Phone"
                value={selectedVendor.businessPhone || selectedVendor.vendorInfo?.business_phone || ''}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, businessPhone: e.target.value })}
                fullWidth
              />
              {!createDialogOpen && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedVendor.status || selectedVendor.vendorInfo?.status || 'pending_approval'}
                      label="Status"
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, status: e.target.value })}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                      <MenuItem value="pending_approval">Pending Approval</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Verified</InputLabel>
                    <Select
                      value={selectedVendor.verified || selectedVendor.vendorInfo?.verified ? 'yes' : 'no'}
                      label="Verified"
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, verified: e.target.value === 'yes' })}
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Commission Rate (%)"
                    type="number"
                    value={selectedVendor.commissionRate || selectedVendor.vendorInfo?.commission_rate || 10}
                    onChange={(e) => setSelectedVendor({ ...selectedVendor, commissionRate: parseFloat(e.target.value) })}
                    fullWidth
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
          }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vendors;

