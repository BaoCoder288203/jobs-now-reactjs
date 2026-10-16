import type { Session } from '@/types';

let mockSessions: Session[] = [];

export function createSession(userId: string, token: string, device?: string): Session {
  const session: Session = {
    sessionId: `session-${Date.now()}`,
    userId,
    token,
    refreshToken: `refresh-${Date.now()}`,
    device: device || 'Unknown Device',
    ipAddress: '192.168.1.1',
    userAgent: navigator.userAgent,
    lastActivityAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };
  
  mockSessions.push(session);
  return session;
}

export function getSessionsByUserId(userId: string): Session[] {
  return mockSessions.filter(s => s.userId === userId);
}

export function getSessionByToken(token: string): Session | null {
  return mockSessions.find(s => s.token === token) || null;
}

export function deleteSession(sessionId: string): boolean {
  const index = mockSessions.findIndex(s => s.sessionId === sessionId);
  if (index > -1) {
    mockSessions.splice(index, 1);
    return true;
  }
  return false;
}

export function deleteAllSessionsByUserId(userId: string): void {
  mockSessions = mockSessions.filter(s => s.userId !== userId);
}

export function clearAllSessions(): void {
  mockSessions = [];
}

