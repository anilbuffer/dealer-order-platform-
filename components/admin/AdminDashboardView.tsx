"use client";

import React, { useState } from "react";
import { useProgramme } from "@/lib/programme-context";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
import {
  Car,
  Users,
  Clock,
  Ship,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Building2,
} from "lucide-react";

interface AdminDashboardViewProps {
  onNavigateTab: (tabId: string) => void;
}

export default function AdminDashboardView({ onNavigateTab }: AdminDashboardViewProps) {
  const { vehicles, orders, dealers, confirmAllocation, releaseHold } = useProgramme();

  const heldVehicles = vehicles.filter((v) => v.status === "RESERVED");
  const pendingDealers = dealers.filter((d) => d.status === "PENDING_APPROVAL");
  const availableStockCount = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const inTransitCount = orders.filter((o) => o.currentMilestone === "IN_TRANSIT").length;
  const awaitingCostCount = orders.filter((o) => o.currentMilestone === "AWAITING_ADDITIONAL_COST").length;

  // 1-Click Allocation Confirm from Dashboard
  const handleConfirmHold = (vehicleId: string) => {
    audio.playSuccessChime();
    confirmAllocation(vehicleId);
  };

  // 1-Click Release Hold back to available stock
  const handleReleaseHold = (vehicleId: string) => {
    audio.playSubtleClick();
    releaseHold(vehicleId);
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header Banner & Status                                  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
              Autohub Logistics Operations
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● Central Controller Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overseeing Nissan Japan Yokohama export dispatch, NZ RoRo logistics, and 5-zone franchise dealer allocations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 font-mono text-slate-700 font-semibold border border-slate-200">
            Port Operations: Auckland / Tauranga / Lyttelton
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Executive KPI Metrics (Clean & Decision-Critical)       */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Active Stock */}
        <div
          onClick={() => onNavigateTab("admin-stock")}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Available Stock
            </span>
            <Car className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
            {availableStockCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Yokohama &amp; Kobe Yard</div>
        </div>

        {/* Metric 2: Pending Applications */}
        <div
          onClick={() => onNavigateTab("admin-approvals")}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Dealers
            </span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono mt-2">
            {pendingDealers.length}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Needs Zone Authorization</div>
        </div>

        {/* Metric 3: Active 24h Holds */}
        <div
          onClick={() => onNavigateTab("admin-milestones")}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              24h Active Holds
            </span>
            <Clock className="w-4 h-4 text-[#E11D48]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
            {heldVehicles.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Atomic Reservation Queue</div>
        </div>

        {/* Metric 4: RoRo In Transit */}
        <div
          onClick={() => onNavigateTab("admin-milestones")}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              RoRo In Transit
            </span>
            <Ship className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
            {inTransitCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Vessel TP-2648</div>
        </div>

        {/* Metric 5: Awaiting Variation */}
        <div
          onClick={() => onNavigateTab("admin-milestones")}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cost Variations
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 font-mono mt-2">
            {awaitingCostCount}
          </div>
          <div className="text-[11px] text-rose-700 font-semibold mt-0.5">Awaiting Dealer Signoff</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. Action Required Alert (Pending Dealer Application)       */}
      {/* ─────────────────────────────────────────────────────────── */}
      {pendingDealers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-amber-900">
                Dealer Onboarding Approval Required ({pendingDealers[0].legalTradingName})
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                NZBN {pendingDealers[0].nzbn} · Lower South Island · Terms v2026.1 accepted. Waiting for Geographic Zone assignment.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("admin-approvals")}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Review &amp; Authorize</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. Split Dashboard Grid (Queue & Live Logistics Tracker)   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): 24h Holds & Orders */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active 24-Hour Atomic Reservation Holds Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  24-Hour Atomic Reservation Queue
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dealer holds placed via self-service catalog awaiting formal Autohub confirmation.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-mono font-bold text-slate-700">
                {heldVehicles.length} active hold
              </span>
            </div>

            {heldVehicles.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                No active 24-hour reservation holds pending allocation.
              </div>
            ) : (
              <div className="space-y-3">
                {heldVehicles.map((v) => {
                  const price = calculateLandedPrice(v.fobPriceJPY, "ZONE_1");
                  return (
                    <div
                      key={v.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={v.images[0]}
                          alt={v.model}
                          className="w-16 h-12 object-contain bg-white rounded-lg border border-slate-200 p-1 shrink-0"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-slate-900">
                            {v.year} {v.make} {v.model} {v.grade}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Stock: {v.stockId} · Chassis: {v.vinChassis}
                          </div>
                          <div className="text-[11px] text-[#E11D48] font-semibold mt-0.5">
                            Held by Auckland Nissan City · Expiry: 18h remaining
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReleaseHold(v.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Release Hold
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmHold(v.id)}
                          className="px-4 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Allocation</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Logistics RoRo Shipments Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Active Programme Orders &amp; RoRo Tracking
                </h3>
                <p className="text-[11px] text-slate-500">
                  Real-time status across 9 RoRo logistics milestones.
                </p>
              </div>

              <button
                onClick={() => onNavigateTab("admin-milestones")}
                className="text-xs font-bold text-[#E11D48] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Manage Milestones</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-700">{o.dealerName}</span>
                    </div>
                    <div className="text-slate-600 font-medium">
                      {o.vehicle.year} {o.vehicle.make} {o.vehicle.model} ({o.vehicle.vinChassis})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Vessel: <strong className="text-slate-800">{o.vesselName}</strong> · ETA: {o.etaDeliveryDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        o.currentMilestone === "AWAITING_ADDITIONAL_COST"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {o.currentMilestone === "AWAITING_ADDITIONAL_COST"
                        ? "Variation Review ($480)"
                        : "In Transit (On Vessel)"}
                    </span>

                    <button
                      onClick={() => onNavigateTab("admin-milestones")}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Update Milestones"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Geographic Zones Coverage & Policy */}
        <div className="lg:col-span-4 space-y-6">
          {/* 5 Geographic Pricing Zones Coverage Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Official Programme Policy
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                5 Geographic Pricing Zones
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Zone 1: Upper North Island</span>
                  <span className="text-[11px] text-slate-500">Auckland, Northland</span>
                </div>
                <strong className="text-slate-900 font-mono">$650</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Zone 2: Central North Island</span>
                  <span className="text-[11px] text-slate-500">Waikato, Bay of Plenty, Rotorua</span>
                </div>
                <strong className="text-slate-900 font-mono">$850</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Zone 3: Lower North Island</span>
                  <span className="text-[11px] text-slate-500">Taranaki, Hawke&apos;s Bay, Wellington</span>
                </div>
                <strong className="text-slate-900 font-mono">$1,150</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Zone 4: Upper South Island</span>
                  <span className="text-[11px] text-slate-500">Nelson, Marlborough, Canterbury</span>
                </div>
                <strong className="text-slate-900 font-mono">$1,450</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Zone 5: Lower South Island</span>
                  <span className="text-[11px] text-slate-500">West Coast, Otago, Southland</span>
                </div>
                <strong className="text-slate-900 font-mono">$1,750</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 leading-relaxed">
              Delivery amounts cover transport from arrival port to dealership yard plus 2 metro compliance tow moves.
            </div>
          </div>

          {/* Quick System Links */}
          <div className="p-4 rounded-2xl bg-[#0A1322] text-white space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E11D48]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Audited Commercial Operations
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every dealer onboarding, pricing assignment, atomic lock, and milestone step is immutably logged for commercial verification.
            </p>
            <button
              onClick={() => onNavigateTab("admin-audit")}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              View Audit Event Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

