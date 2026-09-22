/**
 * @module redux/features/auth/authSlice
 * @description Redux slice managing client-side authentication state and active user session.
 */
import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {object} UserProfile
 * @property {string} _id - Unique user ID.
 * @property {string} firstName - Supervisor first name.
 * @property {string} lastName - Supervisor last name.
 * @property {string} [fullName] - Virtual full name.
 * @property {string} email - Verified supervisor email.
 * @property {string} position - Organizational position or title.
 * @property {string|null} avatar - Relative avatar image path.
 * @property {string|null} [phone] - Optional contact phone number.
 * @property {string|null} [googleId] - Linked Google account ID.
 * @property {string} createdAt - Account creation timestamp.
 * @property {string} updatedAt - Account last update timestamp.
 */

/**
 * @typedef {object} AuthState
 * @property {UserProfile|null} user - Active authenticated user or null.
 * @property {boolean} isAuthenticated - Whether a valid authenticated session is active.
 * @property {boolean} isInitialized - Whether the initial bootstrap session check has completed.
 */

/**
 * Initial authentication state.
 * @type {AuthState}
 */
const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

/**
 * Redux Toolkit slice for authentication state management.
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Updates authentication state with user credentials.
     *
     * @param {AuthState} state - Current draft slice state.
     * @param {import('@reduxjs/toolkit').PayloadAction<{ user: UserProfile|null }>} action - Action payload.
     */
    setCredentials: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = !!user;
      state.isInitialized = true;
    },
    /**
     * Clears user credentials and marks session unauthenticated.
     *
     * @param {AuthState} state - Current draft slice state.
     */
    logOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

/** Alias for specification compatibility */
export const logout = logOut;

/**
 * Selects the active user profile from state.
 * @param {{ auth: AuthState }} state - Global Redux state.
 * @returns {UserProfile|null} Active user profile.
 */
export const selectCurrentUser = (state) => state.auth.user;

/**
 * Selects whether the user is authenticated.
 * @param {{ auth: AuthState }} state - Global Redux state.
 * @returns {boolean} Authentication status.
 */
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

/**
 * Selects whether auth initialization has completed.
 * @param {{ auth: AuthState }} state - Global Redux state.
 * @returns {boolean} Auth initialized status.
 */
export const selectIsInitialized = (state) => state.auth.isInitialized;

export default authSlice.reducer;
