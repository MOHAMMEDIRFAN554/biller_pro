import { apiSlice } from './apiSlice';

const VENDORS_URL = '/vendors';

export const vendorsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getVendors: builder.query({
            query: () => ({
                url: VENDORS_URL,
            }),
            providesTags: ['Vendor'],
            keepUnusedDataFor: 5,
        }),
        createVendor: builder.mutation({
            query: (data) => ({
                url: VENDORS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Vendor'],
        }),
    }),
});

export const {
    useGetVendorsQuery,
    useCreateVendorMutation,
} = vendorsApiSlice;
