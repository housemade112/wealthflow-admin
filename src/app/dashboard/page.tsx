"use client";

import { useEffect, useState } from "react";
import { getStats } from "@/lib/api";
import { Users, ArrowDownCircle, ArrowUpCircle, TrendingUp, DollarSign, Clock } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getStats();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-zinc-500">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <button
                    onClick={() => { setError(""); setLoading(true); loadStats(); }}
                    className="bg-white text-black px-4 py-2 rounded-xl font-bold hover:bg-zinc-200"
                >
                    Retry
                </button>
            </div>
        );
    }

    const statCards = [
        { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/20" },
        { label: "Active Users", value: stats?.activeUsers || 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/20" },
        { label: "Pending Deposits", value: stats?.pendingDeposits || 0, icon: ArrowDownCircle, color: "text-amber-500", bg: "bg-amber-500/20" },
        { label: "Pending Withdrawals", value: stats?.pendingWithdrawals || 0, icon: ArrowUpCircle, color: "text-rose-500", bg: "bg-rose-500/20" },
        { label: "Active Investments", value: stats?.activeInvestments || 0, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/20" },
        { label: "Total Available", value: `$${(stats?.totalBalance?.available || 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/20" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
                <p className="text-zinc-500">Overview of your investment platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <Icon size={24} className={stat.color} />
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-sm">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-zinc-500" />
                    Quick Actions
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <a href="/dashboard/deposits" className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 hover:border-amber-500 transition-colors">
                        <p className="font-bold text-amber-500">Review Deposits</p>
                        <p className="text-sm text-zinc-500">{stats?.pendingDeposits || 0} pending</p>
                    </a>
                    <a href="/dashboard/withdrawals" className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 hover:border-rose-500 transition-colors">
                        <p className="font-bold text-rose-500">Review Withdrawals</p>
                        <p className="text-sm text-zinc-500">{stats?.pendingWithdrawals || 0} pending</p>
                    </a>
                    <a href="/dashboard/investments" className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500 transition-colors">
                        <p className="font-bold text-purple-500">Manage Investments</p>
                        <p className="text-sm text-zinc-500">{stats?.activeInvestments || 0} active</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
