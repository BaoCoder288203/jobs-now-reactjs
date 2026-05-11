import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useHotkey } from '@tanstack/react-hotkeys';
import { MessageCircle, ChevronDown, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SUPPORT_CONFIG } from './support.constants';
import { createSupportConversation } from '@/services/chat.service';

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnectingSupport, setIsConnectingSupport] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const userRole = user?.role;
  const canUseInAppSupport = userRole === 'ROLE_JOBSEEKER' || userRole === 'ROLE_COMPANY';
  const chatPath = userRole === 'ROLE_COMPANY' ? '/employer/chat' : '/user/chat';
  const isOnChatPage = location.pathname.startsWith('/user/chat') || location.pathname.startsWith('/employer/chat');
  const shouldHideWidget = userRole === 'ROLE_ADMIN' || isOnChatPage || location.pathname.startsWith('/admin/support');

  useHotkey('Escape', () => setIsOpen(false), {
    enabled: isOpen,
    requireReset: true,
  });

  const handleOpenSupportConversation = async () => {
    if (!isAuthenticated || !user) {
      toast.info('Vui lòng đăng nhập để nhắn tin với bộ phận hỗ trợ');
      navigate('/');
      setIsOpen(false);
      return;
    }

    if (!canUseInAppSupport) {
      toast.info('Tài khoản hiện tại không dùng luồng hỗ trợ này');
      return;
    }

    setIsConnectingSupport(true);
    try {
      const supportConversation = await createSupportConversation();
      setIsOpen(false);
      navigate(chatPath, {
        state: {
          openConversationId: supportConversation.conversationId,
          openConversation: supportConversation,
        },
      });
    } catch (error) {
      console.error('Cannot create support conversation', error);
      toast.error('Không thể mở cuộc trò chuyện hỗ trợ');
    } finally {
      setIsConnectingSupport(false);
    }
  };

  if (shouldHideWidget) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div
          className="w-[380px] max-h-[500px] rounded-t-xl rounded-l-xl border border-gray-200 bg-white shadow-xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between bg-primary px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">{SUPPORT_CONFIG.title}</p>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Đang trực tuyến
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                aria-label="Thu nhỏ"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 bg-gray-50 min-h-[200px]">
            <p className="text-center text-sm text-gray-500 mb-4">
              {SUPPORT_CONFIG.introLines[0]}
              <br />
              <span className="text-xs">{SUPPORT_CONFIG.introLines[1]}</span>
            </p>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              {SUPPORT_CONFIG.chatHint}
            </div>
            <div className="mt-4 space-y-2">
              <Button
                className="w-full"
                onClick={handleOpenSupportConversation}
                disabled={isConnectingSupport}
              >
                {isConnectingSupport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang kết nối...
                  </>
                ) : (
                  SUPPORT_CONFIG.openSupportCta
                )}
              </Button>
              <a
                href={SUPPORT_CONFIG.zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                {SUPPORT_CONFIG.openZaloCta}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* <a
        href={SUPPORT_CONFIG.zaloLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-lg hover:scale-105 transition-transform overflow-hidden"
        aria-label="Chat Zalo"
      >
        <img
          src="/logo/logo_zalo.png"
          alt="Zalo"
          className="w-full h-full object-contain p-1.5"
        />
      </a> */}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-105 transition-all"
        aria-label="Mở chat hỗ trợ"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    </div>
  );
}
