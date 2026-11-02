"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useProgramme } from "@/lib/programme-context";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
import RoleSwitcher from "./RoleSwitcher";
import {
  Search,
  Bell,
  PanelLeft,
  Menu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ship,
  Sparkles,
  X,
  ArrowUpRight,
  Car,
  Lock,
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
  const router = useRouter();
  const { currentUser, currentDealer } = useAuth();
  const { vehicles } = useProgramme();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const dealerZone = currentDealer?.pricingZoneId || "ZONE_1";
  const isAdmin = currentUser?.role === "AUTOHUB_ADMIN";

  // Filter Vehicles Live on Search Query (On-Type Search)
  const searchResults = useMemo(() => {
    if (!searchValue || !searchValue.trim()) return [];
    const q = searchValue.trim().toLowerCase();
    return vehicles
      .filter((v) => {
        if (v.status === "WITHDRAWN") return false;
        const modelMatch = v.model?.toLowerCase().includes(q);
        const makeMatch = v.make?.toLowerCase().includes(q);
        const stockMatch = v.stockId?.toLowerCase().includes(q);
        const vinMatch = v.vinChassis?.toLowerCase().includes(q);
        const fuelMatch = v.fuelType?.toLowerCase().includes(q);
        const gradeMatch = v.auctionGrade?.toLowerCase().includes(q) || v.grade?.toLowerCase().includes(q);
        const yearMatch = String(v.year).includes(q);
        const locationMatch = v.location?.toLowerCase().includes(q);
        return modelMatch || makeMatch || stockMatch || vinMatch || fuelMatch || gradeMatch || yearMatch || locationMatch;
      })
      .slice(0, 6); // Top 6 matching vehicles
  }, [searchValue, vehicles]);

  // Handle vehicle selection
  const handleSelectVehicle = (vehicleId: string) => {
    audio.playSubtleClick();
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    if (onSearchChange) onSearchChange("");
    router.push(`/dealer/vehicles/${vehicleId}`);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut '/' to focus search & ESC to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        if (window.innerWidth < 640) {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
        } else {
          searchInputRef.current?.focus();
        }
        setIsSearchFocused(true);
        audio.playSubtleClick();
      } else if (e.key === "Escape") {
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
        searchInputRef.current?.blur();
        mobileSearchInputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keyboard navigation inside search dropdown
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchFocused || searchResults.length === 0) {
      if (e.key === "Enter" && onSearchSubmit) {
        onSearchSubmit(searchValue);
        setIsSearchFocused(false);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectVehicle(searchResults[selectedIndex].id);
      } else if (onSearchSubmit) {
        onSearchSubmit(searchValue);
        setIsSearchFocused(false);
      }
    }
  };

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
    <header className="h-[60px] bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4 sticky top-0 z-30 shrink-0">
      {/* Mobile Search Overlay Bar */}
      {isMobileSearchOpen && (
        <div className="sm:hidden absolute inset-0 z-40 bg-white px-3 flex flex-col justify-center animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search make, model, stock ID..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:bg-white"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-900 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Mobile Instant Results Dropdown */}
          {searchValue.trim() && (
            <div className="absolute top-[60px] left-0 right-0 bg-white border-b border-slate-200 shadow-xl max-h-[70vh] overflow-y-auto p-2 space-y-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                <span>Vehicles ({searchResults.length})</span>
                <span>Landed ({dealerZone})</span>
              </div>
              {searchResults.map((v) => {
                const price = calculateLandedPrice(v.fobPriceJPY, dealerZone);
                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVehicle(v.id)}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-8 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0">
                        <img src={v.images?.[0] || "/images/cars/kicks.png"} alt={v.model} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">{v.year} {v.make} {v.model}</p>
                        <p className="text-[10px] text-slate-400">#{v.stockId} · Grade {v.auctionGrade}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-900 shrink-0">${price.totalBuyPriceNZD.toLocaleString()}</span>
                  </div>
                );
              })}
              {searchResults.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No vehicles found matching &ldquo;{searchValue}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Left: Sidebar Toggle Icon + Global Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              onToggleSidebar();
            }}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5 lg:hidden text-slate-700" />
            <PanelLeft className="w-5 h-5 hidden lg:block text-slate-600" />
          </button>
        )}

        {/* Mobile App Branding Mark on small screens */}
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E11D48] to-[#881337] flex items-center justify-center font-black text-white text-xs shadow-xs">
            D
          </div>
        </div>

        {/* Desktop / Tablet Search Input with Live On-Type Dropdown */}
        <div ref={searchContainerRef} className="relative flex-1 hidden sm:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
                setIsSearchFocused(true);
                setSelectedIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search make, model, year or keyword..."
              className="w-full pl-9 pr-10 py-1.5 sm:py-2 text-xs sm:text-sm bg-white hover:bg-slate-50/80 focus:bg-white rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all shadow-2xs font-medium"
            />
            <div className="absolute right-3 flex items-center">
              {searchValue ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onSearchChange) onSearchChange("");
                    searchInputRef.current?.focus();
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 text-xs cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded pointer-events-none">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* Live On-Type Search Results Popover Dropdown                */}
          {/* ─────────────────────────────────────────────────────────── */}
          {isSearchFocused && searchValue.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                <span>Matching Vehicles ({searchResults.length})</span>
                <span>Landed Buy ({dealerZone})</span>
              </div>

              {/* Vehicle Results List */}
              <div className="divide-y divide-slate-100/80 max-h-[380px] overflow-y-auto">
                {searchResults.map((v, idx) => {
                  const price = calculateLandedPrice(v.fobPriceJPY, dealerZone);
                  const isAvailable = v.status === "AVAILABLE";
                  const isSelected = selectedIndex === idx;

                  return (
                    <div
                      key={v.id}
                      onClick={() => handleSelectVehicle(v.id)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "bg-slate-100/90 text-slate-900 shadow-2xs"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {/* Left: Thumbnail & Specs */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-9 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={v.images?.[0] || "/images/cars/kicks.png"}
                            alt={v.model}
                            className="w-full h-full object-contain filter drop-shadow-2xs"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {v.year} {v.make} {v.model}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                              #{v.stockId}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-medium text-slate-600">{v.fuelType}</span>
                            <span>·</span>
                            <span>Grade {v.auctionGrade}</span>
                            <span>·</span>
                            <span className="font-mono">{v.odometerKm.toLocaleString()} km</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Landed Price & Status Pill */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-black font-mono text-slate-900 leading-tight">
                            ${price.totalBuyPriceNZD.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {isAdmin ? `FOB ¥${v.fobPriceJPY.toLocaleString()}` : "NZD Landed"}
                          </div>
                        </div>

                        {isAvailable ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center" title="Available for Hold">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center" title="On 24h Exclusivity Hold">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {searchResults.length === 0 && (
                <div className="p-6 text-center space-y-2">
                  <Car className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-800">
                    No vehicles matching &ldquo;{searchValue}&rdquo;
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Try searching by model (e.g. Note, X-Trail, Serena, Ariya), fuel type (e-Power, EV), or stock ID (#NIS-2026-9041).
                  </p>
                </div>
              )}

              {/* Dropdown Footer with keyboard navigation shortcuts */}
              <div className="mt-1 pt-2 border-t border-slate-100 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span><kbd className="px-1 py-0.2 rounded bg-slate-100 font-mono text-[9px] border border-slate-200">↑↓</kbd> navigate</span>
                  <span>•</span>
                  <span><kbd className="px-1 py-0.2 rounded bg-slate-100 font-mono text-[9px] border border-slate-200">↵</kbd> select</span>
                  <span>•</span>
                  <span><kbd className="px-1 py-0.2 rounded bg-slate-100 font-mono text-[9px] border border-slate-200">ESC</kbd> close</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audio.playSubtleClick();
                    setIsSearchFocused(false);
                    if (onSearchSubmit) onSearchSubmit(searchValue);
                  }}
                  className="text-[#E11D48] hover:underline font-bold cursor-pointer"
                >
                  View all in Catalog &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Search Button on mobile, Notifications, Role Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Search Trigger Icon */}
        <button
          type="button"
          onClick={() => {
            audio.playSubtleClick();
            setIsMobileSearchOpen(true);
            setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
          }}
          aria-label="Open search input"
          className="sm:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 text-slate-600" />
        </button>

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
            <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm rounded-2xl bg-white border border-slate-200 shadow-hover p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pt-1 navy-scrollbar">
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

        {/* Dynamic Multi-Role Switcher (Compact on mobile, full on desktop) */}
        <RoleSwitcher />
      </div>
    </header>
  );
}
