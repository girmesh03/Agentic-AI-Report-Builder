/**
 * @module redux/app/store
 * @description Primary Redux store configuration with RTK Query middleware integration.
 */
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer.js';
import { apiSlice } from '../features/api/apiSlice.js';
import { env } from '../../config/env.js';

/**
 * Configured Redux store instance.
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: env.IS_DEV,
});

export default store;
