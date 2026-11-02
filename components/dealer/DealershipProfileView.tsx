"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { OFFICIAL_PRICING_ZONES } from "@/lib/pricing-calculator";
import {
  Building2,
  MapPin,
  FileText,
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  Truck,
} from "lucide-react";

export default function DealershipProfileView() {
  const { currentDealer, currentUser } = useAuth();
  const zone = OFFICIAL_PRICING_ZONES.ZONE_1;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dealership Account & Zone Profile
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Authorized Franchise
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {currentDealer?.legalTradingName || "Auckland Nissan City Ltd"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Nissan Dealer Code: <strong className="font-mono text-slate-800">{currentDealer?.dealerCode || "NZ-NIS-AKL01"}</strong> · NZBN: {currentDealer?.nzbn || "9429038291024"}
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Terms v2026.1 Verified</span>
        </div>
      </div>

      {/* Pricing Zone Profile Card (US-04) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Assigned Pricing Basis (US-04)
              </span>
              <h2 className="text-lg font-bold text-slate-900">{zone.zoneName}</h2>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Assigned by AutoHub Admin
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {zone.notes} Your landed vehicle orders receive two standard carrier movements from the Port of Auckland to your Greenlane facility.
        </p>

        {/* Fixed Cost Schedule Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-400 text-[11px] block">Ocean Freight</span>
            <strong className="text-slate-900 font-bold text-sm font-mono">
              ${zone.oceanFreightNZD.toLocaleString()} NZD
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">Yokohama to NZ RoRo</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-400 text-[11px] block">Entry Compliance</span>
            <strong className="text-slate-900 font-bold text-sm font-mono">
              ${zone.complianceInspectionNZD.toLocaleString()} NZD
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">Standard MR2A pass</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-400 text-[11px] block">Zone 1 Delivery (2 moves)</span>
            <strong className="text-slate-900 font-bold text-sm font-mono">
              ${zone.deliveryCostNZD.toLocaleString()} NZD
            </strong>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Auckland metro carrier</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-400 text-[11px] block">Customs & Bio-security</span>
            <strong className="text-slate-900 font-bold text-sm font-mono">
              ${zone.customsProcessingNZD.toLocaleString()} NZD
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">Port clearances</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 italic pt-2">
          Effective Date: {zone.effectiveDate}. In accordance with programme governance, pricing profile changes are effective-dated and audited by AutoHub administrators.
        </div>
      </div>

      {/* Dealership Physical Delivery Location & Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="w-4 h-4 text-crimson-600" />
            <span>Delivery Destination Address</span>
          </div>
          <p className="text-sm text-slate-800 font-medium leading-relaxed">
            {currentDealer?.address || "360 Great South Road, Greenlane, Auckland 1051, New Zealand"}
          </p>
          <div className="text-xs text-slate-500">
            All assigned vehicle carrier movements deliver directly to this physical dealership location.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Authorized Portal Buyer</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="text-sm font-bold text-slate-900">David Miller</div>
            <div className="text-slate-500">Dealer Principal & Purchasing Manager</div>
            <div className="font-mono text-slate-700 pt-1">dealer@aucklandnissan.co.nz</div>
            <div className="font-mono text-slate-700">+64 9 520 8899</div>
          </div>
        </div>
      </div>
    </div>
  );
}

