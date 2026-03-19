const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyAdmin } = require('../middleware/adminAuth');

/**
 * GET /api/admin/products
 * Get all products with pagination
 */
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', category = '', vendor = '', search = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category_id', category);
    }
    if (vendor) {
      query = query.eq('vendor_id', vendor);
    }
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = query.or(`name.ilike.${searchLower},sku.ilike.${searchLower},description.ilike.${searchLower}`);
    }

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1)
      .order('created_at', { ascending: false });

    const { data: products, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      products: products || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/products/:id
 * Get product details by ID
 */
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/products
 * Create new product
 */
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const productData = req.body;

    // Set default status if not provided
    if (!productData.status) {
      productData.status = 'draft';
    }

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/products/:id
 * Update product
 */
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/products/:id/approve
 * Approve a vendor product (set status to published)
 */
router.post('/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Product approved successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving product',
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/products/:id/reject
 * Reject a vendor product (set status to rejected)
 */
router.post('/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Product rejected successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting product',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/products/:id
 * Delete product
 */
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
});

module.exports = router;
