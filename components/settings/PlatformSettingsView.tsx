"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { audio } from "@/lib/sound";
import {
  User,
  Shield,
  LogOut,
  MapPin,
  Mail,
  Phone,
  KeyRound,
  ArrowLeft,
  Lock,
  ChevronRight,
  ShieldCheck,
  Check,
  Building2,
  Calendar,
  Layers,
  FileCheck,
} from "lucide-react";

interface PlatformSettingsViewProps {
  onBack: () => void;
}

export default function PlatformSettingsView({ onBack }: PlatformSettingsViewProps) {
  const router = useRouter();
  const { currentUser, currentDealer, logout } = useAuth();

  const handleLogout = () => {
    audio.playSubtleClick();
    logout();
    router.push("/");
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
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Platform</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">My Profile</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              My Profile
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

      {/* Main Profile Container (Just My Profile - No other tabs) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* User Identity Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] text-white font-black text-2xl flex items-center justify-center shadow-lg ring-4 ring-white/10 shrink-0">
              {currentUser?.name.charAt(0) || "U"}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-white tracking-tight truncate">
                  {currentUser?.name}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-slate-200 border border-white/15">
                  {currentUser?.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono truncate">
                {currentUser?.email}
              </p>
              <div className="text-[11px] text-slate-400 font-medium">
                {currentUser?.title || "Authorised Programme Representative"} · {currentUser?.department || "Dealership Operations"}
              </div>
            </div>
          </div>

          <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Authentication Status
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MFA TOTP Active</span>
            </div>
          </div>
        </div>

        {/* Verified User & Organization Information Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Account Details &amp; Dealership Organization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Business Email</span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono truncate">
                {currentUser?.email}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block">
                ● Verified Nissan NZ SSO
              </span>
            </div>

            {/* Direct Phone */}
            <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Direct Contact Phone</span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {currentUser?.phone || currentDealer?.primaryContactPhone || "+64 9 520 8899"}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                Direct Floor Contact
              </span>
            </div>

            {/* Dealership Entity */}
            <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Dealership / Organisation Entity</span>
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {currentDealer?.legalTradingName || currentUser?.dealershipName || "Auckland Nissan City Ltd"}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Dealer Code: <strong className="text-slate-800">{currentDealer?.dealerCode || "NZ-NIS-AKL01"}</strong>
              </div>
            </div>

            {/* Geographic Pricing Zone */}
            <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Geographic Pricing Zone</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {currentDealer?.pricingZoneId || currentUser?.zoneId || "ZONE_1"} (Upper North Island)
              </div>
              <div className="text-[11px] text-slate-500">
                Inland transit profile automatically applied to stock pricing
              </div>
            </div>

            {/* Holding Capacity & Allocation Tier */}
            <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Floorplan Holding Limit</span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                ${(currentUser?.holdingLimitNZD || 350000).toLocaleString()} NZD
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                Max Concurrent 24h Holds: <strong className="text-slate-800">{currentUser?.maxActiveHolds || 3} Vehicles</strong>
              </span>
            </div>

            {/* Security Session */}
            <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>Session Security</span>
              </div>
              <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>MFA TOTP Authenticated</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">
                Last Login: {new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })} · {currentUser?.lastLoginIp || "202.89.4.15"}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Programme Permissions */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Assigned Programme Permissions
          </h3>

          <div className="flex flex-wrap gap-2">
            {(currentUser?.permissions || [
              "inventory.browse",
              "inventory.view_landed",
              "inventory.reserve_hold",
              "commercial.view_margins",
              "compliance.view_auction_sheet",
            ]).map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span>{perm}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Security Session Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
          <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold">256-Bit Encrypted Cryptographic Session</span>
            <p className="text-[11px] text-blue-800">
              Your profile is authenticated against the Nissan Used Vehicle Programme vault. All stock reservations and atomic holds generate immutable SHA-256 audit logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
