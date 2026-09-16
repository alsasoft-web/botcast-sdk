import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client';
import {
  BotcastSocketEventMap,
  SocketEventHandler,
  SocketMessagesUpsertEvent,
  SocketChatMessageEvent,
  SocketMessageStatusEvent,
  SocketMessageReactionEvent,
  SocketMessageDeletedEvent,
  SocketPresenceUpdateEvent,
  SocketInstanceUpdateEvent,
  SocketGroupParticipantsUpdateEvent,
  SocketCallEvent,
  SocketGenericEvent,
  SocketTelegramMessageEvent,
  SocketTelegramMessageEditedEvent,
  SocketTelegramMessageDeletedEvent,
  SocketTelegramMessageReadEvent,
  SocketTelegramUserUpdateEvent,
  SocketTelegramChatActionEvent,
  SocketTelegramCallbackQueryEvent,
} from '../types/socket.js';
import { BotcastClientConfig } from '../types/index.js';

export interface BotcastSocketOptions extends Partial<ManagerOptions & SocketOptions> {
  /**
   * Automatically initiate the socket connection upon client creation.
   * Default: false
   */
  autoConnect?: boolean;
}

/**
 * BotcastSocketClient
 * Real-time event streaming client powered by Socket.io.
 * Provides authenticated multi-tenant real-time subscriptions to WhatsApp and Telegram instance events.
 */
export class BotcastSocketClient {
  private socket: Socket | null = null;
  private config: Required<BotcastClientConfig>;
  private socketOptions: BotcastSocketOptions;

  constructor(config: Required<BotcastClientConfig>, options: BotcastSocketOptions = {}) {
    this.config = config;
    this.socketOptions = options;

    if (options.autoConnect) {
      this.connect();
    }
  }

  /**
   * Establish the real-time Socket.io connection to the Botcast Gateway.
   */
  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const { baseUrl, instanceId, instanceToken } = this.config;
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

    this.socket = io(cleanBaseUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: {
        instanceId,
        token: instanceToken,
      },
      query: {
        instanceId,
        token: instanceToken,
      },
      extraHeaders: {
        'x-instance-id': instanceId,
        'x-instance-token': instanceToken,
      },
      ...this.socketOptions,
    });

    return this.socket;
  }

  /**
   * Disconnect the active Socket.io connection.
   */
  public disconnect(): this {
    if (this.socket) {
      this.socket.disconnect();
    }
    return this;
  }

  /**
   * Check whether the socket is currently connected.
   */
  public isConnected(): boolean {
    return Boolean(this.socket && this.socket.connected);
  }

  /**
   * Retrieve the underlying Socket.io-client Socket instance.
   */
  public getRawSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Register a typed event listener for instance events.
   *
   * @param event The event name
   * @param handler The event callback function
   */
  public on<K extends keyof BotcastSocketEventMap>(
    event: K,
    handler: SocketEventHandler<BotcastSocketEventMap[K]>,
  ): this {
    const s = this.ensureSocket();
    s.on(event as string, handler as any);
    return this;
  }

  /**
   * Register a one-time event listener.
   */
  public once<K extends keyof BotcastSocketEventMap>(
    event: K,
    handler: SocketEventHandler<BotcastSocketEventMap[K]>,
  ): this {
    const s = this.ensureSocket();
    s.once(event as string, handler as any);
    return this;
  }

  /**
   * Remove an event listener.
   */
  public off<K extends keyof BotcastSocketEventMap>(
    event: K,
    handler?: SocketEventHandler<BotcastSocketEventMap[K]>,
  ): this {
    if (this.socket) {
      if (handler) {
        this.socket.off(event as string, handler as any);
      } else {
        this.socket.off(event as string);
      }
    }
    return this;
  }

  /**
   * Register a wildcard listener for all incoming events.
   */
  public onAny(handler: (event: string, data: any) => void): this {
    const s = this.ensureSocket();
    s.onAny(handler);
    return this;
  }

  /**
   * Remove a wildcard listener.
   */
  public offAny(handler?: (event: string, data: any) => void): this {
    if (this.socket) {
      this.socket.offAny(handler);
    }
    return this;
  }

  // =========================================================================
  // High-Level Convenience Event Listeners
  // =========================================================================

  /**
   * Listen for incoming and outgoing messages (messages.upsert or chat_message).
   */
  public onMessage(
    handler: SocketEventHandler<SocketMessagesUpsertEvent | SocketChatMessageEvent>,
  ): this {
    this.on('messages.upsert', handler as any);
    this.on('chat_message', handler as any);
    return this;
  }

  /**
   * Listen for message delivery status updates (sent, delivered, read receipts).
   */
  public onMessageStatus(handler: SocketEventHandler<SocketMessageStatusEvent>): this {
    return this.on('message_status', handler);
  }

  /**
   * Listen for message reactions (emoji added/removed).
   */
  public onReaction(handler: SocketEventHandler<SocketMessageReactionEvent>): this {
    return this.on('message_reaction', handler);
  }

  /**
   * Listen for message revocations/deletions.
   */
  public onMessageDeleted(handler: SocketEventHandler<SocketMessageDeletedEvent>): this {
    return this.on('message_deleted', handler);
  }

  /**
   * Listen for user presence changes (composing, recording, online, offline).
   */
  public onPresence(handler: SocketEventHandler<SocketPresenceUpdateEvent>): this {
    this.on('presence.update', handler);
    this.on('presence_update', handler);
    return this;
  }

  /**
   * Listen for instance connection changes, QR code generation, and pairing codes.
   */
  public onConnectionUpdate(handler: SocketEventHandler<SocketInstanceUpdateEvent>): this {
    this.on('connection.update', handler);
    this.on('instance_update', handler);
    return this;
  }

  /**
   * Listen for WhatsApp group participant changes (add, remove, promote, demote).
   */
  public onGroupParticipants(
    handler: SocketEventHandler<SocketGroupParticipantsUpdateEvent>,
  ): this {
    return this.on('group-participants.update', handler);
  }

  /**
   * Listen for incoming WhatsApp calls.
   */
  public onCall(handler: SocketEventHandler<SocketCallEvent>): this {
    return this.on('call', handler);
  }

  /**
   * Listen for generic instance event stream.
   */
  public onEvent(handler: SocketEventHandler<SocketGenericEvent>): this {
    return this.on('instance_event', handler);
  }

  // =========================================================================
  // Telegram-Specific Event Listeners
  // =========================================================================

  /**
   * Listen for Telegram new messages.
   */
  public onTelegramMessage(handler: SocketEventHandler<SocketTelegramMessageEvent>): this {
    return this.on('telegram.message', handler);
  }

  /**
   * Listen for Telegram message edits.
   */
  public onTelegramMessageEdited(
    handler: SocketEventHandler<SocketTelegramMessageEditedEvent>,
  ): this {
    return this.on('telegram.message_edited', handler);
  }

  /**
   * Listen for Telegram message deletions.
   */
  public onTelegramMessageDeleted(
    handler: SocketEventHandler<SocketTelegramMessageDeletedEvent>,
  ): this {
    return this.on('telegram.message_deleted', handler);
  }

  /**
   * Listen for Telegram message read receipts.
   */
  public onTelegramMessageRead(
    handler: SocketEventHandler<SocketTelegramMessageReadEvent>,
  ): this {
    return this.on('telegram.message_read', handler);
  }

  /**
   * Listen for Telegram user updates (presence, typing, online status).
   */
  public onTelegramUserUpdate(
    handler: SocketEventHandler<SocketTelegramUserUpdateEvent>,
  ): this {
    return this.on('telegram.user_update', handler);
  }

  /**
   * Listen for Telegram chat actions (user joined, user left, etc.).
   */
  public onTelegramChatAction(
    handler: SocketEventHandler<SocketTelegramChatActionEvent>,
  ): this {
    return this.on('telegram.chat_action', handler);
  }

  /**
   * Listen for Telegram inline & callback button queries.
   */
  public onTelegramCallbackQuery(
    handler: SocketEventHandler<SocketTelegramCallbackQueryEvent>,
  ): this {
    return this.on('telegram.callback_query', handler);
  }

  private ensureSocket(): Socket {
    if (!this.socket) {
      this.connect();
    }
    return this.socket!;
  }
}
