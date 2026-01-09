"use client";

import { useEffect, useState } from "react";
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from "@/lib/api";
import { Check, X, Clock, CheckCircle, XCircle, Wallet } from "lucide-react";

export default function WithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadWithdrawals();
    }, [statusFilter]);

    const loadWithdrawals = async () => {
        try {
            setLoading(true);
            const data = await getWithdrawals(statusFilter);
            setWithdrawals(data.withdrawals || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            setProcessing(id);
            await approveWithdrawal(id);
            loadWithdrawals();
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        const note = prompt("Rejection reason (optional):");
        try {
            setProcessing(id);
            await rejectWithdrawal(id, note || undefined);
            loadWithdrawals();
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING": return <Clock size={16} className="text-zinc-500" />;
            case "APPROVED": return <CheckCircle size={16} className="text-white" />;
            case "REJECTED": return <XCircle size={16} className="text-zinc-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Withdrawals</h2>
                <p className="text-zinc-500">Review and approve user withdrawal requests</p>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
                {["PENDING", "APPROVED", "REJECTED"].map((status) => (
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

            {/* Withdrawals List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                        Loading...
                    </div>
                ) : withdrawals.length === 0 ? (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                        No {statusFilter.toLowerCase()} withdrawals
                    </div>
                ) : (
                    withdrawals.map((withdrawal) => (
                        <div
                            key={withdrawal.id}
                            className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getStatusIcon(withdrawal.status)}
                                        <span className="text-xs font-medium text-zinc-400 uppercase">
                                            {withdrawal.status}
                                        </span>
                                    </div>
                                    <p className="font-bold">{withdrawal.user?.email || "Unknown User"}</p>
                                    <p className="text-zinc-500 text-sm">{withdrawal.user?.fullName}</p>
                                </div>

                                <div className="text-center md:text-right">
                                    <p className="text-2xl font-medium text-white">${withdrawal.amount?.toLocaleString()}</p>
                                    <p className="text-xs text-zinc-500">{withdrawal.method?.toUpperCase()}</p>
                                </div>

                                <div className="text-sm text-zinc-500">
                                    <p>{new Date(withdrawal.createdAt).toLocaleDateString()}</p>
                                    <p>{new Date(withdrawal.createdAt).toLocaleTimeString()}</p>
                                </div>

                                {withdrawal.status === "PENDING" && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(withdrawal.id)}
                                            disabled={processing === withdrawal.id}
                                            className="flex items-center gap-2 bg-white text-black px-4 py-2 font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                        >
                                            <Check size={18} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(withdrawal.id)}
                                            disabled={processing === withdrawal.id}
                                            className="flex items-center gap-2 bg-zinc-900 text-white border border-zinc-800 px-4 py-2 font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                        >
                                            <X size={18} />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>

                            {withdrawal.walletAddress && (
                                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2">
                                    <Wallet size={16} className="text-zinc-500" />
                                    <p className="text-xs text-zinc-500 font-mono">{withdrawal.walletAddress}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
