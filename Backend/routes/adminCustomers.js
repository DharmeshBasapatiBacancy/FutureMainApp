const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyAdmin } = require('../middleware/adminAuth');

/**
 * GET /api/admin/customers
 * Get all customers (users with role='customer') with pagination
 */
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', 'customer');

    // Apply status filter if provided
    if (status) {
      query = query.eq('account_status', status);
    }

    // Apply search filter if provided
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = query.or(`email.ilike.${searchLower},first_name.ilike.${searchLower},last_name.ilike.${searchLower},display_name.ilike.${searchLower}`);
    }

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1)
      .order('created_at', { ascending: false });

    const { data: customers, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get order statistics for each customer
    const customersWithStats = await Promise.all(
      (customers || []).map(async (customer) => {
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', customer.id);

        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('user_id', customer.id);

        const totalSpent = orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

        return {
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          displayName: customer.display_name,
          role: customer.role,
          accountStatus: customer.account_status,
          emailVerified: customer.email_verified,
          createdAt: customer.created_at,
          totalOrders: orderCount || 0,
          totalSpent: totalSpent,
          ...customer,
        };
      })
    );

    res.json({
      success: true,
      customers: customersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/customers/:id
 * Get customer details by ID
 */
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: customer, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'customer')
      .single();

    if (error || !customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Get customer statistics
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', id);

    const totalSpent = orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

    res.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        displayName: customer.display_name,
        role: customer.role,
        accountStatus: customer.account_status,
        emailVerified: customer.email_verified,
        createdAt: customer.created_at,
        totalOrders: orderCount || 0,
        totalSpent: totalSpent,
        ...customer,
      },
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/customers/:id
 * Update customer
 */
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Transform camelCase to snake_case for database
    const dbUpdateData = {};
    if (updateData.firstName !== undefined) dbUpdateData.first_name = updateData.firstName;
    if (updateData.lastName !== undefined) dbUpdateData.last_name = updateData.lastName;
    if (updateData.displayName !== undefined) dbUpdateData.display_name = updateData.displayName;
    if (updateData.accountStatus !== undefined) dbUpdateData.account_status = updateData.accountStatus;

    // Remove fields that shouldn't be updated directly
    delete dbUpdateData.id;
    delete dbUpdateData.created_at;

    // Add updated timestamp
    dbUpdateData.updated_at = new Date().toISOString();

    const { data: updatedCustomer, error } = await supabase
      .from('users')
      .update(dbUpdateData)
      .eq('id', id)
      .eq('role', 'customer')
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        firstName: updatedCustomer.first_name,
        lastName: updatedCustomer.last_name,
        displayName: updatedCustomer.display_name,
        role: updatedCustomer.role,
        accountStatus: updatedCustomer.account_status,
        ...updatedCustomer,
      },
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/customers/:id/orders
 * Get customer orders
 */
router.get('/:id/orders', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Verify customer exists
    const { data: customer } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .eq('role', 'customer')
      .single();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

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
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer orders',
      error: error.message,
    });
  }
});

module.exports = router;

