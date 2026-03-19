const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyVendor } = require('../middleware/vendorAuth');

/**
 * POST /api/vendor/auth/login
 * Vendor login with Supabase access token (from signInWithPassword on client)
 */
router.post('/login', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (userData.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor account required.',
      });
    }

    const { data: vendorInfo } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      success: true,
      message: 'Login successful',
      vendor: {
        id: user.id,
        email: user.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        displayName: userData.display_name || userData.first_name || '',
        role: userData.role,
        businessName: vendorInfo?.business_name || '',
        businessEmail: vendorInfo?.business_email || user.email,
        businessPhone: vendorInfo?.business_phone || '',
        status: vendorInfo?.status || 'pending_approval',
        verified: vendorInfo?.verified || false,
        rating: vendorInfo?.rating || 0,
        totalSales: vendorInfo?.total_sales || 0,
        commissionRate: vendorInfo?.commission_rate || 10,
        vendorInfo: vendorInfo || {},
      },
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

/**
 * GET /api/vendor/auth/verify
 * Verify current vendor session
 */
router.get('/verify', verifyVendor, (req, res) => {
  const v = req.vendor;
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
      status: v.vendorInfo?.status || 'pending_approval',
      verified: v.vendorInfo?.verified || false,
      rating: v.vendorInfo?.rating || 0,
      totalSales: v.vendorInfo?.total_sales || 0,
      commissionRate: v.vendorInfo?.commission_rate || 10,
      vendorInfo: v.vendorInfo || {},
    },
  });
});

/**
 * POST /api/vendor/auth/logout
 */
router.post('/logout', verifyVendor, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

module.exports = router;
