"use client";

import React, { use } from "react";
import { useProjects } from "@/context/ProjectContext";
import { Users, ChevronLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function SimplifiedProjectDashboard({ params }: PageProps) {
  const resolvedParams = use(params);
  const { projects, projectUsers } = useProjects();
  const currentProject = projects.find(p => p.id === resolvedParams.appId);

  if (!currentProject) {
    notFound();
  }

  const userList = projectUsers[currentProject.id] || [];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden select-none">
      {/* Background radial accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E50914]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 text-center relative z-10">
        
        {/* Back Link */}
        <Link 
          href="/apps"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition uppercase font-mono font-bold tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </Link>

        {/* Project Header */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg ${currentProject.logo}`}>
              {currentProject.name[0]}
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{currentProject.name}</h1>
          <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">{currentProject.id}</p>
        </div>

        {/* Giant Click Button Box */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href={`/apps/${currentProject.id}/users`}
            className="block w-full bg-[#111113] hover:bg-[#151518] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-10 shadow-2xl transition duration-200 group text-center cursor-pointer relative overflow-hidden"
          >
            {/* Top red neon indicator line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-[#E50914]" />
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E50914]/10 flex items-center justify-center group-hover:bg-[#E50914]/20 transition duration-150">
                <Users className="w-6 h-6 text-[#E50914]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono group-hover:text-[#E50914] transition">
                  Click here to see users and their details
                </h2>
                <p className="text-xs text-zinc-500">
                  Manage profiles, emails, organizations, and all Firestore attributes.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-bold group-hover:text-white transition mt-2">
                <span>Open Operators List ({userList.length})</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Quick Connection Info */}
        <p className="text-[10px] text-zinc-650 font-mono uppercase tracking-widest">
          Database Connection active • Security Rules Ignored
        </p>

      </div>
    </div>
  );
}
