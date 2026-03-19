import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { toast } from 'sonner';
import { connectWebSocket, subscribeToNotifications } from '@/services/websocket';
import { setUnreadMessageCount } from '@/auth/authSlice';
import { getUnreadCount } from '@/services/notification.service';
import { useQueryClient } from '@tanstack/react-query';

export function GlobalNotificationListener() {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.userId) return;

    let notifSub: any = null;
    let isMounted = true;

    connectWebSocket(user.userId)
      .then(() => {
        if (!isMounted) return;

        getUnreadCount(user.userId).then((count) => {
          if (isMounted) dispatch(setUnreadMessageCount(count));
        }).catch(console.error);

        notifSub = subscribeToNotifications(user.userId, (notif: any) => {
          if (notif.type === 'CHAT') {
            if (!location.pathname.startsWith('/chat')) {
              toast(
                <div className="flex flex-col gap-1 cursor-pointer" onClick={() => navigate('/chat')}>
                  <p className="font-semibold text-sm">Tin nhắn mới từ {notif.senderName || 'Ai đó'}</p>
                  <p className="text-sm text-gray-600 line-clamp-1">{notif.content}</p>
                </div>,
                { duration: 5000 }
              );
            }
          }
          
          queryClient.invalidateQueries({ queryKey: ['notifications', String(user.userId)] });

          getUnreadCount(user.userId).then((count) => {
            if (isMounted) dispatch(setUnreadMessageCount(count));
          }).catch(console.error);
        });
      })
      .catch(console.error);

    return () => {
      isMounted = false;
      if (notifSub) notifSub.unsubscribe();
    };
  }, [user?.userId, location.pathname, navigate, dispatch, queryClient]);

  return null;
}
