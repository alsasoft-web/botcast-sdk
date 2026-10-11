import { BaseModule } from './base.js';
import {
  SendMessageResponse,
  SendTextOptions,
  SendMediaOptions,
  SendLocationOptions,
  SendContactOptions,
  SendPollOptions,
  SendOTPOptions,
  SendButtonsOptions,
  MessageKey,
  BaseMessageOptions,
} from '../types/index.js';

export class MessagesModule extends BaseModule {
  /**
   * Sends a raw message payload to the Botcast gateway.
   */
  public async send(payload: Record<string, any>): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>({
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
  public async sendButtons(
    recipient: string,
    buttonsOptions: SendButtonsOptions
  ): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>({
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
  public async sendText(
    recipient: string,
    text: string,
    options?: BaseMessageOptions
  ): Promise<SendMessageResponse> {
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
  public async sendOTP(
    recipient: string,
    options?: SendOTPOptions
  ): Promise<SendMessageResponse & { codeSent: string }> {
    if (this.config.platform === 'telegram') {
      return this.send({
        recipient,
        type: 'otp',
        ...options,
      }) as any;
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
  public async sendImage(
    recipient: string,
    imageSource: { url?: string; base64?: string; caption?: string },
    options?: BaseMessageOptions
  ): Promise<SendMessageResponse> {
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
  public async sendVideo(
    recipient: string,
    videoSource: { url?: string; base64?: string; caption?: string },
    options?: BaseMessageOptions
  ): Promise<SendMessageResponse> {
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
  public async sendAudio(
    recipient: string,
    audioSource: { url?: string; base64?: string; mimetype?: string },
    options?: BaseMessageOptions
  ): Promise<SendMessageResponse> {
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
  public async sendVoice(
    recipient: string,
    audioSource: { url?: string; base64?: string },
    options?: BaseMessageOptions
  ): Promise<SendMessageResponse> {
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
  public async sendDocument(
    recipient: string,
    docSource: { url?: string; base64?: string; fileName?: string; mimetype?: string; caption?: string },
    options?: BaseMessageOptions
  ): Promise<SendMessageResponse> {
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
  public async sendSticker(
    recipient: string,
    stickerSource: { url?: string; base64?: string },
    options?: BaseMessageOptions
  ): Promise<SendMessageResponse> {
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
  public async sendLocation(
    recipient: string,
    location: { latitude: number; longitude: number; name?: string; address?: string },
    options?: BaseMessageOptions
  ): Promise<SendMessageResponse> {
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
  public async sendContact(
    recipient: string,
    contact: { displayName?: string; firstName?: string; phone?: string; vcard?: string; contacts?: Array<{ displayName: string; vcard: string }> },
    options?: BaseMessageOptions
  ): Promise<SendMessageResponse> {
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
  public async sendPoll(
    recipient: string,
    poll: { name: string; values: string[]; selectableCount?: number },
    options?: BaseMessageOptions
  ): Promise<SendMessageResponse> {
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
  public async forward(
    recipient: string,
    message: any
  ): Promise<{ success: boolean; message: string; result?: any }> {
    return this.request({
      method: 'POST',
      path: this.buildPath('messages/forward'),
      body: { recipient, message },
    });
  }

  /**
   * Edits the text content of a previously sent message.
   */
  public async edit(
    recipient: string,
    key: MessageKey,
    newText: string
  ): Promise<{ success: boolean; message: string; result?: any }> {
    return this.request({
      method: 'POST',
      path: this.buildPath('messages/edit'),
      body: { recipient, key, text: newText },
    });
  }

  /**
   * Deletes a message for everyone in the chat.
   */
  public async delete(
    recipient: string,
    key: MessageKey
  ): Promise<{ success: boolean; message: string; result?: any }> {
    return this.request({
      method: 'POST',
      path: this.buildPath('messages/delete'),
      body: { recipient, key },
    });
  }

  /**
   * Marks one or more messages as read (sends blue double tick).
   */
  public async markAsRead(
    keys: MessageKey | MessageKey[]
  ): Promise<{ success: boolean; message: string; result?: any }> {
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
  public async react(
    recipient: string,
    key: MessageKey,
    emoji: string
  ): Promise<{ success: boolean; message: string; result?: any }> {
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
  public async pin(
    recipient: string,
    key: MessageKey,
    type: 1 | 0 = 1,
    duration: number = 86400
  ): Promise<{ success: boolean; message: string; result?: any }> {
    return this.request({
      method: 'POST',
      path: this.buildPath('messages/pin'),
      body: { recipient, key, type, time: duration },
    });
  }
}
