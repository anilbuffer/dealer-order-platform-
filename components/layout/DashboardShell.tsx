"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/lib/auth-context";
import DealerStockCatalog from "@/components/dealer/DealerStockCatalog";
import DealerOrdersView from "@/components/dealer/DealerOrdersView";
import DealershipProfileView from "@/components/dealer/DealershipProfileView";
import CommercialBoundaryView from "@/components/dealer/CommercialBoundaryView";
import JapanInventoryView from "@/components/japan/JapanInventoryView";
import BatchUploadView from "@/components/japan/BatchUploadView";
import AddVehicleForm from "@/components/japan/AddVehicleForm";

export default function DashboardShell() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentUser?.role === "AUTOHUB_ADMIN") return "admin-dashboard";
    if (currentUser?.role === "NISSAN_JAPAN") return "japan-inventory";
    return "dealer-stock";
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Automatically sync primary tab on role switch
  useEffect(() => {
    if (currentUser?.role === "DEALER_USER" || currentUser?.role === "DEALER_ADMIN") {
      setActiveTab("dealer-stock");
    } else if (currentUser?.role === "NISSAN_JAPAN") {
      setActiveTab("japan-inventory");
    } else if (currentUser?.role === "AUTOHUB_ADMIN") {
      setActiveTab("admin-dashboard");
    }
  }, [currentUser?.role]);

  // Determine what view to render based on role and active tab
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

    // 2. NISSAN JAPAN VIEWS
    if (currentUser?.role === "NISSAN_JAPAN") {
      switch (activeTab) {
        case "japan-inventory":
          return (
            <JapanInventoryView
              onNavigateAdd={() => setActiveTab("japan-add-single")}
              onNavigateBatch={() => setActiveTab("japan-upload")}
            />
          );
        case "japan-upload":
          return (
            <BatchUploadView onSuccessReturn={() => setActiveTab("japan-inventory")} />
          );
        case "japan-add-single":
          return (
            <AddVehicleForm onSuccessReturn={() => setActiveTab("japan-inventory")} />
          );
        default:
          return (
            <JapanInventoryView
              onNavigateAdd={() => setActiveTab("japan-add-single")}
              onNavigateBatch={() => setActiveTab("japan-upload")}
            />
          );
      }
    }

    // 3. AUTOHUB ADMIN VIEWS (Next Phase)
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-soft">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Autohub Operations Admin
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Operations Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Switch between Auckland Nissan, Nissan Japan, and Admin via the top-right Role Switcher.
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
