export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  sentAt: string;
}

export interface ConversationSummary {
  partnerId: number;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface BondStatus {
  investorUserId: number;
  startupUserId: number;
  messageCount: number;
  active: boolean;
  lastMessageAt: string | null;
}
