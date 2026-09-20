/**
 * @module App
 * @description Top-level application wrapper with AppTheme, CssBaseline, and Outlet.
 */
import { Outlet } from 'react-router';
import AppTheme from './theme/AppTheme.jsx';

/**
 * Top-level application shell component that injects the dynamic MUI theme context
 * and mounts child route outlets.
 *
 * @function App
 * @returns {JSX.Element} The rendered root theme provider wrapping the React Router Outlet.
 */
export const App = () => {
  return (
    <AppTheme>
      <Outlet />
    </AppTheme>
  );
};

export default App;
