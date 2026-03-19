const { supabase } = require('../config/supabase');

/**
 * Middleware to verify customer authentication
 * Checks Supabase JWT token and validates customer role
 */
const verifyCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Test mode: allow test token to bypass Supabase
    if (token === 'test-token-customer') {
      const { data: customers } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'customer')
        .limit(1);
      const customer = customers?.[0];
      if (!customer) {
        return res.status(403).json({
          success: false,
          message: 'Test customer not found',
        });
      }
      req.customer = {
        id: customer.id,
        uid: customer.id,
        email: customer.email,
        displayName: customer.display_name || customer.first_name || customer.email || 'Test Customer',
        ...customer,
      };
      return next();
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

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
      return res.status(403).json({
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

    if (userData.account_status && userData.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
      });
    }

    req.customer = {
      id: user.id,
      uid: user.id,
      email: user.email,
      displayName: userData.display_name || userData.first_name || userData.email || '',
      ...userData,
    };

    next();
  } catch (error) {
    console.error('Customer auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

module.exports = { verifyCustomer };
