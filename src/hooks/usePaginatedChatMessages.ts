import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as chatService from '@/services/chat.service';
import type { MessageResponse } from '@/services/chat.service';
import { mergeMessagePages } from '@/utils/chatMessage';

export function usePaginatedChatMessages() {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const conversationIdRef = useRef<number | null>(null);

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [oldestMessageId, setOldestMessageId] = useState<number | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const reset = useCallback(() => {
    conversationIdRef.current = null;
    setMessages([]);
    setHasMore(false);
    setOldestMessageId(null);
    setError(null);
    setLoadingInitial(false);
    setLoadingOlder(false);
    shouldStickToBottomRef.current = true;
  }, []);

  const loadInitial = useCallback(
    async (conversationId: number) => {
      conversationIdRef.current = conversationId;
      setMessages([]);
      setHasMore(false);
      setOldestMessageId(null);
      setError(null);
      setLoadingInitial(true);
      shouldStickToBottomRef.current = true;

      try {
        const page = await chatService.getMessagesPage(conversationId);
        if (conversationIdRef.current !== conversationId) return;

        setMessages(page.messages);
        setHasMore(page.hasMore);
        setOldestMessageId(page.oldestMessageId);
        requestAnimationFrame(() => scrollToBottom());
      } catch (e) {
        const msg =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message: string }).message)
            : 'Không thể tải tin nhắn';
        setError(msg);
        toast.error(msg);
        throw e;
      } finally {
        setLoadingInitial(false);
      }
    },
    [scrollToBottom],
  );

  const loadOlder = useCallback(async () => {
    const conversationId = conversationIdRef.current;
    if (
      conversationId == null ||
      !hasMore ||
      oldestMessageId == null ||
      loadingOlder ||
      loadingInitial
    ) {
      return;
    }

    const el = messagesContainerRef.current;
    if (!el) return;

    const prevHeight = el.scrollHeight;
    const prevTop = el.scrollTop;
    setLoadingOlder(true);

    try {
      const page = await chatService.getMessagesPage(conversationId, oldestMessageId);
      if (conversationIdRef.current !== conversationId) return;

      setMessages((prev) => mergeMessagePages(page.messages, prev));
      setHasMore(page.hasMore);
      setOldestMessageId(page.oldestMessageId);

      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        container.scrollTop = container.scrollHeight - prevHeight + prevTop;
      });
    } catch (e) {
      console.error('Failed to load older messages', e);
      toast.error('Không thể tải thêm tin nhắn');
    } finally {
      setLoadingOlder(false);
    }
  }, [hasMore, oldestMessageId, loadingOlder, loadingInitial]);

  const appendRealtime = useCallback((msg: MessageResponse) => {
    setMessages((prev) => {
      if (prev.some((m) => m.messageId === msg.messageId)) return prev;
      return [...prev, msg];
    });
    shouldStickToBottomRef.current = true;
  }, []);

  useEffect(() => {
    if (shouldStickToBottomRef.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const onMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 120;

    if (el.scrollTop <= 80 && hasMore && !loadingOlder && !loadingInitial) {
      void loadOlder();
    }
  }, [hasMore, loadingOlder, loadingInitial, loadOlder]);

  return {
    messages,
    messagesContainerRef,
    loadingInitial,
    loadingOlder,
    error,
    hasMore,
    reset,
    loadInitial,
    loadOlder,
    appendRealtime,
    onMessagesScroll,
    scrollToBottom,
  };
}
