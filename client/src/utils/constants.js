/**
 * @module utils/constants
 * @description Centralized, immutable UI constants for the client workspace.
 */

/**
 * Layout dimensions and responsive breakpoints for the AppShell.
 * @constant {object}
 */
export const LAYOUT_CONSTANTS = Object.freeze({
  SIDEBAR_EXPANDED_WIDTH: 240,
  SIDEBAR_MINI_WIDTH: 64,
  APPBAR_HEIGHT: 48,
});

/**
 * Canonical application route paths.
 * @constant {object}
 */
export const APP_ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  BRANCHES: '/branches',
  REPORTS: '/reports',
  CHAT: '/chat',
  PROFILE: '/profile',
});

/**
 * Account deletion confirmation sentinel keyword required by Danger Zone.
 * @constant {string}
 */
export const ACCOUNT_DELETION_SENTINEL = 'DELETE';

/**
 * Standard phone regex pattern for Ethiopian mobile numbers (+251XXXXXXXXX).
 * @constant {RegExp}
 */
export const ETHIOPIAN_PHONE_REGEX = /^\+251[0-9]{9}$/;

/**
 * Standard email format regex pattern.
 * @constant {RegExp}
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Standard spinner dimensions mapping for the LoadingSpinner reusable component.
 * @constant {object}
 */
export const SPINNER_DIMENSIONS = Object.freeze({
  small: 24,
  medium: 36,
  large: 48,
});

export default {
  LAYOUT_CONSTANTS,
  APP_ROUTES,
  ACCOUNT_DELETION_SENTINEL,
  ETHIOPIAN_PHONE_REGEX,
  EMAIL_REGEX,
  SPINNER_DIMENSIONS,
};
