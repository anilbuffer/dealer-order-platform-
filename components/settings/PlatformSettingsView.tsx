"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { audio } from "@/lib/sound";
import { UserRole } from "@/lib/types";
import {
  Settings,
  User,
  Shield,
  Car,
  Globe2,
  Volume2,
  VolumeX,
  Bell,
  Check,
  LogOut,
  MapPin,
  Mail,
  Phone,
  KeyRound,
  Sparkles,
  ArrowLeft,
  Lock,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface PlatformSettingsViewProps {
  onBack: () => void;
}

interface RoleOption {
  role: UserRole;
  label: string;
  sublabel: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  iconBg: string;
  email: string;
  description: string;
}

const ROLES: RoleOption[] = [
  {
    role: "DEALER_USER",
    label: "Auckland Nissan City",
    sublabel: "David Miller · General Manager",
    badge: "DEALER (ZONE 1)",
    badgeColor: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    icon: Car,
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    email: "dealer@aucklandnissan.co.nz",
    description: "Browse certified Japan stock, place 24h atomic holds, and track landed vehicles.",
  },
  {
    role: "AUTOHUB_ADMIN",
    label: "Autohub Platform Operations",
    sublabel: "Sarah Jenkins · Operations Lead",
    badge: "CENTRAL ADMIN",
    badgeColor: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    icon: Shield,
    iconBg: "bg-blue-50 text-blue-600 border border-blue-200",
    email: "ops@autohub.co.nz",
    description: "Approve dealership registrations, manage RBAC permissions, and oversee compliance.",
  },
  {
    role: "NISSAN_JAPAN",
    label: "Nissan Japan HQ & Export Yards",
    sublabel: "Kenji Sato · Tokyo Export Coordinator",
    badge: "JAPAN HQ",
    badgeColor: "bg-purple-500/15 text-purple-700 border-purple-500/30",
    icon: Globe2,
    iconBg: "bg-purple-50 text-purple-600 border border-purple-200",
    email: "kenji.sato@nissan.co.jp",
    description: "Publish Yokohama export inventory, upload CSV batches, and manage RoRo schedules.",
  },
];

export default function PlatformSettingsView({ onBack }: PlatformSettingsViewProps) {
  const { currentUser, currentDealer, switchRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"ROLES" | "PROFILE" | "PREFERENCES">("ROLES");
  const [isMuted, setIsMuted] = useState(audio.getMuted());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleToggleSound = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audio.playSoftChime();
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    audio.playSoftChime();
    switchRole(role);
  };

  const handleLogout = () => {
    audio.playSubtleClick();
    logout();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              onBack();
            }}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-xs"
            title="Back to Previous View"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Platform</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">Settings</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Platform Settings
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Container Card with Inner Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
        {/* Horizontal Navigation Tabs */}
        <div className="flex border-b border-slate-200/80 bg-slate-50/50 px-6 pt-3 gap-2 overflow-x-auto">
          {[
            { id: "ROLES", label: "Switch Persona / Role", icon: Shield },
            { id: "PROFILE", label: "My Profile", icon: User },
            { id: "PREFERENCES", label: "Preferences & Audio", icon: Volume2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  audio.playSubtleClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-[#E11D48] text-[#E11D48] bg-white rounded-t-xl shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 rounded-t-xl"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8">
          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 1: SWITCH PERSONA / ROLE                               */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeTab === "ROLES" && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Switch Active Role Persona
                </h3>
                <p className="text-xs text-slate-500">
                  Instantly switch between programme personas for demonstration and testing.
                </p>
              </div>

              <div className="space-y-3">
                {ROLES.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = currentUser?.role === item.role;

                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleRoleSelect(item.role)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-start justify-between group cursor-pointer ${
                        isCurrent
                          ? "bg-rose-50/30 border-[#E11D48] ring-2 ring-rose-500/20 shadow-soft"
                          : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 group-hover:text-[#E11D48] transition-colors">
                              {item.label}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 font-medium">
                            {item.sublabel} · <span className="font-mono text-slate-400">{item.email}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug pt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="ml-3 shrink-0 pt-1">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E11D48] bg-rose-100/70 px-2.5 py-1 rounded-full">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-700 bg-slate-100 group-hover:bg-slate-200/70 px-2.5 py-1 rounded-full transition-colors">
                            Switch
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 2: MY PROFILE & SECURITY                               */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeTab === "PROFILE" && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  User Profile &amp; Organization
                </h3>
                <p className="text-xs text-slate-500">
                  Account identity, verified credentials and dealership allocation tier.
                </p>
              </div>

              {/* User Avatar Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/80 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-soft shrink-0">
                  {currentUser?.name.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-extrabold text-slate-900 truncate">
                      {currentUser?.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono">
                      {currentUser?.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              {/* Verified Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Business Email</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {currentUser?.email}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Direct Phone</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    +64 9 520 8899
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Dealership Entity</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentDealer?.legalTradingName || "Nissan Programme Central Fleet"}
                  </div>
                  {currentDealer?.dealerCode && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Code: {currentDealer.dealerCode}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Authentication &amp; MFA</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>MFA TOTP Active</span>
                  </div>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-relaxed">
                  <span className="font-bold">256-Bit Encrypted Session</span>
                  <p className="text-[11px] text-blue-800">
                    Your session is cryptographically bound to the Nissan Used Vehicle Programme audit vault. All vehicle hold placements generate immutable SHA-256 logs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 3: PREFERENCES & AUDIO                                 */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeTab === "PREFERENCES" && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Audio &amp; Interaction Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  Customise audio feedback, alerts and stock reservation notifications.
                </p>
              </div>

              <div className="space-y-4">
                {/* Audio Feedback Toggle */}
                <div className="p-4 rounded-2xl border border-slate-200/90 bg-white flex items-center justify-between shadow-xs">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isMuted ? "bg-slate-100 text-slate-400" : "bg-rose-50 text-[#E11D48] border border-rose-200/60"
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Micro-Interaction Sound Effects
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tactile audio feedback on vehicle hold locks, role switching, and filtering.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      !isMuted ? "bg-[#E11D48]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        !isMuted ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Email Notifications Toggle */}
                <div className="p-4 rounded-2xl border border-slate-200/90 bg-white flex items-center justify-between shadow-xs">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        notificationsEnabled
                          ? "bg-blue-50 text-blue-600 border border-blue-200/60"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        24-Hour Atomic Hold Notifications
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Receive instant email alerts when your vehicle hold timer reaches 4 hours remaining.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      audio.playSubtleClick();
                      setNotificationsEnabled(!notificationsEnabled);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notificationsEnabled ? "bg-[#E11D48]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        notificationsEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

