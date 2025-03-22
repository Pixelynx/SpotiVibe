import { configureStore } from '@reduxjs/toolkit';
import catalogReducer from './slices/catalogSlice.ts';

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    // TODO: other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 