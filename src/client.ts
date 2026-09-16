import { BotcastClientConfig } from './types/index.js';
import { InstancesModule } from './modules/instances.js';
import { MessagesModule } from './modules/messages.js';
import { ChatsModule } from './modules/chats.js';
import { GroupsModule } from './modules/groups.js';
import { ProfileModule } from './modules/profile.js';
import { BroadcastModule } from './modules/broadcast.js';
import { BotcastWebhook } from './webhooks/index.js';
import { BotcastSocketClient, BotcastSocketOptions } from './socket/index.js';

export class BotcastClient {
  private config: Required<BotcastClientConfig>;

  /** Instance Lifecycle & Connection Management */
  public instances: InstancesModule;

  /** WhatsApp Message Dispatcher (Text, OTP, Media, Polls, Reactions, etc.) */
  public messages: MessagesModule;

  /** Chats, Contacts, History, and Chat State Management */
  public chats: ChatsModule;

  /** WhatsApp Group Operations & Administration */
  public groups: GroupsModule;

  /** Profile, Avatar, About Status, and Privacy Settings */
  public profile: ProfileModule;

  /** WhatsApp Status Stories & Broadcast Lists */
  public broadcast: BroadcastModule;

  /** Webhook Handler & Middleware */
  public webhook: BotcastWebhook;

  /** Real-Time Socket.io Event Gateway Client */
  public socket: BotcastSocketClient;

  /**
   * Initializes a new Botcast API Client.
   *
   * @param config Client configuration options
   * @param socketOptions Optional Socket.io client overrides
   *
   * @example
   * ```ts
   * import { BotcastClient } from 'botcast-sdk';
   *
   * const botcast = new BotcastClient({
   *   baseUrl: 'https://botcast.site',
   *   instanceId: 'inst_abc123',
   *   instanceToken: 'token_xyz789'
   * });
   *
   * // Listen for real-time events via Socket.io
   * botcast.socket.onMessage((msg) => {
   *   console.log('Incoming message:', msg);
   * });
   *
   * // Send a text message
   * await botcast.messages.sendText('201000000000', 'Hello from Botcast SDK!');
   * ```
   */
  constructor(config: BotcastClientConfig, socketOptions?: BotcastSocketOptions) {
    if (!config.instanceId) {
      throw new Error('BotcastClient requires a valid "instanceId"');
    }
    if (!config.instanceToken) {
      throw new Error('BotcastClient requires a valid "instanceToken"');
    }

    this.config = {
      baseUrl: config.baseUrl || 'https://botcast.site',
      platform: config.platform || 'whatsapp',
      instanceId: config.instanceId,
      instanceToken: config.instanceToken,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries ?? 2,
      headers: config.headers || {},
      autoConnectSocket: config.autoConnectSocket ?? false,
    };

    this.instances = new InstancesModule(this.config);
    this.messages = new MessagesModule(this.config);
    this.chats = new ChatsModule(this.config);
    this.groups = new GroupsModule(this.config);
    this.profile = new ProfileModule(this.config);
    this.broadcast = new BroadcastModule(this.config);
    this.webhook = new BotcastWebhook();
    this.socket = new BotcastSocketClient(this.config, {
      autoConnect: config.autoConnectSocket,
      ...socketOptions,
    });
  }

  // =========================================================================
  // Top-Level Convenience Shortcuts
  // =========================================================================

  /**
   * Shortcut to send a text message.
   */
  public async sendText(recipient: string, text: string) {
    return this.messages.sendText(recipient, text);
  }

  /**
   * Shortcut to send an automated OTP verification code.
   */
  public async sendOTP(recipient: string, options?: { code?: string; appName?: string; expiryMinutes?: number }) {
    return this.messages.sendOTP(recipient, options);
  }

  /**
   * Shortcut to check instance connectivity status.
   */
  public async getStatus() {
    return this.instances.getStatus();
  }

  /**
   * Shortcut to get the device pairing QR code string.
   */
  public async getQR() {
    return this.instances.getQR();
  }

  /**
   * Shortcut to request an 8-digit phone PIN pairing code without scanning QR.
   *
   * @param phoneNumber Recipient phone number with country code (e.g. `201000000000` or `15551234567`)
   */
  public async pairWithCode(phoneNumber: string) {
    return this.instances.pairWithCode(phoneNumber);
  }

  /**
   * Shortcut to verify if a phone number exists on WhatsApp.
   *
   * @param phoneNumber The phone number to check (with country code)
   */
  public async checkNumber(phoneNumber: string) {
    return this.instances.checkNumber(phoneNumber);
  }
}
