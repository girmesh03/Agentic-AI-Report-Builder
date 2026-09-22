/**
 * @module components/auth/ProtectedRoute
 * @description Route guard requiring authenticated session for protected application routes.
 */
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';
import { selectIsAuthenticated, selectIsInitialized } from '../../redux/features/auth/authSlice.js';
import LoadingSpinner from '../reusable/LoadingSpinner.jsx';
import { APP_ROUTES } from '../../utils/constants.js';

/**
 * Route guard component securing protected application views under AppShell.
 * Redirects unauthenticated visitors to /login preserving the requested target location.
 *
 * @component ProtectedRoute
 * @returns {JSX.Element} Rendered child outlet or redirect to /login.
 */
export const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);
  const location = useLocation();

  if (!isInitialized) {
    return <LoadingSpinner message="Validating session..." height="100vh" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
