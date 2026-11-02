"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useProgramme } from "@/lib/programme-context";
import { audio } from "@/lib/sound";
import {
  Car,
  Package,
  Layers,
  FileText,
  Shield,
  Users,
  UserCheck,
  KeyRound,
  Clock,
  Download,
  PlusCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MapPin,
  ExternalLink,
  Settings,
} from "lucide-react";
import SettingsModal from "./SettingsModal";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { currentUser, currentDealer, logout } = useAuth();
  const { vehicles, orders, dealers, users } = useProgramme();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dynamic live synced counts
  const dealerOrdersCount = orders.filter(
    (o) => !currentDealer?.id || o.dealerId === currentDealer.id
  ).length;

  const availableStockCount = vehicles.filter(
    (v) => v.status === "AVAILABLE"
  ).length;

  const pendingApprovalsCount = dealers.filter(
    (d) => d.status === "PENDING_APPROVAL"
  ).length;

  const reservedAllocationsCount = vehicles.filter(
    (v) => v.status === "RESERVED"
  ).length;

  const activeUsersCount = users.filter((u) => u.active).length;

  // Navigation configurations based on role
  const getNavItems = (): NavItem[] => {
    if (currentUser?.role === "DEALER_USER" || currentUser?.role === "DEALER_ADMIN") {
      return [
        {
          id: "dealer-stock",
          label: "Stock",
          icon: Car,
          badge: availableStockCount > 0 ? availableStockCount : undefined,
          badgeColor: "bg-white/10 text-slate-200 border-white/10",
        },
        {
          id: "dealer-orders",
          label: "Orders",
          icon: Package,
          badge: dealerOrdersCount > 0 ? dealerOrdersCount : undefined,
          badgeColor: "bg-crimson-600/20 text-rose-300 border-crimson-500/30",
        },
        {
          id: "dealer-profile",
          label: "Dealership",
          icon: MapPin,
        },
        {
          id: "dealer-terms",
          label: "Pricing Terms",
          icon: FileText,
        },
      ];
    }

    if (currentUser?.role === "AUTOHUB_ADMIN") {
      return [
        {
          id: "admin-dashboard",
          label: "Overview",
          icon: Shield,
        },
        {
          id: "admin-users",
          label: "Users Listing",
          icon: Users,
          badge: activeUsersCount > 0 ? activeUsersCount : undefined,
          badgeColor: "bg-white/10 text-slate-200 border-white/10",
        },
        {
          id: "admin-roles",
          label: "Roles & RBAC",
          icon: KeyRound,
        },
        {
          id: "admin-approvals",
          label: "Approvals",
          icon: UserCheck,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        },
        {
          id: "admin-stock",
          label: "Inventory",
          icon: Layers,
          badge: availableStockCount > 0 ? availableStockCount : undefined,
          badgeColor: "bg-white/10 text-slate-200 border-white/10",
        },
        {
          id: "admin-milestones",
          label: "Allocations",
          icon: Clock,
          badge: reservedAllocationsCount > 0 ? reservedAllocationsCount : undefined,
          badgeColor: "bg-white/10 text-slate-200 border-white/10",
        },
        {
          id: "admin-audit",
          label: "Audit Log",
          icon: Download,
        },
      ];
    }

    // Nissan Japan
    return [
      {
        id: "japan-inventory",
        label: "Inventory",
        icon: Car,
        badge: vehicles.length > 0 ? vehicles.length : undefined,
        badgeColor: "bg-white/10 text-slate-200 border-white/10",
      },
      {
        id: "japan-upload",
        label: "Batch Upload",
        icon: FileSpreadsheet,
      },
      {
        id: "japan-add-single",
        label: "Add Vehicle",
        icon: PlusCircle,
      },
    ];
  };

  const navItems = getNavItems();

  const handleItemClick = (id: string) => {
    audio.playSubtleClick();
    onTabChange(id);
  };

  return (
    <aside
      className={`relative h-full bg-[#0A1322] border-r border-[#1B2A42] flex flex-col justify-between transition-sidebar z-30 select-none ${
        isCollapsed ? "w-[76px]" : "w-[268px]"
      }`}
      aria-label="Platform Sidebar Navigation"
    >
      {/* Top Branding Section */}
      <div>
        <div className="h-[68px] flex items-center px-4 border-b border-[#1B2A42] justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] flex items-center justify-center font-bold text-white shadow-soft shrink-0">
              D
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <h1 className="font-bold text-sm tracking-tight text-white truncate">
                  Dealer Order Platform
                </h1>
                <p className="text-[10px] text-slate-400 truncate">Nissan NZ Programme</p>
              </div>
            )}
          </div>

          {/* Collapse/Expand Toggle Button */}
          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              onToggleCollapse();
            }}
            title={isCollapsed ? "Expand sidebar (268px)" : "Collapse sidebar (76px)"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1B2A42] transition-colors focus-visible:ring-2 focus-visible:ring-crimson-500 cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Dealership / Programme Status Chip */}
        {!isCollapsed && currentDealer && (
          <div className="mx-3.5 my-3 p-2.5 rounded-xl bg-[#0F1B2E] border border-[#1B2A42] text-xs">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold mb-1">
              <span>Active Dealer</span>
              <span className="text-emerald-400 font-mono">Zone 1</span>
            </div>
            <div className="font-medium text-white truncate">{currentDealer.legalTradingName}</div>
            <div className="text-[11px] text-slate-400 font-mono truncate">{currentDealer.dealerCode}</div>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="p-3 space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-smooth cursor-pointer ${
                    isActive
                      ? "bg-white/10 text-white nav-active-glow shadow-soft"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? "text-crimson-500 scale-110" : "text-slate-400"
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate text-left">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            item.badgeColor || "bg-white/10 text-slate-300 border-white/20"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Floating Tooltip in Mini Mode */}
                {isCollapsed && hoveredItem === item.id && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0F1B2E] text-white border border-[#1B2A42] text-xs font-medium shadow-hover whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile, Settings & Sign Out Section */}
      <div className="p-3 border-t border-[#1B2A42] bg-[#070D18]/60">
        {!isCollapsed ? (
          <div className="space-y-2">
            {/* Clickable Profile Card -> Opens Settings */}
            <div
              onClick={() => {
                audio.playSubtleClick();
                setIsSettingsOpen(true);
              }}
              title="Click to open Profile & Settings"
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-[#1B2A42] flex items-center justify-center font-bold text-xs text-white shadow-xs">
                    {currentUser?.name.charAt(0) || "U"}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0A1322]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate group-hover:text-rose-200 transition-colors">
                    {currentUser?.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentUser?.email}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Settings & Sign Out */}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    audio.playSubtleClick();
                    setIsSettingsOpen(true);
                  }}
                  title="Platform Settings"
                  aria-label="Platform Settings"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audio.playSubtleClick();
                    logout();
                  }}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                setIsSettingsOpen(true);
              }}
              title="Profile & Settings"
              aria-label="Profile & Settings"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-[#1B2A42] flex items-center justify-center font-bold text-xs text-white hover:ring-2 hover:ring-rose-500/50 transition-all cursor-pointer"
            >
              {currentUser?.name.charAt(0) || "U"}
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                setIsSettingsOpen(true);
              }}
              title="Platform Settings"
              aria-label="Platform Settings"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                logout();
              }}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Platform Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </aside>
  );
}

