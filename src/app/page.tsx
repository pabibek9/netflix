"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Database } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid administrator credentials. Access Denied.");
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("admin@controlcenter.co");
    setPassword("admin123");
    setError("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090B] px-4 relative overflow-hidden select-none">
      {/* Background radial accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E50914]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[420px] bg-[#111113] border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#E50914] flex items-center justify-center shadow-lg shadow-[#E50914]/25 mb-4 group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wider">CONTROL CENTER</h1>
          <p className="text-xs text-zinc-500 mt-1.5 uppercase font-mono tracking-widest">Enterprise Firebase Console</p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-start gap-2.5 p-3 rounded-lg bg-red-950/20 border border-red-800/40 text-red-400 text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-zinc-500 font-mono block mb-1.5 uppercase tracking-wider">ADMINISTRATOR EMAIL</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="admin@controlcenter.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#09090B] border border-zinc-800 text-zinc-200 placeholder-zinc-600 text-xs rounded-lg pl-9 pr-4 py-2.5 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]/20 transition outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] text-zinc-500 font-mono block uppercase tracking-wider">PASSWORD</label>
              <span className="text-[10px] text-zinc-600 hover:text-zinc-400 cursor-pointer transition">Forgot password?</span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#09090B] border border-zinc-800 text-zinc-200 placeholder-zinc-600 text-xs rounded-lg pl-9 pr-4 py-2.5 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]/20 transition outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-2.5 bg-[#E50914] hover:bg-[#B8070F] disabled:bg-zinc-800 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-lg shadow-[#E50914]/15 focus:ring-2 focus:ring-[#E50914]/30"
          >
            {isLoading ? "Validating Session..." : "Authorize Access"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Helper Panel */}
        <div className="mt-8 border-t border-zinc-800/80 pt-6 flex flex-col items-center">
          <p className="text-[10px] text-zinc-500 text-center mb-3">To verify client-side dashboard telemetry & visual components:</p>
          <button
            onClick={handleDemoFill}
            className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[10px] font-mono rounded-lg flex items-center gap-1.5 transition duration-150 active:scale-98"
          >
            <Database className="w-3.5 h-3.5 text-[#E50914]" />
            Autofill Sandbox Admin
          </button>
        </div>
      </motion.div>
    </main>
  );
}
