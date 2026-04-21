import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
  subscribeToConversationData
} from '@/services/websocket';
import { Send, MessageCircle, Search, ArrowLeft, FileText, Image, X, Download, Trash2, Headset } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId;

  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<ConversationResponse | null>(null);
  const [deletingConversationId, setDeletingConversationId] = useState<number | null>(null);
  const [isCreatingSupport, setIsCreatingSupport] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  const statusSubscriptionRef = useRef<any>(null);
  const conversationDataSubscriptionRef = useRef<any>(null);
  const activeConversationIdRef = useRef<number | null>(null);
  const selectConversationRequestRef = useRef(0);
  const hasAutoOpenedConversationRef = useRef(false);

  const location = useLocation();
  const openConversationId = location.state?.openConversationId;
  const openConversation = location.state?.openConversation as ConversationResponse | undefined;

  useEffect(() => {
    if (!userId) return;
    chatService.getUserConversations(userId).then((data) => {
      setConversations(data);
      setLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    connectWebSocket(userId).then(() => {
      statusSubscriptionRef.current = subscribeToUserStatus((status) => {
        if (!isMounted) return;
        setConversations(prev => prev.map(c => {
          if (c.otherUserId === status.userId) {
            return {
              ...c,
              isOtherUserOnline: status.isOnline,
              otherUserLastSeen: status.lastSeen
            };
          }
          return c;
        }));
        setSelectedConv(prev => {
          if (prev?.otherUserId === status.userId) {
            return {
              ...prev,
              isOtherUserOnline: status.isOnline,
              otherUserLastSeen: status.lastSeen
            }
          }
          return prev;
        });
      });

      conversationDataSubscriptionRef.current = subscribeToConversationData(userId, (conversation: ConversationResponse) => {
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.conversationId === conversation.conversationId);
          if (index >= 0) {
            const next = [...prev];
            next[index] = { ...next[index], ...conversation };
            next.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
            return next;
          }
          return [conversation, ...prev];
        });
      });
    }).catch(console.error);
    return () => {
      isMounted = false;
      if (statusSubscriptionRef.current) {
        statusSubscriptionRef.current.unsubscribe();
        statusSubscriptionRef.current = null;
      }
      if (conversationDataSubscriptionRef.current) {
        conversationDataSubscriptionRef.current.unsubscribe();
        conversationDataSubscriptionRef.current = null;
      }
    };
  }, [userId]);

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectConversation = useCallback(async (conv: ConversationResponse) => {
    const requestId = ++selectConversationRequestRef.current;
    activeConversationIdRef.current = conv.conversationId;

    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = null;

    if (userId) {
      await connectWebSocket(userId);
    }

    setSelectedConv(conv);
    setShowSidebar(false);
    setMessages([]);

    const msgs = await chatService.getMessages(conv.conversationId);
    if (requestId !== selectConversationRequestRef.current || activeConversationIdRef.current !== conv.conversationId) {
      return;
    }
    setMessages(msgs);

    if (userId) {
      markMessagesRead(conv.conversationId, userId);
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    }

    subscriptionRef.current = subscribeToConversation(
      conv.conversationId,
      (msg: MessageResponse) => {
        if (activeConversationIdRef.current !== conv.conversationId) {
          return;
        }
        setMessages((prev) => [...prev, msg]);
        if (userId && msg.senderId !== userId) {
          markMessagesRead(conv.conversationId, userId);
        }
      }
    );
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (hasAutoOpenedConversationRef.current) return;
    if (!openConversation?.conversationId) return;

    if (selectedConv?.conversationId === openConversation.conversationId) {
      hasAutoOpenedConversationRef.current = true;
      return;
    }

    setConversations((prev) => {
      const index = prev.findIndex((c) => c.conversationId === openConversation.conversationId);
      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], ...openConversation };
        return next;
      }
      return [openConversation, ...prev];
    });

    const runAutoOpen = async () => {
      try {
        await selectConversation(openConversation);
        hasAutoOpenedConversationRef.current = true;
      } catch (error) {
        console.error('Failed to auto open support conversation from state', error);
      }
    };

    void runAutoOpen();
  }, [openConversation, selectedConv?.conversationId, selectConversation, userId]);

  useEffect(() => {
    if (!userId) return;
    if (hasAutoOpenedConversationRef.current) return;
    const requestedConversationId = Number(openConversationId);
    if (Number.isNaN(requestedConversationId)) return;
    if (requestedConversationId && conversations.length > 0) {
      const targetConv = conversations.find(c => c.conversationId === requestedConversationId);
      if (targetConv && selectedConv?.conversationId !== requestedConversationId) {
        const runAutoOpenById = async () => {
          try {
            await selectConversation(targetConv);
            hasAutoOpenedConversationRef.current = true;
          } catch (error) {
            console.error('Failed to auto open support conversation by id', error);
          }
        };

        void runAutoOpenById();
      }
    }
  }, [openConversationId, conversations, selectedConv?.conversationId, selectConversation, userId]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedConv || !userId) return;

    await connectWebSocket(userId);

    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadRes = await chatService.uploadChatFile(selectedFile);
        const { fileUrl, fileName, fileType } = uploadRes;

        const isImage = selectedFile.type.startsWith('image/');
        const msgType = isImage ? 'IMAGE' : 'FILE';

        sendFileMessage(
          selectedConv.conversationId,
          userId,
          msgType === 'IMAGE' ? 'Đã gửi một hình ảnh' : 'Đã gửi một tệp',
          fileName,
          fileType,
          fileUrl
        );
      } catch (error) {
        console.error('File upload failed', error);
        toast.error('Không thể tải tệp lên');
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }

    if (newMessage.trim()) {
      sendTextMessage(selectedConv.conversationId, userId, newMessage.trim());
      setNewMessage('');
    }
  };

  useEffect(() => {
    return () => {
      activeConversationIdRef.current = null;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteConversation = (conv: ConversationResponse, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversationToDelete(conv);
  };

  const confirmDeleteConversation = async () => {
    if (!userId) return;
    if (!conversationToDelete) return;
    setDeletingConversationId(conversationToDelete.conversationId);
    try {
      await chatService.deleteConversation(conversationToDelete.conversationId, userId);
      setConversations((prev) => prev.filter((c) => c.conversationId !== conversationToDelete.conversationId));
      if (selectedConv?.conversationId === conversationToDelete.conversationId) {
        setSelectedConv(null);
        setMessages([]);
      }
      setConversationToDelete(null);
      toast.success('Đã xóa cuộc trò chuyện');
    } catch (error) {
      console.error('Failed to delete conversation', error);
      toast.error('Không thể xóa cuộc trò chuyện lúc này');
    } finally {
      setDeletingConversationId(null);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.otherUserName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canContactSupport = user?.role === 'ROLE_JOBSEEKER' || user?.role === 'ROLE_COMPANY';

  const handleContactSupport = async () => {
    if (!userId || !canContactSupport) return;
    setIsCreatingSupport(true);
    try {
      const supportConversation = await chatService.createSupportConversation();
      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c.conversationId === supportConversation.conversationId);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = { ...next[existingIndex], ...supportConversation };
          next.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
          return next;
        }
        return [supportConversation, ...prev];
      });
      hasAutoOpenedConversationRef.current = true;
      await selectConversation(supportConversation);
    } catch (error) {
      console.error('Cannot create support conversation', error);
      toast.error('Không thể mở cuộc trò chuyện hỗ trợ');
    } finally {
      setIsCreatingSupport(false);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString('vi-VN', { weekday: 'short' });
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-170px)] min-h-[560px] flex flex-col bg-gray-50 overflow-hidden rounded-xl border border-gray-200">
      <div className="flex-1 flex overflow-hidden">
        <div
          className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col bg-white border-r border-gray-200`}
          style={{ width: '360px', minWidth: '360px' }}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Tin nhắn
              </h2>
              {canContactSupport && (
                <button
                  onClick={handleContactSupport}
                  disabled={isCreatingSupport}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  <Headset className="h-3.5 w-3.5" />
                  {isCreatingSupport ? 'Đang mở...' : 'Liên hệ hỗ trợ'}
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">Chưa có cuộc trò chuyện nào</div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.conversationId}
                  onClick={() => {
                    hasAutoOpenedConversationRef.current = true;
                    void selectConversation(conv);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selectedConv?.conversationId === conv.conversationId
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                >
                  <div className="relative">
                    {conv.otherUserAvatar ? (
                      <img
                        src={conv.otherUserAvatar}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg">
                        {conv.otherUserName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    {conv.isOtherUserOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {conv.otherUserName}
                      </p>
                      <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                      {conv.lastMessage || 'Bắt đầu trò chuyện'}
                    </p>
                  </div>
                  <button
                    onClick={(event) => handleDeleteConversation(conv, event)}
                    className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Xóa cuộc trò chuyện"
                    title="Xóa cuộc trò chuyện"
                    disabled={deletingConversationId === conv.conversationId}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white`}>
          {selectedConv ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {selectedConv.otherUserAvatar ? (
                  <img src={selectedConv.otherUserAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    {selectedConv.otherUserName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{selectedConv.otherUserName}</p>
                  <p className={`text-xs flex items-center gap-1 ${selectedConv.isOtherUserOnline ? 'text-green-500' : 'text-gray-500'}`}>
                    {selectedConv.isOtherUserOnline ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Đang hoạt động
                      </>
                    ) : (
                      <>
                        Hoạt động {formatTime(selectedConv.otherUserLastSeen || selectedConv.lastMessageAt)}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white">
                {messages.map((msg) => {
                  const isMine = msg.senderId === userId;
                  return (
                    <div key={msg.messageId} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMine
                          ? 'bg-primary text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }`}
                      >
                        {msg.messageType === 'IMAGE' && msg.attachment ? (
                          <img
                            src={msg.attachment.filePath}
                            alt="attachment"
                            className="max-w-[200px] max-h-[200px] object-contain rounded-lg mt-1 cursor-zoom-in hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewImage(msg.attachment!.filePath)}
                          />
                        ) : msg.messageType === 'FILE' && msg.attachment ? (
                          <a
                            href={msg.attachment.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-3 mt-1 rounded-lg border hover:bg-black/5 hover:opacity-90 transition-colors ${isMine ? 'bg-primary/30 border-primary/40 text-white' : 'bg-gray-50 border-gray-200 text-primary'}`}
                          >
                            <div className="p-2 bg-white/20 rounded-md">
                              <FileText className="w-5 h-5 shrink-0" />
                            </div>
                            <span className="truncate flex-1 max-w-[150px] font-medium">{msg.attachment.fileName}</span>
                            <Download className="w-4 h-4 shrink-0 ml-1" />
                          </a>
                        ) : (
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                        )}
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-white/80' : 'text-gray-400'}`}>
                          {formatTime(msg.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-3 border-t border-gray-200 bg-white">
                {/* File Preview Area */}
                {selectedFile && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedFile.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="preview"
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        const fileInput = document.getElementById('chat-file-input') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="w-full flex items-center gap-2">
                  <input
                    id="chat-file-input"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    disabled={isUploading}
                  />
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = 'image/*';
                        fileInputRef.current.click();
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Gửi hình ảnh"
                    disabled={isUploading}
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = '.pdf,.doc,.docx,.zip,.txt';
                        fileInputRef.current.click();
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Gửi tệp đính kèm"
                    disabled={isUploading}
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isUploading ? "Đang tải tệp lên..." : "Nhập tin nhắn..."}
                    className="flex-1 min-w-0 px-4 py-2.5 rounded-full bg-gray-100 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    disabled={isUploading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                    className="mr-16 p-2.5 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Chọn một cuộc trò chuyện</p>
              <p className="text-sm mt-1">để bắt đầu nhắn tin</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors z-10"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
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
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={deletingConversationId != null}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteConversation}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                disabled={deletingConversationId != null}
              >
                {deletingConversationId != null ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
