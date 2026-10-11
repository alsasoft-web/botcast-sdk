"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesModule = void 0;
const base_js_1 = require("./base.js");
class MessagesModule extends base_js_1.BaseModule {
    /**
     * Sends a raw message payload to the Botcast gateway.
     */
    async send(payload) {
        return this.request({
            method: 'POST',
            path: this.buildPath('send'),
            body: payload,
        });
    }
    /**
     * Sends modern WhatsApp interactive native flow buttons (Quick Reply, CTA URL, Call, Copy Code).
     *
     * @param recipient Target phone number or JID
     * @param buttonsOptions Buttons configuration (body, title, footer, buttons array)
     */
    async sendButtons(recipient, buttonsOptions) {
        return this.request({
            method: 'POST',
            path: this.buildPath('buttons'),
            body: {
                recipient,
                type: 'buttons',
                ...buttonsOptions,
            },
        });
    }
    /**
     * Sends a plain text message.
     *
     * @param recipient Target phone number or JID
     * @param text The message text
     * @param options Additional options (mentions, quoted message, etc.)
     */
    async sendText(recipient, text, options) {
        return this.send({
            recipient,
            type: 'text',
            text,
            ...options,
        });
    }
    /**
     * Sends an automated OTP verification code.
     *
     * @param recipient Target phone number
     * @param options OTP configuration (code, app name, expiry minutes)
     */
    async sendOTP(recipient, options) {
        if (this.config.platform === 'telegram') {
            return this.send({
                recipient,
                type: 'otp',
                ...options,
            });
        }
        return this.request({
            method: 'POST',
            path: this.buildPath('otp'),
            body: {
                recipient,
                ...options,
            },
        });
    }
    /**
     * Sends an image from a URL or Base64 string.
     */
    async sendImage(recipient, imageSource, options) {
        return this.send({
            recipient,
            type: 'image',
            ...imageSource,
            ...options,
        });
    }
    /**
     * Sends a video from a URL or Base64 string.
     */
    async sendVideo(recipient, videoSource, options) {
        return this.send({
            recipient,
            type: 'video',
            ...videoSource,
            ...options,
        });
    }
    /**
     * Sends an audio file from a URL or Base64 string.
     */
    async sendAudio(recipient, audioSource, options) {
        return this.send({
            recipient,
            type: 'audio',
            ...audioSource,
            ...options,
        });
    }
    /**
     * Sends a voice note (push-to-talk waveform audio).
     */
    async sendVoice(recipient, audioSource, options) {
        return this.send({
            recipient,
            type: 'voice',
            ptt: true,
            ...audioSource,
            ...options,
        });
    }
    /**
     * Sends a document / PDF / file from a URL or Base64 string.
     */
    async sendDocument(recipient, docSource, options) {
        return this.send({
            recipient,
            type: 'document',
            ...docSource,
            ...options,
        });
    }
    /**
     * Sends an animated or static sticker.
     */
    async sendSticker(recipient, stickerSource, options) {
        return this.send({
            recipient,
            type: 'sticker',
            ...stickerSource,
            ...options,
        });
    }
    /**
     * Sends GPS location coordinates.
     */
    async sendLocation(recipient, location, options) {
        return this.send({
            recipient,
            type: 'location',
            ...location,
            ...options,
        });
    }
    /**
     * Sends a contact vCard card.
     */
    async sendContact(recipient, contact, options) {
        if (this.config.platform === 'telegram') {
            return this.send({
                recipient,
                type: 'contact',
                ...contact,
                ...options,
            });
        }
        return this.request({
            method: 'POST',
            path: this.buildPath('messages/contact'),
            body: {
                recipient,
                ...contact,
                ...options,
            },
        });
    }
    /**
     * Sends an interactive single/multiple choice poll.
     */
    async sendPoll(recipient, poll, options) {
        return this.send({
            recipient,
            type: 'poll',
            poll,
            ...options,
        });
    }
    /**
     * Forwards an existing message to another chat.
     */
    async forward(recipient, message) {
        return this.request({
            method: 'POST',
            path: this.buildPath('messages/forward'),
            body: { recipient, message },
        });
    }
    /**
     * Edits the text content of a previously sent message.
     */
    async edit(recipient, key, newText) {
        return this.request({
            method: 'POST',
            path: this.buildPath('messages/edit'),
            body: { recipient, key, text: newText },
        });
    }
    /**
     * Deletes a message for everyone in the chat.
     */
    async delete(recipient, key) {
        return this.request({
            method: 'POST',
            path: this.buildPath('messages/delete'),
            body: { recipient, key },
        });
    }
    /**
     * Marks one or more messages as read (sends blue double tick).
     */
    async markAsRead(keys) {
        const keyList = Array.isArray(keys) ? keys : [keys];
        return this.request({
            method: 'POST',
            path: this.buildPath('messages/read'),
            body: { keys: keyList },
        });
    }
    /**
     * Sends an emoji reaction to a message (pass empty string `""` to remove reaction).
     */
    async react(recipient, key, emoji) {
        return this.request({
            method: 'POST',
            path: this.buildPath('messages/reaction'),
            body: { recipient, key, emoji },
        });
    }
    /**
     * Pins a message in a conversation.
     *
     * @param recipient Target chat
     * @param key Message key
     * @param type 1 to pin, 0 to unpin (default: 1)
     * @param duration Duration in seconds (e.g. 86400 for 24h, 604800 for 7d, 2592000 for 30d)
     */
    async pin(recipient, key, type = 1, duration = 86400) {
        return this.request({
            method: 'POST',
            path: this.buildPath('messages/pin'),
            body: { recipient, key, type, time: duration },
        });
    }
}
exports.MessagesModule = MessagesModule;
