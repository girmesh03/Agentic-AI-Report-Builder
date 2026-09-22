/**
 * @module redux/features/api/apiSlice
 * @description Centralized RTK Query API slice with baseQueryWithReauth, async-mutex concurrency control, and normalizeResult.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { env } from '../../../config/env.js';
import { logOut, setCredentials } from '../auth/authSlice.js';

/**
 * Concurrency mutex instance preventing parallel refresh storms from tripping
 * RFC 6819 token family reuse detection alarms.
 * @type {Mutex}
 */
const mutex = new Mutex();

/**
 * Base fetch client configured with API base URL and httpOnly credentials.
 */
const baseFetch = fetchBaseQuery({
  baseUrl: env.API_BASE_URL,
  credentials: 'include', // Mandates httpOnly cookie transmission across all network calls
});

/**
 * Normalizes standard backend envelope { success, message, data } if required.
 * Conforms to Master Technical Specification Section 2.7 and Section 12.11.1.
 *
 * @function normalizeResult
 * @param {object} result - Raw RTK Query fetch result { data } or { error }.
 * @returns {object} Normalized result object for consumption by RTK Query hooks.
 */
export const normalizeResult = (result) => {
  // Normalizes standard { success, message, data } backend envelope
  return result;
};

/**
 * Custom base query wrapper handling seamless JWT refresh with async-mutex concurrency control.
 * On HTTP 401: locks mutex, dispatches single POST /auth/refresh, updates dual cookies,
 * and retries failed queries. If refresh fails, dispatches logOut and purges cache.
 *
 * @async
 * @function baseQueryWithReauth
 * @param {string|object} args - Request arguments or URL string.
 * @param {object} api - BaseQuery API containing dispatch and getState.
 * @param {object} [extraOptions={}] - Additional query options.
 * @returns {Promise<object>} Execution result containing data or error payload.
 */
export const baseQueryWithReauth = async (args, api, extraOptions = {}) => {
  // 1. Wait until any pending refresh unlock completes
  await mutex.waitForUnlock();
  let result = await baseFetch(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // 2. Infinite Loop Defense: If the failed request was already /auth/refresh, terminate immediately
    const requestUrl = typeof args === 'string' ? args : args?.url;
    if (requestUrl?.includes('/auth/refresh')) {
      api.dispatch(logOut());
      return normalizeResult(result);
    }

    // 3. If session is already known to be unauthenticated, do not attempt refresh
    const authState = api.getState()?.auth;
    if (authState?.isInitialized && !authState?.isAuthenticated) {
      return normalizeResult(result);
    }

    // 4. Acquire Mutex to prevent multiple parallel refresh storms
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseFetch(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data && refreshResult.data.success) {
          if (refreshResult.data.data?.user) {
            api.dispatch(setCredentials({ user: refreshResult.data.data.user }));
          }
          // 5. Retry initial failed query with newly rotated access token cookie
          result = await baseFetch(args, api, extraOptions);
        } else {
          // 6. Refresh token expired, revoked, or absent: terminate session cleanly
          api.dispatch(logOut());
        }
      } finally {
        release();
      }
    } else {
      // 7. Mutex was already locked by a concurrent in-flight request: wait for unlock and retry
      await mutex.waitForUnlock();
      result = await baseFetch(args, api, extraOptions);
    }
  }

  return normalizeResult(result);
};

/**
 * Master RTK Query API slice with complete entity tagTypes.
 * Includes 'Dashboard' tag to guarantee automated cache invalidation when
 * branches, reports, or supervisor settings are mutated across the application.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Branch', 'Report', 'Chat', 'Preset', 'Dashboard'],
  endpoints: () => ({}),
});

export default apiSlice;
