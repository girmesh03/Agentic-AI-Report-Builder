/**
 * @module redux/app/rootReducer
 * @description Root reducer combining all domain feature reducers and RTK Query apiSlice.
 */
import { combineReducers } from '@reduxjs/toolkit';
import { apiSlice } from '../features/api/apiSlice.js';
import authReducer from '../features/auth/authSlice.js';

/**
 * Root Redux reducer combining all active application slices.
 */
export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
});

export default rootReducer;
