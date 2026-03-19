const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyVendor } = require('../middleware/vendorAuth');

// All vendor routes require authentication
router.use(verifyVendor);

/**
 * GET /api/vendor/me
 * Vendor profile and stats
 */
router.get('/me', async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const v = req.vendor;

    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId);

    const { data: vendorProducts } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendorId);
    const productIds = vendorProducts?.map(p => p.id) || [];

    let orderCount = 0;
    if (productIds.length > 0) {
      const { data: orders } = await supabase
        .from('orders')
        .select('id, items');
      const vendorOrderIds = (orders || []).filter(o => 
        o.items && Array.isArray(o.items) && o.items.some(item => productIds.includes(item.product_id))
      );
      orderCount = vendorOrderIds.length;
    }

    res.json({
      success: true,
      vendor: {
        id: v.id,
        email: v.email,
        firstName: v.first_name,
        lastName: v.last_name,
        displayName: v.display_name || v.first_name || '',
        role: v.role,
        businessName: v.vendorInfo?.business_name || '',
        businessEmail: v.vendorInfo?.business_email || v.email,
        businessPhone: v.vendorInfo?.business_phone || '',
        businessAddress: v.vendorInfo?.business_address || {},
        status: v.vendorInfo?.status || 'pending_approval',
        verified: v.vendorInfo?.verified || false,
        rating: v.vendorInfo?.rating || 0,
        totalSales: v.vendorInfo?.total_sales || 0,
        commissionRate: v.vendorInfo?.commission_rate || 10,
        vendorInfo: v.vendorInfo || {},
      },
      stats: {
        totalProducts: productCount || 0,
        totalOrders: orderCount,
      },
    });
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
});

/**
 * GET /api/vendor/products
 * Vendor's own products
 */
router.get('/products', async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId);

    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = query.or(`name.ilike.${searchLower},sku.ilike.${searchLower},description.ilike.${searchLower}`);
    }

    const { data: products, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

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
    console.error('Error fetching vendor products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
});

/**
 * POST /api/vendor/products
 * Vendor creates a new product (goes to pending_approval)
 */
router.post('/products', async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const {
      name,
      sku,
      description,
      short_description,
      price,
      stock,
      category_id,
      primary_image_url,
      images,
      featured,
      trending,
      new_arrival,
      best_seller,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required',
      });
    }

    const productData = {
      name,
      sku: sku || null,
      description: description || null,
      short_description: short_description || null,
      price,
      stock: stock ?? 0,
      status: 'pending_approval',
      category_id: category_id || null,
      vendor_id: vendorId,
      primary_image_url: primary_image_url || null,
      images: images || [],
      featured: !!featured,
      trending: !!trending,
      new_arrival: !!new_arrival,
      best_seller: !!best_seller,
      updated_at: new Date().toISOString(),
    };

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
      message: 'Product created and sent for approval',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error creating vendor product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
});

/**
 * GET /api/vendor/orders
 * Orders that contain vendor's products
 */
router.get('/orders', async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const { data: vendorProducts } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendorId);

    const productIds = vendorProducts?.map(p => p.id) || [];

    if (productIds.length === 0) {
      return res.json({
        success: true,
        orders: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
        },
      });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const vendorOrders = (orders || []).filter(order => {
      if (!order.items || !Array.isArray(order.items)) return false;
      return order.items.some(item => productIds.includes(item.product_id));
    });

    const total = vendorOrders.length;
    const start = (pageNum - 1) * limitNum;
    const paginatedOrders = vendorOrders.slice(start, start + limitNum);

    res.json({
      success: true,
      orders: paginatedOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
});

/**
 * GET /api/vendor/categories
 * All active categories (for reference / product assignment)
 */
router.get('/categories', async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { data: categories, error, count } = await supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      success: true,
      categories: categories || [],
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

module.exports = router;
