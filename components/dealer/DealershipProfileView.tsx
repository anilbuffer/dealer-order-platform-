"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { OFFICIAL_PRICING_ZONES } from "@/lib/pricing-calculator";
import { Building2, MapPin, Truck } from "lucide-react";

export default function DealershipProfileView() {
  const { currentDealer } = useAuth();
  const zone = OFFICIAL_PRICING_ZONES.ZONE_1;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Clean Header */}
      <div className="pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dealership Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Account details, assigned pricing zone, and delivery location
        </p>
      </div>

      {/* Account Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {currentDealer?.legalTradingName || "Auckland Nissan City Ltd"}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Dealer Code: {currentDealer?.dealerCode || "NZ-NIS-AKL01"} · NZBN: {currentDealer?.nzbn || "9429038291024"}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            Approved Dealer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Physical Delivery Address</span>
            <span className="font-medium text-slate-800">{currentDealer?.address}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Primary Contact</span>
            <span className="font-medium text-slate-800">
              {currentDealer?.primaryContactName} ({currentDealer?.primaryContactEmail})
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Schedule Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Commercial Pricing Schedule
            </span>
            <h2 className="text-base font-bold text-slate-900">{zone.zoneName}</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">Effective: {zone.effectiveDate}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[11px] block">RoRo Ocean Freight</span>
            <span className="font-bold font-mono text-slate-900 text-sm">${zone.oceanFreightNZD.toLocaleString()} NZD</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[11px] block">Entry Compliance</span>
            <span className="font-bold font-mono text-slate-900 text-sm">${zone.complianceInspectionNZD.toLocaleString()} NZD</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[11px] block">Zone 1 Delivery</span>
            <span className="font-bold font-mono text-slate-900 text-sm">${zone.deliveryCostNZD.toLocaleString()} NZD</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[11px] block">Customs & Bio-clean</span>
            <span className="font-bold font-mono text-slate-900 text-sm">${zone.customsProcessingNZD.toLocaleString()} NZD</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
          {zone.notes}
        </p>
      </div>
    </div>
  );
}
