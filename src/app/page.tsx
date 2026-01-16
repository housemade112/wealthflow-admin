"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

// CHANGE THIS PASSPHRASE TO YOUR SECRET
const ADMIN_PASSPHRASE = "upwork101@";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already unlocked in session
  useEffect(() => {
    const unlocked = sessionStorage.getItem("adminUnlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const handlePassphraseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === ADMIN_PASSPHRASE) {
      setIsUnlocked(true);
      sessionStorage.setItem("adminUnlocked", "true");
      setError("");
    } else {
      setError("Invalid passphrase");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      if (data.user.role !== "ADMIN") {
        setError("Access denied. Admin only.");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // PASSPHRASE GATE
  if (!isUnlocked) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} className="min-h-screen bg-black flex items-center justify-center p-4">
        <div style={{ width: '100%', maxWidth: '28rem' }} className="w-full max-w-md">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="text-center mb-8">
            <div style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', background: '#18181b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="w-16 h-16 mx-auto mb-4 bg-zinc-900 rounded-full flex items-center justify-center">
              <svg style={{ width: '2rem', height: '2rem', color: '#fff' }} className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }} className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
            <p style={{ color: '#71717a', fontSize: '0.875rem' }} className="text-zinc-500 text-sm">Enter passphrase to continue</p>
          </div>

          <form onSubmit={handlePassphraseSubmit} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '2rem' }} className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 space-y-6">
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', padding: '1rem', color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }} className="space-y-2">
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }} className="text-xs font-bold text-zinc-500 uppercase">Passphrase</label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                style={{ width: '100%', background: '#000', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1rem', color: '#fff', outline: 'none', textAlign: 'center', letterSpacing: '0.1em' }}
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-white transition-colors text-center tracking-widest"
                placeholder="••••••••••••"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', background: '#fff', color: '#000', fontWeight: 'bold', padding: '1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Unlock
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#52525b', fontSize: '0.75rem', marginTop: '1.5rem' }} className="text-center text-zinc-600 text-xs mt-6">
            Unauthorized access attempts are logged
          </p>
        </div>
      </div>
    );
  }

  // ADMIN LOGIN (after passphrase)
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">WealthBridg Admin</h1>
          <p className="text-zinc-500">Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-white transition-colors"
              placeholder="admin@wealthbridg.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-white transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
