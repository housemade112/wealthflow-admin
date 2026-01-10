"use client";

import { useEffect, useState } from "react";
import { getUsers, getUser, updateUser, deleteUser, sendNotification, resetPassword, createInvestment } from "@/lib/api";
import { Search, X, DollarSign, Ban, UserCheck, Loader2, ChevronRight, Mail, Trash2, MessageSquare, Key, TrendingUp } from "lucide-react";

interface UserData {
    id: string;
    email: string;
    fullName?: string;
    phone?: string;
    country?: string;
    status: string;
    createdAt: string;
    lastLoginAt?: string;
    balance?: {
        available: number;
        invested: number;
        totalProfit: number;
        bonus: number;
    };
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);

    // Modals
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [balanceField, setBalanceField] = useState<'available' | 'invested' | 'totalProfit' | 'bonus'>('available');
    const [newBalance, setNewBalance] = useState("");

    const [showInvestmentModal, setShowInvestmentModal] = useState(false);
    const [investmentData, setInvestmentData] = useState({
        amount: "",
        profitPercent: "",
        duration: "",
        sourceBalance: "available" as 'available' | 'invested' | 'totalProfit' | 'bonus'
    });

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [generatedPassword, setGeneratedPassword] = useState("");

    const [showMessageModal, setShowMessageModal] = useState(false);
    const [msgTitle, setMsgTitle] = useState("");
    const [msgBody, setMsgBody] = useState("");

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [search, statusFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers({ search, status: statusFilter });
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectUser = async (user: UserData) => {
        setLoadingUser(true);
        setSelectedUser(user);
        try {
            const fullUser = await getUser(user.id);
            setSelectedUser(fullUser.user);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingUser(false);
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedUser) return;
        setSaving(true);
        try {
            await updateUser(selectedUser.id, { status });
            setSelectedUser({ ...selectedUser, status });
            loadUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser || !confirm(`Delete user ${selectedUser.email}?`)) return;
        setSaving(true);
        try {
            await deleteUser(selectedUser.id);
            setSelectedUser(null);
            loadUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const openBalanceModal = (field: 'available' | 'invested' | 'totalProfit' | 'bonus') => {
        setBalanceField(field);
        setNewBalance(selectedUser?.balance?.[field]?.toString() || "0");
        setShowBalanceModal(true);
    };

    const handleUpdateBalance = async () => {
        if (!selectedUser || !newBalance) return;
        setSaving(true);
        try {
            const updateData = { [balanceField]: parseFloat(newBalance) };
            await updateUser(selectedUser.id, { balance: updateData });

            setSelectedUser({
                ...selectedUser,
                balance: { ...selectedUser.balance!, [balanceField]: parseFloat(newBalance) },
            });
            setShowBalanceModal(false);
            loadUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateInvestment = async () => {
        if (!selectedUser || !investmentData.amount || !investmentData.profitPercent || !investmentData.duration) {
            alert("Please fill all fields");
            return;
        }

        setSaving(true);
        try {
            await createInvestment({
                userIds: [selectedUser.id],
                amount: parseFloat(investmentData.amount),
                profitPercent: parseFloat(investmentData.profitPercent),
                payoutFrequency: 1, // Default daily
                durationDays: parseInt(investmentData.duration),
            });

            alert("Investment created successfully!");
            setShowInvestmentModal(false);
            setInvestmentData({ amount: "", profitPercent: "", duration: "", sourceBalance: "available" });
            loadUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to create investment");
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;
        setSaving(true);
        try {
            const generated = Math.random().toString(36).slice(-8);
            const response = await resetPassword(selectedUser.id, generated);
            setGeneratedPassword(generated);
            setNewPassword("");
        } catch (err) {
            console.error(err);
            alert("Failed to reset password");
        } finally {
            setSaving(false);
        }
    };

    const handleSendMessage = async () => {
        if (!selectedUser || !msgTitle || !msgBody) return;
        setSaving(true);
        try {
            await sendNotification(selectedUser.id, msgTitle, msgBody);
            setShowMessageModal(false);
            alert("Message sent to user");
        } catch (err) {
            console.error(err);
            alert("Failed to send message");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const balanceLabels = {
        available: "Available Balance",
        invested: "Total Invested",
        totalProfit: "Total Profit",
        bonus: "Bonus"
    };

    return (
        <div className="flex h-[calc(100vh-80px)] -m-6 bg-black text-white">
            {/* Left Panel - Users List */}
            <div className="flex-1 flex flex-col border-r border-zinc-800 min-w-0">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-medium">Users</h2>
                </div>

                <div className="p-4 border-b border-zinc-800">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm text-white outline-none focus:border-white"
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="animate-spin mx-auto mb-2 text-zinc-500" size={20} />
                            <p className="text-zinc-500 text-sm">Loading...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500 text-sm">No users found</div>
                    ) : (
                        <div className="divide-y divide-zinc-900">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => selectUser(user)}
                                    className={`w-full p-4 text-left hover:bg-zinc-900 transition-colors ${selectedUser?.id === user.id ? 'bg-zinc-900' : ''}`}
                                >
                                    <p className="text-white font-medium text-sm mb-1">{user.email}</p>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-zinc-600">{user.fullName || 'No name'}</span>
                                        <span className="text-zinc-800">•</span>
                                        <span className={user.status === 'ACTIVE' ? 'text-white' : 'text-zinc-600'}>
                                            {user.status}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - User Details */}
            <div className="w-[500px] flex flex-col bg-black">
                {!selectedUser ? (
                    <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
                        Select a user to view details
                    </div>
                ) : loadingUser ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin text-zinc-500" size={24} />
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-zinc-800">
                            <h3 className="text-lg font-medium text-white mb-1">{selectedUser.email}</h3>
                            <p className="text-zinc-500 text-sm">{selectedUser.fullName || 'No name'}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* User Info */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Phone</span>
                                    <span className="text-white">{selectedUser.phone || 'Not set'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Country</span>
                                    <span className="text-white">{selectedUser.country || 'Not set'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Status</span>
                                    <span className="text-white uppercase text-xs">{selectedUser.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Joined</span>
                                    <span className="text-white">{formatDate(selectedUser.createdAt)}</span>
                                </div>
                            </div>

                            <div className="border-t border-zinc-900"></div>

                            {/* Balance Section */}
                            <div>
                                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Balances</h4>
                                <div className="space-y-3">
                                    {(['available', 'invested', 'totalProfit', 'bonus'] as const).map((field) => (
                                        <div key={field} className="bg-zinc-950 border border-zinc-800 p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-zinc-600 text-xs uppercase">{balanceLabels[field]}</span>
                                                <button
                                                    onClick={() => openBalanceModal(field)}
                                                    className="text-white hover:text-zinc-400 transition-colors"
                                                >
                                                    <DollarSign size={14} />
                                                </button>
                                            </div>
                                            <p className="text-xl font-light text-white">
                                                {parseFloat(selectedUser.balance?.[field]?.toString() || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-zinc-900"></div>

                            {/* Actions */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => setShowInvestmentModal(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 font-bold hover:bg-zinc-200 transition-colors text-sm"
                                >
                                    <TrendingUp size={16} />
                                    Create Investment
                                </button>

                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 py-2.5 font-medium hover:bg-zinc-800 transition-colors text-sm"
                                >
                                    <Key size={16} />
                                    Reset Password
                                </button>

                                <button
                                    onClick={() => setShowMessageModal(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 py-2.5 font-medium hover:bg-zinc-800 transition-colors text-sm"
                                >
                                    <MessageSquare size={16} />
                                    Send Message
                                </button>

                                {selectedUser.status === "ACTIVE" ? (
                                    <button
                                        onClick={() => handleUpdateStatus("SUSPENDED")}
                                        className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 py-2.5 font-medium hover:bg-zinc-800 transition-colors text-sm"
                                    >
                                        <Ban size={16} />
                                        Suspend
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUpdateStatus("ACTIVE")}
                                        className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 py-2.5 font-medium hover:bg-zinc-800 transition-colors text-sm"
                                    >
                                        <UserCheck size={16} />
                                        Activate
                                    </button>
                                )}

                                <button
                                    onClick={handleDeleteUser}
                                    className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-white py-2.5 transition-colors text-sm"
                                >
                                    <Trash2 size={16} />
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Balance Modal */}
            {showBalanceModal && selectedUser && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider">Edit {balanceLabels[balanceField]}</h3>
                            <button onClick={() => setShowBalanceModal(false)}><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Amount (USD)</label>
                                <input
                                    type="number"
                                    value={newBalance}
                                    onChange={(e) => setNewBalance(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-lg text-white focus:border-white outline-none"
                                    step="0.01"
                                />
                            </div>
                            <button
                                onClick={handleUpdateBalance}
                                disabled={saving}
                                className="w-full bg-white text-black py-3 font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                {saving ? "SAVING..." : "CONFIRM"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Investment Modal */}
            {showInvestmentModal && selectedUser && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider">Create Investment</h3>
                            <button onClick={() => setShowInvestmentModal(false)}><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Amount</label>
                                <input
                                    type="number"
                                    value={investmentData.amount}
                                    onChange={(e) => setInvestmentData({ ...investmentData, amount: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Profit % (per day)</label>
                                <input
                                    type="number"
                                    value={investmentData.profitPercent}
                                    onChange={(e) => setInvestmentData({ ...investmentData, profitPercent: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Duration (days)</label>
                                <input
                                    type="number"
                                    value={investmentData.duration}
                                    onChange={(e) => setInvestmentData({ ...investmentData, duration: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Source Balance</label>
                                <select
                                    value={investmentData.sourceBalance}
                                    onChange={(e) => setInvestmentData({ ...investmentData, sourceBalance: e.target.value as any })}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none"
                                >
                                    <option value="available">Available Balance</option>
                                    <option value="invested">Total Invested</option>
                                    <option value="totalProfit">Total Profit</option>
                                    <option value="bonus">Bonus</option>
                                </select>
                            </div>
                            <button
                                onClick={handleCreateInvestment}
                                disabled={saving}
                                className="w-full bg-white text-black py-3 font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                {saving ? "CREATING..." : "CREATE INVESTMENT"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider">Reset Password</h3>
                            <button onClick={() => setShowPasswordModal(false)}><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {generatedPassword ? (
                                <>
                                    <div className="bg-zinc-900 border border-zinc-800 p-4">
                                        <p className="text-xs text-zinc-600 uppercase mb-2">New Password</p>
                                        <p className="text-lg font-mono text-white">{generatedPassword}</p>
                                    </div>
                                    <p className="text-xs text-zinc-600">Copy this password and share it with the user.</p>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedPassword);
                                            alert("Password copied!");
                                        }}
                                        className="w-full bg-white text-black py-3 font-bold hover:bg-zinc-200 transition-colors"
                                    >
                                        COPY PASSWORD
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleResetPassword}
                                    disabled={saving}
                                    className="w-full bg-white text-black py-3 font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                >
                                    {saving ? "GENERATING..." : "GENERATE NEW PASSWORD"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && selectedUser && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider">Send Message</h3>
                            <button onClick={() => setShowMessageModal(false)}><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Title</label>
                                <input
                                    type="text"
                                    value={msgTitle}
                                    onChange={(e) => setMsgTitle(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Message</label>
                                <textarea
                                    value={msgBody}
                                    onChange={(e) => setMsgBody(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none resize-none"
                                    rows={4}
                                />
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={saving}
                                className="w-full bg-white text-black py-3 font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                {saving ? "SENDING..." : "SEND MESSAGE"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
