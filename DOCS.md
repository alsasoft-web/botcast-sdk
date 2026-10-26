# Botcast SDK Comprehensive Documentation

Welcome to the complete developer guide for `botcast-sdk`. This package provides two core clients:
1. **`BotcastAdminClient`**: For SaaS platforms, partner websites, and administrators to programmatically provision, inspect, renew, and manage WhatsApp & Telegram instances using a Master Partner API Key.
2. **`BotcastClient`**: For interacting with a specific WhatsApp or Telegram instance to send messages, media, OTP codes, manage chats, groups, and listen to real-time webhook events.

---

## Table of Contents
- [Installation](#installation)
- [Authentication & Credentials](#authentication--credentials)
- [BotcastAdminClient (Fleet & Instance Management)](#botcastadminclient-fleet--instance-management)
  - [Initialization](#admin-initialization)
  - [List All Instances](#list-all-instances)
  - [Get Instance Details & Status](#get-instance-details--status)
  - [Create a New Instance](#create-a-new-instance)
  - [Renew an Instance](#renew-an-instance)
  - [Update Instance Settings](#update-instance-settings)
  - [Regenerate Instance Token](#regenerate-instance-token)
  - [Delete an Instance](#delete-an-instance)
- [BotcastClient (Instance Operations & Messaging)](#botcastclient-instance-operations--messaging)
  - [Initialization](#client-initialization)
  - [WhatsApp Pairing (QR Code & Phone PIN)](#whatsapp-pairing)
  - [Telegram Pairing (QR Code & SMS Code)](#telegram-pairing)
  - [Sending Messages & OTP](#sending-messages--otp)
  - [Sending Media & Documents](#sending-media--documents)
  - [Interactive Polls & Location](#interactive-polls--location)
  - [Message Actions (Edit, Delete, Pin, Reactions)](#message-actions)
  - [Group Operations](#group-operations)
- [Webhooks & Real-Time Events](#webhooks--real-time-events)
- [Error Handling](#error-handling)

---

## Installation

```bash
npm install botcast-sdk
# or
pnpm add botcast-sdk
# or
yarn add botcast-sdk
```

---

## Authentication & Credentials

### Master API Key (For Admins / External SaaS Platforms)
Obtain your Master API Key from the Botcast dashboard under **User Profile > Master API Key**.
Format: `bcast_live_<hex_string>`

### Instance Credentials (For Specific Bots / Instances)
Each instance created has a unique `id` (e.g. `ins_paid_abc123`) and a secret `instance_token` (e.g. `bcast_xyz456`).

---

## BotcastAdminClient (Fleet & Instance Management)

Use `BotcastAdminClient` in your backend / server to manage customer instances.

<a name="admin-initialization"></a>
### Initialization

```typescript
import { BotcastAdminClient } from 'botcast-sdk';

const admin = new BotcastAdminClient({
  apiKey: process.env.BOTCAST_API_KEY!, // bcast_live_...
  timeout: 30000,
});
```

### List All Instances

```typescript
const { instances } = await admin.listInstances();

for (const inst of instances) {
  console.log(`[${inst.platform}] ${inst.name} (${inst.id}) - Status: ${inst.status} - Expires: ${inst.expires_at}`);
}
```

### Get Instance Details & Status

```typescript
const { instance } = await admin.getInstance('ins_paid_abc123');

console.log('Status:', instance.status); // 'connected' | 'disconnected' | 'qr_ready'
console.log('Phone Number:', instance.phone_number);
console.log('QR Code String:', instance.qr);
console.log('Pairing Code:', instance.pairingCode);
console.log('Expires At:', instance.expires_at);
```

### Create a New Instance

Admins are zero-payment, so instances are provisioned immediately with full active status and valid future expiry without transaction gateways.

```typescript
const { instance } = await admin.createInstance({
  name: 'Store Branch 1',
  platform: 'whatsapp',        // 'whatsapp' | 'telegram'
  type: 'paid',               // 'paid' | 'dev'
  plan_months: 12,            // 12 months subscription (or set exact expires_at below)
  expires_at: '2027-12-31T23:59:59.000Z', // Optional: Set exact expiration date
  webhook_url: 'https://myapp.com/api/webhooks/botcast',
  allowed_numbers: [],        // Empty for paid (unlimited), or list of sandbox numbers for dev
});

console.log('Created Instance ID:', instance.id);
console.log('Instance Token:', instance.instance_token);
// Store instance.id and instance.instance_token in your database
```

### Renew / Extend an Instance

Extends the instance's subscription directly by month count or by setting an exact date:

```typescript
// Option A: Extend by months
const result = await admin.renewInstance('ins_paid_abc123', {
  months: 12, // Extend by 12 months
});

// Option B: Set exact expiration date
const resultExact = await admin.renewInstance('ins_paid_abc123', {
  expires_at: '2028-06-30T23:59:59.000Z',
});

console.log(result.message);
console.log('New Expiry Date:', result.instance.expires_at);
```

### Update Instance Settings & Expiration

```typescript
await admin.updateInstance('ins_paid_abc123', {
  name: 'Updated Store Name',
  webhook_url: 'https://myapp.com/api/v2/webhooks',
  expires_at: '2028-01-01T00:00:00.000Z', // Optional: Set new exact expiration date
});

// Or use the dedicated expiration helper:
await admin.setExpiration('ins_paid_abc123', '2028-01-01T00:00:00.000Z');
```

### Regenerate Instance Token

```typescript
const { instance_token } = await admin.regenerateInstanceToken('ins_paid_abc123');
console.log('New secret token:', instance_token);
```

### Delete an Instance

```typescript
await admin.deleteInstance('ins_paid_abc123');
console.log('Instance deleted and cleaned up.');
```

---

## BotcastClient (Instance Operations & Messaging)

Use `BotcastClient` to control an individual instance, pair devices, and send messages.

<a name="client-initialization"></a>
### Initialization

```typescript
import { BotcastClient } from 'botcast-sdk';

const bot = new BotcastClient({
  baseUrl: 'https://botcast.site',
  platform: 'whatsapp', // 'whatsapp' or 'telegram'
  instanceId: 'ins_paid_abc123',
  instanceToken: 'bcast_secret_token_123',
});
```

<a name="whatsapp-pairing"></a>
### WhatsApp Pairing

#### Option 1: Pairing with Phone Number Code (No Camera Needed)
```typescript
// Request an 8-digit PIN pairing code
const res = await bot.instances.pairWithCode('201012345678');
console.log('Enter this code in WhatsApp:', res.formattedCode); // e.g. "ABCD-1234"
```

#### Option 2: QR Code Scan
```typescript
// Start the instance socket
await bot.instances.start();

// Get the QR code string
const { qr, status } = await bot.instances.getQR();
if (qr) {
  console.log('Render QR Code in your UI:', qr);
}
```

<a name="telegram-pairing"></a>
### Telegram Pairing

```typescript
// 1. Send SMS / Telegram login code
await bot.instances.verifyCode('+1234567890', '');

// 2. Submit the 5-digit verification code (and optional 2FA password)
const result = await bot.instances.verifyCode('+1234567890', '12345', 'my2faPassword');
console.log('Telegram login status:', result.status);
```

<a name="sending-messages--otp"></a>
### Sending Messages & OTP

#### Send Plain Text
```typescript
const res = await bot.messages.sendText('201012345678', 'Hello from Botcast SDK!');
console.log('Message ID:', res.messageId);
```

#### Send Automated OTP Verification
```typescript
const otp = await bot.messages.sendOTP('201012345678', {
  appName: 'My Store',
  expiryMinutes: 5,
});
console.log('Code Sent:', otp.codeSent);
```

<a name="sending-media--documents"></a>
### Sending Media & Documents

#### Send Image
```typescript
await bot.messages.sendImage('201012345678', {
  imageUrl: 'https://example.com/photo.jpg',
  caption: 'Check out our new catalog!',
});
```

#### Send PDF / Document
```typescript
await bot.messages.sendDocument('201012345678', {
  documentUrl: 'https://example.com/invoice.pdf',
  fileName: 'Invoice_2026.pdf',
  caption: 'Your monthly statement',
});
```

#### Send Voice Note (PTT)
```typescript
await bot.messages.sendAudio('201012345678', {
  audioUrl: 'https://example.com/voicenote.mp3',
  ptt: true,
});
```

<a name="interactive-polls--location"></a>
### Interactive Polls & Location

```typescript
// Send Poll
await bot.messages.sendPoll('201012345678', {
  question: 'What is your preferred delivery time?',
  options: ['Morning (9 AM - 12 PM)', 'Afternoon (1 PM - 5 PM)', 'Evening (6 PM - 9 PM)'],
  selectableCount: 1,
});

// Send Location
await bot.messages.sendLocation('201012345678', {
  latitude: 30.0444,
  longitude: 31.2357,
  name: 'Headquarters',
  address: 'Downtown Cairo, Egypt',
});
```

<a name="message-actions"></a>
### Message Actions (Edit, Delete, Reactions)

```typescript
// React to a message
await bot.messages.react('201012345678', 'message_id_123', '👍');

// Edit sent text message
await bot.messages.editText('201012345678', 'message_id_123', 'Updated message text');

// Revoke / Delete for everyone
await bot.messages.delete('201012345678', 'message_id_123');

// Mark as read
await bot.messages.markAsRead('201012345678', 'message_id_123');
```

<a name="group-operations"></a>
### Group Operations (WhatsApp)

```typescript
// Create a new group
const group = await bot.groups.create('VIP Customers', ['201012345678', '201098765432']);
console.log('New Group JID:', group.groupId);

// Get Group Invite Link
const invite = await bot.groups.getInviteCode(group.groupId);
console.log('Join Link:', invite.inviteUrl);
```

---

## Webhooks & Real-Time Events

Receive incoming messages and connection updates in Express or Next.js:

```typescript
import express from 'express';
import { BotcastWebhook } from 'botcast-sdk';

const app = express();
app.use(express.json());

const webhook = new BotcastWebhook();

// Listen to incoming text messages
webhook.onMessage((msg) => {
  console.log(`[Message from ${msg.sender}]: ${msg.body}`);
});

// Listen to connection status changes
webhook.onStatusChange((event) => {
  console.log(`Instance ${event.instanceId} is now ${event.status}`);
});

// Express route
app.post('/api/webhooks/botcast', webhook.createHandler());

app.listen(3000, () => console.log('Webhook server running on port 3000'));
```

---

## Error Handling

All SDK errors inherit from `BotcastError`:

```typescript
import {
  BotcastError,
  BotcastAuthError,
  BotcastSubscriptionExpiredError,
  BotcastRateLimitError,
} from 'botcast-sdk';

try {
  await bot.messages.sendText('201012345678', 'Hello');
} catch (error) {
  if (error instanceof BotcastAuthError) {
    console.error('Invalid instance token or credentials');
  } else if (error instanceof BotcastSubscriptionExpiredError) {
    console.error('Instance subscription expired on:', error.expiresAt);
  } else if (error instanceof BotcastRateLimitError) {
    console.error('Daily message limit exceeded');
  } else if (error instanceof BotcastError) {
    console.error(`Botcast API error (${error.statusCode}):`, error.message);
  }
}
```
