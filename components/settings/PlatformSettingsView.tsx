"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { audio } from "@/lib/sound";
import {
  User,
  LogOut,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Briefcase,
  Hash,
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
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              onBack();
            }}
            className="btn-outline"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Platform</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">Account Details</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Account Details
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn-outline hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-slate-700 self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Account Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-8">
        {/* User Identity Header - Clean, Light & Luxury */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center shadow-2xs ring-4 ring-slate-100 shrink-0">
              {currentUser?.name?.charAt(0) || "U"}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {currentUser?.name || "David Miller"}
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {currentUser?.role === "DEALER_USER" ? "Authorised Dealer" : currentUser?.role || "Member"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {currentUser?.title || "Authorised Programme Buyer"} · {currentDealer?.legalTradingName || currentUser?.dealershipName || "Auckland Nissan City Ltd"}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Nissan SSO</span>
          </div>
        </div>

        {/* Clean Account Details Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Franchise Profile &amp; Contact Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {currentUser?.name || "David Miller"}
              </div>
            </div>

            {/* Email */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Business Email</span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono truncate">
                {currentUser?.email || "dealer@aucklandnissan.co.nz"}
              </div>
            </div>

            {/* Direct Phone */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Direct Contact Phone</span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {currentUser?.phone || currentDealer?.primaryContactPhone || "+64 9 520 8899"}
              </div>
            </div>

            {/* Dealership Entity */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Dealership / Organisation Entity</span>
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {currentDealer?.legalTradingName || currentUser?.dealershipName || "Auckland Nissan City Ltd"}
              </div>
            </div>

            {/* Dealer Code */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Dealer Franchise Code</span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {currentDealer?.dealerCode || "NZ-NIS-AKL01"}
              </div>
            </div>

            {/* Role & Title */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Designation &amp; Department</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {currentUser?.title || "Authorised Programme Buyer"} · {currentUser?.department || "Dealership Operations"}
              </div>
            </div>

            {/* Geographic Pricing Zone */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Commercial Pricing Zone</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {currentDealer?.pricingZoneId || currentUser?.zoneId || "ZONE_1"} — Upper North Island (Port of Auckland Direct)
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Footer Note */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <span>Franchise profile authenticated under Nissan Motor Corporation New Zealand.</span>
          <span className="font-mono text-[11px] text-slate-400">SSO Session Verified</span>
        </div>
      </div>
    </div>
  );
}
