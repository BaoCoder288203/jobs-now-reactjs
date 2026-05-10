import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/app/hooks';
import * as chatService from '@/services/chat.service';
import type { ConversationResponse, MessageResponse } from '@/services/chat.service';
import {
  connectWebSocket,
  subscribeToConversation,
  sendTextMessage,
  sendFileMessage,
  markMessagesRead,
  subscribeToUserStatus,
  subscribeToConversationData,
} from '@/services/websocket';
import { MessageCircle, Search, Send, Trash2, Image, FileText, Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return (
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );
}

export function AdminSupportPage() {
  const { user: admin } = useAppSelector((state) => state.auth);
  const adminId = admin?.userId;

  const [selectedConv, setSelectedConv] = useState<ConversationResponse | null>(null);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<ConversationResponse | null>(null);
  const [deletingConversationId, setDeletingConversationId] = useState<number | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const conversationSubscriptionRef = useRef<any>(null);
  const statusSubscriptionRef = useRef<any>(null);
  const conversationDataSubscriptionRef = useRef<any>(null);
  const activeConversationIdRef = useRef<number | null>(null);
  const selectRequestRef = useRef(0);

  const loadConversations = useCallback(async () => {
    if (!adminId) return;
    try {
      const list = await chatService.getUserConversations(adminId);
      setConversations(list);
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!adminId) return;
    let mounted = true;

    connectWebSocket(adminId)
      .then(() => {
        if (!mounted) return;

        statusSubscriptionRef.current = subscribeToUserStatus((status) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.otherUserId !== status.userId) return c;
              return {
                ...c,
                isOtherUserOnline: status.isOnline,
                otherUserLastSeen: status.lastSeen,
              };
            })
          );

          setSelectedConv((prev) => {
            if (!prev || prev.otherUserId !== status.userId) return prev;
            return {
              ...prev,
              isOtherUserOnline: status.isOnline,
              otherUserLastSeen: status.lastSeen,
            };
          });
        });

        conversationDataSubscriptionRef.current = subscribeToConversationData(adminId, (conversation: ConversationResponse) => {
          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.conversationId === conversation.conversationId);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = { ...next[idx], ...conversation };
              next.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
              return next;
            }
            return [conversation, ...prev];
          });
        });
      })
      .catch(console.error);

    return () => {
      mounted = false;
      if (statusSubscriptionRef.current) {
        statusSubscriptionRef.current.unsubscribe();
        statusSubscriptionRef.current = null;
      }
      if (conversationDataSubscriptionRef.current) {
        conversationDataSubscriptionRef.current.unsubscribe();
        conversationDataSubscriptionRef.current = null;
      }
    };
  }, [adminId]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const selectConversation = useCallback(
    async (conv: ConversationResponse) => {
      if (!adminId) return;

      const requestId = ++selectRequestRef.current;
      activeConversationIdRef.current = conv.conversationId;

      conversationSubscriptionRef.current?.unsubscribe();
      conversationSubscriptionRef.current = null;

      setSelectedConv(conv);
      setMessages([]);

      await connectWebSocket(adminId);
      const list = await chatService.getMessages(conv.conversationId);
      if (requestId !== selectRequestRef.current || activeConversationIdRef.current !== conv.conversationId) {
        return;
      }

      setMessages(list);
      markMessagesRead(conv.conversationId, adminId);
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conv.conversationId
            ? { ...c, unreadCount: 0 }
            : c
        )
      );

      conversationSubscriptionRef.current = subscribeToConversation(conv.conversationId, (msg: MessageResponse) => {
        if (activeConversationIdRef.current !== conv.conversationId) return;
        setMessages((prev) => [...prev, msg]);
        if (msg.senderId !== adminId) {
          markMessagesRead(conv.conversationId, adminId);
        }
      });
    },
    [adminId]
  );

  useEffect(() => {
    return () => {
      activeConversationIdRef.current = null;
      if (conversationSubscriptionRef.current) {
        conversationSubscriptionRef.current.unsubscribe();
        conversationSubscriptionRef.current = null;
      }
      if (statusSubscriptionRef.current) {
        statusSubscriptionRef.current.unsubscribe();
        statusSubscriptionRef.current = null;
      }
      if (conversationDataSubscriptionRef.current) {
        conversationDataSubscriptionRef.current.unsubscribe();
        conversationDataSubscriptionRef.current = null;
      }
    };
  }, []);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (filter === 'unread') list = list.filter((c) => c.unreadCount > 0);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.otherUserName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, filter, searchTerm]);

  const handleSend = useCallback(async () => {
    const text = replyText.trim();
    if (!selectedConv || !adminId || (!text && !selectedFile)) return;

    await connectWebSocket(adminId);

    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadRes = await chatService.uploadChatFile(selectedFile);
        const isImage = selectedFile.type.startsWith('image/');
        sendFileMessage(
          selectedConv.conversationId,
          adminId,
          isImage ? 'Đã gửi một hình ảnh' : 'Đã gửi một tệp',
          uploadRes.fileName,
          uploadRes.fileType,
          uploadRes.fileUrl
        );
      } catch (error) {
        console.error('Upload failed', error);
        toast.error('Không thể tải tệp lên');
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }

    if (text) {
      sendTextMessage(selectedConv.conversationId, adminId, text);
      setReplyText('');
    }
  }, [replyText, selectedConv, adminId, selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDeleteConversation = (conv: ConversationResponse, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversationToDelete(conv);
  };

  const confirmDeleteConversation = async () => {
    if (!adminId || !conversationToDelete) return;
    setDeletingConversationId(conversationToDelete.conversationId);
    try {
      await chatService.deleteConversation(conversationToDelete.conversationId, adminId);
      setConversations((prev) => prev.filter((c) => c.conversationId !== conversationToDelete.conversationId));
      if (selectedConv?.conversationId === conversationToDelete.conversationId) {
        setSelectedConv(null);
        setMessages([]);
      }
      setConversationToDelete(null);
      toast.success('Đã xóa cuộc trò chuyện');
    } catch (error) {
      console.error('Delete conversation failed', error);
      toast.error('Không thể xóa cuộc trò chuyện');
    } finally {
      setDeletingConversationId(null);
    }
  };

  if (!admin) return null;

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Hỗ trợ tin nhắn</h1>
          <p className="mt-1 text-gray-600">Quản lý các hội thoại hỗ trợ khách hàng theo thời gian thực</p>
        </div>

        <div className="flex h-[calc(100vh-12rem)] min-h-[400px] gap-4">
          <Card className="w-full max-w-sm shrink-0 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5" />
                Hội thoại
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="mt-2 flex gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
                  Tất cả
                </Button>
                <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>
                  Chưa đọc
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {loading ? (
                <p className="p-4 text-center text-sm text-gray-500">Đang tải hội thoại...</p>
              ) : filteredConversations.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500">Không có hội thoại nào.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredConversations.map((conv) => (
                    <li key={conv.conversationId}>
                      <div
                        className={cn(
                          'flex items-center gap-2 px-2 py-2 transition-colors',
                          selectedConv?.conversationId === conv.conversationId && 'bg-primary/10'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => void selectConversation(conv)}
                          className={cn(
                            'flex-1 rounded-md px-2 py-1 text-left transition-colors hover:bg-gray-50',
                            selectedConv?.conversationId === conv.conversationId && 'border-l-2 border-primary'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20">
                              {conv.otherUserAvatar ? (
                                <img src={conv.otherUserAvatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-medium text-primary">
                                  {conv.otherUserName?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-gray-900">{conv.otherUserName || 'Người dùng'}</p>
                              <p className="mt-0.5 truncate text-xs text-gray-500">{conv.lastMessage || 'Bắt đầu trò chuyện'}</p>
                              <p className="mt-0.5 text-xs text-gray-400">{conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}</p>
                            </div>
                            {conv.unreadCount > 0 && <Badge className="shrink-0 bg-primary text-white">{conv.unreadCount}</Badge>}
                          </div>
                        </button>

                        <button
                          onClick={(event) => handleDeleteConversation(conv, event)}
                          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Xóa cuộc trò chuyện"
                          title="Xóa cuộc trò chuyện"
                          disabled={deletingConversationId === conv.conversationId}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 flex-1 flex flex-col">
            {!selectedConv ? (
              <CardContent className="flex flex-1 items-center justify-center text-gray-500">
                <p>Chọn một hội thoại để xem và trả lời</p>
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b border-gray-200 py-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/20">
                      {selectedConv.otherUserAvatar ? (
                        <img src={selectedConv.otherUserAvatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          {selectedConv.otherUserName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p>{selectedConv.otherUserName || 'Người dùng'}</p>
                      <p className="text-xs font-normal text-gray-500">
                        {selectedConv.isOtherUserOnline
                          ? 'Đang hoạt động'
                          : `Hoạt động ${formatTime(selectedConv.otherUserLastSeen || selectedConv.lastMessageAt)}`}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.map((msg) => {
                    const isAdminSender = msg.senderId === adminId;
                    return (
                      <div key={msg.messageId} className={cn('flex gap-2', isAdminSender ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                            isAdminSender ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                          )}
                        >
                          {msg.messageType === 'IMAGE' && msg.attachment?.filePath ? (
                            <img
                              src={msg.attachment.filePath}
                              alt={msg.attachment.fileName || 'Ảnh đính kèm'}
                              className="mt-1 max-h-[220px] max-w-[220px] cursor-zoom-in rounded-lg object-contain"
                              onClick={() => setPreviewImage(msg.attachment!.filePath)}
                            />
                          ) : msg.messageType === 'FILE' && msg.attachment?.filePath ? (
                            <a
                              href={msg.attachment.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                'mt-1 inline-flex items-center gap-2 rounded-lg border px-3 py-2',
                                isAdminSender
                                  ? 'border-white/30 bg-primary/30 text-white hover:bg-primary/40'
                                  : 'border-gray-200 bg-white text-primary hover:bg-gray-50'
                              )}
                            >
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="max-w-[180px] truncate">{msg.attachment.fileName || msg.content}</span>
                              <Download className="h-4 w-4 shrink-0" />
                            </a>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                          <p className={cn('mt-1 text-xs', isAdminSender ? 'text-white/80' : 'text-gray-500')}>
                            {formatTime(msg.sentAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>

                <div className="border-t border-gray-200 p-3 flex gap-2">
                  {selectedFile && (
                    <div className="absolute bottom-20 left-6 right-6 rounded-lg border border-gray-200 bg-white p-3 shadow-md">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {selectedFile.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(selectedFile)}
                              alt="preview"
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                              <FileText className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="rounded-full p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.zip,.txt"
                    disabled={isUploading}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = 'image/*';
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={isUploading}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = '.pdf,.doc,.docx,.zip,.txt';
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={isUploading}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>

                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder={isUploading ? 'Đang tải tệp lên...' : 'Nhập tin nhắn, nhấn Enter để gửi...'}
                    className="flex-1"
                    disabled={isUploading}
                  />
                  <Button onClick={() => void handleSend()} disabled={(!replyText.trim() && !selectedFile) || isUploading} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/80 z-10"
            onClick={() => setPreviewImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-full rounded object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Dialog open={!!conversationToDelete} onOpenChange={(open) => !open && setConversationToDelete(null)}>
        <DialogContent className="max-w-md p-0" showClose={false} onClose={() => setConversationToDelete(null)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Xóa cuộc trò chuyện</h3>
            <p className="mt-2 text-sm text-gray-600">
              Bạn có chắc muốn xóa cuộc trò chuyện với {conversationToDelete?.otherUserName}?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConversationToDelete(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                disabled={deletingConversationId != null}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteConversation}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                disabled={deletingConversationId != null}
              >
                {deletingConversationId != null ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
