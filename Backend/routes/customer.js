const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyCustomer } = require('../middleware/customerAuth');

function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${random}`;
}

/**
 * GET /api/customer/categories
 * List active categories (no auth required)
 */
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (cat) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id)
          .eq('status', 'published');
        return { ...cat, productCount: count || 0 };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithCounts,
    });
  } catch (error) {
    console.error('Error fetching customer categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
});

/**
 * GET /api/customer/products
 * List published products (optional category_id, pagination)
 */
router.get('/products', async (req, res) => {
  try {
    const { category_id, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('products')
      .select('id, name, short_description, description, price, stock, status, category_id, primary_image_url, images, slug', { count: 'exact' })
      .eq('status', 'published');

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    query = query.range(offset, offset + limitNum - 1).order('created_at', { ascending: false });

    const { data: products, error, count } = await query;

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
    console.error('Error fetching customer products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
});

/**
 * GET /api/customer/products/:id
 * Single published product
 */
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
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
 * POST /api/customer/orders
 * Create order (protected)
 */
router.post('/orders', verifyCustomer, async (req, res) => {
  try {
    const { items, subtotal, shipping_address, billing_address, payment_method } = req.body;
    const customerId = req.customer.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    const subtotalNum = parseFloat(subtotal) || items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 0), 0);
    const shippingCost = 5.99;
    const taxAmount = Math.round(subtotalNum * 0.08 * 100) / 100;
    const discountAmount = 0;
    const totalAmount = Math.round((subtotalNum + shippingCost + taxAmount - discountAmount) * 100) / 100;

    const orderItems = items.map((i) => ({
      product_id: i.product_id,
      name: i.name || 'Product',
      quantity: parseInt(i.quantity) || 1,
      price: parseFloat(i.price) || 0,
      total: (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1),
      image_url: i.image_url || null,
    }));

    const orderNumber = generateOrderNumber();
    const orderPayload = {
      order_number: orderNumber,
      user_id: customerId,
      status: 'pending',
      payment_status: 'pending',
      total_amount: totalAmount,
      subtotal: subtotalNum,
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      items: orderItems,
      shipping_address: shipping_address || {},
      billing_address: billing_address || {},
      payment_method: payment_method || null,
      status_history: [{ status: 'pending', updated_at: new Date().toISOString() }],
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Order created',
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
});

module.exports = router;
