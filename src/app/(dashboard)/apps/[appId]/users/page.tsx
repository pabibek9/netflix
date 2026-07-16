"use client";

import React, { useState, useMemo, use } from "react";
import { useProjects, MockUser } from "@/context/ProjectContext";
import { ChevronLeft, Search, User, Mail, X, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function SimplifiedUsersPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { projects, projectUsers } = useProjects();
  const currentProject = projects.find(p => p.id === resolvedParams.appId);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

  if (!currentProject) {
    notFound();
  }

  const usersList = projectUsers[currentProject.id] || [];

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return usersList;
    const q = searchQuery.toLowerCase();
    return usersList.filter(u => 
      (u.displayName || "").toLowerCase().includes(q) || 
      (u.email || "").toLowerCase().includes(q) || 
      u.uid.toLowerCase().includes(q)
    );
  }, [usersList, searchQuery]);

  // Format database key names for easy reading by seniors (e.g. businessOrganization -> Business Organization)
  const formatFieldLabel = (label: string) => {
    return label
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans select-none">
      
      {/* Top Header */}
      <header className="border-b border-zinc-900 bg-[#09090B] py-4 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <Link 
          href="/apps"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition uppercase font-mono font-bold tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${currentProject.logo}`}>
            {currentProject.name[0]}
          </div>
          <span className="text-xs font-bold tracking-wider text-white uppercase font-mono">
            {currentProject.name} Operators
          </span>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Simple Search Input */}
        <div className="relative w-full max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Type name or email to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111113] border border-zinc-800 focus:border-zinc-700 text-zinc-200 placeholder-zinc-600 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition"
          />
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="py-20 border border-dashed border-zinc-850 rounded-2xl text-center max-w-xl mx-auto">
            <User className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-xs text-zinc-500">No matching operators found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredUsers.map((u) => (
              <motion.div
                key={u.uid}
                onClick={() => setSelectedUser(u)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#111113] border border-zinc-850 hover:border-zinc-700 rounded-xl overflow-hidden cursor-pointer shrink-0 transition flex flex-col justify-between"
              >
                {/* User avatar cover picture (like Netflix poster tile) */}
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
                  
                  {/* Status Indicator Dot */}
                  <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${
                    u.status === "active" ? "bg-emerald-500" : "bg-zinc-600"
                  }`} />
                </div>

                {/* Card footer description */}
                <div className="p-3 space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-200 truncate">{u.displayName}</h4>
                  <p className="text-[9px] text-zinc-500 truncate font-mono">{u.email || "No email"}</p>
                  <div className="pt-2 flex items-center justify-between">
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

      </main>

      {/* Slide-Over Dossier Details */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            
            {/* Dimmed background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Sidebar dossier card panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
              className="relative w-full max-w-md bg-[#111113] border-l border-zinc-850 h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              
              <div className="space-y-6">
                
                {/* Dossier Header */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">User Dossier</h3>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Big profile avatar card */}
                <div className="flex items-center gap-4 p-4 bg-[#09090B] border border-zinc-850 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-zinc-850 border border-zinc-850 flex items-center justify-center overflow-hidden shrink-0">
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
                      <span>{selectedUser.email || "No email address"}</span>
                    </p>
                  </div>
                </div>

                {/* Key Account metrics */}
                <div className="space-y-3">
                  <h4 className="text-zinc-400 text-xs font-semibold uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#E50914]" /> Account Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 bg-[#09090B] border border-zinc-850 p-4 rounded-xl text-[10px]">
                    <div>
                      <span className="text-zinc-500 block font-mono">ACCESS ROLE</span>
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

                {/* Complete Firestore Properties list */}
                <div className="space-y-3">
                  <h4 className="text-zinc-400 text-xs font-semibold uppercase font-mono tracking-wider">Firestore Properties</h4>
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

              {/* Dossier footer metadata */}
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
