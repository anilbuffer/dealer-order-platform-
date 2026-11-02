"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/lib/auth-context";
import DealerStockCatalog from "@/components/dealer/DealerStockCatalog";
import FullPageVehicleDetail from "@/components/dealer/FullPageVehicleDetail";
import DealerOrdersView from "@/components/dealer/DealerOrdersView";
import DealershipProfileView from "@/components/dealer/DealershipProfileView";
import CommercialBoundaryView from "@/components/dealer/CommercialBoundaryView";
import JapanInventoryView from "@/components/japan/JapanInventoryView";
import BatchUploadView from "@/components/japan/BatchUploadView";
import AddVehicleForm from "@/components/japan/AddVehicleForm";
import AdminDashboardView from "@/components/admin/AdminDashboardView";
import DealerApprovalsView from "@/components/admin/DealerApprovalsView";
import AdminInventoryControllerView from "@/components/admin/AdminInventoryControllerView";
import AllocationMilestonesView from "@/components/admin/AllocationMilestonesView";
import AuditExportView from "@/components/admin/AuditExportView";
import UserManagementView from "@/components/admin/UserManagementView";
import RolesPermissionsView from "@/components/admin/RolesPermissionsView";

interface DashboardShellProps {
  initialVehicleId?: string;
}

export default function DashboardShell({ initialVehicleId }: DashboardShellProps = {}) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentUser?.role === "AUTOHUB_ADMIN") return "admin-dashboard";
    if (currentUser?.role === "NISSAN_JAPAN") return "japan-inventory";
    return "dealer-stock";
  });
  const [viewingVehicleId, setViewingVehicleId] = useState<string | null>(initialVehicleId || null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [prevRole, setPrevRole] = useState(currentUser?.role);
  if (currentUser?.role && prevRole && currentUser.role !== prevRole) {
    setPrevRole(currentUser.role);
    setViewingVehicleId(null);
    if (currentUser.role === "AUTOHUB_ADMIN") {
      setActiveTab("admin-dashboard");
    } else if (currentUser.role === "NISSAN_JAPAN") {
      setActiveTab("japan-inventory");
    } else {
      setActiveTab("dealer-stock");
    }
  }

  const handleSelectVehicle = (vehicleId: string) => {
    setViewingVehicleId(vehicleId);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/vehicles/${vehicleId}`);
    }
  };

  const handleBackFromVehicle = () => {
    setViewingVehicleId(null);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
    }
  };

  const handleTabChange = (tab: string) => {
    setViewingVehicleId(null);
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
    }
  };

  // Determine what view to render based on role and active tab
  const renderViewContent = () => {
    // If viewing a vehicle detail, render it as full-page view inside the portal canvas!
    if (viewingVehicleId) {
      return (
        <FullPageVehicleDetail
          vehicleId={viewingVehicleId}
          onBack={handleBackFromVehicle}
        />
      );
    }

    // 1. DEALER VIEWS
    if (currentUser?.role === "DEALER_USER" || currentUser?.role === "DEALER_ADMIN") {
      switch (activeTab) {
        case "dealer-stock":
          return <DealerStockCatalog onSelectVehicle={handleSelectVehicle} />;
        case "dealer-orders":
          return <DealerOrdersView />;
        case "dealer-profile":
          return <DealershipProfileView />;
        case "dealer-terms":
          return <CommercialBoundaryView />;
        default:
          return <DealerStockCatalog onSelectVehicle={handleSelectVehicle} />;
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

    // 3. AUTOHUB ADMIN VIEWS (Operations Command Center)
    if (currentUser?.role === "AUTOHUB_ADMIN") {
      switch (activeTab) {
        case "admin-dashboard":
          return <AdminDashboardView onNavigateTab={(t) => setActiveTab(t)} />;
        case "admin-users":
          return <UserManagementView />;
        case "admin-roles":
          return <RolesPermissionsView />;
        case "admin-approvals":
          return <DealerApprovalsView />;
        case "admin-stock":
          return <AdminInventoryControllerView />;
        case "admin-milestones":
          return <AllocationMilestonesView />;
        case "admin-audit":
          return <AuditExportView />;
        default:
          return <AdminDashboardView onNavigateTab={(t) => setActiveTab(t)} />;
      }
    }

    return <DealerStockCatalog onSelectVehicle={handleSelectVehicle} />;
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* 1. Responsive Collapsible Navy Sidebar (268px ↔ 76px) */}
      <Sidebar
        activeTab={viewingVehicleId ? "dealer-stock" : activeTab}
        onTabChange={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header with Search shortcut, Notifications & Role Switcher */}
        <Header />

        {/* Scrollable View Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderViewContent()}</div>
        </main>
      </div>
    </div>
  );
}
