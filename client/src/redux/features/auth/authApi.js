/**
 * @module redux/features/auth/authApi
 * @description Injected RTK Query endpoints for authentication, session lifecycle, and user profile management.
 */
import { apiSlice } from '../api/apiSlice.js';
import { setCredentials, logOut } from './authSlice.js';

/**
 * Authentication and User API endpoints injected into the central apiSlice.
 */
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Authenticates supervisor with email and password credentials.
     */
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Dashboard'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.user) {
            dispatch(setCredentials({ user: data.data.user }));
          }
        } catch {
          // Handled by caller UI
        }
      },
    }),

    /**
     * Registers a new supervisor account with email and password.
     */
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    /**
     * Revokes the active refresh token and terminates supervisor session.
     */
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Proceed with client logout even if server call fails
        } finally {
          dispatch(logOut());
          dispatch(apiSlice.util.resetApiState());
        }
      },
    }),

    /**
     * Retrieves Google OAuth 2.0 PKCE initiation URL.
     */
    getGoogleAuthUrl: builder.query({
      query: () => '/auth/google/url',
    }),

    /**
     * Completes Google OAuth 2.0 PKCE authentication callback.
     */
    googleCallback: builder.mutation({
      query: (payload) => ({
        url: '/auth/google/callback',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User', 'Dashboard'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.user) {
            dispatch(setCredentials({ user: data.data.user }));
          }
        } catch {
          // Handled by caller UI
        }
      },
    }),

    /**
     * Fetches current authenticated supervisor profile.
     */
    getProfile: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            dispatch(setCredentials({ user: data.data }));
          }
        } catch {
          dispatch(logOut());
        }
      },
    }),

    /**
     * Updates profile fields (fullName, phone, position).
     */
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/users/me',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['User', 'Dashboard'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            dispatch(setCredentials({ user: data.data }));
          }
        } catch {
          // Handled by caller UI
        }
      },
    }),

    /**
     * Uploads and optimizes supervisor avatar image.
     */
    uploadAvatar: builder.mutation({
      query: (formData) => ({
        url: '/users/me/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User', 'Dashboard'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            dispatch(setCredentials({ user: data.data }));
          }
        } catch {
          // Handled by caller UI
        }
      },
    }),

    /**
     * Updates supervisor account password.
     */
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/users/me/password',
        method: 'PUT',
        body: passwordData,
      }),
    }),

    /**
     * Permanently deletes supervisor account and cascades data purge.
     */
    deleteAccount: builder.mutation({
      query: (confirmationPayload) => ({
        url: '/users/me',
        method: 'DELETE',
        body: confirmationPayload,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logOut());
          dispatch(apiSlice.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLazyGetGoogleAuthUrlQuery,
  useGoogleCallbackMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = authApi;

export default authApi;
