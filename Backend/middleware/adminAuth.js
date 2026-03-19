const { supabase } = require('../config/supabase');

/**
 * Middleware to verify admin authentication
 * Checks Supabase JWT token and validates admin role
 */
const verifyAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Test mode: allow test token to bypass Supabase
    if (token.startsWith('test-token-')) {
      req.admin = {
        id: 'test-admin-id',
        uid: 'test-admin-id',
        email: 'test@admin.com',
        displayName: 'Test Admin',
        role: 'admin',
        first_name: 'Test',
        last_name: 'Admin',
        display_name: 'Test Admin',
        account_status: 'active',
      };
      return next();
    }

    // Verify the Supabase JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
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
      return res.status(403).json({
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

    // Attach user info to request
    req.admin = {
      id: user.id,
      uid: user.id, // Keep for compatibility
      email: user.email,
      ...userData,
    };

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

module.exports = { verifyAdmin };
