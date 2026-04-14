'use client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { addNotification } from '@/store/slices/notificationSlice';
import { useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';

function SocketInit() {
  const dispatch = store.dispatch;
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    const socket = getSocket();

    // Join personal room for targeted notifications (winner alerts etc.)
    if (isAuthenticated && user?._id) {
      socket.emit('joinUserRoom', user._id);
    }

    socket.on('notification', (data: any) => {
      dispatch(addNotification(data));
      if (data.isWinner) {
        toast.success(data.message, {
          duration: 10000,
          icon: '🏆',
          style: { background: '#1e2d6b', color: '#fff', fontWeight: 700, fontSize: 15 },
        });
      } else if (data.type === 'BID_ENDED') {
        toast(data.message, { icon: '🔔', duration: 6000 });
      } else {
        toast(data.message, { icon: '🔔' });
      }
    });

    return () => { socket.off('notification'); };
  }, [isAuthenticated, user?._id]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SocketInit />
      <Toaster position="top-right" />
      {children}
    </Provider>
  );
}
