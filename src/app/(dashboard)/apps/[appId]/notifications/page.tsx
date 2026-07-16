"use client";

import React, { useState, useTransition, use } from "react";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell, Mail, Send, Calendar, Clock, X, 
  CheckCircle, ShieldAlert, Sparkles, Filter, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function NotificationsHubPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { notifications, sendNewNotification } = useProjects();
  const { hasPermission } = useAuth();

  // Campaign Form State
  const [notifType, setNotifType] = useState<"push" | "email">("push");
  const [target, setTarget] = useState<"all" | "vip" | "single" | "segment">("all");
  const [targetUser, setTargetUser] = useState("");
  const [segment, setSegment] = useState("iOS platform users");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  
  // Scheduling State
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    // RBAC Validation
    if (!hasPermission("Support")) return;
    if (target === "all" && !hasPermission("Admin")) {
      alert("Only Admins and Owners can target ALL users in a notification broadcast.");
      return;
    }

    sendNewNotification({
      type: notifType,
      target,
      targetUser: target === "single" ? targetUser : undefined,
      segment: target === "segment" ? segment : undefined,
      title,
      body,
      scheduledFor: scheduleLater ? scheduleTime || new Date(Date.now() + 3600000).toISOString() : undefined
    });

    // Reset Form
    setTitle("");
    setBody("");
    setTargetUser("");
    setScheduleLater(false);
    setScheduleTime("");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Notification Campaigns</h1>
        <p className="text-xs text-zinc-500 mt-1">Broadcast push messages, dispatch transactional emails, and schedule delivery triggers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dispatch Form (2/3 width) */}
        <div className="lg:col-span-2 bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-white flex items-center gap-1.5"><Send className="w-4 h-4 text-[#E50914]" /> Launch Broadcast Campaign</span>
            {!hasPermission("Support") && (
              <span className="text-[9px] text-amber-500 font-mono flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Insufficient Roles (Requires Support+)
              </span>
            )}
          </div>

          <form onSubmit={handleDispatch} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">CAMPAIGN TYPE</label>
                <div className="grid grid-cols-2 bg-[#09090B] border border-zinc-800 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setNotifType("push")}
                    className={`py-1.5 rounded-md text-[10px] font-mono tracking-wider transition ${
                      notifType === "push" ? "bg-[#111113] text-white" : "text-zinc-550 hover:text-zinc-350"
                    }`}
                  >
                    Push Notif
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifType("email")}
                    className={`py-1.5 rounded-md text-[10px] font-mono tracking-wider transition ${
                      notifType === "email" ? "bg-[#111113] text-white" : "text-zinc-550 hover:text-zinc-350"
                    }`}
                  >
                    Email HTML
                  </button>
                </div>
              </div>

              {/* Target Segment */}
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">TARGET CUSTOMER AUDIENCE</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-400 font-mono text-[10px] rounded-lg p-2 outline-none cursor-pointer focus:border-zinc-700"
                >
                  <option value="all">All Registered Accounts</option>
                  <option value="vip">VIP Members (Tier = vip)</option>
                  <option value="segment">Geographic / Platform Segment</option>
                  <option value="single">Single Account UID</option>
                </select>
              </div>
            </div>

            {/* Target deep settings */}
            <AnimatePresence mode="wait">
              {target === "single" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">CONSUMER UID</label>
                  <input
                    type="text"
                    required
                    placeholder="netflix-prod-user-admin"
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 font-mono text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                  />
                </motion.div>
              )}
              {target === "segment" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">FILTER WORKFLOW GROUP</label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full bg-[#09090B] border border-zinc-800 text-zinc-400 font-mono text-[10px] rounded-lg p-2 outline-none cursor-pointer focus:border-zinc-700"
                  >
                    <option value="iOS platform users">iOS Application Users</option>
                    <option value="Android platform users">Android Application Users</option>
                    <option value="Users from USA">Region: United States (USA)</option>
                    <option value="Google OAuth accounts">Auth provider: Google OAuth</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notification fields */}
            <div>
              <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">CAMPAIGN TITLE / SUBJECT</label>
              <input
                type="text"
                required
                placeholder="Alert: Security update required"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
              />
            </div>

            <div>
              <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">MESSAGE PAYLOAD BODY</label>
              <textarea
                rows={4}
                required
                placeholder="We have detected an authorization mismatch on your client side device. Please sign out and sign back in to apply the profile update."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg p-3 outline-none focus:border-[#E50914] transition resize-none"
              />
            </div>

            {/* Scheduling settings */}
            <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="scheduleCheck"
                  checked={scheduleLater}
                  onChange={(e) => setScheduleLater(e.target.checked)}
                  className="cursor-pointer accent-[#E50914]"
                />
                <label htmlFor="scheduleCheck" className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider cursor-pointer">Queue dispatch task for later</label>
              </div>

              <AnimatePresence>
                {scheduleLater && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <input
                      type="datetime-local"
                      required
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="bg-[#09090B] border border-zinc-800 text-zinc-400 font-mono text-[9px] rounded px-2.5 py-1.5 outline-none focus:border-zinc-700 cursor-pointer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={!hasPermission("Support")}
              className="w-full py-2.5 bg-[#E50914] hover:bg-[#B8070F] disabled:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-lg shadow-[#E50914]/10 active:scale-98"
            >
              <Send className="w-4 h-4" />
              {scheduleLater ? "Queue Broadcast Task" : "Dispatch Broadcast Immediately"}
            </button>
          </form>
        </div>

        {/* Campaign Logs History (1/3 width) */}
        <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-white flex items-center gap-1.5"><Calendar className="w-4 h-4 text-zinc-500" /> Broadcast History</span>
              <p className="text-[9px] text-zinc-500 mt-1 uppercase font-mono">Dispatched payloads registry</p>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-3.5 bg-[#09090B]/60 border border-zinc-850 rounded-xl space-y-2 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      notif.type === "push" ? "bg-blue-950/40 text-blue-400 border border-blue-900/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700/20"
                    }`}>
                      {notif.type.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1 text-[8px] font-mono">
                      {notif.status === "sent" ? (
                        <span className="text-emerald-400 font-semibold">DISPATCHED</span>
                      ) : (
                        <span className="text-amber-500 font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> SCHEDULED</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-zinc-200 truncate">{notif.title}</h5>
                    <p className="text-zinc-500 leading-normal line-clamp-2 mt-0.5">{notif.body}</p>
                  </div>

                  <div className="pt-2 border-t border-zinc-900/80 flex items-center justify-between text-[8px] font-mono text-zinc-650">
                    <span className="uppercase">To: {notif.target} {notif.segment ? `(${notif.segment})` : ""}</span>
                    <span>{notif.sentAt ? new Date(notif.sentAt).toLocaleDateString() : new Date(notif.scheduledFor || "").toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
