import { apiSlice } from "./apiSlice";

export const ledgerApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLedgerPayments: builder.query({
            query: () => '/ledger/payments',
            providesTags: ['Ledger'],
        }),
        createLedgerPayment: builder.mutation({
            query: (data) => ({
                url: '/ledger/payments',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Ledger', 'Customer', 'Vendor', 'Invoice'],
        }),
        getLedgerPaymentById: builder.query({
            query: (id) => ({
                url: `/ledger/payments/${id}`,
            }),
            providesTags: ['Ledger'],
        }),
    }),
});

export const {
    useGetLedgerPaymentsQuery,
    useCreateLedgerPaymentMutation,
    useGetLedgerPaymentByIdQuery,
} = ledgerApiSlice;
