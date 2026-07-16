"use client";

import React, { useState, useTransition, use } from "react";
import { useProjects, FirebaseProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Settings, Key, Trash2, ShieldAlert, Check, X,
  Globe, Database, HardDrive, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function ProjectSettingsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { projects, updateProject, deleteProject, logAction } = useProjects();
  const { hasPermission } = useAuth();
  
  const currentProject = projects.find(p => p.id === resolvedParams.appId);

  if (!currentProject) return null;

  // Form states
  const [name, setName] = useState(currentProject.name);
  const [desc, setDesc] = useState(currentProject.description);
  const [env, setEnv] = useState(currentProject.environment);
  const [status, setStatus] = useState(currentProject.status);
  
  const [apiKey, setApiKey] = useState(currentProject.firebaseConfig?.apiKey || "");
  const [authDomain, setAuthDomain] = useState(currentProject.firebaseConfig?.authDomain || "");
  const [storageBucket, setStorageBucket] = useState(currentProject.firebaseConfig?.storageBucket || "");
  
  const [serviceAccount, setServiceAccount] = useState(currentProject.serviceAccount || "");
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // RBAC validation
    if (!hasPermission("Admin")) return;

    updateProject(currentProject.id, {
      name,
      description: desc,
      environment: env,
      status: status,
      firebaseConfig: apiKey ? { apiKey, authDomain, projectId: currentProject.id, storageBucket } : undefined,
      serviceAccount: serviceAccount || undefined
    });

    logAction("Update Settings", `Modified database connection parameters for project ${currentProject.id}`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDelete = () => {
    if (!hasPermission("Owner")) return;
    if (confirm(`Are you absolutely sure you want to remove the project configuration "${currentProject.name}"? This action is irreversible.`)) {
      deleteProject(currentProject.id);
      logAction("Delete Project", `Permanently removed project workspace config: ${currentProject.id}`);
      router.push("/apps");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Project Settings</h1>
        <p className="text-xs text-zinc-500 mt-1">Configure workspace parameters, update SDK connection keys, and delete environments.</p>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        
        {/* Core Config Forms (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Branding */}
          <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><Settings className="w-4 h-4 text-zinc-400" /> General Properties</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">PROJECT NAME</label>
                <input
                  type="text"
                  required
                  placeholder="My Firebase Console"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!hasPermission("Admin")}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] disabled:opacity-50 transition"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">ENVIRONMENT STATE</label>
                <select
                  value={env}
                  onChange={(e) => setEnv(e.target.value as any)}
                  disabled={!hasPermission("Admin")}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-400 font-mono text-[10px] rounded-lg p-2 outline-none cursor-pointer focus:border-zinc-700 disabled:opacity-50"
                >
                  <option value="production">Production</option>
                  <option value="development">Development</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">PROJECT DESCRIPTION</label>
              <textarea
                rows={3}
                placeholder="Details of the project databases and operational scopes..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                disabled={!hasPermission("Admin")}
                className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg p-3 outline-none focus:border-[#E50914] disabled:opacity-50 transition resize-none"
              />
            </div>
          </div>

          {/* Web SDK Configuration Keys */}
          <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><Key className="w-4 h-4 text-zinc-400" /> Firebase Web SDK Keys</h3>
            
            <div>
              <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">WEB API KEY</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={!hasPermission("Admin")}
                className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 font-mono text-xs rounded-lg px-3 py-2 outline-none focus:border-zinc-700 disabled:opacity-50 transition"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">AUTH DOMAIN</label>
                <input
                  type="text"
                  placeholder="project-id.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  disabled={!hasPermission("Admin")}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 font-mono text-xs rounded-lg px-3 py-2 outline-none focus:border-zinc-700 disabled:opacity-50 transition"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">STORAGE BUCKET</label>
                <input
                  type="text"
                  placeholder="project-id.appspot.com"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  disabled={!hasPermission("Admin")}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 font-mono text-xs rounded-lg px-3 py-2 outline-none focus:border-zinc-700 disabled:opacity-50 transition"
                />
              </div>
            </div>
          </div>

          {/* Service Account JSON */}
          <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><Database className="w-4 h-4 text-zinc-400" /> Firebase Admin SDK (Service Account JSON)</h3>
            <div>
              <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">PASTE SERVICE ACCOUNT KEY JSON</label>
              <textarea
                rows={5}
                placeholder={`{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key_id": "...",\n  "private_key": "...",\n  ...\n}`}
                value={serviceAccount}
                onChange={(e) => setServiceAccount(e.target.value)}
                disabled={!hasPermission("Admin")}
                className="w-full bg-[#09090B] border border-zinc-800 text-zinc-350 font-mono text-[10px] rounded-lg p-3 outline-none focus:border-zinc-700 disabled:opacity-50 transition resize-none"
              />
            </div>
          </div>

        </div>

        {/* Status Settings & Actions (1/3 width) */}
        <div className="space-y-6">
          
          {/* Status Settings */}
          <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><Globe className="w-4 h-4 text-zinc-400" /> System Status</h3>
            
            <div className="flex items-center justify-between p-3 bg-[#09090B] border border-zinc-850 rounded-lg">
              <div>
                <span className="text-zinc-200 font-semibold block">Maintenance Mode</span>
                <span className="text-[9px] text-zinc-500 mt-0.5 block">Offline mode redirects clients</span>
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={!hasPermission("Admin")}
                className="bg-[#111113] border border-zinc-800 text-zinc-300 font-mono text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded outline-none cursor-pointer focus:border-zinc-700"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              {hasPermission("Admin") && (
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E50914] hover:bg-[#B8070F] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer shadow-lg shadow-[#E50914]/10 active:scale-98"
                >
                  <Check className="w-4 h-4" /> Save Settings
                </button>
              )}
            </div>
            
            {saveSuccess && (
              <p className="text-center font-mono text-[10px] text-emerald-450 font-bold uppercase tracking-wider animate-pulse mt-2">
                Configurations updated.
              </p>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-[#111113] border border-red-950/20 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-red-500 uppercase font-mono tracking-wider border-b border-red-950/10 pb-3 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-red-500" /> Danger Zone</h3>
            <p className="text-[10px] text-zinc-500 leading-normal">Removing the project configuration wipes cached documents, Storage layouts, and disconnects the API listener permanently.</p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!hasPermission("Owner")}
              className="w-full py-2.5 bg-[#E50914] hover:bg-[#B8070F] disabled:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-[10px] uppercase font-mono tracking-wider rounded-lg transition active:scale-98 cursor-pointer shadow-lg shadow-[#E50914]/10"
            >
              <Trash2 className="w-3.5 h-3.5 inline shrink-0 mr-1.5" /> Remove Configuration
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
