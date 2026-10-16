import type { MessageResponse } from '@/services/chat.service';

export const CHAT_MESSAGE_PAGE_SIZE = 10;

export interface ChatMessagesPage {
  messages: MessageResponse[];
  hasMore: boolean;
  oldestMessageId: number | null;
}

/** Normalize paginated API payload (object or legacy full-list array). */
export function parseChatMessagesPage(payload: unknown): ChatMessagesPage {
  if (payload == null) {
    return { messages: [], hasMore: false, oldestMessageId: null };
  }

  if (typeof payload === 'object' && payload !== null && 'data' in payload && 'code' in payload) {
    return parseChatMessagesPage((payload as { data: unknown }).data);
  }

  if (Array.isArray(payload)) {
    const messages = [...payload] as MessageResponse[];
    messages.sort((a, b) => a.messageId - b.messageId);
    return {
      messages,
      hasMore: false,
      oldestMessageId: messages[0]?.messageId ?? null,
    };
  }

  const page = payload as ChatMessagesPage;
  const messages = [...(page.messages ?? [])].sort((a, b) => a.messageId - b.messageId);
  return {
    messages,
    hasMore: !!page.hasMore,
    oldestMessageId: page.oldestMessageId ?? messages[0]?.messageId ?? null,
  };
}

/** Prepend older page; dedupe by messageId; keep ASC for normal scroll. */
export function mergeMessagePages(
  older: MessageResponse[],
  existing: MessageResponse[],
): MessageResponse[] {
  const map = new Map<number, MessageResponse>();
  for (const m of [...older, ...existing]) {
    if (m?.messageId != null) {
      map.set(m.messageId, m);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.messageId - b.messageId);
}
