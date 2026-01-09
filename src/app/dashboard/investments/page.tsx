"use client";

import { useEffect, useState } from "react";
import { getInvestments, getUsers, createInvestment, cancelInvestment } from "@/lib/api";
import { Plus, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ACTIVE");
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    // New investment form
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [amount, setAmount] = useState("");
    const [profitPercent, setProfitPercent] = useState("");
    const [payoutFrequency, setPayoutFrequency] = useState("1");
    const [durationDays, setDurationDays] = useState("");

    useEffect(() => {
        loadInvestments();
        loadUsers();
    }, [statusFilter]);

    const loadInvestments = async () => {
        try {
            setLoading(true);
            const data = await getInvestments(statusFilter);
            setInvestments(data.investments || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await getUsers({ status: "ACTIVE" });
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateInvestment = async () => {
        if (!selectedUsers.length || !amount || !profitPercent || !durationDays) {
            alert("Please fill all fields");
            return;
        }

        try {
            setProcessing(true);
            await createInvestment({
                userIds: selectedUsers,
                amount: parseFloat(amount),
                profitPercent: parseFloat(profitPercent),
                payoutFrequency: parseInt(payoutFrequency),
                durationDays: parseInt(durationDays),
            });
            setShowModal(false);
            resetForm();
            loadInvestments();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelInvestment = async (id: string) => {
        if (!confirm("Cancel this investment? The principal will be returned to user.")) return;
        try {
            await cancelInvestment(id);
            loadInvestments();
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setSelectedUsers([]);
        setAmount("");
        setProfitPercent("");
        setPayoutFrequency("1");
        setDurationDays("");
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACTIVE": return <TrendingUp size={16} className="text-white" />;
            case "COMPLETED": return <CheckCircle size={16} className="text-white" />;
            case "CANCELLED": return <XCircle size={16} className="text-zinc-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Investments</h2>
                    <p className="text-zinc-500">Create and manage user investments</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                >
                    <Plus size={20} />
                    Create Investment
                </button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
                {["ACTIVE", "COMPLETED", "CANCELLED"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${statusFilter === status
                            ? "bg-white text-black"
                            : "bg-zinc-900 text-zinc-400 hover:text-white"
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Investments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                        Loading...
                    </div>
                ) : investments.length === 0 ? (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                        No {statusFilter.toLowerCase()} investments
                    </div>
                ) : (
                    investments.map((inv) => (
                        <div
                            key={inv.id}
                            className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getStatusIcon(inv.status)}
                                        <span className="text-xs font-medium text-zinc-400 uppercase">
                                            {inv.status}
                                        </span>
                                    </div>
                                    <p className="font-bold">{inv.user?.email || "Unknown User"}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-6 text-center">
                                    <div>
                                        <p className="text-zinc-500 text-xs">Amount</p>
                                        <p className="font-bold">${inv.amount?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs">Profit %</p>
                                        <p className="font-medium text-white">{inv.profitPercent}%</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs">Total Profit</p>
                                        <p className="font-medium text-white">${inv.totalProfit?.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="text-sm text-zinc-500 text-right">
                                    <p>Started: {new Date(inv.startedAt).toLocaleDateString()}</p>
                                    <p>Ends: {new Date(inv.endsAt).toLocaleDateString()}</p>
                                    <p className="text-xs">{inv.payoutFrequency}x/day for {inv.durationDays} days</p>
                                </div>

                                {inv.status === "ACTIVE" && (
                                    <button
                                        onClick={() => handleCancelInvestment(inv.id)}
                                        className="bg-zinc-900 text-white border border-zinc-800 px-4 py-2 font-medium hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Investment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-6">Create Investment</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Select Users</label>
                                <select
                                    multiple
                                    value={selectedUsers}
                                    onChange={(e) => setSelectedUsers(Array.from(e.target.selectedOptions, o => o.value))}
                                    className="w-full bg-black border border-zinc-800 rounded-xl p-4 h-32 outline-none focus:border-white transition-colors"
                                >
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.email} (${user.balance?.available || 0})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-zinc-500">Hold Ctrl to select multiple</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Amount ($)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 outline-none focus:border-white transition-colors"
                                        placeholder="1000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Profit % per payout</label>
                                    <input
                                        type="number"
                                        value={profitPercent}
                                        onChange={(e) => setProfitPercent(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 outline-none focus:border-white transition-colors"
                                        placeholder="2.5"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Payouts per day</label>
                                    <select
                                        value={payoutFrequency}
                                        onChange={(e) => setPayoutFrequency(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 outline-none focus:border-white transition-colors"
                                    >
                                        <option value="1">1x per day</option>
                                        <option value="2">2x per day</option>
                                        <option value="3">3x per day</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Duration (days)</label>
                                    <input
                                        type="number"
                                        value={durationDays}
                                        onChange={(e) => setDurationDays(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 outline-none focus:border-white transition-colors"
                                        placeholder="7"
                                        min="1"
                                        max="20"
                                    />
                                </div>
                            </div>

                            {amount && profitPercent && durationDays && payoutFrequency && (
                                <div className="bg-zinc-900 rounded-xl p-4">
                                    <p className="text-xs text-zinc-500 mb-2">Projected Total Profit</p>
                                    <p className="text-2xl font-medium text-white">
                                        ${(parseFloat(amount) * (parseFloat(profitPercent) / 100) * parseInt(durationDays) * parseInt(payoutFrequency)).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        ({profitPercent}% × {payoutFrequency} payouts/day × {durationDays} days)
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 bg-zinc-800 py-3 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateInvestment}
                                    disabled={processing}
                                    className="flex-1 bg-white text-black py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                >
                                    {processing ? "Creating..." : "Create Investment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
