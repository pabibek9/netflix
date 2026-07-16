"use client";

import React, { useState, useMemo } from "react";
import { useProjects } from "@/context/ProjectContext";
import { 
  FileText, Search, Filter, ShieldCheck, Key, 
  Trash2, Database, Layers, ArrowUpRight, Activity, Calendar
} from "lucide-react";

export default function GlobalAuditLogPage() {
  const { auditLogs, projects } = useProjects();
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterAction, setFilterAction] = useState("all");

  // Flatten or use direct audit logs across all environments (they are gathered in current context)
  // Let's filter based on state
  const filteredLogs = useMemo(() => {
    let result = [...auditLogs];

    if (filterProject !== "all") {
      result = result.filter(log => log.projectId === filterProject);
    }

    if (filterAction !== "all") {
      result = result.filter(log => log.action.toLowerCase().includes(filterAction.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(log => 
        log.details.toLowerCase().includes(q) ||
        log.userEmail.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }

    return result;
  }, [auditLogs, filterProject, filterAction, search]);

  const getLogIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("login") || act.includes("auth")) {
      return <Key className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (act.includes("delete") || act.includes("remove")) {
      return <Trash2 className="w-4 h-4 text-[#E50914] shrink-0" />;
    }
    if (act.includes("firestore") || act.includes("document") || act.includes("collection")) {
      return <Database className="w-4 h-4 text-blue-400 shrink-0" />;
    }
    if (act.includes("permission") || act.includes("role") || act.includes("claim")) {
      return <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    return <Activity className="w-4 h-4 text-zinc-500 shrink-0" />;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System Audit Log</h1>
        <p className="text-xs text-zinc-500 mt-1">Audit historical administrator actions, authentication events, and document updates.</p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-[#111113] border border-zinc-850 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search details, emails, actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 placeholder-zinc-700 text-xs rounded-lg pl-9 pr-4 py-2 outline-none focus:border-zinc-700 transition"
          />
        </div>

        {/* Mapped selectors */}
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-[#09090B] border border-zinc-800 text-zinc-400 text-[10px] uppercase font-mono tracking-wider px-3 py-2 rounded-lg outline-none cursor-pointer hover:border-zinc-700 transition"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-[#09090B] border border-zinc-800 text-zinc-400 text-[10px] uppercase font-mono tracking-wider px-3 py-2 rounded-lg outline-none cursor-pointer hover:border-zinc-700 transition"
          >
            <option value="all">All Actions</option>
            <option value="login">Login / Logout</option>
            <option value="firestore">Database Edits</option>
            <option value="user">User Provisions</option>
            <option value="claims">Permission Changes</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-zinc-850 ml-4 pl-8 space-y-6">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-850 rounded-2xl ml-[-2rem] pl-0">
            No audit records captured matching search metrics.
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const project = projects.find(p => p.id === log.projectId);
            return (
              <div key={log.id} className="relative group">
                
                {/* Timeline Bullet */}
                <div className="absolute left-[-2.5rem] top-1 p-2 bg-[#111113] border border-zinc-800 rounded-xl shrink-0 group-hover:border-[#E50914] transition duration-200">
                  {getLogIcon(log.action)}
                </div>

                {/* Timeline Card */}
                <div className="bg-[#111113] border border-zinc-850 p-5 rounded-xl space-y-3 max-w-4xl hover:border-zinc-800 transition duration-150">
                  
                  {/* Title & Timestamp */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-xs uppercase font-mono tracking-wide">{log.action}</span>
                      {project && (
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${project.logo}`}>
                          {project.name}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-550 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Description details */}
                  <p className="text-xs text-zinc-400 leading-relaxed font-mono select-text">{log.details}</p>

                  {/* Actor credentials */}
                  <div className="flex items-center gap-3 text-[9px] text-zinc-550 font-mono pt-2 border-t border-zinc-900/60">
                    <span>Actor: <strong className="text-zinc-400">{log.userEmail}</strong></span>
                    <span>•</span>
                    <span>Role: <strong className="text-zinc-400">{log.userRole}</strong></span>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
