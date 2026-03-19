const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyAdmin } = require('../middleware/adminAuth');

/**
 * GET /api/admin/categories
 * Get all categories with pagination
 */
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status = '', parent_id = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('categories')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (parent_id === 'null' || parent_id === '') {
      // Get root categories (no parent)
      query = query.is('parent_id', null);
    } else if (parent_id) {
      query = query.eq('parent_id', parent_id);
    }

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    const { data: categories, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get product count for each category
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        return {
          ...category,
          productCount: productCount || 0,
        };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithCounts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/categories/:id
 * Get category details by ID
 */
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Get product count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    // Get parent category if exists
    let parentCategory = null;
    if (category.parent_id) {
      const { data: parent } = await supabase
        .from('categories')
        .select('*')
        .eq('id', category.parent_id)
        .single();
      parentCategory = parent;
    }

    // Get child categories
    const { data: children } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', id);

    res.json({
      success: true,
      category: {
        ...category,
        productCount: productCount || 0,
        parentCategory,
        children: children || [],
      },
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/categories
 * Create new category
 */
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const categoryData = req.body;

    // Generate slug if not provided
    if (!categoryData.slug && categoryData.name) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Ensure slug is unique
    if (categoryData.slug) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categoryData.slug)
        .single();

      if (existing) {
        categoryData.slug = `${categoryData.slug}-${Date.now()}`;
      }
    }

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: newCategory,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/categories/:id
 * Update category
 */
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Generate slug if name changed and slug not provided
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check slug uniqueness if changed
    if (updateData.slug) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', id)
        .single();

      if (existing) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/categories/:id
 * Delete category
 */
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} product(s) associated with it.`,
      });
    }

    // Check if category has children
    const { count: childrenCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', id);

    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${childrenCount} sub-category(ies).`,
      });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message,
    });
  }
});

module.exports = router;

