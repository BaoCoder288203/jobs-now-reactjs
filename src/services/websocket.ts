import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082').replace(/\/+$/, '');

let stompClient: Client | null = null;
let connectPromise: Promise<Client> | null = null;

export async function connectWebSocket(userId?: string | number): Promise<Client> {
  if (stompClient?.connected && userId && !stompClient.connectHeaders?.userId) {
    await disconnectWebSocket();
  }

  if (stompClient?.connected) {
    return Promise.resolve(stompClient);
  }
  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = new Promise((resolve, reject) => {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      reconnectDelay: 5000,
      connectHeaders: userId ? { userId: userId.toString() } : {},
      onConnect: () => {
        resolve(stompClient!);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        reject(frame);
      },
    });
    stompClient.activate();
  });

  return connectPromise;
}

export async function disconnectWebSocket() {
  if (stompClient?.connected) {
    await stompClient.deactivate();
  }
  stompClient = null;
  connectPromise = null;
}

export function subscribeToConversation(
  conversationId: number,
  callback: (message: any) => void
) {
  if (!stompClient?.connected) return null;
  return stompClient.subscribe(
    `/topic/conversation/${conversationId}`,
    (msg) => callback(JSON.parse(msg.body))
  );
}

function subscribeToTopic(
  topic: string,
  callback: (message: any) => void,
  parser: (body: string) => any = JSON.parse
) {
  if (!stompClient?.connected) return null;
  return stompClient.subscribe(topic, (msg) => {
    try {
      callback(parser(msg.body));
    } catch (e) {
      console.error(`Failed to parse WebSocket message from ${topic}`, e);
    }
  });
}

export function subscribeToNotifications(
  userId: number,
  callback: (message: any) => void
) {
  if (!stompClient?.connected) return null;
  return subscribeToTopic(`/topic/notifications/${userId}`, callback);
}

export function subscribeToUnreadCount(
  userId: number,
  callback: (count: number) => void
) {
  return subscribeToTopic(
    `/topic/countUnread/${userId}`,
    callback,
    (body) => parseInt(body, 10)
  );
}

export function subscribeToUserStatus(
  callback: (status: { userId: number; isOnline: boolean; lastSeen?: string }) => void
) {
  return subscribeToTopic(`/topic/user.status`, callback);
}

export function subscribeToConversationData(
  userId: number,
  callback: (conversation: any) => void
) {
  return subscribeToTopic(`/topic/conversation-data/${userId}`, callback);
}

export function sendTextMessage(conversationId: number, senderId: number, content: string) {
  if (!stompClient?.connected) return;
  stompClient.publish({
    destination: '/app/message/text',
    body: JSON.stringify({ conversationId, senderId, content }),
  });
}

export function sendFileMessage(
  conversationId: number,
  senderId: number,
  content: string,
  fileName: string,
  fileType: string,
  filePath: string
) {
  if (!stompClient?.connected) return;
  stompClient.publish({
    destination: '/app/message/file',
    body: JSON.stringify({ conversationId, senderId, content, fileName, fileType, filePath }),
  });
}

export function markMessagesRead(conversationId: number, userId: number) {
  if (!stompClient?.connected) return;
  stompClient.publish({
    destination: '/app/messages/read',
    body: JSON.stringify({ conversationId, userId }),
  });
}

export function getStompClient() {
  return stompClient;
}
