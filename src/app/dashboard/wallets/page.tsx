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

const CRYPTO_OPTIONS = [
    { symbol: "BTC", name: "Bitcoin", network: "SegWit" },
    { symbol: "ETH", name: "Ethereum", network: "ERC-20" },
    { symbol: "USDT", name: "Tether", network: "TRC-20" },
    { symbol: "XRP", name: "Ripple", network: "Ripple" },
    { symbol: "BNB", name: "Binance Coin", network: "BSC" },
    { symbol: "SOL", name: "Solana", network: "Solana" },
];

export default function WalletsPage() {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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

    const handleCryptoSelect = (crypto: typeof CRYPTO_OPTIONS[0]) => {
        setForm({
            ...form,
            symbol: crypto.symbol,
            name: crypto.name,
            network: crypto.network,
        });
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
        if (!confirm("Delete this wallet?")) return;

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
        <div className="space-y-6 bg-black min-h-screen text-white font-sans">
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
                <div>
                    <h2 className="text-xl font-medium">Deposit Wallets</h2>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-bold hover:bg-zinc-200 transition-colors uppercase"
                >
                    <Plus size={16} />
                    Add Wallet
                </button>
            </div>

            <div className="border-t border-zinc-800">
                {loading ? (
                    <div className="p-12 text-center text-zinc-500 text-sm">
                        <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                        Loading...
                    </div>
                ) : wallets.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500 text-sm">
                        <p className="mb-2">No wallets configured.</p>
                        <p>Add a wallet to start accepting deposits.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-zinc-800">
                            <tr>
                                <th className="text-left py-4 font-medium text-zinc-500 uppercase w-24">Asset</th>
                                <th className="text-left py-4 font-medium text-zinc-500 uppercase w-32">Network</th>
                                <th className="text-left py-4 font-medium text-zinc-500 uppercase">Address</th>
                                <th className="text-left py-4 font-medium text-zinc-500 uppercase w-24">Status</th>
                                <th className="text-right py-4 font-medium text-zinc-500 uppercase w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {wallets.map((wallet) => (
                                <tr key={wallet.id} className="group hover:bg-zinc-900 transition-colors">
                                    <td className="py-4 font-medium text-white">{wallet.symbol}</td>
                                    <td className="py-4 text-zinc-400">{wallet.network}</td>
                                    <td className="py-4 font-mono text-zinc-400 text-xs">{wallet.address}</td>
                                    <td className="py-4">
                                        <button
                                            onClick={() => handleToggleActive(wallet)}
                                            className={`px-2 py-1 text-[10px] font-bold uppercase border transition-colors ${wallet.isActive
                                                    ? "bg-white text-black border-white"
                                                    : "bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600"
                                                }`}
                                        >
                                            {wallet.isActive ? "ACTIVE" : "INACTIVE"}
                                        </button>
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(wallet)}
                                                className="text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(wallet.id)}
                                                className="text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <h3 className="text-sm font-bold uppercase">
                                {editingWallet ? "Edit Wallet" : "Add New Wallet"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {error && (
                                <div className="border border-zinc-700 p-3 text-xs text-white bg-zinc-900">
                                    {error}
                                </div>
                            )}

                            {/* Quick Select Crypto */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase">Quick Select</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CRYPTO_OPTIONS.map((crypto) => (
                                        <button
                                            key={crypto.symbol}
                                            type="button"
                                            onClick={() => handleCryptoSelect(crypto)}
                                            className={`p-2 text-xs font-bold border transition-colors ${form.symbol === crypto.symbol
                                                    ? "bg-white text-black border-white"
                                                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600"
                                                }`}
                                        >
                                            {crypto.symbol}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase">Symbol</label>
                                    <input
                                        type="text"
                                        placeholder="BTC"
                                        value={form.symbol}
                                        onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                                        className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm text-white outline-none focus:border-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Bitcoin"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm text-white outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase">Network</label>
                                <input
                                    type="text"
                                    placeholder="e.g. SegWit"
                                    value={form.network}
                                    onChange={(e) => setForm({ ...form, network: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm text-white outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase">Wallet Address</label>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm font-mono text-white outline-none focus:border-white transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex gap-0 border-t border-zinc-800">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-zinc-900 py-4 text-sm font-medium hover:bg-zinc-800 transition-colors border-r border-zinc-800"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-white text-black py-4 text-sm font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                {saving ? "SAVING..." : "SAVE WALLET"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
