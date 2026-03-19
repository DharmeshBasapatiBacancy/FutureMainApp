const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyCustomer } = require('../middleware/customerAuth');

/**
 * POST /api/customer/auth/login
 * Verify Supabase session and return customer session info
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

    // Test mode: allow test token to bypass Supabase and use first customer from DB
    if (accessToken === 'test-token-customer') {
      const { data: customers, error: listError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'customer')
        .limit(1);
      const customer = customers?.[0];
      if (listError || !customer) {
        return res.status(400).json({
          success: false,
          message: 'No test customer found. Run seed script to create customers (e.g. customer1@example.com).',
        });
      }
      return res.json({
        success: true,
        message: 'Login successful (test mode)',
        customer: {
          id: customer.id,
          uid: customer.id,
          email: customer.email,
          displayName: customer.display_name || customer.first_name || customer.email || 'Test Customer',
          firstName: customer.first_name,
          lastName: customer.last_name,
          role: 'customer',
        },
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

    if (userData.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Customer account required.',
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      customer: {
        id: user.id,
        uid: user.id,
        email: user.email,
        displayName: userData.display_name || userData.first_name || userData.email || '',
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
});

/**
 * POST /api/customer/auth/register
 * After Supabase signUp: upsert users row with role customer
 */
router.post('/register', async (req, res) => {
  try {
    const { accessToken, firstName, lastName, displayName } = req.body;

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

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    const payload = {
      id: user.id,
      email: user.email,
      role: 'customer',
      account_status: 'active',
      email_verified: !!user.email_confirmed_at,
      updated_at: new Date().toISOString(),
    };
    if (firstName !== undefined) payload.first_name = firstName;
    if (lastName !== undefined) payload.last_name = lastName;
    if (displayName !== undefined) payload.display_name = displayName;

    if (existing) {
      await supabase.from('users').update(payload).eq('id', user.id);
    } else {
      await supabase.from('users').insert({ ...payload, created_at: new Date().toISOString() });
    }

    res.json({
      success: true,
      message: 'Registration complete',
      customer: {
        id: user.id,
        uid: user.id,
        email: user.email,
        displayName: displayName || firstName || user.email || '',
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'customer',
      },
    });
  } catch (error) {
    console.error('Customer register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
});

/**
 * GET /api/customer/auth/verify
 * Verify current customer session
 */
router.get('/verify', verifyCustomer, (req, res) => {
  res.json({
    success: true,
    customer: {
      id: req.customer.id,
      uid: req.customer.id,
      email: req.customer.email,
      displayName: req.customer.display_name || req.customer.first_name || req.customer.email || '',
      firstName: req.customer.first_name,
      lastName: req.customer.last_name,
      role: req.customer.role,
    },
  });
});

/**
 * POST /api/customer/auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

module.exports = router;
