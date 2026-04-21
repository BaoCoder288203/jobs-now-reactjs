import { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/app/hooks';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/services/notification.service';
import type { Notification } from '@/types/notification';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  userId: string;
}

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

export function NotificationDropdown({
  isOpen,
  onClose,
  anchorRef,
  userId,
}: NotificationDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { unreadMessageCount } = useAppSelector((state) => state.auth);

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', userId],
    queryFn: () => getNotifications(userId),
    enabled: !!userId,
  });

  const displayNotifications = notifications.slice(0, 5);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-[100] w-80 rounded-lg border border-gray-200 bg-white shadow-xl py-2"
      onMouseLeave={onClose}
    >
      {/* Triangle pointer */}
      <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45" />
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Thông báo</span>
        {unreadMessageCount > 0 && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {unreadMessageCount} mới
          </span>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-gray-500 px-4 py-6 text-center">
            Đang tải...
          </p>
        ) : displayNotifications.length === 0 ? (
          <p className="text-sm text-gray-500 px-4 py-6 text-center">
            Chưa có thông báo
          </p>
        ) : (
          displayNotifications.map((n) => (
            <div
              key={n.notificationId}
              onClick={() => {
                onClose();
                if (n.type === 'CHAT') {
                  navigate('/user/chat', { state: { openConversationId: n.conversationId } });
                } else {
                  navigate('/user/notifications');
                }
              }}
              className={cn(
                'block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer',
                !n.isRead && 'bg-primary/5'
              )}
            >
              <p className={cn('text-sm font-medium', !n.isRead && 'text-gray-900')}>
                {n.type === 'CHAT' ? `Tin nhắn từ ${n.senderName || 'Người dùng'}` : 'Thông báo hệ thống'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.content}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-gray-100 px-4 py-2">
        <Link
          to="/user/notifications"
          onClick={onClose}
          className="block text-center text-sm font-medium text-primary hover:underline py-2"
        >
          Xem tất cả thông báo
        </Link>
      </div>
    </div>
  );
}
