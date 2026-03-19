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
  CircularProgress,
  Chip,
  Pagination,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { categoriesAPI } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll({
        page,
        limit: 50,
      });
      setCategories(response.data.categories || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCategory({
      name: '',
      slug: '',
      description: '',
      parent_id: null,
      image_url: '',
      status: 'active',
      display_order: 0,
    });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoriesAPI.delete(id);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await categoriesAPI.update(selectedCategory.id, selectedCategory);
      } else {
        await categoriesAPI.create(selectedCategory);
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category');
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Categories Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Display Order</TableCell>
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
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    {category.parent_id ? (
                      categories.find(c => c.id === category.parent_id)?.name || 'N/A'
                    ) : (
                      'Root'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category.status}
                      color={getStatusColor(category.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{category.productCount || 0}</TableCell>
                  <TableCell>{category.display_order || 0}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(category)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(category.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                value={selectedCategory.name}
                onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Slug"
                value={selectedCategory.slug}
                onChange={(e) => setSelectedCategory({ ...selectedCategory, slug: e.target.value })}
                fullWidth
                helperText="URL-friendly name (auto-generated if left empty)"
              />
              <TextField
                label="Description"
                value={selectedCategory.description || ''}
                onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
              <FormControl fullWidth>
                <InputLabel>Parent Category</InputLabel>
                <Select
                  value={selectedCategory.parent_id || ''}
                  label="Parent Category"
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, parent_id: e.target.value || null })}
                >
                  <MenuItem value="">None (Root Category)</MenuItem>
                  {categories
                    .filter(c => c.id !== selectedCategory.id)
                    .map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <TextField
                label="Image URL"
                value={selectedCategory.image_url || ''}
                onChange={(e) => setSelectedCategory({ ...selectedCategory, image_url: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedCategory.status}
                  label="Status"
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Display Order"
                type="number"
                value={selectedCategory.display_order || 0}
                onChange={(e) => setSelectedCategory({ ...selectedCategory, display_order: parseInt(e.target.value) || 0 })}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;

