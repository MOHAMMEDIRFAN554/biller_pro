import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cartItems: [],
    customer: null,
    discount: 0, // Bill level percentage or fixed? Let's assume fixed amount for now as per logic, or maybe percentage is betterUI.
    // Req says "Bill-level". Let's store amount.
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x.product === item.product);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x.product === existItem.product ? { ...x, quantity: x.quantity + 1 } : x
                );
            } else {
                state.cartItems = [...state.cartItems, { ...item, quantity: 1, itemDiscount: 0 }];
            }
        },
        updateCartQty: (state, action) => {
            const { product, quantity } = action.payload;
            state.cartItems = state.cartItems.map((x) =>
                x.product === product ? { ...x, quantity: parseFloat(quantity) } : x
            );
        },
        updateCartDiscount: (state, action) => {
            const { product, discount } = action.payload;
            state.cartItems = state.cartItems.map((x) =>
                x.product === product ? { ...x, itemDiscount: parseFloat(discount) || 0 } : x
            );
        },
        setGlobalDiscount: (state, action) => {
            state.discount = parseFloat(action.payload) || 0;
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
        },
        setCustomer: (state, action) => {
            state.customer = action.payload;
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.customer = null;
            state.discount = 0;
        }
    },
});

export const { addToCart, updateCartQty, updateCartDiscount, setGlobalDiscount, removeFromCart, setCustomer, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
