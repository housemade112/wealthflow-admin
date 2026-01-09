"use client";

import { useEffect, useState } from "react";
import { getWallets, createWallet, updateWallet, deleteWallet } from "@/lib/api";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface Wallet {
    id: string;
    symbol: string;
    name: string;
    network: string;
    address: string;
    icon?: string;
    isActive: boolean;
}

export default function WalletsPage() {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [form, setForm] = useState({
        symbol: "",
        name: "",
        network: "",
        address: "",
        icon: "",
    });

    useEffect(() => {
        loadWallets();
    }, []);

    const loadWallets = async () => {
        try {
            setLoading(true);
            const data = await getWallets();
            setWallets(data.wallets || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingWallet(null);
        setForm({ symbol: "", name: "", network: "", address: "", icon: "" });
        setError("");
        setShowModal(true);
    };

    const openEditModal = (wallet: Wallet) => {
        setEditingWallet(wallet);
        setForm({
            symbol: wallet.symbol,
            name: wallet.name,
            network: wallet.network,
            address: wallet.address,
            icon: wallet.icon || "",
        });
        setError("");
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.symbol || !form.name || !form.network || !form.address) {
            setError("All fields except icon are required");
            return;
        }

        setSaving(true);
        setError("");

        try {
            if (editingWallet) {
                await updateWallet(editingWallet.id, form);
            } else {
                await createWallet(form);
            }
            setShowModal(false);
            loadWallets();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this wallet address? Users will no longer see it.")) return;

        try {
            await deleteWallet(id);
            loadWallets();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleToggleActive = async (wallet: Wallet) => {
        try {
            await updateWallet(wallet.id, { isActive: !wallet.isActive });
            loadWallets();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Wallet Addresses</h2>
                    <p className="text-zinc-500 text-sm mt-1">
                        Manage deposit addresses shown to users
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                >
                    <Plus size={18} />
                    Add Wallet
                </button>
            </div>

            {/* Wallets Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-zinc-500">
                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                        Loading...
                    </div>
                ) : wallets.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        <p className="mb-2">No wallet addresses configured</p>
                        <p className="text-sm">Add your first wallet address to enable deposits</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-zinc-900 border-b border-zinc-800">
                            <tr>
                                <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Asset</th>
                                <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Network</th>
                                <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Address</th>
                                <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                                <th className="text-right p-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {wallets.map((wallet) => (
                                <tr key={wallet.id} className="hover:bg-zinc-900/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {wallet.icon ? (
                                                <img src={wallet.icon} alt={wallet.symbol} className="w-8 h-8 rounded-full" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                                                    {wallet.symbol.slice(0, 2)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{wallet.symbol}</p>
                                                <p className="text-sm text-zinc-500">{wallet.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-zinc-800 rounded text-xs font-medium">
                                            {wallet.network}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <code className="text-xs text-zinc-400 font-mono">
                                            {wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}
                                        </code>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggleActive(wallet)}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${wallet.isActive
                                                    ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                                }`}
                                        >
                                            {wallet.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEditModal(wallet)}
                                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={16} className="text-zinc-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(wallet.id)}
                                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} className="text-rose-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <h3 className="text-lg font-bold">
                                {editingWallet ? "Edit Wallet Address" : "Add Wallet Address"}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-zinc-800 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase">Symbol</label>
                                    <input
                                        type="text"
                                        placeholder="BTC"
                                        value={form.symbol}
                                        onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Bitcoin"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase">Network</label>
                                <input
                                    type="text"
                                    placeholder="Bitcoin / ERC20 / TRC20"
                                    value={form.network}
                                    onChange={(e) => setForm({ ...form, network: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase">Wallet Address</label>
                                <input
                                    type="text"
                                    placeholder="bc1q..."
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono outline-none focus:border-zinc-600 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase">Icon URL (optional)</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={form.icon}
                                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-zinc-800">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-zinc-800 py-3 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : editingWallet ? "Save Changes" : "Add Wallet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
