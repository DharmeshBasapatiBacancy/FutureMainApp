import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { supabase } from '../config/supabase';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Test mode: bypass Supabase for test credentials
      const TEST_EMAIL = 'test@admin.com';
      const TEST_PASSWORD = 'test123';

      if (email === TEST_EMAIL && password === TEST_PASSWORD) {
        // Test login - bypass Supabase
        const testAdmin = {
          id: 'test-admin-id',
          uid: 'test-admin-id',
          email: TEST_EMAIL,
          displayName: 'Test Admin',
          role: 'admin',
        };
        
        // Use test token for API calls
        const testToken = 'test-token-' + Date.now();
        login(testAdmin, testToken);
        navigate('/');
        return;
      }

      // Regular Supabase login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.session?.access_token) {
        throw new Error('No access token received');
      }

      // Verify with backend that user is admin
      const response = await authAPI.login(authData.session.access_token);

      if (response.data.success) {
        // Store token and admin data
        login(response.data.admin, authData.session.access_token);
        navigate('/');
      } else {
        setError(response.data.message || 'Login failed');
        // Sign out from Supabase if not admin
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message?.includes('Invalid login credentials') || err.message?.includes('Email not confirmed')) {
        setError('Invalid email or password');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Admin Login
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Enter your credentials to access the admin panel
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }} icon={false}>
            <Typography variant="body2">
              <strong>Test login (no Supabase):</strong> test@admin.com / test123
            </Typography>
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Vendor? <Link component={RouterLink} to="/vendor-login">Go to Vendor Login</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
