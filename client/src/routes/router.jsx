/**
 * @module routes/router
 * @description Flat route definitions using react-router v7 with lazy loading, route guards, and AppShell.
 */
import { createBrowserRouter } from 'react-router';
import App from '../App.jsx';
import PublicRoute from '../components/auth/PublicRoute.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AppShell from '../layouts/AppShell.jsx';
import NotFound from '../pages/NotFound.jsx';
import RootHydrateFallback from '../components/reusable/RootHydrateFallback.jsx';

/**
 * Primary React Router v7 browser router configuration.
 * Defines the complete public and protected route tree with lazy loading per Section 10.1.1.
 *
 * @type {import('react-router').Router}
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    ErrorBoundary: NotFound,
    HydrateFallback: RootHydrateFallback,
    children: [
      // 1. PUBLIC ROUTES (Guarded by PublicRoute)
      {
        Component: PublicRoute,
        children: [
          {
            Component: PublicLayout,
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('../pages/Landing.jsx')).default,
                }),
              },
              {
                path: 'login',
                lazy: async () => ({
                  Component: (await import('../pages/Login.jsx')).default,
                }),
              },
              {
                path: 'register',
                lazy: async () => ({
                  Component: (await import('../pages/Register.jsx')).default,
                }),
              },
            ],
          },
        ],
      },
      // 2. PROTECTED ROUTES (Guarded by ProtectedRoute)
      {
        Component: ProtectedRoute,
        children: [
          {
            Component: AppShell,
            children: [
              {
                path: 'dashboard',
                lazy: async () => ({
                  Component: (await import('../pages/Dashboard.jsx')).default,
                }),
              },
              {
                path: 'branches',
                lazy: async () => ({
                  Component: (await import('../pages/Branches.jsx')).default,
                }),
              },
              {
                path: 'reports',
                lazy: async () => ({
                  Component: (await import('../pages/Reports.jsx')).default,
                }),
              },
              {
                path: 'chat',
                lazy: async () => ({
                  Component: (await import('../pages/Chat.jsx')).default,
                }),
              },
              {
                path: 'profile',
                lazy: async () => ({
                  Component: (await import('../pages/Profile.jsx')).default,
                }),
              },
            ],
          },
        ],
      },
      // 3. WILDCARD CATCH-ALL
      { path: '*', Component: NotFound },
    ],
  },
]);

export default router;
