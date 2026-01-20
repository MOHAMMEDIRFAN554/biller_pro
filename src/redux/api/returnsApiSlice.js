import { apiSlice } from './apiSlice';

const RETURNS_URL = '/returns';

export const returnsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createSalesReturn: builder.mutation({
            query: (data) => ({
                url: `${RETURNS_URL}/sales`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Product', 'Customer', 'Invoice', 'Return'],
        }),
        createPurchaseReturn: builder.mutation({
            query: (data) => ({
                url: `${RETURNS_URL}/purchase`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Product', 'Vendor', 'Purchase'],
        }),
        getSalesReturn: builder.query({
            query: (id) => ({
                url: `${RETURNS_URL}/sales/${id}`,
            }),
            providesTags: ['Return'],
        }),
        getSalesReturns: builder.query({
            query: () => ({
                url: `${RETURNS_URL}/sales`,
            }),
            providesTags: ['Return'],
        }),
    }),
});

export const {
    useCreateSalesReturnMutation,
    useCreatePurchaseReturnMutation,
    useGetSalesReturnQuery,
    useGetSalesReturnsQuery,
} = returnsApiSlice;
