"use client";

import { useEffect, useState } from "react";
import { getStats } from "@/lib/api";
import Link from "next/link";
import { Users, ArrowDownCircle, ArrowUpCircle, TrendingUp, DollarSign, Clock, Rocket } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deploying, setDeploying] = useState(false);
    const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle");

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

    const triggerDeploy = async () => {
        const deployHookUrl = process.env.NEXT_PUBLIC_DEPLOY_HOOK_URL;

        if (!deployHookUrl) {
            setDeployStatus("error");
            setTimeout(() => setDeployStatus("idle"), 3000);
            return;
        }

        try {
            setDeploying(true);
            setDeployStatus("idle");

            const response = await fetch(deployHookUrl, {
                method: "POST",
            });

            if (response.ok) {
                setDeployStatus("success");
                setTimeout(() => setDeployStatus("idle"), 5000);
            } else {
                setDeployStatus("error");
                setTimeout(() => setDeployStatus("idle"), 3000);
            }
        } catch (err) {
            setDeployStatus("error");
            setTimeout(() => setDeployStatus("idle"), 3000);
        } finally {
            setDeploying(false);
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
        { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, href: "/dashboard/users" },
        { label: "Active Users", value: stats?.activeUsers || 0, icon: Users, href: "/dashboard/users?status=active" },
        { label: "Pending Deposits", value: stats?.pendingDeposits || 0, icon: ArrowDownCircle, href: "/dashboard/deposits" },
        { label: "Pending Withdrawals", value: stats?.pendingWithdrawals || 0, icon: ArrowUpCircle, href: "/dashboard/withdrawals" },
        { label: "Active Investments", value: stats?.activeInvestments || 0, icon: TrendingUp, href: "/dashboard/investments" },
        { label: "Total Available", value: `$${(stats?.totalBalance?.available || 0).toLocaleString()}`, icon: DollarSign, href: "/dashboard/users" },
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
                        <Link key={stat.label} href={stat.href} className="block group">
                            <div className="bg-zinc-950 border border-zinc-800 p-6 transition-all duration-200 group-hover:border-[#00C805]/50 group-hover:bg-zinc-900/50 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-[#00C805]/10 group-hover:border-[#00C805]/30 transition-colors">
                                        <Icon size={24} className="text-zinc-500 group-hover:text-[#00C805] transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-sm">{stat.label}</p>
                                        <p className="text-2xl font-medium text-white">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
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

            {/* Deploy Section */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Rocket size={20} className="text-[#00C805]" />
                    Deployment
                </h3>
                <div className="flex items-center gap-4">
                    <button
                        onClick={triggerDeploy}
                        disabled={deploying}
                        className="flex items-center gap-2 bg-[#00C805] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#00B004] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Rocket size={18} />
                        {deploying ? "Deploying..." : "Deploy Updates"}
                    </button>
                    {deployStatus === "success" && (
                        <p className="text-sm text-[#00C805] font-medium">✓ Deployment triggered successfully!</p>
                    )}
                    {deployStatus === "error" && (
                        <p className="text-sm text-red-500 font-medium">✗ Deploy hook not configured. Add NEXT_PUBLIC_DEPLOY_HOOK_URL env variable.</p>
                    )}
                </div>
                <p className="text-xs text-zinc-600 mt-3">
                    Click to trigger a new deployment from the latest code in main branch
                </p>
            </div>
        </div>
    );
}
