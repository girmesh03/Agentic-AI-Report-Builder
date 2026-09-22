/**
 * @module components/auth/PublicRoute
 * @description Route guard barring authenticated supervisors from public auth routes, redirecting to /dashboard.
 */
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';
import { selectIsAuthenticated, selectIsInitialized } from '../../redux/features/auth/authSlice.js';
import LoadingSpinner from '../reusable/LoadingSpinner.jsx';
import { APP_ROUTES } from '../../utils/constants.js';

/**
 * Route guard component for public guest pages (/login, /register, /).
 * Prevents already authenticated supervisors from accessing authentication entry routes.
 *
 * @component PublicRoute
 * @returns {JSX.Element} Rendered child outlet or redirect to /dashboard.
 */
export const PublicRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized) {
    return <LoadingSpinner message="Checking session..." height="100vh" />;
  }

  if (isAuthenticated) {
    return <Navigate to={APP_ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
