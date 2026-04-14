import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: string;
  message: string;
  carId?: string;
}

interface NotificationState {
  items: Notification[];
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [] } as NotificationState,
  reducers: {
    addNotification(state, action: PayloadAction<Omit<Notification, 'id'>>) {
      state.items.unshift({ ...action.payload, id: Date.now().toString() });
      if (state.items.length > 20) state.items.pop();
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
