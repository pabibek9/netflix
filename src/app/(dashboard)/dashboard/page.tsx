"use client";

import React, { useState, useMemo } from "react";
import { useProjects, MockUser } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { X, Mail, Shield, User, Globe, Laptop, Calendar, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SimplifiedOperatorDashboard() {
  const { projects, projectUsers } = useProjects();
  const { logout } = useAuth();
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

  // Group users by project ID
  const projectRows = useMemo(() => {
    return projects.map(p => {
      const usersList = projectUsers[p.id] || [];
      return {
        project: p,
        users: usersList
      };
    });
  }, [projects, projectUsers]);

  // Clean helper to format document keys for easy reading by an old man
  const formatFieldLabel = (label: string) => {
    // categoryName -> Category Name
    return label
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans select-none">
      
      {/* Top Bar Navigation */}
      <header className="border-b border-zinc-900 bg-[#09090B] py-4 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-[#E50914] tracking-tighter">C</span>
          <span className="text-sm font-bold tracking-wider text-white uppercase font-mono">Control Center</span>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-[#E50914] text-xs font-semibold rounded-lg transition duration-150 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Portal</span>
        </button>
      </header>

      {/* Rows Container */}
      <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {projectRows.map(({ project, users }) => (
          <div key={project.id} className="space-y-3">
            
            {/* Project Header Row */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${users.length > 0 ? "bg-emerald-500 shadow-[0_0_8px_#10B981]" : "bg-zinc-700"}`} />
                <h2 className="text-sm font-bold text-white tracking-wider uppercase font-mono">{project.name}</h2>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                {users.length} {users.length === 1 ? "operator" : "operators"}
              </span>
            </div>

            {/* Netflix Scrollable Row */}
            {users.length === 0 ? (
              <div className="py-8 bg-[#111113]/30 border border-zinc-900 rounded-xl text-center">
                <p className="text-xs text-zinc-650 italic">No operators logged in this database.</p>
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {users.map((u) => (
                  <motion.div
                    key={u.uid}
                    onClick={() => setSelectedUser(u)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-40 sm:w-44 bg-[#111113] border border-zinc-850 hover:border-zinc-700 rounded-xl overflow-hidden cursor-pointer shrink-0 transition flex flex-col justify-between"
                  >
                    {/* User profile picture (like a movie cover tile) */}
                    <div className="w-full h-32 sm:h-36 bg-zinc-900/60 border-b border-zinc-850 flex items-center justify-center overflow-hidden relative">
                      {u.avatarUrl ? (
                        <img 
                          src={u.avatarUrl} 
                          alt={u.displayName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-lg">
                          {u.displayName[0] || u.email[0]}
                        </div>
                      )}
                      
                      {/* Active Status Dot */}
                      <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${
                        u.status === "active" ? "bg-emerald-500" : "bg-zinc-600"
                      }`} />
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="p-3 space-y-0.5">
                      <h4 className="text-xs font-bold text-zinc-200 truncate">{u.displayName}</h4>
                      <p className="text-[9px] text-zinc-500 truncate font-mono">{u.email}</p>
                      <div className="pt-1.5 flex items-center justify-between">
                        <span className="text-[8px] uppercase tracking-wider font-mono font-bold text-[#E50914]">
                          {u.role}
                        </span>
                        <span className="text-[8px] text-zinc-600 font-mono font-bold">
                          {u.platform || "Web"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        ))}
      </main>

      {/* Slide-Over User Details Overlay */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            
            {/* Dark background fade click-away */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Sidebar Details Card */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
              className="relative w-full max-w-md bg-[#111113] border-l border-zinc-850 h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              
              <div className="space-y-6">
                
                {/* Details Header */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">User Dossier</h3>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Card Big */}
                <div className="flex items-center gap-4 p-4 bg-[#09090B] border border-zinc-850 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-zinc-850 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    {selectedUser.avatarUrl ? (
                      <img src={selectedUser.avatarUrl} alt={selectedUser.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-zinc-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-white truncate">{selectedUser.displayName}</h2>
                    <p className="text-[10px] text-zinc-500 font-mono truncate flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span>{selectedUser.email || "No email provided"}</span>
                    </p>
                  </div>
                </div>

                {/* Primary properties list */}
                <div className="space-y-3">
                  <h4 className="text-zinc-400 text-xs font-semibold uppercase font-mono tracking-wider">Account Level</h4>
                  <div className="grid grid-cols-2 gap-3 bg-[#09090B] border border-zinc-850 p-4 rounded-xl text-[10px]">
                    <div>
                      <span className="text-zinc-500 block font-mono">ROLE ACCESS</span>
                      <span className="text-zinc-300 font-bold mt-1 block uppercase text-[#E50914]">{selectedUser.role}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block font-mono">ACCOUNT STATUS</span>
                      <span className={`font-bold mt-1 block uppercase ${
                        selectedUser.status === "active" ? "text-emerald-400" : "text-zinc-400"
                      }`}>{selectedUser.status}</span>
                    </div>
                  </div>
                </div>

                {/* Firestore Database Records (All Details) */}
                <div className="space-y-3">
                  <h4 className="text-zinc-400 text-xs font-semibold uppercase font-mono tracking-wider">Database Records</h4>
                  <div className="bg-[#09090B] border border-zinc-850 p-4 rounded-xl divide-y divide-zinc-900 text-[10px]">
                    {selectedUser.rawDoc && Object.keys(selectedUser.rawDoc).length > 0 ? (
                      Object.entries(selectedUser.rawDoc)
                        .filter(([key]) => !["avatarUrl", "photoURL", "displayName", "name", "email"].includes(key))
                        .map(([key, val]) => (
                          <div key={key} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1">
                            <span className="text-zinc-500 font-semibold font-mono uppercase tracking-wider">
                              {formatFieldLabel(key)}
                            </span>
                            <span className="text-zinc-200 font-semibold leading-relaxed break-words">
                              {typeof val === "object" ? JSON.stringify(val) : String(val)}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-zinc-650 italic text-center py-4">No additional Firestore records saved for this user.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Drawer footer metadata */}
              <div className="border-t border-zinc-900 pt-4 flex items-center justify-between text-[8px] text-zinc-500 font-mono uppercase">
                <span>UID: {selectedUser.uid}</span>
                <span>System Authenticated</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
