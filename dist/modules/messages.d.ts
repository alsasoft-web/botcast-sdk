import { BaseModule } from './base.js';
import { SendMessageResponse, SendOTPOptions, SendButtonsOptions, MessageKey, BaseMessageOptions } from '../types/index.js';
export declare class MessagesModule extends BaseModule {
    /**
     * Sends a raw message payload to the Botcast gateway.
     */
    send(payload: Record<string, any>): Promise<SendMessageResponse>;
    /**
     * Sends modern WhatsApp interactive native flow buttons (Quick Reply, CTA URL, Call, Copy Code).
     *
     * @param recipient Target phone number or JID
     * @param buttonsOptions Buttons configuration (body, title, footer, buttons array)
     */
    sendButtons(recipient: string, buttonsOptions: SendButtonsOptions): Promise<SendMessageResponse>;
    /**
     * Sends a plain text message.
     *
     * @param recipient Target phone number or JID
     * @param text The message text
     * @param options Additional options (mentions, quoted message, etc.)
     */
    sendText(recipient: string, text: string, options?: BaseMessageOptions): Promise<SendMessageResponse>;
    /**
     * Sends an automated OTP verification code.
     *
     * @param recipient Target phone number
     * @param options OTP configuration (code, app name, expiry minutes)
     */
    sendOTP(recipient: string, options?: SendOTPOptions): Promise<SendMessageResponse & {
        codeSent: string;
    }>;
    /**
     * Sends an image from a URL or Base64 string.
     */
    sendImage(recipient: string, imageSource: {
        url?: string;
        base64?: string;
        caption?: string;
    }, options?: BaseMessageOptions): Promise<SendMessageResponse>;
    /**
     * Sends a video from a URL or Base64 string.
     */
    sendVideo(recipient: string, videoSource: {
        url?: string;
        base64?: string;
        caption?: string;
    }, options?: BaseMessageOptions): Promise<SendMessageResponse>;
    /**
     * Sends an audio file from a URL or Base64 string.
     */
    sendAudio(recipient: string, audioSource: {
        url?: string;
        base64?: string;
        mimetype?: string;
    }, options?: BaseMessageOptions): Promise<SendMessageResponse>;
    /**
     * Sends a voice note (push-to-talk waveform audio).
     */
    sendVoice(recipient: string, audioSource: {
        url?: string;
        base64?: string;
    }, options?: BaseMessageOptions): Promise<SendMessageResponse>;
    /**
     * Sends a document / PDF / file from a URL or Base64 string.
     */
    sendDocument(recipient: string, docSource: {
        url?: string;
        base64?: string;
        fileName?: string;
        mimetype?: string;
        caption?: string;
    }, options?: BaseMessageOptions): Promise<SendMessageResponse>;
    /**
     * Sends an animated or static sticker.
     */
    sendSticker(recipient: string, stickerSource: {
        url?: string;
        base64?: string;
    }, options?: BaseMessageOptions): Promise<SendMessageResponse>;
    /**
     * Sends GPS location coordinates.
     */
    sendLocation(recipient: string, location: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
    }, options?: BaseMessageOptions): Promise<SendMessageResponse>;
    /**
     * Sends a contact vCard card.
     */
    sendContact(recipient: string, contact: {
        displayName?: string;
        firstName?: string;
        phone?: string;
        vcard?: string;
        contacts?: Array<{
            displayName: string;
            vcard: string;
        }>;
    }, options?: BaseMessageOptions): Promise<SendMessageResponse>;
    /**
     * Sends an interactive single/multiple choice poll.
     */
    sendPoll(recipient: string, poll: {
        name: string;
        values: string[];
        selectableCount?: number;
    }, options?: BaseMessageOptions): Promise<SendMessageResponse>;
    /**
     * Forwards an existing message to another chat.
     */
    forward(recipient: string, message: any): Promise<{
        success: boolean;
        message: string;
        result?: any;
    }>;
    /**
     * Edits the text content of a previously sent message.
     */
    edit(recipient: string, key: MessageKey, newText: string): Promise<{
        success: boolean;
        message: string;
        result?: any;
    }>;
    /**
     * Deletes a message for everyone in the chat.
     */
    delete(recipient: string, key: MessageKey): Promise<{
        success: boolean;
        message: string;
        result?: any;
    }>;
    /**
     * Marks one or more messages as read (sends blue double tick).
     */
    markAsRead(keys: MessageKey | MessageKey[]): Promise<{
        success: boolean;
        message: string;
        result?: any;
    }>;
    /**
     * Sends an emoji reaction to a message (pass empty string `""` to remove reaction).
     */
    react(recipient: string, key: MessageKey, emoji: string): Promise<{
        success: boolean;
        message: string;
        result?: any;
    }>;
    /**
     * Pins a message in a conversation.
     *
     * @param recipient Target chat
     * @param key Message key
     * @param type 1 to pin, 0 to unpin (default: 1)
     * @param duration Duration in seconds (e.g. 86400 for 24h, 604800 for 7d, 2592000 for 30d)
     */
    pin(recipient: string, key: MessageKey, type?: 1 | 0, duration?: number): Promise<{
        success: boolean;
        message: string;
        result?: any;
    }>;
}
//# sourceMappingURL=messages.d.ts.map