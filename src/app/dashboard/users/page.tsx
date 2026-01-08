"use client";

import { useEffect, useState } from "react";
import { getUsers, updateUser } from "@/lib/api";
import { Search, MoreVertical, Ban, UserCheck, DollarSign } from "lucide-react";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [newBalance, setNewBalance] = useState("");

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

    const handleUpdateStatus = async (userId: string, status: string) => {
        try {
            await updateUser(userId, { status });
            loadUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateBalance = async () => {
        if (!selectedUser || !newBalance) return;
        try {
            await updateUser(selectedUser.id, { balance: parseFloat(newBalance) });
            setShowModal(false);
            setSelectedUser(null);
            setNewBalance("");
            loadUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const openBalanceModal = (user: any) => {
        setSelectedUser(user);
        setNewBalance(user.balance?.available?.toString() || "0");
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Users</h2>
                <p className="text-zinc-500">Manage all platform users</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-white transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-white transition-colors"
                >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BANNED">Banned</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-zinc-500">Loading...</div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">No users found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-900">
                                <tr>
                                    <th className="text-left p-4 text-xs font-bold text-zinc-500 uppercase">User</th>
                                    <th className="text-left p-4 text-xs font-bold text-zinc-500 uppercase">Balance</th>
                                    <th className="text-left p-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
                                    <th className="text-left p-4 text-xs font-bold text-zinc-500 uppercase">Joined</th>
                                    <th className="text-right p-4 text-xs font-bold text-zinc-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-900/50">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-bold">{user.fullName || user.email}</p>
                                                <p className="text-sm text-zinc-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-emerald-500">${user.balance?.available?.toLocaleString() || "0.00"}</p>
                                            <p className="text-xs text-zinc-500">Invested: ${user.balance?.invested?.toLocaleString() || "0.00"}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${user.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-500" :
                                                    user.status === "SUSPENDED" ? "bg-amber-500/20 text-amber-500" :
                                                        "bg-rose-500/20 text-rose-500"
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-zinc-500 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openBalanceModal(user)}
                                                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                                    title="Edit Balance"
                                                >
                                                    <DollarSign size={18} className="text-emerald-500" />
                                                </button>
                                                {user.status === "ACTIVE" ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(user.id, "SUSPENDED")}
                                                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                                        title="Suspend User"
                                                    >
                                                        <Ban size={18} className="text-amber-500" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpdateStatus(user.id, "ACTIVE")}
                                                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                                        title="Activate User"
                                                    >
                                                        <UserCheck size={18} className="text-emerald-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Balance Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit Balance</h3>
                        <p className="text-zinc-500 mb-4">{selectedUser?.email}</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">New Available Balance</label>
                                <input
                                    type="number"
                                    value={newBalance}
                                    onChange={(e) => setNewBalance(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-xl p-4 outline-none focus:border-white transition-colors"
                                    step="0.01"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-zinc-800 py-3 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateBalance}
                                    className="flex-1 bg-white text-black py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
