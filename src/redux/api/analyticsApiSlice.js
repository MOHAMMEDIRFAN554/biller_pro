import { apiSlice } from './apiSlice';

const ANALYTICS_URL = '/analytics';

export const analyticsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query({
            query: () => ({
                url: `${ANALYTICS_URL}/dashboard`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Invoice', 'Expense', 'Product', 'Customer'] // Auto-refetch when these change? Maybe too aggressive, but good for real-time feel
        }),
    }),
});

export const {
    useGetDashboardStatsQuery,
} = analyticsApiSlice;
