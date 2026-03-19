const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyAdmin } = require('../middleware/adminAuth');

/**
 * POST /api/admin/login
 * Verify Supabase session and return admin session info
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

    // Test mode: allow test token to bypass Supabase
    if (accessToken.startsWith('test-token-')) {
      return res.json({
        success: true,
        message: 'Login successful (test mode)',
        admin: {
          id: 'test-admin-id',
          uid: 'test-admin-id',
          email: 'test@admin.com',
          displayName: 'Test Admin',
          role: 'admin',
        },
      });
    }

    // Verify the Supabase access token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Get user data from database
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

    // Verify user has admin role
    if (userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Return admin session info
    res.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: user.id,
        uid: user.id, // Keep for compatibility
        email: user.email,
        displayName: userData.display_name || userData.first_name || '',
        role: userData.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/verify
 * Verify current admin session
 */
router.get('/verify', verifyAdmin, (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin.id,
      uid: req.admin.id,
      email: req.admin.email,
      displayName: req.admin.display_name || req.admin.first_name || '',
      role: req.admin.role,
    },
  });
});

/**
 * POST /api/admin/logout
 * Logout (client-side token removal, this is mainly for consistency)
 */
router.post('/logout', verifyAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

module.exports = router;
