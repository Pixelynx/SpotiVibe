import { configureStore } from '@reduxjs/toolkit';
import catalogReducer from './slices/catalogSlice.ts';
import vibeSearchReducer from './slices/vibeSearchSlice.ts';

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    vibeSearch: vibeSearchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 