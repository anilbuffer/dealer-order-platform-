"use client";

import React from "react";
import LoginPage from "@/components/login/LoginPage";
import { useAuth } from "@/lib/auth-context";
import {
  Car,
  Shield,
  Globe2,
  LogOut,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";

export default function Home() {
  const { currentUser, currentDealer, logout, switchRole } = useAuth();

  // If user is not logged in, render the reference-matching Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Once logged in, show the authenticated portal header + role view
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0A1322] border-b border-[#1B2A42] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] flex items-center justify-center font-bold text-white shadow-soft">
              D
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                Dealer Order Platform
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  NZ
                </span>
              </div>
              <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Nissan Used Vehicle Programme
              </p>
            </div>
          </div>

          {/* Quick Role Switcher for seamless testing */}
          <div className="hidden md:flex items-center gap-2 bg-[#0F1B2E] p-1 rounded-xl border border-[#1B2A42] text-xs">
            <span className="text-slate-400 px-2 text-[11px] font-medium">Switch view:</span>
            <button
              onClick={() => switchRole("DEALER_USER")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentUser.role === "DEALER_USER"
                  ? "bg-emerald-500 text-white shadow-soft"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              🏢 Dealer
            </button>
            <button
              onClick={() => switchRole("AUTOHUB_ADMIN")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentUser.role === "AUTOHUB_ADMIN"
                  ? "bg-blue-600 text-white shadow-soft"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              🛡️ Admin
            </button>
            <button
              onClick={() => switchRole("NISSAN_JAPAN")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentUser.role === "NISSAN_JAPAN"
                  ? "bg-purple-600 text-white shadow-soft"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              🇯🇵 Nissan Japan
            </button>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{currentUser.name}</div>
              <div className="text-[11px] text-slate-400">
                {currentUser.dealershipName || currentUser.role}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1B2A42] transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Welcome back, {currentUser.name}
              </h1>
              {currentUser.role === "DEALER_USER" && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Approved Dealer · Zone 1
                </span>
              )}
              {currentUser.role === "AUTOHUB_ADMIN" && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  AutoHub Operations Admin
                </span>
              )}
              {currentUser.role === "NISSAN_JAPAN" && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Nissan Motor Japan HQ
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              {currentUser.role === "DEALER_USER" &&
                "Ready to browse verified Japan stock, lock landed prices, and track active orders."}
              {currentUser.role === "AUTOHUB_ADMIN" &&
                "Manage dealer applications, approve pricing profiles, and control order allocations."}
              {currentUser.role === "NISSAN_JAPAN" &&
                "Upload and manage Japan export vehicle catalogue and condition certificates."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              ← Back to Sign In Screen
            </button>
          </div>
        </div>

        {/* Portal Workspace Status Card */}
        <div className="bg-gradient-to-br from-[#0A1322] to-[#142239] rounded-2xl p-6 text-white border border-[#1B2A42] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-crimson-600 flex items-center justify-center font-bold text-white text-sm">
                ✓
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Login & Session Architecture Active</h3>
                <p className="text-xs text-slate-400">
                  Authenticated as: <strong className="text-white">{currentUser.email}</strong> ({currentUser.role})
                </p>
              </div>
            </div>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
              Ready for Pricing Zone Integration
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Aapne jo reference login screen share kiya tha, woh AutoHub Dealer Order Platform ke exact specs, Crimson Rose branding (#E11D48), Deep Navy canvas (#0A1322), One-Click demo quick access, aur Dealer Registration Terms Acceptance (US-01/US-02) ke sath successfully integrate ho chuka hai.
          </p>
        </div>
      </main>
    </div>
  );
}
