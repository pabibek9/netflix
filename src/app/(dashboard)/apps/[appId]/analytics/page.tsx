"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  TrendingUp, Users, Clock, Compass, Activity, 
  Smartphone, Monitor, Globe, ChevronDown, Download
} from "lucide-react";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function AnalyticsPage({ params }: PageProps) {
  const resolvedParams = use(params);

  // Live concurrent sessions simulator
  const [realtimeUsers, setRealtimeUsers] = useState(2480);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setRealtimeUsers(prev => {
        const delta = Math.floor(Math.random() * 41) - 20; // -20 to +20
        return Math.max(1800, prev + delta);
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Seed Data Sets
  const trendData = [
    { date: "Jul 01", DAU: 12000, MAU: 41000 },
    { date: "Jul 03", DAU: 13400, MAU: 41200 },
    { date: "Jul 05", DAU: 11000, MAU: 41800 },
    { date: "Jul 07", DAU: 14500, MAU: 42100 },
    { date: "Jul 09", DAU: 16100, MAU: 43000 },
    { date: "Jul 11", DAU: 15400, MAU: 44200 },
    { date: "Jul 13", DAU: 18900, MAU: 48291 },
  ];

  const cohortData = [
    { day: "Day 1", retention: 100 },
    { day: "Day 3", retention: 74 },
    { day: "Day 7", retention: 62 },
    { day: "Day 14", retention: 51 },
    { day: "Day 30", retention: 42 },
  ];

  const browserData = [
    { name: "Chrome", value: 64, color: "#E50914" },
    { name: "Safari", value: 22, color: "#71717A" },
    { name: "Firefox", value: 9, color: "#27272A" },
    { name: "Edge", value: 5, color: "#18181B" },
  ];

  const platformData = [
    { name: "Mobile App", value: 58, color: "#E50914" },
    { name: "Web App", value: 34, color: "#A1A1AA" },
    { name: "Smart TV", value: 8, color: "#27272A" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Product Analytics</h1>
          <p className="text-xs text-zinc-500 mt-1">Live traffic diagnostics, session duration, cohorts, and browser telemetry.</p>
        </div>
        
        <button
          onClick={() => {}}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111113] hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold rounded-lg transition"
        >
          <Download className="w-4 h-4 shrink-0" /> Export CSV Reports
        </button>
      </div>

      {/* Grid of Key Telemetry metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-[#111113] border border-zinc-850 p-5 rounded-xl space-y-4">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase font-mono tracking-wider">DAILY ACTIVE (DAU)</span>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">18,900</h3>
            <p className="text-[9px] text-[#E50914] font-semibold mt-1">+12% vs last week</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#111113] border border-zinc-850 p-5 rounded-xl space-y-4">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase font-mono tracking-wider">MONTHLY ACTIVE (MAU)</span>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">48,291</h3>
            <p className="text-[9px] text-zinc-500 mt-1">Operational target reached</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#111113] border border-zinc-850 p-5 rounded-xl space-y-4">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase font-mono tracking-wider">D30 RETENTION</span>
            <TrendingUp className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">42.4%</h3>
            <p className="text-[9px] text-emerald-500 font-semibold mt-1">+2.1% Industry benchmark</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#111113] border border-zinc-850 p-5 rounded-xl space-y-4">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase font-mono tracking-wider">SESSION DURATION</span>
            <Clock className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">24m 12s</h3>
            <p className="text-[9px] text-zinc-500 mt-1">Average user engagement</p>
          </div>
        </div>

        {/* Metric 5: Glowing Concurrent Sessions */}
        <div className="bg-[#111113] border border-[#E50914]/20 p-5 rounded-xl space-y-4 shadow-lg shadow-[#E50914]/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E50914]/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase font-mono tracking-wider">LIVE SESSIONS</span>
            <span className="w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white font-mono">{realtimeUsers.toLocaleString()}</h3>
            <p className="text-[9px] text-zinc-500 mt-1">Active concurrent connections</p>
          </div>
        </div>

      </div>

      {/* Main Charts: Trends & Cohorts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Monthly Growth telemetry</h3>
              <p className="text-[10px] text-zinc-500">DAU / MAU performance curves</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-[#E50914]"><span className="w-2 h-2 rounded-full bg-[#E50914]" /> Daily (DAU)</span>
              <span className="flex items-center gap-1.5 text-zinc-500"><span className="w-2 h-2 rounded-full bg-zinc-700" /> Monthly (MAU)</span>
            </div>
          </div>
          <div className="h-72 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F22" vertical={false} />
                <XAxis dataKey="date" stroke="#52525B" fontSize={9} className="font-mono" />
                <YAxis stroke="#52525B" fontSize={9} className="font-mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111113", borderColor: "#27272A", borderRadius: "8px", fontSize: "10px" }}
                />
                <Area type="monotone" dataKey="DAU" stroke="#E50914" strokeWidth={1.5} fillOpacity={1} fill="url(#colorDau)" />
                <Area type="monotone" dataKey="MAU" stroke="#71717A" strokeWidth={1.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cohort Retention Bar Chart (1/3 width) */}
        <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">User Retention Cohort</h3>
            <p className="text-[10px] text-zinc-500">Days elapsed following registration</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F22" vertical={false} />
                <XAxis dataKey="day" stroke="#52525B" fontSize={9} className="font-mono" />
                <YAxis stroke="#52525B" fontSize={9} unit="%" className="font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111113", borderColor: "#27272A", borderRadius: "8px", fontSize: "10px" }}
                />
                <Bar dataKey="retention" fill="#E50914" radius={[4, 4, 0, 0]} barSize={28}>
                  {cohortData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.15} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Platforms & Browsers Share */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Browser donut */}
        <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Browser Distribution</h3>
            <p className="text-[10px] text-zinc-500">Browser market share among customers</p>
          </div>
          <div className="h-44 w-full flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-1.5 w-1/2 pr-2 text-[10px] font-mono">
              {browserData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="text-zinc-200 font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Share */}
        <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Platform Allocation</h3>
            <p className="text-[10px] text-zinc-500">Consumer hardware distribution</p>
          </div>
          <div className="h-44 w-full flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-1.5 w-1/2 pr-2 text-[10px] font-mono">
              {platformData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="text-zinc-200 font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Country Metrics list */}
        <div className="bg-[#111113] border border-zinc-850 p-6 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Regional Sessions</h3>
            <p className="text-[10px] text-zinc-500">Geographic customer locations</p>
          </div>
          
          <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
            {[
              { country: "United States", code: "US", users: 14298, percent: 58 },
              { country: "United Kingdom", code: "UK", users: 4902, percent: 20 },
              { country: "Germany", code: "DE", users: 2490, percent: 10 },
              { country: "India", code: "IN", users: 1480, percent: 6 },
              { country: "France", code: "FR", users: 900, percent: 4 }
            ].map((reg, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
                <span className="flex items-center gap-2 text-zinc-400">
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  {reg.country} ({reg.code})
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-550">{reg.users.toLocaleString()}</span>
                  <span className="text-zinc-200 font-bold w-8 text-right">{reg.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
