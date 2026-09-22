/**
 * @module redux/features/reports/reportApi
 * @description Injected RTK Query endpoints for Daily Supervisory Reports.
 * Handles creation, queries, updates, and automatic cache invalidation with ['Report', 'Dashboard'] tags.
 */
import { apiSlice } from '../api/apiSlice.js';

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Retrieves paginated list of reports with date/branch/status filters.
     */
    getReports: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.branch) queryParams.append('branch', params.branch);
        if (params.type) queryParams.append('type', params.type);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.isArchived !== undefined) queryParams.append('isArchived', params.isArchived);
        if (params.sort) queryParams.append('sort', params.sort);

        const queryString = queryParams.toString();
        return `/reports${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.data?.docs
          ? [
              ...result.data.docs.map(({ _id }) => ({ type: 'Report', id: _id })),
              { type: 'Report', id: 'LIST' },
              'Dashboard',
            ]
          : [{ type: 'Report', id: 'LIST' }, 'Dashboard'],
    }),

    /**
     * Retrieves single report details by ID.
     */
    getReportById: builder.query({
      query: (reportId) => `/reports/${reportId}`,
      providesTags: (_result, _error, reportId) => [{ type: 'Report', id: reportId }],
    }),

    /**
     * Creates a new Daily Supervisory Report and paired 1-to-1 Chat thread.
     */
    createReport: builder.mutation({
      query: (reportData) => ({
        url: '/reports',
        method: 'POST',
        body: reportData,
      }),
      invalidatesTags: [
        { type: 'Report', id: 'LIST' },
        'Chat',
        'Dashboard',
      ],
    }),

    /**
     * Updates an existing report.
     */
    updateReport: builder.mutation({
      query: ({ reportId, ...updates }) => ({
        url: `/reports/${reportId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { reportId }) => [
        { type: 'Report', id: reportId },
        { type: 'Report', id: 'LIST' },
        'Dashboard',
      ],
    }),

    /**
     * Mode 3: Transcribes ephemeral audio recording directly via Addis AI STT.
     */
    transcribeEphemeralAudio: builder.mutation({
      query: (formData) => ({
        url: '/audio/transcribe-ephemeral',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetReportsQuery,
  useGetReportByIdQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useTranscribeEphemeralAudioMutation,
} = reportApi;
