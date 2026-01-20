import { apiSlice } from './apiSlice';

const SETTINGS_URL = '/settings';

export const settingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSequences: builder.query({
            query: () => ({
                url: `${SETTINGS_URL}/sequences`,
            }),
            providesTags: ['Sequence'],
        }),
        updatePrefix: builder.mutation({
            query: (data) => ({
                url: `${SETTINGS_URL}/sequences`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Sequence'],
        }),
        getAuditLogs: builder.query({
            query: () => ({
                url: `${SETTINGS_URL}/logs`,
            }),
            keepUnusedDataFor: 0, // Always fetch fresh
        }),
        getCompanyProfile: builder.query({
            query: () => ({
                url: `${SETTINGS_URL}/profile`,
            }),
            providesTags: ['Company'],
        }),
        updateCompanyProfile: builder.mutation({
            query: (data) => ({
                url: `${SETTINGS_URL}/profile`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Company'],
        }),
    }),
});

export const {
    useGetSequencesQuery,
    useUpdatePrefixMutation,
    useGetAuditLogsQuery,
    useGetCompanyProfileQuery,
    useUpdateCompanyProfileMutation,
} = settingsApiSlice;
