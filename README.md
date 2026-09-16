# botcast-sdk

Official Node.js and TypeScript SDK for [Botcast](https://botcast.site) — a high-performance, multi-instance API gateway supporting both **WhatsApp** and **Telegram MTProto** (`teleproto`).

[![npm version](https://img.shields.io/npm/v/botcast-sdk.svg?color=blue)](https://www.npmjs.com/package/botcast-sdk)
[![npm downloads](https://img.shields.io/npm/dm/botcast-sdk.svg)](https://www.npmjs.com/package/botcast-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## Features

- **Multi-Platform Support**: Connect and control both **WhatsApp** and **Telegram MTProto** instances with a single unified SDK.
- **Zero Runtime Dependencies**: Built directly on native `fetch` and modern standard web APIs.
- **Strict TypeScript Types**: Fully typed request parameters, response models, error classes, and event payloads.
- **Dual Authentication**:
  - **WhatsApp**: Scan QR code string or request an 8-digit PIN code without a camera.
  - **Telegram**: Scan QR code via _Telegram > Settings > Devices > Link Desktop Device_ or authenticate via phone verification code with optional Cloud 2FA password.
- **Unified Messaging**: Send text messages, automated OTP codes, images, videos, audio, voice notes (PTT), documents, stickers, locations, contact cards, and interactive polls.
- **Message Operations**: Edit sent messages, delete for everyone (revoke), mark as read, reactions, pin messages, and forward.
- **Chat & History Management**: Query dialogs, contact lists, and message history for both platforms.
- **Group Administration**: Create groups, manage participants, configure permission modes, and share invite links (WhatsApp).
- **Real-Time Webhooks**: Built-in router and middleware for processing inbound messages and connection events across Express, Fastify, Next.js, or raw Node HTTP.

---

## Installation

```bash
npm install botcast-sdk
# or
pnpm add botcast-sdk
# or
yarn add botcast-sdk
# or
bun add botcast-sdk
```

---

## Quick Start

### 1. Admin & Fleet Management (Create, Manage & Renew Instances)

Use `BotcastAdminClient` with your Master Partner API Key (`bcast_live_...`) to programmatically create and manage customer instances:

```typescript
import { BotcastAdminClient } from "botcast-sdk";

const admin = new BotcastAdminClient({
  baseUrl: "https://botcast.site",
  apiKey: process.env.BOTCAST_API_KEY!, // Master API Key
});

// List all instances
const { instances } = await admin.listInstances();

// Create a new WhatsApp or Telegram instance for a customer
const { instance } = await admin.createInstance({
  name: "Customer Store 1",
  platform: "whatsapp",
  type: "paid",
  plan_months: 12,
  expires_at: "2027-12-31T23:59:59.000Z", // Optional exact expiration date
});

// Renew subscription (by months or exact date)
await admin.renewInstance(instance.id, { months: 12 });
// or: await admin.setExpiration(instance.id, "2028-06-30T23:59:59.000Z");
```

---

### 2. WhatsApp Client

```typescript
import { BotcastClient } from "botcast-sdk";

const whatsappBot = new BotcastClient({
  baseUrl: "https://botcast.site", // or your self-hosted server URL
  platform: "whatsapp", // 'whatsapp' (default) or 'telegram'
  instanceId: "your_instance_id",
  instanceToken: "your_instance_token",
});

async function main() {
  // Check connectivity
  const status = await whatsappBot.getStatus();
  console.log(
    `WhatsApp state: ${status.status} (${status.phoneNumber || "Unpaired"})`,
  );

  // Send a text message
  const res = await whatsappBot.messages.sendText(
    "201012345678",
    "Hello from WhatsApp via Botcast SDK!",
  );
  console.log("Message sent! ID:", res.messageId);

  // Send a secure 6-digit OTP code
  const otp = await whatsappBot.messages.sendOTP("201012345678", {
    appName: "My App",
    expiryMinutes: 5,
  });
  console.log("Dispatched OTP:", otp.codeSent);
}

main().catch(console.error);
```

---

### 2. Telegram MTProto Client

```typescript
import { BotcastClient } from "botcast-sdk";

const telegramBot = new BotcastClient({
  baseUrl: "https://botcast.site",
  platform: "telegram",
  instanceId: "your_telegram_instance_id",
  instanceToken: "your_telegram_instance_token",
});

async function main() {
  // Check connectivity
  const status = await telegramBot.getStatus();
  console.log(`Telegram state: ${status.status}`);

  // Send a text message to a phone number or @username
  const res = await telegramBot.messages.sendText(
    "+1234567890",
    "Hello from Telegram MTProto!",
  );
  console.log("Message ID:", res.messageId);

  // Send a photo
  await telegramBot.messages.sendImage("+1234567890", {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    caption: "Welcome flyer",
  });

  // Send OTP
  const otp = await telegramBot.messages.sendOTP("+1234567890", {
    appName: "Security Portal",
  });
  console.log("Telegram OTP sent:", otp.codeSent);
}

main().catch(console.error);
```

---

### CommonJS (require)

```javascript
const { BotcastClient } = require("botcast-sdk");

const client = new BotcastClient({
  platform: "telegram", // or 'whatsapp'
  instanceId: "your_instance_id",
  instanceToken: "your_instance_token",
});
```

---

## API Reference

### 1. Device Pairing and Lifecycle (`client.instances`)

```typescript
// 1. Get live status
const status = await client.instances.getStatus();
console.log("State:", status.status); // 'connected' | 'qr_ready' | 'stopped' | 'connecting'

// 2. Option A: Get QR code string for camera scanning
// (WhatsApp: Linked Devices | Telegram: Settings > Devices > Link Desktop Device)
const qr = await client.getQR(); // or client.instances.getQR()
console.log("QR DataURL:", qr.qr);

// 3. Option B: Request Phone Pairing / Login Code
// (WhatsApp sends 8-digit PIN | Telegram sends verification code into app)
const pair = await client.pairWithCode("+1234567890");
console.log("Code request status:", pair);

// 4. Complete Telegram Phone Login (with optional 2FA cloud password)
await client.instances.verifyCode("+1234567890", "12345", "myCloudPassword2fa");

// 5. Socket engine controls
await client.instances.start(); // Boots socket / MTProto connection
await client.instances.stop(); // Suspends socket session
await client.instances.logout(); // Unlinks device and clears session credentials
```

---

### 2. Message Dispatching (`client.messages`)

All messaging methods work across both **WhatsApp** and **Telegram**:

```typescript
// 1. Text message
await client.messages.sendText("+1234567890", "Hello World", {
  mentions: ["1234567890"], // WhatsApp mentions
});

// 2. Image / Photo
await client.messages.sendImage("+1234567890", {
  url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
  caption: "Photo preview",
});

// 3. Video
await client.messages.sendVideo("+1234567890", {
  url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
  caption: "Product tutorial video",
});

// 4. Voice note and audio
await client.messages.sendVoice("+1234567890", {
  url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
});

// 5. Document / PDF / File
await client.messages.sendDocument("+1234567890", {
  url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  fileName: "Invoice_2026.pdf",
  caption: "Monthly invoice statement",
});

// 6. Location coordinates
await client.messages.sendLocation("+1234567890", {
  latitude: 24.7136,
  longitude: 46.6753,
  name: "Kingdom Tower",
  address: "King Fahd Rd, Riyadh, Saudi Arabia",
});

// 7. Contact Card
await client.messages.sendContact("+1234567890", {
  firstName: "Support Agent",
  phone: "+1234567890",
});

// 8. Automated OTP verification code
const otp = await client.messages.sendOTP("+1234567890", {
  appName: "Botcast Portal",
  expiryMinutes: 5,
});
```

---

### 3. Message Operations (`client.messages`)

```typescript
const msgKey = {
  remoteJid: "201012345678@s.whatsapp.net",
  fromMe: true,
  id: "3EB0ABCDEF1234567890",
};

// 1. Edit sent message
await client.messages.edit("201012345678", msgKey, "Corrected text content");

// 2. Delete message for everyone (revoke)
await client.messages.delete("201012345678", msgKey);

// 3. Mark message as read
await client.messages.markAsRead(msgKey);

// 4. Emoji reaction
await client.messages.react("201012345678", msgKey, "STAR");

// 5. Pin message
await client.messages.pin("201012345678", msgKey, 1, 86400);

// 6. Forward message
await client.messages.forward("201012345678", {
  conversation: "Forwarded message text",
});
```

---

### 4. Real-Time Socket.io Event Gateway (`client.socket`)

Stream real-time instance events directly with zero latency over **Socket.io**:

```typescript
import { BotcastClient } from "botcast-sdk";

const client = new BotcastClient({
  baseUrl: "https://botcast.site",
  instanceId: "your_instance_id",
  instanceToken: "your_instance_token",
  autoConnectSocket: true, // or call client.socket.connect() manually
});

// 1. Listen for new incoming/outgoing messages
client.socket.onMessage((msg) => {
  console.log("Real-time message:", msg);
});

// 2. Listen for delivery status & read receipts
client.socket.onMessageStatus((status) => {
  console.log("Message status update:", status);
});

// 3. Listen for emoji reactions
client.socket.onReaction((reaction) => {
  console.log("Reaction event:", reaction);
});

// 4. Listen for deleted/revoked messages
client.socket.onMessageDeleted((del) => {
  console.log("Message deleted:", del);
});

// 5. Listen for user presence (typing, recording, online state)
client.socket.onPresence((presence) => {
  console.log("Presence update:", presence);
});

// 6. Listen for instance connection & QR updates
client.socket.onConnectionUpdate((conn) => {
  console.log("Connection state:", conn.status, conn.qr || conn.pairingCode);
});

// 7. Generic event listener
client.socket.onEvent((event) => {
  console.log("Instance event received:", event.event, event);
});
```

---

### 5. Chats, Contacts, and History (`client.chats`)

```typescript
// 1. List chats / dialogs
const { chats } = await client.chats.list({ limit: 50 });

// 2. List contacts
const { contacts } = await client.chats.listContacts({ limit: 100 });

// 3. List messages for a chat
const { messages } = await client.chats.listMessages({
  chatJid: "201012345678@s.whatsapp.net",
  limit: 50,
});

// 4. Modify WhatsApp chat state (archive, mute, pin, delete)
await client.chats.archive("201012345678@s.whatsapp.net");
await client.chats.mute("201012345678@s.whatsapp.net", 8 * 60 * 60 * 1000); // 8 hours
await client.chats.pin("201012345678@s.whatsapp.net");
```

---

### 6. Webhook Event Handling

The SDK includes a built-in event dispatcher and middleware for handling inbound webhooks from both WhatsApp and Telegram:

#### Express Example

```typescript
import express from "express";
import { BotcastClient } from "botcast-sdk";

const app = express();
app.use(express.json());

const client = new BotcastClient({
  platform: "telegram", // or 'whatsapp'
  instanceId: "inst_123",
  instanceToken: "tok_abc",
});

// Listen for incoming messages
client.webhook.onMessage(async (event) => {
  console.log(
    `Message from ${event.sender}: ${event.message} [Platform: ${event.platform || "whatsapp"}]`,
  );

  if (event.message.trim().toLowerCase() === "ping") {
    await client.messages.sendText(event.sender, "pong");
  }
});

// Listen for connection changes
client.webhook.onConnection(async (event) => {
  console.log(`Instance status updated: ${event.status}`);
});

// Mount middleware on your webhook route
app.post("/webhook/botcast", client.webhook.middleware());

app.listen(3000, () => console.log("Webhook server running on port 3000"));
```

---

## Error Handling

`botcast-sdk` maps API status codes to typed error classes:

```typescript
import {
  BotcastClient,
  BotcastAuthError,
  BotcastPaymentRequiredError,
  BotcastSubscriptionExpiredError,
  BotcastRateLimitError,
  BotcastValidationError,
  BotcastNotFoundError,
} from "botcast-sdk";

try {
  await client.messages.sendText("+1234567890", "Hello World");
} catch (error) {
  if (error instanceof BotcastAuthError) {
    console.error("Invalid instance credentials or token.");
  } else if (error instanceof BotcastPaymentRequiredError) {
    console.error("Instance requires payment confirmation.");
  } else if (error instanceof BotcastSubscriptionExpiredError) {
    console.error("Subscription expired on:", error.expiresAt);
  } else if (error instanceof BotcastRateLimitError) {
    console.error("Daily message limit reached.");
  } else if (error instanceof BotcastValidationError) {
    console.error("Validation error:", error.message, error.details);
  } else if (error instanceof BotcastNotFoundError) {
    console.error("Resource not found:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

---

## Links

- Website: [https://botcast.site](https://botcast.site)
- Documentation: [https://botcast.site/docs](https://botcast.site/docs)
- NPM Package: [https://www.npmjs.com/package/botcast-sdk](https://www.npmjs.com/package/botcast-sdk)
- GitHub Repository: [https://github.com/alsasoft-web/Botcast](https://github.com/alsasoft-web/Botcast)

---

## License

MIT © [Botcast](https://botcast.site)
