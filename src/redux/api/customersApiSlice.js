import { apiSlice } from './apiSlice';

const CUSTOMERS_URL = '/customers';

export const customersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCustomers: builder.query({
            query: ({ keyword, page } = {}) => ({
                url: CUSTOMERS_URL,
                params: { keyword, page },
            }),
            providesTags: ['Customer'],
            keepUnusedDataFor: 5,
        }),
        createCustomer: builder.mutation({
            query: (data) => ({
                url: CUSTOMERS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Customer'],
        }),
        getCustomerTransactions: builder.query({
            query: ({ id, startDate, endDate }) => ({
                url: `${CUSTOMERS_URL}/${id}/transactions`,
                params: { startDate, endDate }
            }),
            providesTags: ['Customer'],
        }),
        getCustomerById: builder.query({
            query: (id) => ({
                url: `${CUSTOMERS_URL}/${id}`,
            }),
            providesTags: ['Customer'],
        }),
    }),
});

export const {
    useGetCustomersQuery,
    useCreateCustomerMutation,
    useGetCustomerTransactionsQuery,
    useGetCustomerByIdQuery,
} = customersApiSlice;
