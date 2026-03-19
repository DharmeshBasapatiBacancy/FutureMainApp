import { Navigate } from 'react-router-dom';
import { useVendorAuth } from '../context/VendorAuthContext';
import { Box, CircularProgress } from '@mui/material';

const VendorProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useVendorAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/vendor-login" replace />;
  }

  return children;
};

export default VendorProtectedRoute;
