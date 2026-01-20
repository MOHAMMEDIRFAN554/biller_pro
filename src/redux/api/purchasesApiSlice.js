import { apiSlice } from './apiSlice';

const PURCHASES_URL = '/purchases';

export const purchasesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPurchases: builder.query({
            query: () => ({
                url: PURCHASES_URL,
            }),
            providesTags: ['Purchase'],
            keepUnusedDataFor: 5,
        }),
        createPurchase: builder.mutation({
            query: (data) => ({
                url: PURCHASES_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Purchase', 'Product', 'Vendor'], // Stock updates, Vendor Ledger updates
        }),
    }),
});

export const {
    useGetPurchasesQuery,
    useCreatePurchaseMutation,
} = purchasesApiSlice;
