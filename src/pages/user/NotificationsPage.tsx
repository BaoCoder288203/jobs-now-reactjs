import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '@/services/notification.service';
import { setUnreadMessageCount } from '@/auth/authSlice';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/types/notification';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

function formatDate(iso: string) {
  if (!iso) return 'Vừa xong';
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
  return d.toLocaleDateString('vi-VN');
}

export function NotificationsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.userId],
    queryFn: () => getNotifications(String(user?.userId)),
    enabled: !!user?.userId,
  });

  const updateUnreadCount = async () => {
    if (user?.userId) {
      const count = await getUnreadCount(user.userId);
      dispatch(setUnreadMessageCount(count));
    }
  };

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.userId] });
      updateUnreadCount();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllAsRead(String(user?.userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.userId] });
      updateUnreadCount();
    },
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo chung</h1>
          <p className="text-gray-600 mt-1">
            Tổng hợp thông báo ứng tuyển, việc làm và hệ thống
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            {markAllReadMutation.isPending ? 'Đang cập nhật...' : 'Đánh dấu tất cả đã đọc'}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Danh sách thông báo ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">
              Đang tải thông báo...
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Chưa có thông báo nào.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((n) => (
                <li
                  key={n.notificationId}
                  className={`py-4 px-3 rounded-lg transition-colors ${!n.isRead ? 'bg-primary/5' : ''
                    }`}
                >
                  <div 
                    className={cn("flex items-start justify-between gap-3", n.type === 'CHAT' ? "cursor-pointer" : "")}
                    onClick={() => {
                      if (n.type === 'CHAT') {
                        navigate('/user/chat', { state: { openConversationId: n.conversationId } });
                      }
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}
                      >
                        {n.type === 'CHAT' ? `Tin nhắn từ ${n.senderName || 'Người dùng'}` : 'Thông báo hệ thống'}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{n.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markReadMutation.mutate(n.notificationId)}
                        disabled={markReadMutation.isPending}
                      >
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
