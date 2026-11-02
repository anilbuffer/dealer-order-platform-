"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/lib/auth-context";
import {
  Car,
  Package,
  Shield,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function DashboardShell() {
  const { currentUser, currentDealer } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentUser?.role === "AUTOHUB_ADMIN") return "admin-dashboard";
    if (currentUser?.role === "NISSAN_JAPAN") return "japan-inventory";
    return "dealer-stock";
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* 1. Responsive Collapsible Navy Sidebar (268px ↔ 76px) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Aligned 68px Top Header Bar */}
        <Header
          searchValue={searchQuery}
          onSearchChange={(val) => setSearchQuery(val)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Active Workspace Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {currentUser?.role === "DEALER_USER" && "Dealer Channel Portal"}
                  {currentUser?.role === "AUTOHUB_ADMIN" && "Operations & Allocations"}
                  {currentUser?.role === "NISSAN_JAPAN" && "Tokyo Inventory Dispatch"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Active Tab: {activeTab}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                {currentUser?.role === "DEALER_USER" && `Welcome, ${currentUser.name}`}
                {currentUser?.role === "AUTOHUB_ADMIN" && "AutoHub Programme Command Center"}
                {currentUser?.role === "NISSAN_JAPAN" && "Nissan Motor Co. Export Portal"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {currentUser?.role === "DEALER_USER" &&
                  `Assigned to ${currentDealer?.legalTradingName || "Auckland Dealership"} · Geographic Zone 1`}
                {currentUser?.role === "AUTOHUB_ADMIN" &&
                  "Real-time dealer approvals, stock allocations, and order milestone updates."}
                {currentUser?.role === "NISSAN_JAPAN" &&
                  "Direct inventory publishing, vehicle inspections, and batch CSV records."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-slate-800">Direct Link Active</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft hover:shadow-soft-md transition-smooth">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Available Stock</span>
                <Car className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">28 Vehicles</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <span>Direct Yokohama Yard</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft hover:shadow-soft-md transition-smooth">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Active Reservations</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">4 In Progress</div>
              <div className="text-[11px] text-amber-600 mt-1">Atomic 24h Lock Active</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft hover:shadow-soft-md transition-smooth">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Orders In Transit</span>
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">6 RoRo Shipments</div>
              <div className="text-[11px] text-blue-600 mt-1">Next arrival: 5 Nov (Auckland)</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft hover:shadow-soft-md transition-smooth">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Pricing Basis</span>
                <TrendingUp className="w-4 h-4 text-crimson-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">Zone 1 Auckland</div>
              <div className="text-[11px] text-slate-500 mt-1">Standard 2-delivery moves</div>
            </div>
          </div>

          {/* Interactive Placeholder Card with Next Step Information */}
          <div className="bg-[#0A1322] text-white p-6 rounded-2xl border border-[#1B2A42] shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-crimson-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Shell Architecture & Micro-Interactions Live
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                WCAG AAA Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#0F1B2E] border border-[#1B2A42]">
                <h4 className="text-sm font-semibold text-white mb-1">Aligned 68px Header</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Global search with <kbd className="bg-black/30 px-1 py-0.5 rounded text-white font-mono">/</kbd> shortcut pill, notification drawer, and interactive role switcher.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F1B2E] border border-[#1B2A42]">
                <h4 className="text-sm font-semibold text-white mb-1">268px ↔ 76px Navy Sidebar</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Smooth cubic-bezier collapse animation, floating tooltips in mini mode, and active glow indicators.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F1B2E] border border-[#1B2A42]">
                <h4 className="text-sm font-semibold text-white mb-1">Web Audio API Soft Chimes</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instant zero-latency synthesized sound on role switches, nav item clicks, and sound toggle control in header.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

