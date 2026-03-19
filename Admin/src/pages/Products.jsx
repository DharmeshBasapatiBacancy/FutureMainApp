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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Pagination,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { productsAPI, vendorsAPI, categoriesAPI } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);

  const handleApprove = async (id) => {
    try {
      await productsAPI.approve(id);
      fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      setError('Failed to approve product');
    }
  };

  const handleReject = async (id) => {
    try {
      await productsAPI.reject(id);
      fetchProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
      setError('Failed to reject product');
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'pending_approval':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchVendors();
    fetchCategories();
  }, [page]);

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll({ limit: 100 });
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll({ limit: 100 });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll({
        page,
        limit: 20,
      });
      setProducts(response.data.products || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product');
      }
    }
  };

  const handleSave = async (productData) => {
    try {
      if (isEditing) {
        await productsAPI.update(selectedProduct.id, productData);
      } else {
        await productsAPI.create(productData);
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add Product
        </Button>
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
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Status</TableCell>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name || 'N/A'}</TableCell>
                    <TableCell>{product.sku || 'N/A'}</TableCell>
                    <TableCell>${product.price || 0}</TableCell>
                    <TableCell>{product.stock || 0}</TableCell>
                    <TableCell>
                      {vendors.find(v => v.id === product.vendor_id)?.businessName || 
                       vendors.find(v => v.id === product.vendor_id)?.vendorInfo?.business_name || 
                       'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status || 'draft'}
                        color={getStatusChipColor(product.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEdit(product)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(product.id)}>
                        <DeleteIcon />
                      </IconButton>
                      {product.status === 'pending_approval' && (
                        <>
                          <Button
                            size="small"
                            sx={{ ml: 1 }}
                            color="success"
                            onClick={() => handleApprove(product.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            sx={{ ml: 1 }}
                            color="error"
                            onClick={() => handleReject(product.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
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

      <ProductDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        isEditing={isEditing}
        onSave={handleSave}
        vendors={vendors}
        categories={categories}
      />
    </Box>
  );
};

const ProductDialog = ({ open, onClose, product, isEditing, onSave, vendors, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    stock: 0,
    status: 'draft',
    category_id: '',
    vendor_id: '',
    images: [],
    primary_image_url: '',
    featured: false,
    trending: false,
    new_arrival: false,
    best_seller: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        slug: product.slug || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        status: product.status || 'draft',
        category_id: product.category_id || '',
        vendor_id: product.vendor_id || '',
        images: product.images || [],
        primary_image_url: product.primary_image_url || '',
        featured: product.featured || false,
        trending: product.trending || false,
        new_arrival: product.new_arrival || false,
        best_seller: product.best_seller || false,
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        slug: '',
        description: '',
        short_description: '',
        price: 0,
        stock: 0,
        status: 'draft',
        category_id: '',
        vendor_id: '',
        images: [],
        primary_image_url: '',
        featured: false,
        trending: false,
        new_arrival: false,
        best_seller: false,
      });
    }
  }, [product]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Product' : 'Create Product'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Short Description"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vendor</InputLabel>
                <Select
                  value={formData.vendor_id}
                  label="Vendor"
                  onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.businessName || vendor.vendorInfo?.business_name || vendor.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="pending_approval">Pending Approval</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Primary Image URL"
                value={formData.primary_image_url}
                onChange={(e) => setFormData({ ...formData, primary_image_url: e.target.value })}
                fullWidth
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                  }
                  label="Featured"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.trending}
                      onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                    />
                  }
                  label="Trending"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.new_arrival}
                      onChange={(e) => setFormData({ ...formData, new_arrival: e.target.checked })}
                    />
                  }
                  label="New Arrival"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.best_seller}
                      onChange={(e) => setFormData({ ...formData, best_seller: e.target.checked })}
                    />
                  }
                  label="Best Seller"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Products;

