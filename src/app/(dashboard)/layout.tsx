"use client";

import React, { useTransition } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
            <div className="absolute inset-0 border-2 border-t-[#E50914] rounded-full animate-spin" />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Initializing Console Session</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-[#09090B] overflow-hidden text-zinc-200">
      {/* Main Panel - Take full screen */}
      <main className="flex-1 flex flex-col h-full bg-[#09090B] overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 overflow-y-auto h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
