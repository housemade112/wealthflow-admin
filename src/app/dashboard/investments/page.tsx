"use client";

import { useEffect, useState } from "react";
import { getInvestments, getUsers, createInvestment, cancelInvestment, stopInvestment, getUser, updateUser } from "@/lib/api";
import { Plus, TrendingUp, Clock, CheckCircle, XCircle, Ban, AlertOctagon, DollarSign, X, Loader2 } from "lucide-react";

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Balance Management State
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [balanceField, setBalanceField] = useState<'available' | 'invested' | 'totalProfit' | 'bonus'>('available');
    const [balanceOperation, setBalanceOperation] = useState<'add' | 'reduce'>('add');
    const [newBalance, setNewBalance] = useState("");
    const [saving, setSaving] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);

    // New investment form
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [amount, setAmount] = useState(""); // Initial investment amount
    const [profitPercent, setProfitPercent] = useState(""); // Profit % per payout
    const [payoutFrequency, setPayoutFrequency] = useState("1");
    const [durationDays, setDurationDays] = useState("");

    useEffect(() => {
        loadInvestments();
        loadUsers();
    }, [statusFilter]);

    const loadInvestments = async () => {
        try {
            setLoading(true);
            const data = await getInvestments(statusFilter === "ALL" ? undefined : statusFilter);
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

    const handleOpenBalance = async (userId: string) => {
        try {
            setLoadingUser(true);
            const data = await getUser(userId);
            setSelectedUser(data.user);
            setBalanceField('available');
            setBalanceOperation('add');
            setNewBalance("");
            setShowBalanceModal(true);
        } catch (err) {
            console.error(err);
            alert("Failed to load user details");
        } finally {
            setLoadingUser(false);
        }
    };

    const handleUpdateBalance = async () => {
        if (!selectedUser || !newBalance) return;
        setSaving(true);
        try {
            const currentValue = parseFloat(selectedUser?.balance?.[balanceField]?.toString() || "0");
            const changeAmount = parseFloat(newBalance);

            // ADD or REDUCE based on operation
            const newValue = balanceOperation === 'add'
                ? currentValue + changeAmount
                : Math.max(0, currentValue - changeAmount); // Don't go below 0

            const updateData = { [balanceField]: newValue };
            await updateUser(selectedUser.id, { balance: updateData });

            // Update local state if needed or just close
            setShowBalanceModal(false);
            alert("Balance updated successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to update balance");
        } finally {
            setSaving(false);
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

    const handleStopInvestment = async (id: string) => {
        if (!confirm("STOP this investment? It will end immediately and Principal will be returned.")) return;
        try {
            await stopInvestment(id);
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
            case "STOPPED": return <AlertOctagon size={16} className="text-red-500" />;
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
                    className="flex items-center gap-2 bg-[#00C805] text-black px-4 py-2 rounded-xl font-bold hover:bg-[#00B004] transition-colors"
                >
                    <Plus size={20} />
                    Create Investment
                </button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
                {["ALL", "ACTIVE", "COMPLETED", "STOPPED", "CANCELLED"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${statusFilter === status
                            ? "bg-[#00C805] text-black"
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
                                        <span className="text-xs font-medium px-2 py-1 rounded bg-[#00C805]/10 text-[#00C805] uppercase">
                                            {inv.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold">{inv.user?.email || "Unknown User"}</p>
                                        <button
                                            onClick={() => handleOpenBalance(inv.userId)}
                                            className="text-zinc-500 hover:text-[#00C805] transition-colors"
                                            title="Manage User Balance"
                                        >
                                            <DollarSign size={16} />
                                        </button>
                                    </div>
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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStopInvestment(inv.id)}
                                            className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 font-bold text-xs rounded-lg hover:bg-red-500/20 transition-colors uppercase tracking-wider"
                                        >
                                            Stop
                                        </button>
                                        <button
                                            onClick={() => handleCancelInvestment(inv.id)}
                                            className="bg-zinc-900 text-white border border-zinc-800 px-4 py-2 font-medium hover:bg-zinc-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
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
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Initial Amount ($)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 outline-none focus:border-white transition-colors"
                                        placeholder="10000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Profit % Per Payout</label>
                                    <input
                                        type="number"
                                        value={profitPercent}
                                        onChange={(e) => setProfitPercent(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 outline-none focus:border-white transition-colors"
                                        placeholder="1.8"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Duration (days)</label>
                                    <input
                                        type="number"
                                        value={durationDays}
                                        onChange={(e) => setDurationDays(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 outline-none focus:border-white transition-colors"
                                        placeholder="6"
                                        min="1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Payouts per day</label>
                                    <input
                                        type="number"
                                        value={payoutFrequency}
                                        onChange={(e) => setPayoutFrequency(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 outline-none focus:border-white transition-colors"
                                        placeholder="2"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {amount && profitPercent && durationDays && payoutFrequency && (
                                <div className="bg-[#00C805]/10 border border-[#00C805]/20 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between pb-3 border-b border-[#00C805]/20">
                                        <p className="text-xs text-zinc-500">Total Projected Profit</p>
                                        <p className="text-2xl font-bold text-[#00C805]">
                                            ${(parseFloat(amount) * (parseFloat(profitPercent) / 100) * parseInt(payoutFrequency) * parseInt(durationDays)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-[10px] text-zinc-600 mb-1">Per Payout</p>
                                            <p className="font-bold text-white">${(parseFloat(amount) * (parseFloat(profitPercent) / 100)).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-600 mb-1">Per Day</p>
                                            <p className="font-bold text-white">${(parseFloat(amount) * (parseFloat(profitPercent) / 100) * parseInt(payoutFrequency)).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 pt-2 border-t border-[#00C805]/20">
                                        {profitPercent}% × {payoutFrequency}x/day × {durationDays} days = {(parseFloat(profitPercent) * parseInt(payoutFrequency) * parseInt(durationDays)).toFixed(1)}% total return
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
                                    className="flex-1 bg-[#00C805] text-black py-3 rounded-xl font-bold hover:bg-[#00B004] transition-colors disabled:opacity-50"
                                >
                                    {processing ? "Creating..." : "Create Investment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Balance Modal */}
            {showBalanceModal && selectedUser && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider">
                                {balanceOperation === 'add' ? 'Add to' : 'Reduce'} Balance
                            </h3>
                            <button onClick={() => setShowBalanceModal(false)}><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Add/Reduce Toggle */}
                            <div className="flex bg-zinc-900 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setBalanceOperation('add')}
                                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${balanceOperation === 'add'
                                        ? 'bg-[#00C805] text-black'
                                        : 'text-zinc-500 hover:text-white'
                                        }`}
                                >
                                    ADD
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBalanceOperation('reduce')}
                                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${balanceOperation === 'reduce'
                                        ? 'bg-red-500 text-white'
                                        : 'text-zinc-500 hover:text-white'
                                        }`}
                                >
                                    REDUCE
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Balance Field</label>
                                <select
                                    value={balanceField}
                                    onChange={(e) => setBalanceField(e.target.value as 'available' | 'invested' | 'totalProfit' | 'bonus')}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none"
                                >
                                    <option value="available">Available Balance</option>
                                    <option value="invested">Total Invested</option>
                                    <option value="totalProfit">Total Profit</option>
                                    <option value="bonus">Bonus</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Amount (USD)</label>
                                <input
                                    type="number"
                                    value={newBalance}
                                    onChange={(e) => setNewBalance(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-lg text-white focus:border-white outline-none"
                                    step="0.01"
                                    placeholder="Enter amount"
                                />
                            </div>

                            <div className="bg-zinc-900 p-3 rounded text-center">
                                <p className="text-xs text-zinc-500 mb-1">Current {balanceField} Balance</p>
                                <p className="text-xl font-mono text-white">
                                    ${parseFloat(selectedUser.balance?.[balanceField]?.toString() || '0').toLocaleString()}
                                </p>
                            </div>

                            <button
                                onClick={handleUpdateBalance}
                                disabled={saving}
                                className={`w-full py-3 font-bold transition-colors disabled:opacity-50 ${balanceOperation === 'add'
                                    ? 'bg-[#00C805] text-black hover:bg-[#00B004]'
                                    : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                            >
                                {saving ? "SAVING..." : balanceOperation === 'add' ? "ADD BALANCE" : "REDUCE BALANCE"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
