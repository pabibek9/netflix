"use client";

import React, { useState, useMemo, use } from "react";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Key, ShieldCheck, Check, X, ShieldAlert, 
  Layers, Lock, FileText, CheckSquare, Square
} from "lucide-react";

interface PageProps {
  params: Promise<{ appId: string }>;
}

interface ScopePermission {
  key: string;
  name: string;
  description: string;
}

export default function PermissionsManagementPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { auditLogs, logAction } = useProjects();
  const { user: currentAdmin, hasPermission } = useAuth();

  // Mapped permission scopes
  const permissionScopes: ScopePermission[] = [
    { key: "read_telemetry", name: "Read Telemetry Logs", description: "Query read-only dashboards and read server statistics" },
    { key: "write_firestore", name: "Write Firestore", description: "Insert, edit or delete collections and nested document fields" },
    { key: "manage_users", name: "Manage Accounts", description: "Disable, ban, or delete consumer user database accounts" },
    { key: "invoke_functions", name: "Trigger Worker Runtimes", description: "Invoke cloud function HTTPS endpoints directly" },
    { key: "write_storage", name: "Modify Cloud Storage", description: "Upload, download, or delete objects from storage buckets" },
    { key: "edit_claims", name: "Configure Roles", description: "Assign custom JSON claims and modify administrator scopes" },
  ];

  // Default permissions mapping state
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    Owner: ["read_telemetry", "write_firestore", "manage_users", "invoke_functions", "write_storage", "edit_claims"],
    Admin: ["read_telemetry", "write_firestore", "manage_users", "invoke_functions", "write_storage"],
    Moderator: ["read_telemetry", "write_firestore", "manage_users"],
    Support: ["read_telemetry", "manage_users"],
    Viewer: ["read_telemetry"],
  });

  // Filter audit logs specifically for permission changes
  const permAuditLogs = useMemo(() => {
    return auditLogs.filter(log => 
      log.action.includes("Claim") || 
      log.action.includes("Role") || 
      log.action.includes("Permissions") ||
      log.action.includes("Initialize")
    );
  }, [auditLogs]);

  const handleTogglePermission = (role: string, scopeKey: string) => {
    // Owner is locked and Viewer cannot edit permissions
    if (role === "Owner" || !hasPermission("Admin")) return;

    setRolePermissions(prev => {
      const activeScopes = prev[role] || [];
      const updatedScopes = activeScopes.includes(scopeKey)
        ? activeScopes.filter(k => k !== scopeKey)
        : [...activeScopes, scopeKey];

      const actionText = activeScopes.includes(scopeKey) ? "Revoked" : "Granted";
      logAction("Permissions Modify", `${actionText} scope '${scopeKey}' for role: ${role}`);

      return {
        ...prev,
        [role]: updatedScopes
      };
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Security Access Control (RBAC)</h1>
        <p className="text-xs text-zinc-500 mt-1">Configure role maps, assign claim capability tags, and audit modifications.</p>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-[#111113] border border-zinc-850 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between bg-[#0B0B0C]/40">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-white flex items-center gap-1.5"><Lock className="w-4 h-4 text-[#E50914]" /> Role Access Scopes Matrix</span>
          {!hasPermission("Admin") && (
            <span className="text-[9px] text-amber-500 font-mono flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Read-Only Mode (Owner/Admin required to change mappings)
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 bg-[#0B0B0C] font-mono text-[9px] uppercase tracking-wider">
                <th className="p-4 w-48">ADMINISTRATOR LEVEL</th>
                {permissionScopes.map((scope) => (
                  <th key={scope.key} className="p-4 text-center font-mono text-[9px]" title={scope.description}>
                    {scope.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {Object.keys(rolePermissions).map((role) => (
                <tr key={role} className="hover:bg-zinc-900/30 transition duration-150">
                  <td className="p-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`w-3.5 h-3.5 ${role === "Owner" ? "text-red-500" : "text-zinc-500"}`} />
                      <span>{role}</span>
                    </div>
                  </td>
                  {permissionScopes.map((scope) => {
                    const hasAccess = rolePermissions[role].includes(scope.key);
                    const isEditable = role !== "Owner" && hasPermission("Admin");
                    return (
                      <td key={scope.key} className="p-4 text-center">
                        <button
                          disabled={!isEditable}
                          onClick={() => handleTogglePermission(role, scope.key)}
                          className={`mx-auto p-1.5 rounded-lg border transition ${
                            hasAccess 
                              ? "bg-[#E5091410] border-[#E5091430] text-[#E50914] disabled:opacity-85" 
                              : "bg-transparent border-zinc-800 text-zinc-700 disabled:opacity-40"
                          } ${isEditable ? "hover:border-[#E5091450] cursor-pointer" : "cursor-not-allowed"}`}
                        >
                          {hasAccess ? (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 shrink-0" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions descriptions + Audit trail layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scopes Description List */}
        <div className="lg:col-span-2 bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Capability Scopes Reference</h3>
            <p className="text-[10px] text-zinc-500">Security descriptors for custom JWT tokens</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {permissionScopes.map((scope) => (
              <div key={scope.key} className="p-3.5 bg-[#09090B] border border-zinc-850 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-semibold text-[#E50914]">{scope.name}</span>
                <p className="text-[10px] text-zinc-500 leading-normal">{scope.description}</p>
                <div className="text-[8px] font-mono text-zinc-600 uppercase pt-1">Scope key: {scope.key}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit trail list */}
        <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Security Modifications Log</h3>
            <p className="text-[10px] text-zinc-500">Audit trail of security and claim overrides</p>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {permAuditLogs.length === 0 ? (
              <p className="text-center py-6 text-xs text-zinc-500 font-mono">No security overrides recorded.</p>
            ) : (
              permAuditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-[#09090B] border border-zinc-850 rounded-lg text-[10px]">
                  <div className="flex justify-between items-center text-zinc-400 font-semibold mb-1">
                    <span>{log.action}</span>
                    <span className="font-mono text-[9px] text-zinc-550">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-zinc-500 leading-normal">{log.details}</p>
                  <div className="mt-1 text-[8px] text-[#E50914] font-mono uppercase">BY: {log.userEmail}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
