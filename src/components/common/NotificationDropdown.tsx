import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getNotificationsByUserId,
  getUnreadNotificationsByUserId,
} from '@/mocks/data/notifications.mock';
import { cn } from '@/lib/utils';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  userId: string;
}

function formatDate(iso: string) {
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
  const notifications = getNotificationsByUserId(userId).slice(0, 5);
  const unreadCount = getUnreadNotificationsByUserId(userId).length;

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
      {/* Triangle pointer - giống UserDropdown */}
      <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45" />
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Thông báo</span>
        {unreadCount > 0 && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {unreadCount} mới
          </span>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 px-4 py-6 text-center">
            Chưa có thông báo
          </p>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              to="/user/notifications"
              onClick={onClose}
              className={cn(
                'block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0',
                !n.is_read && 'bg-primary/5'
              )}
            >
              <p className={cn('text-sm font-medium', !n.is_read && 'text-gray-900')}>
                {n.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.content}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
            </Link>
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
