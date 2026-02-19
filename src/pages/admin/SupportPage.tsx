import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/app/hooks';
import {
  getConversationsForAdmin,
  getMessagesByConversationId,
  addMessage,
  markMessagesAsRead,
} from '@/mocks/data/conversations.mock';
import { MessageCircle, Search, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function AdminSupportPage() {
  const { user: admin } = useAppSelector((state) => state.auth);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = useMemo(
    () => (admin ? getConversationsForAdmin(admin.id) : []),
    [admin, refreshKey]
  );

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (filter === 'unread') list = list.filter((c) => c.unreadCount > 0);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.otherParticipant?.full_name?.toLowerCase().includes(q) ||
          c.otherParticipant?.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, filter, searchTerm]);

  const messages = useMemo(
    () => (selectedId ? getMessagesByConversationId(selectedId) : []),
    [selectedId, refreshKey]
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId),
    [conversations, selectedId]
  );

  useEffect(() => {
    if (selectedId && admin) {
      markMessagesAsRead(selectedId, admin.id);
    }
  }, [selectedId, admin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = replyText.trim();
    if (!selectedId || !admin || !text) return;
    addMessage(selectedId, admin.id, text);
    setReplyText('');
    setRefreshKey((k) => k + 1);
  }, [selectedId, admin, replyText]);

  if (!admin) return null;

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hỗ trợ tin nhắn</h1>
          <p className="text-gray-600 mt-1">
            Xem và trả lời tin nhắn hỗ trợ từ người dùng
          </p>
        </div>

        <div className="flex gap-4 h-[calc(100vh-12rem)] min-h-[400px]">
          {/* Conversation list */}
          <Card className="w-full max-w-sm flex flex-col shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5" />
                Hội thoại
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Tất cả
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  Chưa đọc
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {filteredConversations.length === 0 ? (
                <p className="text-sm text-gray-500 p-4 text-center">
                  Không có hội thoại nào.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredConversations.map((conv) => (
                    <li key={conv.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(conv.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors',
                          selectedId === conv.id && 'bg-primary/10 border-l-2 border-primary'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-primary">
                              {conv.otherParticipant?.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {conv.otherParticipant?.full_name || 'Người dùng'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {conv.lastMessage?.content || '—'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {conv.lastMessage ? formatTime(conv.lastMessage.created_at) : ''}
                            </p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-primary text-white shrink-0">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Chat panel */}
          <Card className="flex-1 flex flex-col min-w-0">
            {!selectedId ? (
              <CardContent className="flex-1 flex items-center justify-center text-gray-500">
                <p>Chọn một hội thoại để xem và trả lời</p>
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b border-gray-200 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {selectedConversation?.otherParticipant?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p>{selectedConversation?.otherParticipant?.full_name || 'Người dùng'}</p>
                      <p className="text-xs font-normal text-gray-500">
                        {selectedConversation?.otherParticipant?.email}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.map((msg) => {
                    const isAdmin = msg.sender_id === admin.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-2',
                          isAdmin ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {!isAdmin && (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-gray-600">
                              {msg.sender?.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                            isAdmin
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          )}
                        >
                          <p>{msg.content}</p>
                          <p className={cn('text-xs mt-1', isAdmin ? 'text-white/80' : 'text-gray-500')}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </CardContent>
                <div className="border-t border-gray-200 p-3 flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Nhập tin nhắn, nhấn Enter để gửi..."
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!replyText.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
