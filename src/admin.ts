import { BotcastError } from './errors.js';
import { BOTCAST_OFFICIAL_URL } from './types/index.js';

export interface BotcastAdminConfig {
  /**
   * The official Botcast platform gateway URL.
   * Fixed and locked to `https://botcast.site` (cannot be changed).
   */
  baseUrl?: 'https://botcast.site' | string;
  apiKey: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface CreateAdminInstanceOptions {
  name: string;
  platform?: 'whatsapp' | 'telegram';
  type?: 'dev' | 'paid';
  plan_months?: number;
  allowed_numbers?: string[];
  webhook_url?: string;
  target_user_id?: number;
  expires_at?: string | Date;
  expiresAt?: string | Date;
}

export interface AdminInstanceRecord {
  id: string;
  user_id: number;
  name: string;
  instance_token: string;
  platform: 'whatsapp' | 'telegram';
  type: 'dev' | 'paid';
  status: string;
  allowed_numbers: string[];
  webhook_url: string | null;
  plan_months: number;
  expires_at: string | null;
  is_expired?: boolean;
  qr?: string | null;
  pairingCode?: string | null;
  created_at: string;
}

export class BotcastAdminClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: BotcastAdminConfig) {
    if (!config.apiKey) {
      throw new Error('BotcastAdminClient requires a valid "apiKey" (e.g. bcast_live_...)');
    }
    if (config.baseUrl && config.baseUrl.replace(/\/+$/, '') !== BOTCAST_OFFICIAL_URL) {
      throw new Error(
        `Changing the Botcast website URL is not allowed. The SDK is locked to ${BOTCAST_OFFICIAL_URL}.`
      );
    }
    this.baseUrl = BOTCAST_OFFICIAL_URL;
    this.apiKey = config.apiKey.trim();
    this.timeout = config.timeout || 30000;
    this.headers = config.headers || {};
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const mergedHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...this.headers,
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers: mergedHeaders,
        signal: controller.signal,
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new BotcastError(
          body.message || body.error || `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          body
        );
      }
      return body as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new BotcastError(`Request timed out after ${this.timeout}ms`, 408);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Lists all instances under this admin/partner account with live statuses and stats.
   */
  public async listInstances(): Promise<{ instances: AdminInstanceRecord[] }> {
    return this.request('/api/instances', { method: 'GET' });
  }

  /**
   * Retrieves single instance details including QR code, pairing code, status, and expiry.
   */
  public async getInstance(instanceId: string): Promise<{ instance: AdminInstanceRecord }> {
    return this.request(`/api/instances/${instanceId}`, { method: 'GET' });
  }

  /**
   * Creates and immediately provisions a new WhatsApp or Telegram instance.
   * Admins are zero-payment, so instances are provisioned as active paid instances.
   */
  public async createInstance(options: CreateAdminInstanceOptions): Promise<{
    message: string;
    instance: AdminInstanceRecord;
  }> {
    const rawExp = options.expires_at || options.expiresAt;
    const expires_at = rawExp
      ? rawExp instanceof Date
        ? rawExp.toISOString()
        : new Date(rawExp).toISOString()
      : undefined;

    return this.request('/api/instances', {
      method: 'POST',
      body: JSON.stringify({
        name: options.name,
        platform: options.platform || 'whatsapp',
        type: options.type || 'paid',
        plan_months: options.plan_months || 12,
        allowed_numbers: options.allowed_numbers || [],
        webhook_url: options.webhook_url || '',
        target_user_id: options.target_user_id,
        expires_at,
      }),
    });
  }

  /**
   * Programmatically renews an instance's subscription without payment transactions.
   * Supports either extending by months or setting an exact expiration date.
   */
  public async renewInstance(
    instanceId: string,
    options?: {
      months?: number;
      plan_months?: number;
      expires_at?: string | Date;
      expiresAt?: string | Date;
    }
  ): Promise<{ success: boolean; message: string; instance: AdminInstanceRecord }> {
    const rawExp = options?.expires_at || options?.expiresAt;
    const expires_at = rawExp
      ? rawExp instanceof Date
        ? rawExp.toISOString()
        : new Date(rawExp).toISOString()
      : undefined;

    return this.request(`/api/instances/${instanceId}/renew`, {
      method: 'POST',
      body: JSON.stringify({
        months: options?.months || options?.plan_months || (expires_at ? undefined : 12),
        expires_at,
      }),
    });
  }

  /**
   * Updates instance configuration (name, webhook URL, allowed recipient numbers, expiration date).
   */
  public async updateInstance(
    instanceId: string,
    updates: {
      name?: string;
      webhook_url?: string;
      allowed_numbers?: string[];
      expires_at?: string | Date | null;
      expiresAt?: string | Date | null;
    }
  ): Promise<{ message: string; instance: AdminInstanceRecord }> {
    const rawExp = updates.expires_at !== undefined ? updates.expires_at : updates.expiresAt;
    let expires_at: string | null | undefined = undefined;
    if (rawExp !== undefined) {
      if (rawExp === null) {
        expires_at = null;
      } else {
        expires_at = rawExp instanceof Date ? rawExp.toISOString() : new Date(rawExp).toISOString();
      }
    }

    return this.request(`/api/instances/${instanceId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...updates,
        expires_at,
      }),
    });
  }

  /**
   * Directly sets or clears the exact expiration date for an instance.
   *
   * @param instanceId Target instance ID (e.g. `ins_paid_...`)
   * @param expiresAt Date instance, ISO string (e.g. `2027-01-01T00:00:00.000Z`), or `null` to remove expiry.
   */
  public async setExpiration(
    instanceId: string,
    expiresAt: string | Date | null
  ): Promise<{ message: string; instance: AdminInstanceRecord }> {
    return this.updateInstance(instanceId, { expires_at: expiresAt });
  }

  /**
   * Regenerates secret instance token for an instance.
   */
  public async regenerateInstanceToken(
    instanceId: string
  ): Promise<{ message: string; instance_token: string }> {
    return this.request(`/api/instances/${instanceId}/regenerate-token`, {
      method: 'POST',
    });
  }

  /**
   * Deletes and cleans up an instance.
   */
  public async deleteInstance(
    instanceId: string
  ): Promise<{ message: string; instanceId: string }> {
    return this.request(`/api/instances/${instanceId}`, {
      method: 'DELETE',
    });
  }
}
