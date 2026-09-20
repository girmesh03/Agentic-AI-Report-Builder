/**
 * @module routes/router
 * @description Flat route definitions using react-router v7.
 */
import { createBrowserRouter } from 'react-router';
import App from '../App.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import NotFound from '../pages/NotFound.jsx';

/**
 * Primary React Router v7 browser router configuration.
 * Defines the public route tree nested under App and PublicLayout.
 *
 * @type {import('react-router').Router}
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    ErrorBoundary: NotFound,
    children: [
      {
        Component: PublicLayout,
        children: [
          { index: true, Component: Landing },
          { path: 'login', Component: Login },
          { path: 'register', Component: Register },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
]);

export default router;
