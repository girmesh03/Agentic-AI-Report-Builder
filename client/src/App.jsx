/**
 * @module App
 * @description Top-level application wrapper with Redux Provider, AppTheme, session bootstrap, and Outlet.
 */
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import { Provider } from 'react-redux';
import { store } from './redux/app/store.js';
import AppTheme from './theme/AppTheme.jsx';
import { useGetProfileQuery } from './redux/features/auth/authApi.js';
import { selectIsInitialized } from './redux/features/auth/authSlice.js';

/**
 * Inner application shell that triggers session bootstrap via RTK Query profile fetch.
 * Injects AppTheme context and mounts child route outlets.
 *
 * @function AppInner
 * @returns {JSX.Element} The rendered theme provider wrapping the React Router Outlet.
 */
const AppInner = () => {
  const isInitialized = useSelector(selectIsInitialized);

  // Bootstrap session check: silently fetch profile once on mount to rehydrate auth state.
  // Skipped once isInitialized is true, permanently preventing re-fetch loops.
  useGetProfileQuery(undefined, {
    skip: isInitialized,
    refetchOnMountOrArgChange: false,
  });

  return (
    <AppTheme>
      <Outlet />
    </AppTheme>
  );
};

/**
 * Top-level application root component wrapping the Redux Provider.
 *
 * @function App
 * @returns {JSX.Element} The rendered root application component.
 */
export const App = () => {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
};

export default App;
