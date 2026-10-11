export type MessageType = 'text' | 'buttons' | 'image' | 'video' | 'audio' | 'voice' | 'document' | 'sticker' | 'location' | 'contact' | 'reaction' | 'pin' | 'poll' | 'forward' | 'otp' | 'disappearing';
export interface InteractiveButton {
    name?: 'quick_reply' | 'cta_url' | 'cta_call' | 'cta_copy';
    displayText?: string;
    text?: string;
    label?: string;
    id?: string;
    buttonId?: string;
    url?: string;
    phoneNumber?: string;
    phone?: string;
    copyCode?: string;
    params?: Record<string, any>;
}
export interface SendButtonsOptions extends BaseMessageOptions {
    title?: string;
    header?: string;
    body?: string;
    text?: string;
    footer?: string;
    buttons: InteractiveButton[];
}
export interface MessageKey {
    remoteJid?: string;
    fromMe?: boolean;
    id: string;
    participant?: string;
}
export interface QuotedMessageOptions {
    key?: MessageKey;
    message?: any;
    quotedKey?: MessageKey;
    quotedText?: string;
}
export interface BaseMessageOptions {
    quoted?: any;
    quotedKey?: MessageKey;
    quotedText?: string;
    ephemeralExpiration?: number;
    mentions?: string[];
}
export interface SendTextOptions extends BaseMessageOptions {
    text: string;
}
export interface SendMediaOptions extends BaseMessageOptions {
    url?: string;
    base64?: string;
    caption?: string;
    fileName?: string;
    mimetype?: string;
    ptt?: boolean;
}
export interface SendLocationOptions extends BaseMessageOptions {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
}
export interface SendContactOptions extends BaseMessageOptions {
    displayName: string;
    vcard?: string;
    contacts?: Array<{
        displayName: string;
        vcard: string;
    }>;
}
export interface SendPollOptions extends BaseMessageOptions {
    name: string;
    values: string[];
    selectableCount?: number;
}
export interface SendOTPOptions {
    code?: string;
    otp?: string;
    appName?: string;
    service?: string;
    expiryMinutes?: number;
}
export interface SendMessageResponse {
    success: boolean;
    messageId: string;
    status: string;
    timestamp?: number;
    codeSent?: string;
    result?: any;
}
export interface EditMessagePayload {
    recipient: string;
    key: MessageKey;
    text: string;
}
export interface DeleteMessagePayload {
    recipient: string;
    key: MessageKey;
}
export interface ReactMessagePayload {
    recipient: string;
    key: MessageKey;
    emoji: string;
}
export interface PinMessagePayload {
    recipient: string;
    key: MessageKey;
    type?: 1 | 0;
    time?: number;
}
//# sourceMappingURL=messages.d.ts.map