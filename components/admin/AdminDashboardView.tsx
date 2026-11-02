"use client";

import React, { useState } from "react";
import { useProgramme } from "@/lib/programme-context";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
import DealerDetailsModal from "./DealerDetailsModal";
import ReservationDetailsModal from "./ReservationDetailsModal";
import { ReservationRequest, DealerAccount } from "@/lib/types";
import { ZoneId } from "@/lib/types";
import {
  Users,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Building2,
  ArrowRight,
  Clock,
  Car,
  MapPin,
  ShieldCheck,
  FileCheck2,
  Mail,
  Phone,
  Copy,
  Check,
} from "lucide-react";

interface AdminDashboardViewProps {
  onNavigateTab: (tabId: string) => void;
}

export default function AdminDashboardView({ onNavigateTab }: AdminDashboardViewProps) {
  const {
    vehicles,
    dealers,
    reservations,
    approveDealer,
    rejectDealer,
    confirmAllocation,
    releaseHold,
  } = useProgramme();

  const [notification, setNotification] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<Record<string, ZoneId>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDealerForDetails, setSelectedDealerForDetails] = useState<DealerAccount | null>(null);
  const [selectedResForDetails, setSelectedResForDetails] = useState<ReservationRequest | null>(null);

  // 1. Pending Dealer Onboarding Requests
  const pendingDealers = dealers.filter((d) => d.status === "PENDING_APPROVAL");

  // 2. Active 24-Hour Atomic Reservation Holds
  const activeHolds = reservations.filter((r) => r.status === "ACTIVE_HOLD");
  const heldVehicles = (activeHolds.length > 0
    ? activeHolds.map((r) => {
        const live = vehicles.find((v) => v.id === r.vehicleId || v.id === r.vehicle?.id);
        return {
          ...r.vehicle,
          ...live,
          images:
            live?.images && live.images.length > 0
              ? live.images
              : r.vehicle?.images && r.vehicle.images.length > 0
              ? r.vehicle.images
              : ["/images/cars/kicks.png"],
        };
      })
    : vehicles.filter((v) => v.status === "RESERVED")
  ).map((v) => ({
    ...v,
    images: v.images && v.images.length > 0 ? v.images : ["/images/cars/kicks.png"],
  }));

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    audio.playSubtleClick();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Dealer Approval Handler
  const handleApprove = (dealerId: string, defaultZone: ZoneId) => {
    audio.playSuccessChime();
    const zone = selectedZone[dealerId] || defaultZone;
    approveDealer(dealerId, zone);
    setNotification(`Approved dealership application and assigned to ${zone}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Dealer Rejection Handler
  const handleReject = (dealerId: string) => {
    audio.playSubtleClick();
    rejectDealer(dealerId);
    setNotification(`Dealership onboarding request declined.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1-Click Confirm Allocation
  const handleConfirmReservation = (vehicleId: string) => {
    audio.playSuccessChime();
    confirmAllocation(vehicleId, "Confirmed directly from Admin Operations Dashboard.");
    setNotification(`Wholesale allocation confirmed. Order generated and dispatched to shipping pipeline.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1-Click Release Hold
  const handleReleaseReservation = (vehicleId: string) => {
    audio.playSubtleClick();
    releaseHold(vehicleId, "Hold released from Admin Operations Dashboard.");
    setNotification(`Reservation hold released. Vehicle returned to wholesale catalogue.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header Banner                                            */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
              Autohub Platform Operations
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Operations Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time action center for dealer onboarding approvals and 24-hour atomic reservation requests.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. FULL WIDTH HORIZONTAL CARDS (Consistent Color & Typo)    */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-6 w-full">
        {/* ========================================================= */}
        {/* CARD 1: Dealer Onboarding Approval Request (Full Width)   */}
        {/* ========================================================= */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 hover:border-slate-300 transition-all space-y-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Dealer Onboarding Approval Request
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dealership registration verification, NZBN identity check, and geographic pricing profile assignment.
                </p>
              </div>
            </div>

            <span
              className={`px-3.5 py-1 rounded-full text-xs font-bold font-mono border self-start sm:self-auto shrink-0 ${
                pendingDealers.length > 0
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {pendingDealers.length} {pendingDealers.length === 1 ? "Pending Application" : "Pending Applications"}
            </span>
          </div>

          {/* Card Content (Horizontal Rows) */}
          {pendingDealers.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">All Dealerships Approved</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                There are no pending dealership onboarding requests. All active applicants have been verified and assigned pricing profiles.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDealers.map((dealer) => {
                const currentAssignedZone = selectedZone[dealer.id] || dealer.pricingZoneId || "ZONE_1";

                return (
                  <div
                    key={dealer.id}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5 text-xs"
                  >
                    {/* Block A: Dealership Identity */}
                    <div className="space-y-1.5 min-w-[260px]">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">
                          {dealer.legalTradingName}
                        </h3>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          {dealer.dealerCode}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{dealer.address}</span>
                      </p>
                      <div className="font-mono text-[11px] text-slate-400">
                        NZBN: <strong className="text-slate-600">{dealer.nzbn}</strong> · Region: {dealer.region || "Auckland"}
                      </div>
                    </div>

                    {/* Block B: Contact Person & Accepted Terms */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5 min-w-[240px]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Primary Contact:</span>
                        <strong className="text-slate-800">{dealer.primaryContactName}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{dealer.primaryContactEmail}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400">Terms &amp; Boundary:</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <FileCheck2 className="w-3 h-3 text-emerald-600" />
                          <span>{dealer.termsAcceptedVersion || "v2026.1"} Verified</span>
                        </span>
                      </div>
                    </div>

                    {/* Block C: Pricing Zone Assignment Selector */}
                    <div className="space-y-1.5 min-w-[220px]">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        Assigned Pricing Schedule:
                      </label>
                      <select
                        value={currentAssignedZone}
                        onChange={(e) =>
                          setSelectedZone({
                            ...selectedZone,
                            [dealer.id]: e.target.value as ZoneId,
                          })
                        }
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                      >
                        <option value="ZONE_1">Zone 1 (Auckland · $650 tow)</option>
                        <option value="ZONE_2">Zone 2 (Tauranga / Waikato · $850 tow)</option>
                        <option value="ZONE_3">Zone 3 (Wellington · $1,150 tow)</option>
                        <option value="ZONE_4">Zone 4 (Canterbury · $1,450 tow)</option>
                        <option value="ZONE_5">Zone 5 (Otago / Southland · $1,750 tow)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Applies fixed door-to-door freight rate
                      </span>
                    </div>

                    {/* Block D: Decision Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end xl:self-center">
                      <button
                        type="button"
                        onClick={() => handleReject(dealer.id)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(dealer.id, currentAssignedZone)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Authorize Dealership</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Card Footer Link */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              Manage complete dealership network and zone pricing profiles
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab("admin-dealers")}
              className="text-xs font-bold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>View Dealerships Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: Atomic Reservation Queue Request (Full Width)      */}
        {/* ========================================================= */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 hover:border-slate-300 transition-all space-y-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-[#E11D48] shadow-2xs shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Atomic Reservation Queue Request
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  24-hour exclusivity locks requested by franchise dealers awaiting wholesale confirmation or manual release.
                </p>
              </div>
            </div>

            <span
              className={`px-3.5 py-1 rounded-full text-xs font-bold font-mono border self-start sm:self-auto shrink-0 ${
                heldVehicles.length > 0
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {heldVehicles.length} {heldVehicles.length === 1 ? "Active Exclusivity Lock" : "Active Exclusivity Locks"}
            </span>
          </div>

          {/* Card Content (Horizontal Rows) */}
          {heldVehicles.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <Clock className="w-9 h-9 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Active 24h Holds</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                All Japanese export inventory units are currently available for purchase across all 5 New Zealand pricing zones.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {heldVehicles.map((vehicle) => {
                const matchingRes = reservations.find(
                  (r) => r.vehicleId === vehicle.id && r.status === "ACTIVE_HOLD"
                );
                const dealerName = matchingRes?.dealerName || "Auckland Nissan City Ltd";
                const dealerCode = matchingRes?.dealerCode || "NZ-NIS-AKL01";
                const dealerZone = matchingRes?.priceSnapshot?.zoneId || "ZONE_1";
                const price = matchingRes?.priceSnapshot || calculateLandedPrice(vehicle.fobPriceJPY, dealerZone);

                return (
                  <div
                    key={vehicle.id}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5 text-xs"
                  >
                    {/* Block A: Vehicle Image & Core Specifications */}
                    <div className="flex items-center gap-4 min-w-[280px]">
                      <div className="w-24 h-16 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={vehicle.images?.[0] || "/images/cars/kicks.png"}
                          alt={vehicle.model || "Vehicle"}
                          className="w-full h-full object-contain filter drop-shadow-xs"
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            #{vehicle.stockId}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 font-mono flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-amber-600" />
                            <span>24h Lock Active</span>
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-slate-500 text-xs truncate">
                          {vehicle.grade} · {vehicle.fuelType} · {vehicle.odometerKm.toLocaleString()} {vehicle.odometerUnit || "km"} · ★ {vehicle.auctionGrade || "4.5"}
                        </p>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                          <span>VIN: {vehicle.vinChassis}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(vehicle.vinChassis, vehicle.id)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                            title="Copy VIN"
                          >
                            {copiedId === vehicle.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Block B: Reserving Dealership Details */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5 min-w-[240px]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Reserved Dealership:</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                          {dealerCode}
                        </span>
                      </div>
                      <strong className="text-xs font-bold text-slate-900 block truncate">
                        {dealerName}
                      </strong>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400">Assigned Zone:</span>
                        <strong className="font-mono text-slate-700">{dealerZone}</strong>
                      </div>
                    </div>

                    {/* Block C: Landed Price & Terms Snapshot */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1 min-w-[190px]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Guaranteed Landed Price
                      </span>
                      <div className="font-mono font-black text-slate-900 text-base">
                        ${price.totalBuyPriceNZD.toLocaleString()} <span className="text-xs font-sans text-slate-500">NZD</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Section 4 Rate Locked</span>
                      </div>
                    </div>

                    {/* Block D: Decision Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end xl:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          audio.playSubtleClick();
                          const r = reservations.find((res) => res.vehicleId === vehicle.id && res.status === "ACTIVE_HOLD") || reservations[0];
                          if (r) setSelectedResForDetails(r);
                        }}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Inspect Dossier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReleaseReservation(vehicle.id)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Release Hold</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConfirmReservation(vehicle.id)}
                        className="px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Allocation</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Card Footer Link */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              Manage complete atomic reservations queue, timer expiries, and release history
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab("admin-reservations")}
              className="text-xs font-bold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>View Full Reservations Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      {/* Dealer Details Dossier Modal */}
      {selectedDealerForDetails && (
        <DealerDetailsModal
          dealer={selectedDealerForDetails}
          onClose={() => setSelectedDealerForDetails(null)}
          onApprove={(did, zid) => handleApprove(did, zid)}
          onReject={handleReject}
        />
      )}

      {/* Reservation Details Dossier Modal */}
      {selectedResForDetails && (
        <ReservationDetailsModal
          reservation={selectedResForDetails}
          onClose={() => setSelectedResForDetails(null)}
          onConfirmAllocation={(vid) => handleConfirmReservation(vid)}
          onReleaseHold={(vid) => handleReleaseReservation(vid)}
        />
      )}
    </div>
  );
}
