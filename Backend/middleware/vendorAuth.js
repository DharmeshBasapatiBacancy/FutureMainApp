const { supabase } = require('../config/supabase');

/**
 * Middleware to verify vendor authentication
 * Checks Supabase JWT token and validates vendor role
 */
const verifyVendor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

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

    req.vendor = {
      id: user.id,
      email: user.email,
      ...userData,
      vendorInfo: vendorInfo || {},
    };

    next();
  } catch (error) {
    console.error('Vendor auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

module.exports = { verifyVendor };
