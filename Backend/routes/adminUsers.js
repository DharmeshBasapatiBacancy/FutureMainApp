const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyAdmin } = require('../middleware/adminAuth');

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Apply role filter if provided
    if (role) {
      query = query.eq('role', role);
    }

    // Apply search filter if provided
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = query.or(`email.ilike.${searchLower},first_name.ilike.${searchLower},last_name.ilike.${searchLower},display_name.ilike.${searchLower}`);
    }

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: users, error, count } = await query;

    if (error) {
      throw error;
    }

    // Transform data to match expected format
    const transformedUsers = (users || []).map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      displayName: user.display_name,
      role: user.role,
      accountStatus: user.account_status,
      ...user,
    }));

    res.json({
      success: true,
      users: transformedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/users/:id
 * Get user details by ID
 */
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        role: user.role,
        accountStatus: user.account_status,
        ...user,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user
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
    if (updateData.role !== undefined) dbUpdateData.role = updateData.role;
    if (updateData.accountStatus !== undefined) dbUpdateData.account_status = updateData.accountStatus;

    // Remove fields that shouldn't be updated directly
    delete dbUpdateData.id;
    delete dbUpdateData.created_at;

    // Add updated timestamp
    dbUpdateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        displayName: updatedUser.display_name,
        role: updatedUser.role,
        accountStatus: updatedUser.account_status,
        ...updatedUser,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Soft delete user (update accountStatus to 'deleted')
 */
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .update({
        account_status: 'deleted',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
});

module.exports = router;
