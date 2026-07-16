"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useProjects } from "@/context/ProjectContext";
import { useAuth, AdminRole } from "@/context/AuthContext";
import { 
  Sparkles, Database, Users, HardDrive, Terminal, BarChart3, 
  Key, Bell, FileText, Settings, AlertOctagon, LayoutGrid, 
  ShieldAlert, ChevronDown, LogOut, RefreshCw, UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { projects, currentProjectId, currentProject, setCurrentProjectId, liveActive } = useProjects();
  const { user, logout, updateRole } = useAuth();
  const [projSelectorOpen, setProjSelectorOpen] = useState(false);
  const [roleSelectorOpen, setRoleSelectorOpen] = useState(false);

  if (!user) return null;

  // Determine if we are within a project route
  const isProjectRoute = pathname.startsWith("/apps/") && currentProjectId;
  
  // Navigation lists
  const globalNav = [
    { label: "All Projects", href: "/apps", icon: LayoutGrid },
    { label: "Audit Logs", href: "/audit-log", icon: FileText },
    { label: "Global Settings", href: "/settings", icon: Settings },
  ];

  const projectNav = [
    { label: "Dashboard", href: `/apps/${currentProjectId}`, icon: Sparkles },
    { label: "Users List", href: `/apps/${currentProjectId}/users`, icon: Users },
    { label: "Firestore", href: `/apps/${currentProjectId}/firestore`, icon: Database },
    { label: "Storage Browser", href: `/apps/${currentProjectId}/storage`, icon: HardDrive },
    { label: "Cloud Functions", href: `/apps/${currentProjectId}/functions`, icon: Terminal },
    { label: "Analytics", href: `/apps/${currentProjectId}/analytics`, icon: BarChart3 },
    { label: "Permissions DB", href: `/apps/${currentProjectId}/permissions`, icon: Key },
    { label: "Notifications Hub", href: `/apps/${currentProjectId}/notifications`, icon: Bell },
    { label: "Project Settings", href: `/apps/${currentProjectId}/settings`, icon: Settings },
  ];

  const handleProjectSwitch = (id: string) => {
    setCurrentProjectId(id);
    setProjSelectorOpen(false);
    // Preserves the sub-route type if available, otherwise goes to project root
    const subRoute = pathname.split("/").slice(3).join("/");
    if (subRoute) {
      router.push(`/apps/${id}/${subRoute}`);
    } else {
      router.push(`/apps/${id}`);
    }
  };

  const roles: AdminRole[] = ["Owner", "Admin", "Moderator", "Support", "Viewer"];

  return (
    <aside className="w-64 border-r border-[#27272A] bg-[#09090B] flex flex-col h-screen sticky top-0 text-zinc-400 select-none">
      
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#27272A] gap-2.5">
        <div className="w-6 h-6 rounded-md bg-[#E50914] flex items-center justify-center font-bold text-white text-xs">
          C
        </div>
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm tracking-wider">CONTROL CENTER</span>
          <span className="text-[9px] text-[#E50914] font-mono tracking-widest font-semibold uppercase">Enterprise Firebase</span>
        </div>
      </div>

      {/* Project Selector / Dropdown */}
      <div className="px-4 py-4 border-b border-[#27272A]/70 relative">
        <div className="flex items-center justify-between mb-1.5 px-2">
          <label className="text-[10px] text-zinc-500 font-mono">ACTIVE CONFIGURATION</label>
          {isProjectRoute && currentProject && (
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${liveActive ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-zinc-600"}`} />
              <span className="text-[8.5px] font-mono uppercase tracking-wider text-zinc-400">
                {liveActive ? "Live Sync" : "Sandbox"}
              </span>
            </div>
          )}
        </div>
        
        {isProjectRoute && currentProject ? (
          <button
            onClick={() => setProjSelectorOpen(!projSelectorOpen)}
            className="w-full flex items-center justify-between gap-2.5 px-3 py-2 bg-[#111113] hover:bg-[#1A1A1E] border border-zinc-800 rounded-lg text-left text-zinc-200 text-xs transition duration-150 relative"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold shrink-0 ${currentProject.logo}`}>
                {currentProject.name[0]}
              </div>
              <span className="font-medium truncate">{currentProject.name}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => router.push("/apps")}
            className="w-full flex items-center gap-2 px-3 py-2 bg-[#111113] border border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg text-left text-zinc-500 hover:text-zinc-300 text-xs transition duration-150"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="font-medium">Global Admin Mode</span>
          </button>
        )}

        {/* Dropdown Menu */}
        <AnimatePresence>
          {projSelectorOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProjSelectorOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.1 }}
                className="absolute left-4 right-4 mt-1 bg-[#111113] border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-20"
              >
                <div className="p-1 max-h-48 overflow-y-auto space-y-0.5">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleProjectSwitch(p.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition ${
                        p.id === currentProjectId
                          ? "bg-[#E5091410] text-[#E50914] font-semibold"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] shrink-0 ${p.logo}`}>
                          {p.name[0]}
                        </div>
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className={`text-[8px] px-1 py-0.5 rounded font-mono ${p.environment === "production" ? "bg-red-950/40 text-red-400" : "bg-zinc-800 text-zinc-400"}`}>
                        {p.environment === "production" ? "PROD" : "DEV"}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#27272A] p-1 bg-[#09090B]">
                  <button
                    onClick={() => {
                      router.push("/apps");
                      setProjSelectorOpen(false);
                    }}
                    className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 text-[10px] uppercase font-mono tracking-wider transition"
                  >
                    <LayoutGrid className="w-3 h-3" />
                    All Environments
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* Project Specific Links */}
        {isProjectRoute && (
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-600 font-mono px-3 block mb-2 tracking-wider">PROJECT RESOURCES</label>
            {projectNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== `/apps/${currentProjectId}`);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive 
                      ? "bg-[#E5091410] border border-[#E5091430] text-white" 
                      : "hover:bg-zinc-900/60 hover:text-zinc-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-[#E50914]" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Global Links */}
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-600 font-mono px-3 block mb-2 tracking-wider">GLOBAL AUDITING</label>
          {globalNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive 
                    ? "bg-[#E5091410] border border-[#E5091430] text-white" 
                    : "hover:bg-zinc-900/60 hover:text-zinc-200"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-[#E50914]" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Developer Context Portal (RBAC role switcher) */}
      <div className="px-4 py-3 bg-[#111113]/40 border-t border-[#27272A]/70 flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => setRoleSelectorOpen(!roleSelectorOpen)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-[#111113] hover:bg-[#1A1A1E] border border-zinc-800 rounded-md text-[10px] font-mono text-zinc-400 transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <span className="text-zinc-500 block text-[8px] uppercase leading-none">TESTING ROLE</span>
              <span className="text-zinc-200 font-bold truncate leading-tight block">{user.role}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
          </button>

          {/* Role selector dropdown */}
          <AnimatePresence>
            {roleSelectorOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRoleSelectorOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute bottom-full left-0 right-0 mb-1 bg-[#111113] border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-20"
                >
                  <div className="p-1 space-y-0.5">
                    {roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          updateRole(r);
                          setRoleSelectorOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded text-[10px] font-mono ${
                          user.role === r 
                            ? "bg-zinc-800 text-white font-bold" 
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-[#27272A] flex items-center justify-between bg-[#111113]/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-7 h-7 rounded-full border border-zinc-800"
          />
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-xs font-semibold text-zinc-200 truncate">{user.displayName}</span>
            <span className="text-[9px] text-[#E50914] font-mono uppercase font-bold tracking-wider">{user.role}</span>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out of Console"
          className="p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded-md transition duration-150"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </aside>
  );
};
