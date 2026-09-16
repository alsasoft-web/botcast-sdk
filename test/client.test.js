import test from 'node:test';
import assert from 'node:assert';
import {
  BotcastClient,
  BotcastWebhook,
  BotcastError,
  BotcastAuthError,
  BotcastPaymentRequiredError,
  BotcastSubscriptionExpiredError,
  BotcastRateLimitError,
  BotcastValidationError,
  BotcastNotFoundError,
} from '../dist/index.js';

test('BotcastClient initializes properly with valid credentials', () => {
  const client = new BotcastClient({
    baseUrl: 'https://test.botcast.site',
    instanceId: 'inst_test_123',
    instanceToken: 'tok_test_abc',
  });

  assert.ok(client);
  assert.ok(client.messages);
  assert.ok(client.instances);
  assert.ok(client.chats);
  assert.ok(client.groups);
  assert.ok(client.profile);
  assert.ok(client.broadcast);
  assert.ok(client.webhook);
  assert.ok(client.socket);
});

test('BotcastSocketClient initializes and registers listeners correctly', () => {
  const client = new BotcastClient({
    baseUrl: 'https://test.botcast.site',
    instanceId: 'inst_test_123',
    instanceToken: 'tok_test_abc',
  });

  assert.ok(client.socket);
  assert.strictEqual(typeof client.socket.connect, 'function');
  assert.strictEqual(typeof client.socket.disconnect, 'function');
  assert.strictEqual(typeof client.socket.onMessage, 'function');
  assert.strictEqual(typeof client.socket.onMessageStatus, 'function');
  assert.strictEqual(typeof client.socket.onReaction, 'function');
  assert.strictEqual(typeof client.socket.onMessageDeleted, 'function');
  assert.strictEqual(typeof client.socket.onPresence, 'function');
  assert.strictEqual(typeof client.socket.onConnectionUpdate, 'function');
  assert.strictEqual(typeof client.socket.onGroupParticipants, 'function');
  assert.strictEqual(typeof client.socket.onCall, 'function');
  assert.strictEqual(typeof client.socket.onEvent, 'function');
  assert.strictEqual(typeof client.socket.onTelegramMessage, 'function');
  assert.strictEqual(typeof client.socket.onTelegramMessageEdited, 'function');
  assert.strictEqual(typeof client.socket.onTelegramMessageDeleted, 'function');
  assert.strictEqual(typeof client.socket.onTelegramMessageRead, 'function');
  assert.strictEqual(typeof client.socket.onTelegramUserUpdate, 'function');
  assert.strictEqual(typeof client.socket.onTelegramChatAction, 'function');
  assert.strictEqual(typeof client.socket.onTelegramCallbackQuery, 'function');
});

test('BotcastClient throws validation error on missing credentials', () => {
  assert.throws(() => {
    new BotcastClient({ instanceId: '', instanceToken: 'abc' });
  }, /instanceId/);

  assert.throws(() => {
    new BotcastClient({ instanceId: 'inst_123', instanceToken: '' });
  }, /instanceToken/);
});

test('BotcastWebhook dispatches message_received event correctly', async () => {
  const webhook = new BotcastWebhook();
  let receivedPayload = null;

  webhook.onMessage((event) => {
    receivedPayload = event;
  });

  await webhook.handleEvent({
    event: 'message_received',
    instanceId: 'inst_123',
    sender: '201000000000',
    senderJid: '201000000000@s.whatsapp.net',
    message: 'Hello World',
    timestamp: new Date().toISOString(),
  });

  assert.strictEqual(receivedPayload?.sender, '201000000000');
  assert.strictEqual(receivedPayload?.message, 'Hello World');
});

test('Error classes inherit and format properly', () => {
  const authErr = new BotcastAuthError('Bad token');
  assert.strictEqual(authErr.name, 'BotcastAuthError');
  assert.strictEqual(authErr.statusCode, 401);

  const payErr = new BotcastPaymentRequiredError('Pending Fawry');
  assert.strictEqual(payErr.statusCode, 402);

  const expErr = new BotcastSubscriptionExpiredError('Expired', '2026-08-01T00:00:00Z');
  assert.strictEqual(expErr.statusCode, 403);
  assert.strictEqual(expErr.expiresAt, '2026-08-01T00:00:00Z');

  const rateErr = new BotcastRateLimitError('Too many messages');
  assert.strictEqual(rateErr.statusCode, 429);

  const valErr = new BotcastValidationError('Recipient required');
  assert.strictEqual(valErr.statusCode, 400);

  const notFoundErr = new BotcastNotFoundError('Instance not found');
  assert.strictEqual(notFoundErr.statusCode, 404);
});

test('BotcastClient sends text message and builds correct request path', async (t) => {
  const originalFetch = global.fetch;
  let interceptedUrl = '';
  let interceptedBody = null;

  global.fetch = async (url, options) => {
    interceptedUrl = url.toString();
    interceptedBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        messageId: 'msg_test_789',
        status: 'sent',
      }),
    };
  };

  t.after(() => {
    global.fetch = originalFetch;
  });

  const client = new BotcastClient({
    baseUrl: 'https://api.botcast.site',
    instanceId: 'inst_abc',
    instanceToken: 'token_xyz',
  });

  const res = await client.messages.sendText('201000000000', 'Hello WhatsApp!');

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.messageId, 'msg_test_789');
  assert.strictEqual(interceptedUrl, 'https://api.botcast.site/whatsapp/inst_abc/token_xyz/send');
  assert.strictEqual(interceptedBody.recipient, '201000000000');
  assert.strictEqual(interceptedBody.text, 'Hello WhatsApp!');
});

test('BotcastClient handles 402 payment required and 429 rate limit correctly', async (t) => {
  const originalFetch = global.fetch;

  global.fetch = async () => {
    return {
      ok: false,
      status: 402,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        error: 'Payment Required',
        message: 'This instance is awaiting payment confirmation',
      }),
    };
  };

  t.after(() => {
    global.fetch = originalFetch;
  });

  const client = new BotcastClient({
    instanceId: 'inst_abc',
    instanceToken: 'token_xyz',
    maxRetries: 0,
  });

  await assert.rejects(
    async () => {
      await client.messages.sendText('201000000000', 'Test');
    },
    (err) => {
      return err instanceof BotcastPaymentRequiredError && err.statusCode === 402;
    }
  );
});

test('BotcastAdminClient supports setting exact expiration dates on create, update, renew and setExpiration', async (t) => {
  const { BotcastAdminClient } = await import('../dist/index.js');
  const originalFetch = global.fetch;
  const calls = [];

  global.fetch = async (url, options) => {
    calls.push({
      url: url.toString(),
      method: options.method,
      headers: options.headers,
      body: options.body ? JSON.parse(options.body) : null,
    });

    return {
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        message: 'Success',
        instance: {
          id: 'ins_paid_test',
          name: 'Test Instance',
          expires_at: '2027-01-01T00:00:00.000Z',
        },
      }),
    };
  };

  t.after(() => {
    global.fetch = originalFetch;
  });

  const admin = new BotcastAdminClient({
    baseUrl: 'https://api.botcast.site',
    apiKey: 'bcast_live_adminkey123',
  });

  // 1. createInstance with exact expiration date
  await admin.createInstance({
    name: 'Customer WhatsApp',
    expires_at: '2027-01-01T00:00:00.000Z',
  });
  assert.strictEqual(calls[0].url, 'https://api.botcast.site/api/instances');
  assert.strictEqual(calls[0].method, 'POST');
  assert.strictEqual(calls[0].body.expires_at, '2027-01-01T00:00:00.000Z');
  assert.strictEqual(calls[0].headers['x-api-key'], 'bcast_live_adminkey123');

  // 2. renewInstance with exact expiration date
  await admin.renewInstance('ins_paid_test', {
    expires_at: new Date('2028-06-01T00:00:00.000Z'),
  });
  assert.strictEqual(calls[1].url, 'https://api.botcast.site/api/instances/ins_paid_test/renew');
  assert.strictEqual(calls[1].method, 'POST');
  assert.strictEqual(calls[1].body.expires_at, '2028-06-01T00:00:00.000Z');

  // 3. updateInstance with exact expiration date
  await admin.updateInstance('ins_paid_test', {
    expires_at: '2029-01-01T00:00:00.000Z',
  });
  assert.strictEqual(calls[2].url, 'https://api.botcast.site/api/instances/ins_paid_test');
  assert.strictEqual(calls[2].method, 'PUT');
  assert.strictEqual(calls[2].body.expires_at, '2029-01-01T00:00:00.000Z');

  // 4. setExpiration helper
  await admin.setExpiration('ins_paid_test', '2030-01-01T00:00:00.000Z');
  assert.strictEqual(calls[3].url, 'https://api.botcast.site/api/instances/ins_paid_test');
  assert.strictEqual(calls[3].method, 'PUT');
  assert.strictEqual(calls[3].body.expires_at, '2030-01-01T00:00:00.000Z');
});
