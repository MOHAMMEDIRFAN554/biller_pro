import { apiSlice } from './apiSlice';

const REPORTS_URL = '/reports';

export const reportsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCollectionReport: builder.query({
            query: ({ startDate, endDate }) => ({
                url: `${REPORTS_URL}/collection`,
                params: { startDate, endDate },
            }),
            providesTags: ['Bill', 'Return', 'Ledger'],
        }),
        getPnLReport: builder.query({
            query: ({ startDate, endDate }) => ({
                url: `${REPORTS_URL}/pnl`,
                params: { startDate, endDate },
            }),
            providesTags: ['Bill', 'Purchase', 'Expense'],
        }),
    }),
});

export const {
    useGetCollectionReportQuery,
    useGetPnLReportQuery,
} = reportsApiSlice;
