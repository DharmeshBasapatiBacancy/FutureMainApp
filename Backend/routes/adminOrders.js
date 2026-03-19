const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyAdmin } = require('../middleware/adminAuth');

/**
 * GET /api/admin/orders
 * Get all orders with pagination and filters
 */
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', startDate = '', endDate = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' });

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply payment status filter
    if (req.query.paymentStatus) {
      query = query.eq('payment_status', req.query.paymentStatus);
    }

    // Apply date range filter
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      orders: orders || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/orders/:id
 * Get order details by ID
 */
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Optionally fetch user details
    let userData = null;
    if (order.user_id) {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, display_name, first_name')
        .eq('id', order.user_id)
        .single();

      if (user) {
        userData = {
          id: user.id,
          email: user.email,
          displayName: user.display_name || user.first_name || '',
        };
      }
    }

    res.json({
      success: true,
      order: {
        ...order,
        user: userData,
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/orders/:id
 * Update order status
 */
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber, shippingMethod, notes, ...otherUpdates } = req.body;

    const updateData = {
      updated_at: new Date().toISOString(),
      ...otherUpdates,
    };

    // Update status if provided
    if (status) {
      updateData.status = status;
      
      // Get existing order to append to status_history
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('status_history')
        .eq('id', id)
        .single();

      const statusHistory = existingOrder?.status_history || [];
      statusHistory.push({
        status,
        updated_at: new Date().toISOString(),
        updated_by: req.admin.id,
      });
      updateData.status_history = statusHistory;
    }

    // Update payment status if provided
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    // Update tracking information
    if (trackingNumber !== undefined) {
      updateData.tracking_number = trackingNumber;
    }

    if (shippingMethod !== undefined) {
      updateData.shipping_method = shippingMethod;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message,
    });
  }
});

module.exports = router;
