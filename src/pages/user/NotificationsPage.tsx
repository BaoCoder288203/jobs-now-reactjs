import { useAppSelector } from '@/app/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getNotificationsByUserId,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/mocks/data/notifications.mock';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

function formatDate(iso: string) {
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
  const notifications = useMemo(
    () => (user ? getNotificationsByUserId(user.id) : []),
    [user]
  );

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markNotificationAsRead(id);
    },
    []
  );

  const handleMarkAllRead = useCallback(() => {
    if (user) markAllNotificationsAsRead(user.id);
  }, [user]);

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
        {notifications.some((n) => !n.is_read) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Đánh dấu tất cả đã đọc
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
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Chưa có thông báo nào.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`py-4 px-3 rounded-lg transition-colors ${
                    !n.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-medium ${
                          !n.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{n.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(n.id)}
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
