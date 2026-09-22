/**
 * @module redux/features/branches/branchApi
 * @description Injected RTK Query endpoints for company branch CRUD, filters, and lifecycle management.
 */
import { apiSlice } from '../api/apiSlice.js';

export const branchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Retrieves paginated list of company branches with search and archive filters.
     */
    getBranches: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.isArchived !== undefined) queryParams.append('isArchived', params.isArchived);
        if (params.sort) queryParams.append('sort', params.sort);

        const queryString = queryParams.toString();
        return `/branches${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.data?.docs
          ? [
              ...result.data.docs.map(({ _id }) => ({ type: 'Branch', id: _id })),
              { type: 'Branch', id: 'LIST' },
              'Dashboard',
            ]
          : [{ type: 'Branch', id: 'LIST' }, 'Dashboard'],
    }),

    /**
     * Retrieves branch details and computed statistics by branchId.
     */
    getBranchById: builder.query({
      query: (branchId) => `/branches/${branchId}`,
      providesTags: (_result, _error, branchId) => [{ type: 'Branch', id: branchId }],
    }),

    /**
     * Creates a new company branch for the supervisor.
     */
    createBranch: builder.mutation({
      query: (branchData) => ({
        url: '/branches',
        method: 'POST',
        body: branchData,
      }),
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }, 'Dashboard'],
    }),

    /**
     * Updates an existing company branch.
     */
    updateBranch: builder.mutation({
      query: ({ branchId, ...updates }) => ({
        url: `/branches/${branchId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { branchId }) => [
        { type: 'Branch', id: branchId },
        { type: 'Branch', id: 'LIST' },
        'Dashboard',
      ],
    }),

    /**
     * Soft-archives a company branch.
     */
    archiveBranch: builder.mutation({
      query: (branchId) => ({
        url: `/branches/${branchId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, branchId) => [
        { type: 'Branch', id: branchId },
        { type: 'Branch', id: 'LIST' },
        'Dashboard',
      ],
    }),

    /**
     * Restores a soft-archived company branch.
     */
    restoreBranch: builder.mutation({
      query: (branchId) => ({
        url: `/branches/${branchId}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, branchId) => [
        { type: 'Branch', id: branchId },
        { type: 'Branch', id: 'LIST' },
        'Dashboard',
      ],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useArchiveBranchMutation,
  useRestoreBranchMutation,
} = branchApi;

export default branchApi;
