"use client";

import React, { useState } from "react";
import { useProjects, FirebaseProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus, Database, Users, HardDrive, Cpu, 
  ExternalLink, Search, Check, AlertCircle, RefreshCw, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AppsPage() {
  const router = useRouter();
  const { projects, addProject, setCurrentProjectId } = useProjects();
  const { hasPermission } = useAuth();
  
  const [search, setSearch] = useState("");
  const [filterEnv, setFilterEnv] = useState<"all" | "production" | "development">("all");
  const [modalOpen, setModalOpen] = useState(false);
  
  // Add project form state
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [description, setDescription] = useState("");
  const [env, setEnv] = useState<"production" | "development">("development");
  const [status, setStatus] = useState<"online" | "offline">("online");
  const [apiKey, setApiKey] = useState("");
  const [authDomain, setAuthDomain] = useState("");
  const [storageBucket, setStorageBucket] = useState("");
  const [serviceAccount, setServiceAccount] = useState("");

  const handleCardClick = (projectId: string) => {
    setCurrentProjectId(projectId);
    router.push(`/apps/${projectId}/users`);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !id) return;

    const logoOptions = [
      "bg-red-600 text-white",
      "bg-indigo-600 text-white",
      "bg-amber-600 text-white",
      "bg-emerald-600 text-white",
      "bg-violet-600 text-white"
    ];
    const randomLogo = logoOptions[Math.floor(Math.random() * logoOptions.length)];

    const newProject: FirebaseProject = {
      id: id.toLowerCase().replace(/\s+/g, "-"),
      name,
      description: description || "Isolated Firebase Project configuration.",
      environment: env,
      status: status,
      usersCount: 0,
      storageUsed: "0 KB",
      databaseSize: "0 KB",
      logo: randomLogo,
      firebaseConfig: apiKey ? { apiKey, authDomain, projectId: id, storageBucket } : undefined,
      serviceAccount: serviceAccount || undefined
    };

    addProject(newProject);
    setModalOpen(false);
    
    // Reset Form
    setName("");
    setId("");
    setDescription("");
    setEnv("development");
    setStatus("online");
    setApiKey("");
    setAuthDomain("");
    setStorageBucket("");
    setServiceAccount("");
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.id.toLowerCase().includes(search.toLowerCase());
    const matchesEnv = filterEnv === "all" || p.environment === filterEnv;
    return matchesSearch && matchesEnv;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Firebase Environments</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage and audit credentials, database states, and authentication instances.</p>
        </div>

        {hasPermission("Admin") && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E50914] hover:bg-[#B8070F] text-white text-xs font-semibold rounded-lg shadow-lg shadow-[#E50914]/10 transition duration-150 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Connect Environment
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#111113] p-3 border border-zinc-800 rounded-xl">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 placeholder-zinc-600 text-xs rounded-lg pl-9 pr-4 py-2 outline-none focus:border-zinc-700 transition"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-[#09090B] border border-zinc-800 p-0.5 rounded-lg w-full sm:w-auto">
          {(["all", "production", "development"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterEnv(tab)}
              className={`flex-1 sm:flex-initial text-center px-4 py-1.5 rounded-md text-[10px] uppercase font-mono tracking-wider font-semibold transition ${
                filterEnv === tab
                  ? "bg-[#111113] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Projects */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 border border-dashed border-zinc-800 rounded-xl text-center">
          <Database className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-zinc-300 font-semibold text-sm">No environments found</h3>
          <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters or connect a new project workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <motion.div
              key={p.id}
              onClick={() => handleCardClick(p.id)}
              whileHover={{ y: -4, borderColor: "#27272A" }}
              transition={{ duration: 0.15 }}
              className="bg-[#111113] border border-zinc-800/80 rounded-xl p-6 cursor-pointer flex flex-col justify-between hover:shadow-2xl hover:shadow-black/60 transition group relative"
            >
              {/* Top Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${p.logo}`}>
                      {p.name[0]}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm group-hover:text-[#E50914] transition">{p.name}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{p.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      p.environment === "production" 
                        ? "bg-red-950/40 text-red-400 border border-red-900/30" 
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700/55"
                    }`}>
                      {p.environment}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">{p.description}</p>
              </div>

              {/* Specs Divider */}
              <div className="border-t border-zinc-800/50 my-5 pt-4 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">Users</span>
                  <div className="flex items-center justify-center gap-1 mt-1 text-zinc-200 font-semibold text-xs">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{p.usersCount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-center border-x border-zinc-800/50">
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">DB Size</span>
                  <div className="flex items-center justify-center gap-1 mt-1 text-zinc-200 font-semibold text-xs">
                    <Database className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{p.databaseSize}</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">Storage</span>
                  <div className="flex items-center justify-center gap-1 mt-1 text-zinc-200 font-semibold text-xs">
                    <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{p.storageUsed}</span>
                  </div>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${p.status === "online" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" : "bg-zinc-600"}`} />
                  <span className="text-zinc-500 font-mono uppercase">{p.status}</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400 group-hover:text-white transition font-mono">
                  <span>Open Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Add Environment */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-[#09090BB8] backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="relative w-full max-w-lg bg-[#111113] border border-zinc-800 rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[85vh]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                <div>
                  <h2 className="text-base font-bold text-white">Connect Firebase Environment</h2>
                  <p className="text-[10px] text-zinc-500">Inject Web API Configuration or JSON service account</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-mono block mb-1 uppercase">PROJECT DISPLAY NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="My Analytics App"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-mono block mb-1 uppercase">PROJECT ID</label>
                    <input
                      type="text"
                      required
                      placeholder="my-analytics-app"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1 uppercase">SHORT DESCRIPTION</label>
                  <input
                    type="text"
                    placeholder="Short summary of this database context..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-mono block mb-1 uppercase">ENVIRONMENT</label>
                    <select
                      value={env}
                      onChange={(e) => setEnv(e.target.value as any)}
                      className="w-full bg-[#09090B] border border-zinc-800 text-zinc-400 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition cursor-pointer"
                    >
                      <option value="development">Development</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-mono block mb-1 uppercase">INITIAL STATUS</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-[#09090B] border border-zinc-800 text-zinc-400 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition cursor-pointer"
                    >
                      <option value="online">Online / Operational</option>
                      <option value="offline">Offline / Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-zinc-800/80 pt-4 space-y-4">
                  <h3 className="text-zinc-400 text-xs font-semibold uppercase font-mono tracking-wider">Web SDK Keys (Optional)</h3>
                  <div>
                    <label className="text-[9px] text-zinc-500 font-mono block mb-1 uppercase">API KEY</label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-zinc-700 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] text-zinc-500 font-mono block mb-1 uppercase">AUTH DOMAIN</label>
                      <input
                        type="text"
                        placeholder="app-id.firebaseapp.com"
                        value={authDomain}
                        onChange={(e) => setAuthDomain(e.target.value)}
                        className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-zinc-700 transition"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 font-mono block mb-1 uppercase">STORAGE BUCKET</label>
                      <input
                        type="text"
                        placeholder="app-id.appspot.com"
                        value={storageBucket}
                        onChange={(e) => setStorageBucket(e.target.value)}
                        className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-zinc-700 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800/80 pt-4">
                  <label className="text-[9px] text-zinc-500 font-mono block mb-1 uppercase">SERVICE ACCOUNT JSON (Admin Operations)</label>
                  <textarea
                    rows={3}
                    placeholder={`{ "type": "service_account", "project_id": "...", ... }`}
                    value={serviceAccount}
                    onChange={(e) => setServiceAccount(e.target.value)}
                    className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 font-mono text-[10px] rounded-lg px-3 py-2 outline-none focus:border-zinc-700 transition resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800/80 mt-6">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E50914] hover:bg-[#B8070F] text-white text-xs font-semibold rounded-lg transition"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
