/**
 * Socket.io Real-Time Event Types for Botcast SDK
 */

export interface SocketAuthenticatedEvent {
  success: boolean;
  instanceId: string;
  instanceName?: string;
  platform?: string;
  status?: string;
  phoneNumber?: string | null;
  timestamp: string;
}

export interface SocketMessagesUpsertEvent {
  instanceId: string;
  type: string;
  messages: any[];
  timestamp?: number;
}

export interface SocketMessagesUpdateEvent {
  instanceId: string;
  updates: Array<{
    key: {
      remoteJid?: string;
      fromMe?: boolean;
      id?: string;
      participant?: string;
    };
    update: {
      status?: number | string;
      pollUpdates?: any;
      [key: string]: any;
    };
  }>;
  timestamp?: number;
}

export interface SocketMessageStatusEvent {
  instanceId: string;
  key: {
    remoteJid?: string;
    fromMe?: boolean;
    id?: string;
    participant?: string;
  };
  status: number | string;
  update: Record<string, any>;
  timestamp?: number;
}

export interface SocketMessageReactionEvent {
  instanceId: string;
  chatJid: string;
  messageId: string;
  emoji: string;
  senderJid: string;
  fromMe: boolean;
  timestamp?: number;
}

export interface SocketMessageDeletedEvent {
  instanceId: string;
  chatJid: string;
  messageId: string;
  timestamp?: number;
}

export interface SocketChatMessageEvent {
  instanceId: string;
  chatJid?: string;
  fromMe?: number | boolean;
  body?: string;
  messageType?: string;
  timestamp?: number;
  id?: string;
}

export interface SocketChatsUpsertEvent {
  instanceId: string;
  chats: any[];
  timestamp?: number;
}

export interface SocketChatsUpdateEvent {
  instanceId: string;
  updates: any[];
  timestamp?: number;
}

export interface SocketChatsDeleteEvent {
  instanceId: string;
  deletions: any[];
  timestamp?: number;
}

export interface SocketContactsUpsertEvent {
  instanceId: string;
  contacts?: any[];
  timestamp?: number;
}

export interface SocketContactsUpdateEvent {
  instanceId: string;
  updates?: any[];
  timestamp?: number;
}

export interface SocketPresenceUpdateEvent {
  instanceId: string;
  id?: string;
  presences?: Record<string, { lastKnownPresence?: string; lastSeen?: number }>;
  presence?: any;
  timestamp?: number;
}

export interface SocketGroupParticipantsUpdateEvent {
  instanceId: string;
  update: {
    id: string;
    author?: string;
    participants: string[];
    action: "add" | "remove" | "promote" | "demote";
  };
  timestamp?: number;
}

export interface SocketGroupsUpdateEvent {
  instanceId: string;
  updates: any[];
  timestamp?: number;
}

export interface SocketInstanceUpdateEvent {
  instanceId: string;
  status?: "disconnected" | "connecting" | "qr_ready" | "connected" | "stopped";
  qr?: string | null;
  pairingCode?: string | null;
  phoneNumber?: string | null;
  profileName?: string | null;
  profilePicUrl?: string | null;
  profileBio?: string | null;
  expired?: boolean;
  expires_at?: string | null;
  timestamp?: number;
}

export interface SocketCallEvent {
  instanceId: string;
  calls: any[];
  timestamp?: number;
}

export interface SocketPollUpdateEvent {
  instanceId: string;
  key: any;
  pollUpdates: any;
  timestamp?: number;
}

export interface SocketGenericEvent {
  instanceId: string;
  event: string;
  timestamp: number;
  [key: string]: any;
}

export interface SocketTelegramMessageEvent {
  instanceId: string;
  messageId: number | string;
  chatId: string;
  senderId: string;
  text: string;
  fromMe: boolean;
  timestamp: number;
}

export interface SocketTelegramMessageEditedEvent {
  instanceId: string;
  messageId: number | string;
  chatId: string;
  text: string;
}

export interface SocketTelegramMessageDeletedEvent {
  instanceId: string;
  deletedIds: Array<number | string>;
}

export interface SocketTelegramMessageReadEvent {
  instanceId: string;
  chatId: string;
  maxId?: string | null;
  out: boolean;
}

export interface SocketTelegramUserUpdateEvent {
  instanceId: string;
  userId: string;
  online: boolean;
  typing: boolean;
  lastSeen?: any;
}

export interface SocketTelegramChatActionEvent {
  instanceId: string;
  chatId: string;
  participants: string[];
  userJoined: boolean;
  userLeft: boolean;
}

export interface SocketTelegramCallbackQueryEvent {
  instanceId: string;
  queryId?: string | null;
  chatId?: string | null;
  data?: string | null;
  senderId?: string | null;
}

/**
 * Event Map for Strong Typing in Socket Listeners
 */
export interface BotcastSocketEventMap {
  authenticated: SocketAuthenticatedEvent;
  "messages.upsert": SocketMessagesUpsertEvent;
  "messages.update": SocketMessagesUpdateEvent;
  "messages.delete": { instanceId: string; item: any; timestamp?: number };
  "messages.reaction": { instanceId: string; reactions: any[]; timestamp?: number };
  message_status: SocketMessageStatusEvent;
  message_reaction: SocketMessageReactionEvent;
  message_deleted: SocketMessageDeletedEvent;
  chat_message: SocketChatMessageEvent;
  "chats.upsert": SocketChatsUpsertEvent;
  "chats.update": SocketChatsUpdateEvent;
  "chats.delete": SocketChatsDeleteEvent;
  chats_update: { instanceId: string; timestamp?: number };
  "contacts.upsert": SocketContactsUpsertEvent;
  "contacts.update": SocketContactsUpdateEvent;
  contacts_update: { instanceId: string; timestamp?: number };
  "presence.update": SocketPresenceUpdateEvent;
  presence_update: SocketPresenceUpdateEvent;
  "group-participants.update": SocketGroupParticipantsUpdateEvent;
  "groups.update": SocketGroupsUpdateEvent;
  "connection.update": SocketInstanceUpdateEvent;
  instance_update: SocketInstanceUpdateEvent;
  call: SocketCallEvent;
  poll_update: SocketPollUpdateEvent;
  instance_event: SocketGenericEvent;

  // Telegram-specific event bindings
  "telegram.message": SocketTelegramMessageEvent;
  "telegram.message_edited": SocketTelegramMessageEditedEvent;
  "telegram.message_deleted": SocketTelegramMessageDeletedEvent;
  "telegram.message_read": SocketTelegramMessageReadEvent;
  "telegram.user_update": SocketTelegramUserUpdateEvent;
  "telegram.chat_action": SocketTelegramChatActionEvent;
  "telegram.callback_query": SocketTelegramCallbackQueryEvent;

  connect: void;
  disconnect: string;
  connect_error: Error;
}

export type SocketEventHandler<T = any> = (data: T) => void | Promise<void>;

