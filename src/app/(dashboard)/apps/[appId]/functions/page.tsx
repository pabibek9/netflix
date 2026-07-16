"use client";

import React, { useState, useMemo, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Terminal, Play, Trash2, Cpu, Clock, AlertTriangle, 
  Activity, CheckCircle2, ChevronRight, X, Sparkles, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ appId: string }>;
}

interface CloudFunction {
  name: string;
  trigger: "HTTP GET" | "HTTP POST" | "Firestore (onWrite)" | "Auth (onCreate)";
  runtime: string;
  memory: string;
  status: "active" | "degraded" | "inactive";
  invocations: number;
  avgLatency: string;
  lastDeployed: string;
  endpoint?: string;
}

export default function CloudFunctionsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { hasPermission } = useAuth();
  
  // Selected function state
  const [activeFunc, setActiveFunc] = useState<string>("sendWelcomeEmail");
  
  // Execution Simulation state
  const [testPayload, setTestPayload] = useState(JSON.stringify({ userId: "netflix-prod-user-50", email: "newuser@example.com" }, null, 2));
  const [testResponse, setTestResponse] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Deployed Functions list
  const functionsList: CloudFunction[] = [
    {
      name: "sendWelcomeEmail",
      trigger: "Auth (onCreate)",
      runtime: "Node.js 20",
      memory: "256 MB",
      status: "active",
      invocations: 14298,
      avgLatency: "112ms",
      lastDeployed: "2026-07-12 18:30:00"
    },
    {
      name: "processStreamingPayment",
      trigger: "HTTP POST",
      runtime: "Node.js 20",
      memory: "512 MB",
      status: "active",
      invocations: 4892,
      avgLatency: "245ms",
      lastDeployed: "2026-07-14 02:14:00",
      endpoint: "https://us-central1-netflix-prod.cloudfunctions.net/processStreamingPayment"
    },
    {
      name: "compressHeroBanner",
      trigger: "Firestore (onWrite)",
      runtime: "Node.js 18",
      memory: "1024 MB",
      status: "active",
      invocations: 820,
      avgLatency: "812ms",
      lastDeployed: "2026-07-02 09:40:00"
    },
    {
      name: "purgeInactiveSessions",
      trigger: "HTTP GET",
      runtime: "Python 3.10",
      memory: "256 MB",
      status: "inactive",
      invocations: 42,
      avgLatency: "1.4s",
      lastDeployed: "2026-05-14 10:00:00",
      endpoint: "https://us-central1-netflix-prod.cloudfunctions.net/purgeInactiveSessions"
    }
  ];

  const activeFunctionData = useMemo(() => {
    return functionsList.find(f => f.name === activeFunc) || functionsList[0];
  }, [activeFunc]);

  // Simulated Console Execution logs
  const executionLogs = useMemo(() => {
    const time = new Date().toLocaleTimeString();
    if (activeFunc === "sendWelcomeEmail") {
      return [
        `[${time}] INFO: Function execution started by trigger: firebase.auth.user.onCreate`,
        `[${time}] DEBUG: Extracting payload parameters (uid: netflix-prod-user-admin, email: admin@controlcenter.co)`,
        `[${time}] INFO: Initializing connection pool to mail delivery API server...`,
        `[${time}] INFO: Welcome template compiled successfully.`,
        `[${time}] SUCCESS: Dispatched welcome mail payload. Status code: 202 accepted`,
        `[${time}] INFO: Function execution completed in 112ms. Memory used: 74 MB`
      ];
    }
    if (activeFunc === "processStreamingPayment") {
      return [
        `[${time}] INFO: Function invocation started via HTTPS POST endpoint`,
        `[${time}] INFO: Authenticating JWT token signature ...`,
        `[${time}] DEBUG: Validating billing invoice payload parameters`,
        `[${time}] INFO: Querying Stripe transaction gateway endpoint...`,
        `[${time}] SUCCESS: Charge successful. Transaction reference: ch_3Mxxxxxx`,
        `[${time}] INFO: Updating subscription document status in Firestore collection /subscriptions/sub_user_alexander`,
        `[${time}] INFO: Function execution completed in 245ms. Memory used: 142 MB`
      ];
    }
    return [
      `[${time}] INFO: Function execution initialized ...`,
      `[${time}] WARN: Configuration file 'env.yaml' not detected. Defaulting to fallback variables.`,
      `[${time}] ERROR: Firestore listener error: quota exceeded for document reads.`,
      `[${time}] FATAL: Execution halted prematurely.`
    ];
  }, [activeFunc]);

  const handleInvokeTrigger = () => {
    if (!hasPermission("Admin")) return;
    setIsExecuting(true);
    setTestResponse("");
    
    setTimeout(() => {
      try {
        const parsed = JSON.parse(testPayload);
        setTestResponse(JSON.stringify({
          status: "success",
          invocationId: `req-${Math.random().toString(36).substring(7)}`,
          timestamp: new Date().toISOString(),
          responsePayload: {
            message: `Cloud function '${activeFunc}' executed successfully.`,
            processedVariables: parsed,
            telemetry: {
              duration: activeFunctionData.avgLatency,
              memoryUsed: "84 MB",
              billingUnits: 1
            }
          }
        }, null, 2));
      } catch (err: any) {
        setTestResponse(JSON.stringify({
          status: "failed",
          error: "Payload parse error: Invalid JSON syntax"
        }, null, 2));
      } finally {
        setIsExecuting(false);
      }
    }, 1200);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Cloud Functions</h1>
        <p className="text-xs text-zinc-500 mt-1">Monitor deployed triggers, inspect executions logs, and invoke HTTP endpoints.</p>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[#111113] border border-zinc-850 p-6 rounded-xl">
        <div className="flex gap-4 items-center">
          <div className="p-3 bg-zinc-900 text-zinc-500 rounded-xl">
            <Activity className="w-5 h-5 text-[#E50914]" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-mono block uppercase">Weekly Runs</span>
            <h4 className="text-xl font-bold text-white mt-0.5">20,052</h4>
          </div>
        </div>
        <div className="flex gap-4 items-center border-y sm:border-y-0 sm:border-x border-zinc-850 py-4 sm:py-0 sm:px-6">
          <div className="p-3 bg-zinc-900 text-zinc-500 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-mono block uppercase">Error Rate</span>
            <h4 className="text-xl font-bold text-white mt-0.5">0.04%</h4>
          </div>
        </div>
        <div className="flex gap-4 items-center sm:pl-6">
          <div className="p-3 bg-zinc-900 text-zinc-500 rounded-xl">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-mono block uppercase">Avg Latency</span>
            <h4 className="text-xl font-bold text-white mt-0.5">180ms</h4>
          </div>
        </div>
      </div>

      {/* Main Panel Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Deployed List Table (2/3 width) */}
        <div className="lg:col-span-2 bg-[#111113] border border-zinc-850 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-white">Deployed Functions</span>
            <span className="text-[9px] font-mono text-zinc-500">Total count: {functionsList.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 bg-[#0B0B0C] font-mono text-[9px] uppercase tracking-wider">
                  <th className="p-4">FUNCTION NAME</th>
                  <th className="p-4">TRIGGER</th>
                  <th className="p-4">RUNTIME</th>
                  <th className="p-4">AVG RUNTIME</th>
                  <th className="p-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {functionsList.map((f) => {
                  const isActive = activeFunc === f.name;
                  return (
                    <tr
                      key={f.name}
                      onClick={() => setActiveFunc(f.name)}
                      className={`hover:bg-zinc-900/40 transition duration-150 cursor-pointer ${
                        isActive ? "bg-[#E5091405]" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Cpu className={`w-3.5 h-3.5 ${isActive ? "text-[#E50914]" : "text-zinc-500"}`} />
                          <span className={`font-semibold ${isActive ? "text-white" : "text-zinc-300"}`}>{f.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-400 font-mono text-[10px]">
                        {f.trigger}
                      </td>
                      <td className="p-4 text-zinc-400 font-mono text-[10px]">
                        {f.runtime} ({f.memory})
                      </td>
                      <td className="p-4 text-zinc-400 font-mono text-[10px]">
                        {f.avgLatency}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            f.status === "active" ? "bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse" :
                            f.status === "degraded" ? "bg-amber-500" :
                            "bg-zinc-650"
                          }`} />
                          <span className="text-[9px] font-mono text-zinc-450 uppercase">{f.status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Details Panel (1/3 width) */}
        <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[9px] text-[#E50914] font-mono block uppercase">ACTIVE FUNCTION SELECTED</span>
              <h3 className="text-sm font-bold text-white mt-1">{activeFunctionData.name}</h3>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">{activeFunctionData.trigger} • {activeFunctionData.runtime}</p>
            </div>

            {/* HTTP Trigger invocation console */}
            {activeFunctionData.trigger.startsWith("HTTP") ? (
              <div className="space-y-3 pt-3 border-t border-zinc-850">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                  <span>ENDPOINT URI</span>
                  <span className="text-zinc-650 font-bold">HTTPS</span>
                </div>
                <div className="p-2.5 bg-[#09090B] border border-zinc-850 text-[10px] text-zinc-400 font-mono rounded-lg break-all select-all">
                  {activeFunctionData.endpoint}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-550 font-mono block">REQUEST JSON BODY</label>
                  <textarea
                    rows={4}
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full bg-[#09090B] border border-zinc-850 text-zinc-350 font-mono text-[10px] rounded-lg p-2.5 outline-none focus:border-zinc-700 resize-none"
                  />
                </div>

                <button
                  onClick={handleInvokeTrigger}
                  disabled={isExecuting || !hasPermission("Admin")}
                  className="w-full py-2 bg-[#E50914] hover:bg-[#B8070F] disabled:bg-zinc-800 text-white font-semibold text-[10px] uppercase font-mono tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition duration-150 active:scale-98 cursor-pointer"
                >
                  {isExecuting ? "Executing Endpoint..." : "Invoke HTTP Trigger"}
                  <Play className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-zinc-850 text-center py-6 space-y-2">
                <Terminal className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-[10px] text-zinc-500 font-mono">This function relies on internal database triggers ({activeFunctionData.trigger}) and cannot be triggered via direct URL request.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom section: Logs terminal or Response display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Terminal Logs (2/3 width) */}
        <div className="lg:col-span-2 bg-[#111113] border border-zinc-850 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="p-3 bg-[#0B0B0C] border-b border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-400 shrink-0">
            <span className="flex items-center gap-1.5"><Terminal className="w-4 h-4 text-[#E50914]" /> Streaming execution logs</span>
            <span className="text-[9px] text-zinc-650">Real-time sync operational</span>
          </div>

          <div className="p-4 bg-[#09090B] font-mono text-[10px] text-zinc-400 space-y-1.5 h-48 overflow-y-auto pr-2 select-text">
            {executionLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes("SUCCESS") ? "text-emerald-400" :
                  log.includes("ERROR") || log.includes("FATAL") ? "text-red-400" :
                  log.includes("WARN") ? "text-amber-400" :
                  log.includes("DEBUG") ? "text-zinc-550" :
                  "text-zinc-400"
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* HTTP Response payload (1/3 width) */}
        <div className="bg-[#111113] border border-zinc-850 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="p-3 bg-[#0B0B0C] border-b border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-400 shrink-0">
            <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5 text-zinc-500" /> Response Output</span>
            <span className="text-[9px] text-zinc-650">POST Response payload</span>
          </div>

          <div className="p-4 bg-[#09090B] font-mono text-[9px] text-zinc-500 h-48 overflow-y-auto pr-2 select-text">
            {testResponse ? (
              <pre className="text-zinc-400 break-all">{testResponse}</pre>
            ) : (
              <div className="h-full flex items-center justify-center italic text-zinc-650 text-center">
                <span>Invoke endpoint above to receive client-side telemetry.</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
