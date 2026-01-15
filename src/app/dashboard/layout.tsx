"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Users,
    ArrowDownCircle,
    ArrowUpCircle,
    TrendingUp,
    LogOut,
    Menu,
    X,
    Wallet
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/deposits", label: "Deposits", icon: ArrowDownCircle },
    { href: "/dashboard/withdrawals", label: "Withdrawals", icon: ArrowUpCircle },
    { href: "/dashboard/investments", label: "Investments", icon: TrendingUp },
    { href: "/dashboard/wallets", label: "Wallets", icon: Wallet },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        const userData = localStorage.getItem("adminUser");

        if (!token) {
            router.push("/");
            return;
        }

        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-black flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50
        w-72 bg-zinc-950 border-r border-zinc-900
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                        <h1 className="text-xl font-bold tracking-tight">WealthBridg</h1>
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-white text-black px-2 py-0.5 border border-white">Admin</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                    ${isActive
                                            ? "bg-white text-black font-bold"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                        }
                  `}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info & logout */}
                    <div className="p-4 border-t border-zinc-800">
                        {user && (
                            <div className="mb-4 px-4">
                                <p className="text-sm font-bold truncate">{user.email}</p>
                                <p className="text-xs text-zinc-500">Administrator</p>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-zinc-900 p-4 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 hover:bg-zinc-900 rounded-lg text-white"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="font-bold text-white text-lg">Admin Panel</h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </header>

                {/* Page content */}
                <main className="p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
