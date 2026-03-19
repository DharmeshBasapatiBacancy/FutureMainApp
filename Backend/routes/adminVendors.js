const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyAdmin } = require('../middleware/adminAuth');

/**
 * GET /api/admin/vendors
 * Get all vendors with pagination
 */
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get vendors with user info
    let query = supabase
      .from('users')
      .select(`
        *,
        vendors (*)
      `, { count: 'exact' })
      .eq('role', 'vendor');

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

    const { data: vendors, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get statistics for each vendor
    // Note: Supabase returns 1:1 relation as object, not array
    const vendorsWithStats = await Promise.all(
      (vendors || []).map(async (vendor) => {
        const rawVendors = vendor.vendors;
        const vendorInfo = rawVendors != null
          ? (Array.isArray(rawVendors) ? rawVendors[0] ?? null : rawVendors)
          : null;

        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendor.id);

        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', vendor.id);

        return {
          ...vendor,
          id: vendor.id,
          email: vendor.email,
          firstName: vendor.first_name,
          lastName: vendor.last_name,
          displayName: vendor.display_name,
          role: vendor.role,
          accountStatus: vendor.account_status,
          businessName: vendorInfo?.business_name || '',
          businessEmail: vendorInfo?.business_email || vendor.email,
          businessPhone: vendorInfo?.business_phone || '',
          status: vendorInfo?.status ?? 'pending_approval',
          verified: vendorInfo?.verified ?? false,
          rating: vendorInfo?.rating ?? 0,
          totalSales: vendorInfo?.total_sales ?? 0,
          commissionRate: vendorInfo?.commission_rate ?? 10,
          totalProducts: productCount ?? 0,
          totalOrders: orderCount ?? 0,
          vendorInfo: vendorInfo || {},
        };
      })
    );

    res.json({
      success: true,
      vendors: vendorsWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/vendors/:id
 * Get vendor details by ID
 */
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get vendor user info
    const { data: vendor, error: vendorError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'vendor')
      .single();

    if (vendorError || !vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    // Get vendor extended info
    const { data: vendorInfo } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    // Get statistics
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', id);

    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    res.json({
      success: true,
      vendor: {
        id: vendor.id,
        email: vendor.email,
        firstName: vendor.first_name,
        lastName: vendor.last_name,
        displayName: vendor.display_name,
        role: vendor.role,
        accountStatus: vendor.account_status,
        businessName: vendorInfo?.business_name || '',
        businessEmail: vendorInfo?.business_email || vendor.email,
        businessPhone: vendorInfo?.business_phone || '',
        businessAddress: vendorInfo?.business_address || {},
        taxId: vendorInfo?.tax_id || '',
        status: vendorInfo?.status || 'pending_approval',
        verified: vendorInfo?.verified || false,
        rating: vendorInfo?.rating || 0,
        totalSales: vendorInfo?.total_sales || 0,
        commissionRate: vendorInfo?.commission_rate || 10,
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
        ...vendor,
        vendorInfo: vendorInfo || {},
      },
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor',
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/vendors
 * Create vendor (creates user and vendor record)
 */
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { email, password, firstName, lastName, businessName, businessEmail, businessPhone, businessAddress } = req.body;

    if (!email || !password || !businessName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and business name are required',
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      throw authError;
    }

    // Create user record
    const userData = {
      id: authData.user.id,
      email,
      first_name: firstName || '',
      last_name: lastName || '',
      display_name: `${firstName || ''} ${lastName || ''}`.trim() || businessName,
      role: 'vendor',
      account_status: 'active',
      email_verified: true,
    };

    const { error: userError } = await supabase
      .from('users')
      .insert(userData);

    if (userError) {
      // If user creation fails, try to delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    // Create vendor record
    const vendorData = {
      id: authData.user.id,
      business_name: businessName,
      business_email: businessEmail || email,
      business_phone: businessPhone || '',
      business_address: businessAddress || {},
      status: 'pending_approval',
      verified: false,
    };

    const { data: newVendor, error: vendorError } = await supabase
      .from('vendors')
      .insert(vendorData)
      .select()
      .single();

    if (vendorError) {
      throw vendorError;
    }

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      vendor: {
        ...userData,
        vendorInfo: newVendor,
      },
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vendor',
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/vendors/:id
 * Update vendor
 */
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update user data
    const userUpdateData = {};
    if (updateData.firstName !== undefined) userUpdateData.first_name = updateData.firstName;
    if (updateData.lastName !== undefined) userUpdateData.last_name = updateData.lastName;
    if (updateData.displayName !== undefined) userUpdateData.display_name = updateData.displayName;
    if (updateData.accountStatus !== undefined) userUpdateData.account_status = updateData.accountStatus;

    if (Object.keys(userUpdateData).length > 0) {
      userUpdateData.updated_at = new Date().toISOString();
      await supabase
        .from('users')
        .update(userUpdateData)
        .eq('id', id);
    }

    // Update vendor data
    const vendorUpdateData = {};
    if (updateData.businessName !== undefined) vendorUpdateData.business_name = updateData.businessName;
    if (updateData.businessEmail !== undefined) vendorUpdateData.business_email = updateData.businessEmail;
    if (updateData.businessPhone !== undefined) vendorUpdateData.business_phone = updateData.businessPhone;
    if (updateData.businessAddress !== undefined) vendorUpdateData.business_address = updateData.businessAddress;
    if (updateData.status !== undefined) vendorUpdateData.status = updateData.status;
    if (updateData.verified !== undefined) vendorUpdateData.verified = updateData.verified;
    if (updateData.commissionRate !== undefined) vendorUpdateData.commission_rate = updateData.commissionRate;

    if (Object.keys(vendorUpdateData).length > 0) {
      vendorUpdateData.updated_at = new Date().toISOString();
      
      // Check if vendor record exists
      const { data: existingVendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('id', id)
        .single();

      if (existingVendor) {
        await supabase
          .from('vendors')
          .update(vendorUpdateData)
          .eq('id', id);
      } else {
        // Create vendor record if it doesn't exist
        vendorUpdateData.id = id;
        await supabase
          .from('vendors')
          .insert(vendorUpdateData);
      }
    }

    // Fetch updated vendor
    const { data: vendor } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    const { data: vendorInfo } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    res.json({
      success: true,
      message: 'Vendor updated successfully',
      vendor: {
        ...vendor,
        vendorInfo: vendorInfo || {},
      },
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/vendors/:id
 * Delete vendor (soft delete - update status)
 */
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - update status
    await supabase
      .from('users')
      .update({
        account_status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    await supabase
      .from('vendors')
      .update({
        status: 'suspended',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    res.json({
      success: true,
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/vendors/:id/products
 * Get vendor products
 */
router.get('/:id/products', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { data: products, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('vendor_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

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
    console.error('Error fetching vendor products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor products',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/vendors/:id/orders
 * Get vendor orders (orders containing vendor's products)
 */
router.get('/:id/orders', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get all products from this vendor
    const { data: vendorProducts } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', id);

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

    // Get orders that contain vendor's products
    // Note: This is a simplified version - in production, you'd need to check order items
    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Filter orders that contain vendor products (check items JSONB)
    const vendorOrders = (orders || []).filter(order => {
      if (!order.items || !Array.isArray(order.items)) return false;
      return order.items.some(item => productIds.includes(item.product_id));
    });

    res.json({
      success: true,
      orders: vendorOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: vendorOrders.length,
        totalPages: Math.ceil(vendorOrders.length / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor orders',
      error: error.message,
    });
  }
});

module.exports = router;

