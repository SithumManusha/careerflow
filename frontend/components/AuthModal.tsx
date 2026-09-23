"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Lock, Mail, User, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register, demoLogin } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === "login") {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || "Login failed. Please check credentials.");
      }
    } else {
      const res = await register(email, password, fullName);
      if (!res.success) {
        setError(res.error || "Registration failed. Password must be >= 6 chars.");
      }
    }
    setLoading(false);
  };

  const handleDemo = async () => {
    setLoading(true);
    setError(null);
    await demoLogin();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-slate-200 relative">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">CareerFlow Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your ATS scan history, track keyword scores, and manage cloud CV drafts
          </p>
        </div>

        {/* 1-Click Quick Demo Sign-in */}
        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full mb-5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>⚡ 1-Click Demo Sign-In (Recruiter Preview)</span>
        </button>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase tracking-wider font-mono">Or with credentials</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-800/80 p-1 mb-5">
          <button
            type="button"
            onClick={() => { setTab("login"); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === "login" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab("register"); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === "register" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors mt-2 cursor-pointer"
          >
            {loading ? "Processing..." : tab === "login" ? "Sign In to Account" : "Register New Account"}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center mt-4">
          100% Data Privacy Guaranteed. Passwords are cryptographic salted hashes.
        </p>
      </div>
    </div>
  );
}
