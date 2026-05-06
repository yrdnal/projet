import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import { persistMiddleware, loadPersistedState } from './middleware/persistMiddleware';

// Load persisted auth state
const persistedAuth = loadPersistedState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
  preloadedState: persistedAuth ? {
    auth: {
      user: persistedAuth.user,
      isAuthenticated: persistedAuth.isAuthenticated,
      loading: false,
      error: null,
    },
  } : undefined,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(persistMiddleware),
});

export default store;

// Made with Bob
