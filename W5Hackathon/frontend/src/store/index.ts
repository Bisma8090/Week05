import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loadFromStorage } from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
  },
});

// Rehydrate auth from localStorage on the client immediately (not in a useEffect)
if (typeof window !== 'undefined') {
  store.dispatch(loadFromStorage());
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
