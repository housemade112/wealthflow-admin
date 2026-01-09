"use client";

import { useEffect, useState } from "react";
import { getUsers, getUser, updateUser, deleteUser } from "@/lib/api";
import { Search, X, DollarSign, Ban, UserCheck, Loader2, ChevronRight, User, Mail, Phone, Calendar, Trash2 } from "lucide-react";

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
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this user?`)) return;

        try {
            await updateUser(selectedUser.id, { status });
            setSelectedUser({ ...selectedUser, status });
            loadUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        if (!confirm("PERMANENTLY DELETE this user? This action cannot be undone.")) return;

        try {
            await deleteUser(selectedUser.id);
            setSelectedUser(null);
            loadUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to delete user");
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

    return (
        <div className="flex h-[calc(100vh-80px)] -m-6 bg-black text-white font-sans">
            {/* Left Panel - Users List */}
            <div className="flex-1 flex flex-col border-r border-zinc-800 min-w-0">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-medium tracking-tight">Users</h2>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-zinc-800 flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 pl-9 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">No users found</div>
                    ) : (
                        <div className="divide-y divide-zinc-900">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => selectUser(user)}
                                    className={`w-full p-4 text-left hover:bg-zinc-900 transition-colors flex items-center justify-between group ${selectedUser?.id === user.id ? "bg-zinc-900" : ""
                                        }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate text-zinc-200">{user.email}</p>
                                        <p className="text-xs text-zinc-500 truncate mt-0.5">Joined {formatDate(user.createdAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <span className={`text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded ${user.status === "ACTIVE" ? "bg-zinc-800 text-zinc-300" : "bg-zinc-800 text-zinc-500"
                                            }`}>
                                            {user.status}
                                        </span>
                                        <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - User Details */}
            <div className="w-96 flex-shrink-0 flex flex-col bg-zinc-950 border-l border-zinc-800">
                {!selectedUser ? (
                    <div className="flex-1 flex items-center justify-center text-zinc-600">
                        <p className="text-sm">Select a user to view details</p>
                    </div>
                ) : loadingUser ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin text-zinc-500" size={20} />
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">User Details</span>
                            <button onClick={() => setSelectedUser(null)} className="text-zinc-500 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Identity */}
                            <div className="text-center">
                                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                    <span className="text-2xl font-medium text-white">
                                        {(selectedUser.fullName || selectedUser.email).charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-medium text-white truncate max-w-full px-4">{selectedUser.email}</h3>
                                <div className="mt-2 flex justify-center">
                                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-medium text-zinc-400">
                                        {selectedUser.id.substring(0, 8)}...
                                    </span>
                                </div>
                            </div>

                            {/* Balance */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-zinc-500 uppercase">Available Funds</span>
                                </div>
                                <div className="text-3xl font-medium text-white tracking-tight">
                                    ${selectedUser.balance?.available?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || "0.00"}
                                </div>
                                <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-zinc-500 mb-1">Invested</div>
                                        <div className="text-sm font-medium text-zinc-300">
                                            ${selectedUser.balance?.invested?.toLocaleString() || "0.00"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500 mb-1">Total Profit</div>
                                        <div className="text-sm font-medium text-zinc-300">
                                            ${selectedUser.balance?.totalProfit?.toLocaleString() || "0.00"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                    <span className="text-sm text-zinc-500">Full Name</span>
                                    <span className="text-sm text-white font-medium">{selectedUser.fullName || "—"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                    <span className="text-sm text-zinc-500">Phone</span>
                                    <span className="text-sm text-white font-medium">{selectedUser.phone || "—"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                    <span className="text-sm text-zinc-500">Joined On</span>
                                    <span className="text-sm text-white font-medium">{formatDate(selectedUser.createdAt)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                    <span className="text-sm text-zinc-500">Status</span>
                                    <span className="text-sm text-white font-medium">{selectedUser.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-zinc-800 space-y-3 bg-zinc-950">
                            <button
                                onClick={openBalanceModal}
                                className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded font-medium hover:bg-zinc-200 transition-colors text-sm"
                            >
                                <DollarSign size={16} />
                                Add Funds / Edit Balance
                            </button>

                            {selectedUser.status === "ACTIVE" ? (
                                <button
                                    onClick={() => handleUpdateStatus("SUSPENDED")}
                                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 py-3 rounded font-medium hover:bg-zinc-800 transition-colors text-sm"
                                >
                                    <Ban size={16} />
                                    Suspend User
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUpdateStatus("ACTIVE")}
                                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 py-3 rounded font-medium hover:bg-zinc-800 transition-colors text-sm"
                                >
                                    <UserCheck size={16} />
                                    Activate User
                                </button>
                            )}

                            <button
                                onClick={handleDeleteUser}
                                className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-white py-3 transition-colors text-sm"
                            >
                                <Trash2 size={16} />
                                Delete User Permanently
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Balance Modal */}
            {showBalanceModal && selectedUser && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider">Update Fund Balance</h3>
                            <button onClick={() => setShowBalanceModal(false)}><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Available Balance (USD)</label>
                                <input
                                    type="number"
                                    value={newBalance}
                                    onChange={(e) => setNewBalance(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-lg text-white font-medium focus:border-white outline-none transition-colors"
                                    step="0.01"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleUpdateBalance}
                                    disabled={saving}
                                    className="w-full bg-white text-black py-3 font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                >
                                    {saving ? "SAVING..." : "CONFIRM UPDATE"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
