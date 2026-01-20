import { apiSlice } from './apiSlice';

const BILLS_URL = '/bills';

export const billsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createBill: builder.mutation({
            query: (data) => ({
                url: BILLS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Product', 'Customer', 'Invoice'], // Stock changes, Ledger changes
        }),
        getBills: builder.query({
            query: ({ keyword, pageNumber } = {}) => ({
                url: BILLS_URL,
                params: { keyword, page: pageNumber }
            }),
            providesTags: ['Invoice'],
            keepUnusedDataFor: 5
        }),
        getBillById: builder.query({
            query: (id) => ({
                url: `${BILLS_URL}/${id}`,
            }),
            providesTags: (result, error, id) => [{ type: 'Invoice', id }]
        }),
    }),
});

export const {
    useCreateBillMutation,
    useGetBillsQuery,
    useGetBillByIdQuery
} = billsApiSlice;
