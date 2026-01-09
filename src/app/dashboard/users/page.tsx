"use client";

import { useEffect, useState } from "react";
import { getUsers, getUser, updateUser } from "@/lib/api";
import { Search, X, DollarSign, Ban, UserCheck, Loader2, ChevronRight, User, Mail, Phone, Calendar, Wallet } from "lucide-react";

interface UserData {
    id: string;
    email: string;
    fullName?: string;
    phone?: string;
    status: string;
    createdAt: string;
    lastLoginAt?: string;
    balance?: {
        available: number;
        invested: number;
        totalProfit: number;
    };
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Selected user for detail panel
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);

    // Balance editing
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [newBalance, setNewBalance] = useState("");
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
            const data = await getUser(user.id);
            setSelectedUser(data.user);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingUser(false);
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedUser) return;
        try {
            await updateUser(selectedUser.id, { status });
            setSelectedUser({ ...selectedUser, status });
            loadUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const openBalanceModal = () => {
        if (!selectedUser) return;
        setNewBalance(selectedUser.balance?.available?.toString() || "0");
        setShowBalanceModal(true);
    };

    const handleUpdateBalance = async () => {
        if (!selectedUser || !newBalance) return;
        setSaving(true);
        try {
            await updateUser(selectedUser.id, { balance: parseFloat(newBalance) });
            setSelectedUser({
                ...selectedUser,
                balance: {
                    ...selectedUser.balance!,
                    available: parseFloat(newBalance),
                },
            });
            setShowBalanceModal(false);
            loadUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="flex h-[calc(100vh-80px)] -m-6">
            {/* Left Panel - Users List */}
            <div className="flex-1 flex flex-col border-r border-zinc-800 min-w-0">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-2xl font-bold">Users</h2>
                    <p className="text-zinc-500 text-sm mt-1">Manage all registered users</p>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-zinc-800 flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-zinc-600 transition-colors"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-600 transition-colors"
                    >
                        <option value="">All</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="BANNED">Banned</option>
                    </select>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-zinc-500">
                            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                            Loading...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">No users found</div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => selectUser(user)}
                                    className={`w-full p-4 text-left hover:bg-zinc-900/50 transition-colors flex items-center justify-between ${selectedUser?.id === user.id ? "bg-zinc-900" : ""
                                        }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{user.fullName || user.email}</p>
                                        <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-500" :
                                                user.status === "SUSPENDED" ? "bg-amber-500/20 text-amber-500" :
                                                    "bg-rose-500/20 text-rose-500"
                                            }`}>
                                            {user.status}
                                        </span>
                                        <ChevronRight size={16} className="text-zinc-500" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - User Details */}
            <div className="w-96 flex-shrink-0 flex flex-col bg-zinc-950">
                {!selectedUser ? (
                    <div className="flex-1 flex items-center justify-center text-zinc-500">
                        <div className="text-center">
                            <User size={40} className="mx-auto mb-3 opacity-50" />
                            <p>Select a user to view details</p>
                        </div>
                    </div>
                ) : loadingUser ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin text-zinc-500" size={24} />
                    </div>
                ) : (
                    <>
                        {/* User Header */}
                        <div className="p-6 border-b border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-bold">
                                    {(selectedUser.fullName || selectedUser.email).charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-1 hover:bg-zinc-800 rounded transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold">{selectedUser.fullName || "No name"}</h3>
                            <p className="text-zinc-500 text-sm">{selectedUser.email}</p>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Balance Card */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-medium text-zinc-500 uppercase">Balance</span>
                                    <button
                                        onClick={openBalanceModal}
                                        className="text-xs text-white hover:underline"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <p className="text-2xl font-bold text-emerald-500 mb-2">
                                    ${selectedUser.balance?.available?.toLocaleString() || "0.00"}
                                </p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Invested</span>
                                    <span>${selectedUser.balance?.invested?.toLocaleString() || "0.00"}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-zinc-500">Profit</span>
                                    <span className="text-emerald-500">
                                        +${selectedUser.balance?.totalProfit?.toLocaleString() || "0.00"}
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail size={16} className="text-zinc-500" />
                                    <span className="text-zinc-400">{selectedUser.email}</span>
                                </div>
                                {selectedUser.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone size={16} className="text-zinc-500" />
                                        <span className="text-zinc-400">{selectedUser.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar size={16} className="text-zinc-500" />
                                    <span className="text-zinc-400">Joined {formatDate(selectedUser.createdAt)}</span>
                                </div>
                                {selectedUser.lastLoginAt && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <User size={16} className="text-zinc-500" />
                                        <span className="text-zinc-400">Last login {formatDateTime(selectedUser.lastLoginAt)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <span className="text-xs font-medium text-zinc-500 uppercase block mb-2">Status</span>
                                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${selectedUser.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-500" :
                                        selectedUser.status === "SUSPENDED" ? "bg-amber-500/20 text-amber-500" :
                                            "bg-rose-500/20 text-rose-500"
                                    }`}>
                                    {selectedUser.status}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-zinc-800 space-y-3">
                            <button
                                onClick={openBalanceModal}
                                className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                            >
                                <DollarSign size={18} />
                                Add Funds
                            </button>
                            {selectedUser.status === "ACTIVE" ? (
                                <button
                                    onClick={() => handleUpdateStatus("SUSPENDED")}
                                    className="w-full flex items-center justify-center gap-2 bg-amber-500/20 text-amber-500 py-3 rounded-lg font-medium hover:bg-amber-500/30 transition-colors"
                                >
                                    <Ban size={18} />
                                    Suspend User
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUpdateStatus("ACTIVE")}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-500 py-3 rounded-lg font-medium hover:bg-emerald-500/30 transition-colors"
                                >
                                    <UserCheck size={18} />
                                    Activate User
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Balance Modal */}
            {showBalanceModal && selectedUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md">
                        <div className="p-6 border-b border-zinc-800">
                            <h3 className="text-lg font-bold">Edit Balance</h3>
                            <p className="text-zinc-500 text-sm mt-1">{selectedUser.email}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase">Available Balance</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                    <input
                                        type="number"
                                        value={newBalance}
                                        onChange={(e) => setNewBalance(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-4 py-3 text-lg font-medium outline-none focus:border-zinc-600 transition-colors"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-zinc-800">
                            <button
                                onClick={() => setShowBalanceModal(false)}
                                className="flex-1 bg-zinc-800 py-3 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateBalance}
                                disabled={saving}
                                className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
