"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { audio } from "@/lib/sound";
import {
  Search,
  Bell,
  PanelLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ship,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onSearchClick?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (val: string) => void;
}

export default function Header({
  onToggleSidebar,
  isSidebarCollapsed = false,
  onSearchClick,
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
}: HeaderProps) {
  const { currentUser } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        audio.playSubtleClick();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sample real-time notifications
  const notifications = [
    {
      id: "1",
      title: "New Japan Stock Batch Available",
      desc: "24 new verified Nissan Note e-Power & X-Trail units released by Tokyo team.",
      time: "10m ago",
      icon: Sparkles,
      iconColor: "text-emerald-500 bg-emerald-50",
      unread: true,
    },
    {
      id: "2",
      title: "Vessel RoRo Departure Confirmed",
      desc: "Voyage Trans-Pacific V.48 departed Yokohama Port heading toward Auckland.",
      time: "2h ago",
      icon: Ship,
      iconColor: "text-blue-500 bg-blue-50",
      unread: true,
    },
    {
      id: "3",
      title: "Pricing Zone 1 Confirmed",
      desc: "Your dealership fixed-cost profile is active at standard metro rate.",
      time: "1d ago",
      icon: CheckCircle2,
      iconColor: "text-slate-500 bg-slate-50",
      unread: false,
    },
  ];

  return (
    <header className="h-[60px] bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
      {/* Left: Sidebar Toggle Icon + Search Bar (as attached screenshot) */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              onToggleSidebar();
            }}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer shrink-0"
          >
            <PanelLeft className="w-5 h-5 text-slate-600" />
          </button>
        )}

        <div className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && onSearchSubmit) {
                  onSearchSubmit(searchValue);
                }
              }}
              placeholder="Search make, model, year or keyword..."
              className="w-full pl-9 pr-10 py-1.5 sm:py-2 text-xs sm:text-sm bg-white hover:bg-slate-50/80 focus:bg-white rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all shadow-2xs"
            />
            <div className="absolute right-3 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
                /
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Notifications, Role Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Real-time Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              setIsNotificationsOpen(!isNotificationsOpen);
            }}
            aria-label="View notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E11D48] ring-2 ring-white animate-pulse" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-hover p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                    2 New
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => audio.playSubtleClick()}
                  className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pt-1">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="py-3 flex items-start gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors cursor-pointer"
                      onClick={() => audio.playSubtleClick()}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${n.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    audio.playSubtleClick();
                    setIsNotificationsOpen(false);
                  }}
                  className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] cursor-pointer"
                >
                  View All Programme Activity →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
