"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  User, Mail, ShieldAlert, Check, LogOut, 
  Monitor, Key, ShieldCheck, Clock, MapPin
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "Alexander Wright");
  const [email] = useState(user?.email || "admin@controlcenter.co");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passError, setPassError] = useState("");

  if (!user) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");

    if (password) {
      if (password !== confirmPassword) {
        setPassError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setPassError("Password must be at least 6 characters.");
        return;
      }
    }

    setSaveSuccess(true);
    setPassword("");
    setConfirmPassword("");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 select-none text-xs">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Admin Profile</h1>
        <p className="text-xs text-zinc-500 mt-1">Manage your console profile identity and active login sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card Summary */}
        <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl flex flex-col items-center justify-between text-center">
          <div className="space-y-4 flex flex-col items-center">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-16 h-16 rounded-full border border-zinc-800 bg-zinc-900"
            />
            <div className="leading-tight">
              <h3 className="text-sm font-bold text-white">{user.displayName}</h3>
              <span className="text-[10px] font-mono text-[#E50914] uppercase font-bold tracking-widest block mt-1">{user.role}</span>
            </div>
            <p className="text-[10px] text-zinc-555 font-mono select-all mt-1">{user.email}</p>
          </div>

          <button
            onClick={logout}
            className="w-full mt-8 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-350 hover:text-white rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out of Session
          </button>
        </div>

        {/* Update Form (2/3 width) */}
        <div className="md:col-span-2 bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-6">
          <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><User className="w-4 h-4 text-zinc-400" /> Account Security Details</h3>
          
          {passError && (
            <div className="flex gap-2 p-3 bg-red-950/20 border border-red-900/30 text-[#E50914] rounded-lg items-center">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">DISPLAY NAME</label>
                <input
                  type="text"
                  required
                  placeholder="Alexander Wright"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">EMAIL ADDRESS</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-[#09090B]/60 border border-zinc-850 text-zinc-550 text-xs rounded-lg px-3 py-2 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/80 pt-4">
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">NEW PASSWORD (OPTIONAL)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-850 flex gap-3 items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-mono">Profile changes are applied immediately.</span>
              <button
                type="submit"
                className="py-2 px-5 bg-[#E50914] hover:bg-[#B8070F] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Profile
              </button>
            </div>

            {saveSuccess && (
              <p className="text-right font-mono text-[9px] text-emerald-450 font-bold uppercase tracking-wider animate-pulse">
                Profile updated.
              </p>
            )}
          </form>
        </div>

      </div>

      {/* Active sessions tracking */}
      <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-zinc-400" /> Authorized Login Sessions</h3>
        
        <div className="space-y-3">
          {[
            { device: "Chrome / macOS (MacBook Pro M3)", location: "Ashburn, VA, United States", ip: "136.226.14.120", time: "Active Now (Current Session)" },
            { device: "Safari / iOS (iPhone 15 Pro)", location: "Washington, DC, United States", ip: "172.56.21.42", time: "Authorized 2 hours ago" }
          ].map((sess, idx) => (
            <div key={idx} className="flex gap-4 items-start p-3 bg-[#09090B] border border-zinc-850 rounded-lg">
              <div className="p-2 bg-zinc-900 text-zinc-550 border border-zinc-800 rounded-lg">
                <Monitor className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-200 font-semibold">{sess.device}</span>
                  <span className="text-[9px] text-[#E50914] font-mono font-semibold uppercase">{sess.time}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-[9px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {sess.location}</span>
                  <span>IP: {sess.ip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
