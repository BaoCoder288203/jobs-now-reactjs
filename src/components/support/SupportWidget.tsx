import { useState, useRef, useEffect } from 'react';
import { useHotkey } from '@tanstack/react-hotkeys';
import { MessageCircle, ChevronDown, X, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SUPPORT_CONFIG } from './support.constants';
import { cn } from '@/lib/utils';

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    type: 'bot' as const,
    text: SUPPORT_CONFIG.welcomeMessage,
    createdAt: new Date().toISOString(),
  },
];

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useHotkey('Escape', () => setIsOpen(false), {
    enabled: isOpen,
    requireReset: true,
  });

  useEffect(() => {
    if (isOpen && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: 'user' as const,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInputValue('');
    // Simulate bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          type: 'bot' as const,
          text: 'Cảm ơn bạn! Bộ phận hỗ trợ sẽ phản hồi trong thời gian sớm nhất.',
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Chat Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="w-[380px] max-h-[500px] rounded-t-xl rounded-l-xl border border-gray-200 bg-white shadow-xl flex flex-col overflow-hidden"
        >
          {/* Header */}
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

          {/* Body */}
          <div
            ref={bodyRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-[200px]"
          >
            <p className="text-center text-sm text-gray-500 mb-4">
              {SUPPORT_CONFIG.introLines[0]}
              <br />
              <span className="text-xs">{SUPPORT_CONFIG.introLines[1]}</span>
            </p>
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.type === 'bot' && (
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      msg.type === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-900'
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={SUPPORT_CONFIG.inputPlaceholder}
              className="flex-1 rounded-lg"
            />
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              aria-label="Đính kèm"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              aria-label="Emoji"
            >
              <Smile className="h-5 w-5" />
            </button>
            <Button size="sm" onClick={handleSend} disabled={!inputValue.trim()}>
              Gửi
            </Button>
          </div>
        </div>
      )}

      {/* Zalo link - cùng kích thước nút chat tư vấn */}
      <a
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
      </a>

      {/* FAB - Message icon */}
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
