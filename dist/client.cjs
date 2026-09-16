"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotcastClient = void 0;
const instances_js_1 = require("./modules/instances.js");
const messages_js_1 = require("./modules/messages.js");
const chats_js_1 = require("./modules/chats.js");
const groups_js_1 = require("./modules/groups.js");
const profile_js_1 = require("./modules/profile.js");
const broadcast_js_1 = require("./modules/broadcast.js");
const index_js_1 = require("./webhooks/index.js");
const index_js_2 = require("./socket/index.js");
class BotcastClient {
    config;
    /** Instance Lifecycle & Connection Management */
    instances;
    /** WhatsApp Message Dispatcher (Text, OTP, Media, Polls, Reactions, etc.) */
    messages;
    /** Chats, Contacts, History, and Chat State Management */
    chats;
    /** WhatsApp Group Operations & Administration */
    groups;
    /** Profile, Avatar, About Status, and Privacy Settings */
    profile;
    /** WhatsApp Status Stories & Broadcast Lists */
    broadcast;
    /** Webhook Handler & Middleware */
    webhook;
    /** Real-Time Socket.io Event Gateway Client */
    socket;
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
    constructor(config, socketOptions) {
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
        this.instances = new instances_js_1.InstancesModule(this.config);
        this.messages = new messages_js_1.MessagesModule(this.config);
        this.chats = new chats_js_1.ChatsModule(this.config);
        this.groups = new groups_js_1.GroupsModule(this.config);
        this.profile = new profile_js_1.ProfileModule(this.config);
        this.broadcast = new broadcast_js_1.BroadcastModule(this.config);
        this.webhook = new index_js_1.BotcastWebhook();
        this.socket = new index_js_2.BotcastSocketClient(this.config, {
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
    async sendText(recipient, text) {
        return this.messages.sendText(recipient, text);
    }
    /**
     * Shortcut to send an automated OTP verification code.
     */
    async sendOTP(recipient, options) {
        return this.messages.sendOTP(recipient, options);
    }
    /**
     * Shortcut to check instance connectivity status.
     */
    async getStatus() {
        return this.instances.getStatus();
    }
    /**
     * Shortcut to get the device pairing QR code string.
     */
    async getQR() {
        return this.instances.getQR();
    }
    /**
     * Shortcut to request an 8-digit phone PIN pairing code without scanning QR.
     *
     * @param phoneNumber Recipient phone number with country code (e.g. `201000000000` or `15551234567`)
     */
    async pairWithCode(phoneNumber) {
        return this.instances.pairWithCode(phoneNumber);
    }
    /**
     * Shortcut to verify if a phone number exists on WhatsApp.
     *
     * @param phoneNumber The phone number to check (with country code)
     */
    async checkNumber(phoneNumber) {
        return this.instances.checkNumber(phoneNumber);
    }
}
exports.BotcastClient = BotcastClient;
