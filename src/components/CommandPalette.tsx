"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/context/ProjectContext";
import { Search, Sparkles, Database, Users, HardDrive, FileText, Settings, LogOut, ArrowRight, CornerDownLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { projects, users, collections, storageFiles, setCurrentProjectId, currentProjectId } = useProjects();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Compute search results
  const getFilteredItems = () => {
    if (!query) {
      // Default actions and shortcuts
      return [
        { type: "action", id: "nav-dash", title: "Go to Overview Dashboard", subtitle: "Overview stats & telemetry", icon: Sparkles, action: () => router.push("/dashboard") },
        { type: "action", id: "nav-apps", title: "View All Firebase Projects", subtitle: "Select another environment", icon: Database, action: () => router.push("/apps") },
        { type: "action", id: "nav-logs", title: "View System Audit Logs", subtitle: "Trace historical actions", icon: FileText, action: () => router.push("/audit-log") },
        { type: "action", id: "nav-settings", title: "Configure Global Settings", subtitle: "Branding, credentials, backups", icon: Settings, action: () => router.push("/settings") },
      ];
    }

    const lowerQuery = query.toLowerCase();
    const results: any[] = [];

    // 1. Projects
    projects.forEach(p => {
      if (p.name.toLowerCase().includes(lowerQuery) || p.id.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "project",
          id: `p-${p.id}`,
          title: `Switch to ${p.name}`,
          subtitle: `Firebase Project ID: ${p.id} (${p.environment})`,
          icon: Database,
          action: () => {
            setCurrentProjectId(p.id);
            router.push(`/apps/${p.id}`);
            setIsOpen(false);
          }
        });
      }
    });

    // 2. Users
    users.forEach(u => {
      if (
        u.displayName.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery) ||
        u.uid.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "user",
          id: `u-${u.uid}`,
          title: u.displayName,
          subtitle: `User Account: ${u.email} (Role: ${u.role})`,
          icon: Users,
          action: () => {
            router.push(`/apps/${currentProjectId}/users?search=${u.uid}`); // Redirect to search user
            setIsOpen(false);
          }
        });
      }
    });

    // 3. Collections
    collections.forEach(c => {
      if (c.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "collection",
          id: `c-${c.name}`,
          title: `Firestore: /${c.name}`,
          subtitle: `Collection containing ${c.documents.length} mock documents`,
          icon: Database,
          action: () => {
            router.push(`/apps/${currentProjectId}/firestore?collection=${c.name}`);
            setIsOpen(false);
          }
        });
      }
    });

    // 4. Storage Files
    storageFiles.forEach(f => {
      if (f.name.toLowerCase().includes(lowerQuery) || f.path.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "file",
          id: `f-${f.path}`,
          title: `Storage: ${f.name}`,
          subtitle: `File location: /${f.path} (${f.size})`,
          icon: HardDrive,
          action: () => {
            router.push(`/apps/${currentProjectId}/storage`);
            setIsOpen(false);
          }
        });
      }
    });

    // 5. Actions matching query
    const actions = [
      { id: "act-users", title: "Manage Active Users", queryMatch: "users table list admin support", icon: Users, action: () => router.push(`/apps/${currentProjectId}/users`) },
      { id: "act-firestore", title: "Browse Firestore Collections", queryMatch: "firestore database documents query json", icon: Database, action: () => router.push(`/apps/${currentProjectId}/firestore`) },
      { id: "act-storage", title: "Storage File Browser", queryMatch: "storage bucket file image pdf download upload", icon: HardDrive, action: () => router.push(`/apps/${currentProjectId}/storage`) },
      { id: "act-settings", title: "Global Settings", queryMatch: "settings credentials service accounts themes keys api", icon: Settings, action: () => router.push("/settings") },
    ];

    actions.forEach(a => {
      if (a.title.toLowerCase().includes(lowerQuery) || a.queryMatch.includes(lowerQuery)) {
        results.push({
          type: "action",
          id: a.id,
          title: a.title,
          subtitle: "Quick navigation action shortcut",
          icon: a.icon,
          action: () => {
            a.action();
            setIsOpen(false);
          }
        });
      }
    });

    return results;
  };

  const filteredItems = getFilteredItems();

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector("[data-active=true]");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <>
      {/* Global Shortcut Help Button fixed to bottom right for discoverability */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2 bg-[#111113] hover:bg-[#1A1A1E] border border-zinc-800 text-xs font-mono text-zinc-400 rounded-lg shadow-2xl transition-all duration-200 group"
      >
        <span className="text-zinc-500 group-hover:text-zinc-300">Quick Command</span>
        <div className="flex items-center gap-0.5">
          <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px]">Ctrl</kbd>
          <span className="text-[10px] text-zinc-600 font-sans">+</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px]">K</kbd>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#09090BB2] backdrop-blur-md"
            />

            {/* Dialog Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full max-w-xl mx-4 bg-[#111113] border border-zinc-800 rounded-xl shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[50vh]"
              onKeyDown={handleKeyDown}
            >
              {/* Search Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-[#0B0B0C]">
                <Search className="w-5 h-5 text-zinc-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search projects, users, collections, files..."
                  value={query}
                  onChange={(e) => startTransition(() => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  })}
                  className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 border-none outline-none focus:ring-0 focus:outline-none"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-500 hover:text-zinc-300"
                >
                  ESC
                </button>
              </div>

              {/* Items List */}
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto p-2 space-y-1 select-none"
              >
                {filteredItems.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <Search className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-400">No results found for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-zinc-600 mt-1">Try searching for &apos;netflix&apos;, &apos;users&apos; or &apos;admin&apos;</p>
                  </div>
                ) : (
                  filteredItems.map((item, index) => {
                    const IconComp = item.icon;
                    const isActive = index === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        data-active={isActive}
                        onClick={() => {
                          item.action();
                          setIsOpen(false);
                        }}
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-100 ${
                          isActive 
                            ? "bg-[#E5091410] border border-[#E5091430] text-[#FAFAFA]" 
                            : "bg-transparent border border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1.5 rounded-md ${isActive ? "bg-[#E50914]/15 text-[#E50914]" : "bg-zinc-900 text-zinc-500"}`}>
                            <IconComp className="w-4 h-4 shrink-0" />
                          </div>
                          <div className="truncate">
                            <p className={`text-xs font-medium ${isActive ? "text-white font-semibold" : "text-zinc-300"}`}>{item.title}</p>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{item.subtitle}</p>
                          </div>
                        </div>

                        {isActive && (
                          <div className="flex items-center gap-1.5 shrink-0 text-[#E50914] text-[10px] font-mono pr-1">
                            <span className="text-[9px]">Select</span>
                            <CornerDownLeft className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Status Footer */}
              <div className="px-4 py-2 border-t border-zinc-800 bg-[#0B0B0C] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><kbd className="bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded">↑↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">Enter</kbd> Action</span>
                </div>
                <span>Ctrl + K to toggle</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
