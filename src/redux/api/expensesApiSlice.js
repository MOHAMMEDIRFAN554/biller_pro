import { apiSlice } from './apiSlice';

const EXPENSES_URL = '/expenses';

export const expensesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getExpenses: builder.query({
            query: () => ({
                url: EXPENSES_URL,
            }),
            providesTags: ['Expense'],
            keepUnusedDataFor: 5,
        }),
        createExpense: builder.mutation({
            query: (data) => ({
                url: EXPENSES_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Expense'],
        }),
        deleteExpense: builder.mutation({
            query: (id) => ({
                url: `${EXPENSES_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Expense'],
        }),
    }),
});

export const {
    useGetExpensesQuery,
    useCreateExpenseMutation,
    useDeleteExpenseMutation,
} = expensesApiSlice;
