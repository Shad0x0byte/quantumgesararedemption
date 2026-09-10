// src/lib/api/client.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8002/api';

/** Unique key per mutation — protects against double-clicks/retries. */
export function idempotencyKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  message?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  // Still send Authorization header for environments that support it
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Appends ?_token=xxx to the URL.
 * This is the reliable fallback for nginx/cPanel hosts that strip
 * the Authorization header before PHP sees it.
 */
function appendToken(endpoint: string): string {
  const token = getToken();
  if (!token) return endpoint;
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}_token=${encodeURIComponent(token)}`;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let data: any;
  try {
    data = await response.json();
  } catch {
    return { success: false, error: 'Invalid server response' };
  }

  if (!response.ok) {
    return {
      success: false,
      error:   data.error   || 'An error occurred',
      errors:  data.errors,
      message: data.message,
    };
  }

  return {
    success: true,
    data:    data.data,
    message: data.message,
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 1,
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${appendToken(endpoint)}`;
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Mutations already carry idempotency keys, so a single retry is safe.
      if (attempt > 0) await new Promise((r) => setTimeout(r, 600 * attempt));
      const response = await fetch(url, {
        ...options,
        headers: buildHeaders(options.headers as Record<string, string>),
      });
      return await handleResponse<T>(response);
    } catch (error) {
      lastError = error;
      console.error(`API Request Error (attempt ${attempt + 1}):`, error);
    }
  }
  void lastError;
  return { success: false, error: 'Network error. Please check your connection.' };
}

// ── Auth ──────────────────────────────────────────────────────────────────

export const login = (email: string, password: string) =>
  apiRequest('/auth/login.php', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });

export const register = (userData: Record<string, unknown>) =>
  apiRequest('/auth/register.php', {
    method: 'POST',
    body:   JSON.stringify(userData),
  });

export const logout = () =>
  apiRequest('/auth/logout.php', { method: 'POST' });

export const getCurrentUser = () =>
  apiRequest('/user/profile.php', { method: 'GET' });

// ── Accounts ──────────────────────────────────────────────────────────────

export const getAccounts = () =>
  apiRequest('/accounts/list.php', { method: 'GET' });

// ── Transactions ──────────────────────────────────────────────────────────

export function getTransactions(accountId?: number, filters?: Record<string, unknown>) {
  const params = new URLSearchParams();
  if (accountId) params.append('account_id', accountId.toString());
  if (filters)
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
  return apiRequest(`/transactions/list.php?${params.toString()}`, { method: 'GET' });
}

// ── Cards ─────────────────────────────────────────────────────────────────

export const getCards = () =>
  apiRequest('/cards/list.php', { method: 'GET' });

export const lockCard = (cardId: number, lock: boolean) =>
  apiRequest('/cards/lock.php', {
    method: 'POST',
    body:   JSON.stringify({ card_id: cardId, lock }),
  });

export const updateCardSettings = (cardId: number, settings: Record<string, unknown>) =>
  apiRequest('/cards/settings.php', {
    method: 'POST',
    body:   JSON.stringify({ card_id: cardId, ...settings }),
  });

// ── Transfers ─────────────────────────────────────────────────────────────

export const initiateInternalTransfer = (data: {
  from_account_id: number;
  to_account_id:   number;
  amount:          number;
  note?:           string;
}) =>
  apiRequest('/transfer/internal.php', {
    method: 'POST',
    body:   JSON.stringify(data),
  });

export const initiateExternalTransfer = (data: {
  from_account_id: number;
  recipient_name:  string;
  recipient_bank:  string;
  routing_number?: string;
  account_number?: string;
  amount:          number;
  transfer_type:   'external' | 'wire';
  note?:           string;
}) =>
  apiRequest('/transfer/external.php', {
    method: 'POST',
    body:   JSON.stringify(data),
  });

// ── User profile / settings ───────────────────────────────────────────────

export const updateProfile = (data: Record<string, unknown>) =>
  apiRequest('/user/update_profile.php', {
    method: 'POST',
    body:   JSON.stringify(data),
  });

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiRequest('/user/change_password.php', {
    method: 'POST',
    body:   JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });

// ── Admin ─────────────────────────────────────────────────────────────────

export const getAdminDashboard = () =>
  apiRequest('/admin/dashboard.php', { method: 'GET' });

export const getAllUsers = () =>
  apiRequest('/admin/users.php', { method: 'GET' });

export const getAdminUserDetail = (userId: number) =>
  apiRequest(`/admin/user_detail.php?user_id=${userId}`, { method: 'GET' });

export const createUser = (userData: Record<string, unknown>) =>
  apiRequest('/admin/create_user.php', {
    method: 'POST',
    body:   JSON.stringify(userData),
  });

export const updateUser = (userId: number, userData: Record<string, unknown>) =>
  apiRequest('/admin/user_update.php', {
    method: 'POST',
    body:   JSON.stringify({ user_id: userId, ...userData }),
  });

export const deleteUser = (userId: number) =>
  apiRequest('/admin/user_delete.php', {
    method: 'POST',
    body:   JSON.stringify({ user_id: userId }),
  });

export const adminBalanceAdjust = (data: {
  account_id:   number;
  mode:         'set' | 'adjust';
  amount:       number;
  description:  string;
  type:         'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'fee';
  sender_name?: string;
  date?:        string;
}) =>
  apiRequest('/admin/balance_adjust.php', {
    method: 'POST',
    body:   JSON.stringify(data),
  });

export const getAdminCards = (userId?: number) =>
  apiRequest(`/admin/cards.php${userId ? `?user_id=${userId}` : ''}`, { method: 'GET' });

export const getAdminLogs = (type: 'admin' | 'security' | 'error', page = 1, limit = 50) =>
  apiRequest(`/admin/logs.php?type=${type}&page=${page}&limit=${limit}`, { method: 'GET' });

export const getAdminTransactions = (filters?: Record<string, unknown>) => {
  const params = new URLSearchParams();
  if (filters)
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
  return apiRequest(`/admin/transactions.php?${params.toString()}`, { method: 'GET' });
};

// ── Crypto ──────────────────────────────────────────────────────────────────

export const getCryptoDashboard = () =>
  apiRequest('/crypto/dashboard.php', { method: 'GET' });

export const getCryptoWallets = () =>
  apiRequest('/crypto/wallets.php', { method: 'GET' });

export const getCryptoMarkets = () =>
  apiRequest('/crypto/markets.php', { method: 'GET' });

export const getCryptoTransactions = (limit = 20) =>
  apiRequest(`/crypto/transactions.php?limit=${limit}`, { method: 'GET' });

export const getSwapQuote = (fromAsset: string, toAsset: string, amount: number, fromNetwork?: string, toNetwork?: string) =>
  apiRequest('/crypto/swap_quote.php', {
    method: 'POST',
    body: JSON.stringify({ from_asset: fromAsset, to_asset: toAsset, amount, from_network: fromNetwork, to_network: toNetwork }),
  });

export const executeSwap = (fromAsset: string, toAsset: string, amount: number, opts?: { quote_key?: string; fromNetwork?: string; toNetwork?: string; idempotency_key?: string }) =>
  apiRequest('/crypto/swap.php', {
    method: 'POST',
    body: JSON.stringify({ from_asset: fromAsset, to_asset: toAsset, amount, quote_key: opts?.quote_key, from_network: opts?.fromNetwork, to_network: opts?.toNetwork, idempotency_key: opts?.idempotency_key ?? idempotencyKey() }),
  });

export const depositFunds = (asset: string, amount: number, network?: string) =>
  apiRequest('/crypto/deposit.php', {
    method: 'POST',
    body: JSON.stringify({ asset, amount, network, idempotency_key: idempotencyKey() }),
  });

export const sendCrypto = (asset: string, address: string, amount: number, network?: string) =>
  apiRequest('/crypto/send.php', {
    method: 'POST',
    body: JSON.stringify({ asset, address, amount, network, idempotency_key: idempotencyKey() }),
  });

export const transferCrypto = (asset: string, recipient: string, amount: number, network?: string) =>
  apiRequest('/crypto/transfer.php', {
    method: 'POST',
    body: JSON.stringify({ asset, recipient, amount, network, idempotency_key: idempotencyKey() }),
  });

export const buyCrypto = (asset: string, usdAmount: number, network?: string) =>
  apiRequest('/crypto/buy.php', {
    method: 'POST',
    body: JSON.stringify({ asset, usd_amount: usdAmount, network, idempotency_key: idempotencyKey() }),
  });

export const sellCrypto = (asset: string, amount: number, network?: string) =>
  apiRequest('/crypto/sell.php', {
    method: 'POST',
    body: JSON.stringify({ asset, amount, network, idempotency_key: idempotencyKey() }),
  });

// ── Admin crypto ────────────────────────────────────────────────────────────

export const getAdminCryptoWallets = (search?: string, userId?: number) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (userId) params.append('user_id', String(userId));
  return apiRequest(`/crypto/admin_wallets.php?${params.toString()}`, { method: 'GET' });
};

export const adminCryptoBalance = (data: { user_id: number; asset: string; network?: string; mode: 'set' | 'add' | 'remove'; amount: number; note: string }) =>
  apiRequest('/crypto/admin_balance.php', { method: 'POST', body: JSON.stringify(data) });

export const adminCryptoCreditUsd = (data: { user_id: number; asset: string; network?: string; usd_amount: number; note: string }) =>
  apiRequest('/crypto/admin_credit_usd.php', { method: 'POST', body: JSON.stringify({ ...data, idempotency_key: idempotencyKey() }) });

export const adminCryptoTxUpdate = (tx_id: number, action: 'approve' | 'fail' | 'cancel', note?: string) =>
  apiRequest('/crypto/admin_tx_update.php', { method: 'POST', body: JSON.stringify({ tx_id, action, note }) });

export const getAdminCryptoAssets = () =>
  apiRequest('/crypto/admin_assets.php', { method: 'GET' });

export const adminCryptoAssetUpdate = (data: Record<string, unknown>) =>
  apiRequest('/crypto/admin_assets.php', { method: 'POST', body: JSON.stringify(data) });

export const getAdminCryptoTransactions = (filters?: Record<string, unknown>) => {
  const params = new URLSearchParams();
  if (filters)
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
  return apiRequest(`/crypto/admin_transactions.php?${params.toString()}`, { method: 'GET' });
};
