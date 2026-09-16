export * from './instances.js';
export * from './messages.js';
export * from './chats.js';
export * from './groups.js';
export * from './profile.js';
export * from './webhooks.js';
export * from './socket.js';
export interface BotcastClientConfig {
    /**
     * The base URL of your Botcast instance or cloud gateway.
     * Default: `https://botcast.site`
     */
    baseUrl?: string;
    /**
     * Platform type: 'whatsapp' or 'telegram'. Default: 'whatsapp'.
     */
    platform?: 'whatsapp' | 'telegram';
    /**
     * Your unique Botcast Instance ID.
     */
    instanceId: string;
    /**
     * The secret Instance Token for authentication.
     */
    instanceToken: string;
    /**
     * Request timeout in milliseconds (default: 30000ms).
     */
    timeout?: number;
    /**
     * Maximum retry attempts on network / rate limit errors (default: 2).
     */
    maxRetries?: number;
    /**
     * Custom HTTP headers to include with every request.
     */
    headers?: Record<string, string>;
    /**
     * Auto-connect the Socket.io real-time client upon initialization (default: false).
     */
    autoConnectSocket?: boolean;
}
//# sourceMappingURL=index.d.ts.map