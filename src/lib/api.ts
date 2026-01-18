const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.wealthbridg.com';

if (!API_URL) {
    console.warn('NEXT_PUBLIC_API_URL is not set, using fallback');
}

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// Auth
export const login = (email: string, password: string) =>
    apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

export const getMe = () => apiRequest('/api/auth/me');

// Admin Stats
export const getStats = () => apiRequest('/api/admin/stats');

// Users
export const getUsers = (params?: { search?: string; status?: string; page?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest(`/api/admin/users${query ? `?${query}` : ''}`);
};

export const getUser = (id: string) => apiRequest(`/api/admin/users/${id}`);

export const updateUser = (id: string, data: any) =>
    apiRequest(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });

export const resetUserPassword = (id: string, newPassword: string) =>
    apiRequest(`/api/admin/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
    });

export const deleteUser = (id: string) =>
    apiRequest(`/api/admin/users/${id}`, {
        method: 'DELETE',
    });

export const sendNotification = (id: string, title: string, message: string) =>
    apiRequest(`/api/admin/users/${id}/notify`, {
        method: 'POST',
        body: JSON.stringify({ title, message }),
    });

export const resetPassword = (id: string, newPassword: string) =>
    apiRequest(`/api/admin/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
    });

// Deposits
export const getDeposits = (status?: string) =>
    apiRequest(`/api/admin/deposits${status ? `?status=${status}` : ''}`);

export const approveDeposit = (id: string, note?: string) =>
    apiRequest(`/api/admin/deposits/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ note }),
    });

export const rejectDeposit = (id: string, note?: string) =>
    apiRequest(`/api/admin/deposits/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note }),
    });

// Withdrawals
export const getWithdrawals = (status?: string) =>
    apiRequest(`/api/admin/withdrawals${status ? `?status=${status}` : ''}`);

export const approveWithdrawal = (id: string, note?: string) =>
    apiRequest(`/api/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ note }),
    });

export const rejectWithdrawal = (id: string, note?: string) =>
    apiRequest(`/api/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note }),
    });

// Investments
export const getInvestments = (status?: string) =>
    apiRequest(`/api/admin/investments${status ? `?status=${status}` : ''}`);

export const createInvestment = (data: {
    userIds: string[];
    amount: number;
    profitPercent: number;
    payoutFrequency: number;
    durationDays: number;
}) =>
    apiRequest('/api/admin/investments', {
        method: 'POST',
        body: JSON.stringify(data),
    });

// Cancel investment
export const cancelInvestment = (id: string) =>
    apiRequest(`/api/admin/investments/${id}/cancel`, {
        method: 'POST',
    });

// Stop investment
export const stopInvestment = (id: string) =>
    apiRequest(`/api/admin/investments/${id}/stop`, {
        method: 'POST',
    });

// Update investment
export const updateInvestment = (id: string, data: any) =>
    apiRequest(`/api/admin/investments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });

// Force Pay Investment
export const forcePayInvestment = (id: string) => apiRequest(`/api/admin/investments/${id}/force-pay`, { method: 'POST' });

// Catch Up (Process All Missed)
export const catchUpInvestment = (id: string) => apiRequest(`/api/admin/investments/${id}/catch-up`, { method: 'POST' });

// Trigger Payouts
export const triggerPayouts = () => apiRequest('/api/admin/investments/trigger-payouts', { method: 'POST' });

// Admin Logs
export const getAdminLogs = () => apiRequest('/api/admin/logs');

// Inject Trade
export const injectTrade = (userId: string, data: { amount: number, asset: string }) =>
    apiRequest(`/api/admin/users/${userId}/inject-trade`, {
        method: 'POST',
        body: JSON.stringify(data)
    });

// Wallet Addresses
export const getWallets = () => apiRequest('/api/admin/wallets');

export const createWallet = (data: {
    symbol: string;
    name: string;
    network: string;
    address: string;
    icon?: string;
}) =>
    apiRequest('/api/admin/wallets', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateWallet = (id: string, data: any) =>
    apiRequest(`/api/admin/wallets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });

export const deleteWallet = (id: string) =>
    apiRequest(`/api/admin/wallets/${id}`, {
        method: 'DELETE',
    });

