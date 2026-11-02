"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/lib/auth-context";
import DealerStockCatalog from "@/components/dealer/DealerStockCatalog";
import DealerOrdersView from "@/components/dealer/DealerOrdersView";
import DealershipProfileView from "@/components/dealer/DealershipProfileView";
import CommercialBoundaryView from "@/components/dealer/CommercialBoundaryView";
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

  // Determine what view to render in the scrollable view area
  const renderViewContent = () => {
    // 1. DEALER VIEWS
    if (currentUser?.role === "DEALER_USER" || currentUser?.role === "DEALER_ADMIN") {
      switch (activeTab) {
        case "dealer-stock":
          return <DealerStockCatalog />;
        case "dealer-orders":
          return <DealerOrdersView />;
        case "dealer-profile":
          return <DealershipProfileView />;
        case "dealer-terms":
          return <CommercialBoundaryView />;
        default:
          return <DealerStockCatalog />;
      }
    }

    // 2. PLACEHOLDER FOR ADMIN / JAPAN ROLES (Which we'll implement in subsequent phases)
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {currentUser?.role === "AUTOHUB_ADMIN" ? "Operations Command Portal" : "Nissan Japan Export HQ"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Tab: {activeTab}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {currentUser?.role === "AUTOHUB_ADMIN"
              ? "Autohub Operations Dashboard"
              : "Nissan Japan Inventory Dispatch"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Switch back to <strong className="text-slate-900">Auckland Nissan (DEALER VIEW)</strong> using the top-right Role Switcher to test the completed dealer workflow.
          </p>
        </div>
      </div>
    );
  };

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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderViewContent()}
        </main>
      </div>
    </div>
  );
}
