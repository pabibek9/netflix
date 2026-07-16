"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { 
  Settings, ShieldAlert, Check, Users, Key, 
  Download, Upload, ShieldCheck, Moon, Globe
} from "lucide-react";

export default function GlobalSettingsPage() {
  const { user: currentAdmin, hasPermission } = useAuth();
  const { projects } = useProjects();

  // Settings State
  const [consoleTitle, setConsoleTitle] = useState("CONTROL CENTER");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission("Admin")) return;

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    if (!hasPermission("Admin")) return;
    
    // Trigger download of in-memory project credentials as JSON
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `control_center_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Global Settings</h1>
        <p className="text-xs text-zinc-500 mt-1">Configure administrator session security, manage backup JSON sheets, and modify console branding.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        
        {/* Core settings (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Console Branding */}
          <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><Globe className="w-4 h-4 text-zinc-400" /> Console Branding</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">CONSOLE TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="CONTROL CENTER"
                  value={consoleTitle}
                  onChange={(e) => setConsoleTitle(e.target.value)}
                  disabled={!hasPermission("Admin")}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] disabled:opacity-50 transition"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">INTERFACE ACCENT</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-450 font-mono">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#E50914] shrink-0" />
                  <span>Netflix Red (#E50914)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Configurations */}
          <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><Key className="w-4 h-4 text-zinc-400" /> Console Security</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">SESSION IDLE TIMEOUT</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  disabled={!hasPermission("Admin")}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-450 font-mono text-[10px] rounded-lg p-2 outline-none cursor-pointer focus:border-zinc-700 disabled:opacity-50"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="120">120 Minutes</option>
                </select>
              </div>
              
              <div>
                <label className="text-[9px] text-zinc-500 font-mono block mb-1.5 uppercase">TWO-FACTOR MFA AUTH</label>
                <select
                  value={mfaEnabled ? "true" : "false"}
                  onChange={(e) => setMfaEnabled(e.target.value === "true")}
                  disabled={!hasPermission("Admin")}
                  className="w-full bg-[#09090B] border border-zinc-800 text-zinc-450 font-mono text-[10px] rounded-lg p-2 outline-none cursor-pointer focus:border-zinc-700 disabled:opacity-50"
                >
                  <option value="true">Enforced (Active)</option>
                  <option value="false">Disabled (Sandbox)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Backup operations */}
          <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><Download className="w-4 h-4 text-zinc-400" /> Console Backup Sheet</h3>
            <p className="text-[10px] text-zinc-500 leading-normal">Download current configuration matrices (project lists, credentials, offline preferences) as a JSON sheet to backup state locally.</p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={!hasPermission("Admin")}
                className="flex-1 py-2 bg-[#09090B] hover:bg-zinc-900 border border-zinc-800 disabled:opacity-50 text-zinc-300 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition duration-150 active:scale-98"
              >
                <Download className="w-4 h-4 text-zinc-500" /> Export Credentials JSON
              </button>
              <button
                type="button"
                disabled
                className="flex-1 py-2 bg-[#09090B] border border-zinc-800 border-dashed opacity-40 text-zinc-550 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-4 h-4" /> Import Credentials JSON
              </button>
            </div>
          </div>

        </div>

        {/* Right Admin Panel (1/3 width) */}
        <div className="space-y-6">
          
          {/* Active Console Admins */}
          <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><Users className="w-4 h-4 text-zinc-400" /> Console Operators</h3>
            
            <div className="space-y-3">
              {[
                { name: "Alexander Wright", email: "admin@controlcenter.co", role: "Owner" },
                { name: "Sarah Jenkins", email: "support@controlcenter.co", role: "Support" }
              ].map((adm, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#09090B] border border-zinc-850 rounded-lg">
                  <div>
                    <span className="text-zinc-200 font-semibold block">{adm.name}</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5 block">{adm.email}</span>
                  </div>
                  <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-850 font-bold uppercase shrink-0">
                    {adm.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-zinc-400" /> Save Matrix</h3>
            <p className="text-[10px] text-zinc-500 leading-normal">Apply branding and security rules across all isolated project instances.</p>
            {hasPermission("Admin") ? (
              <button
                type="submit"
                className="w-full py-2.5 bg-[#E50914] hover:bg-[#B8070F] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition duration-150 active:scale-98 cursor-pointer shadow-lg shadow-[#E50914]/15"
              >
                <Check className="w-4 h-4" /> Save Preferences
              </button>
            ) : (
              <div className="flex gap-2 p-3 bg-red-950/20 border border-red-900/30 text-[#E50914] rounded-lg items-start text-[10px]">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Requires Admin role levels to save console settings.</span>
              </div>
            )}

            {saveSuccess && (
              <p className="text-center font-mono text-[9px] text-emerald-450 font-bold uppercase tracking-wider animate-pulse mt-2">
                Settings saved successfully.
              </p>
            )}
          </div>

        </div>

      </form>

    </div>
  );
}
