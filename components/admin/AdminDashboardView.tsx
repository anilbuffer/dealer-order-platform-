"use client";

import React, { useState } from "react";
import { useProgramme } from "@/lib/programme-context";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
import DealerDetailsModal from "./DealerDetailsModal";
import ReservationDetailsModal from "./ReservationDetailsModal";
import { ReservationRequest, DealerAccount, ZoneId } from "@/lib/types";
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
  AlertCircle,
  Eye,
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
              Operations Action Center
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time action alerts for dealer onboarding approvals and 24-hour atomic reservation requests.
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
      {/* 2. ACTION ALERT CARDS (Clean, Uncluttered, Alert-Styled)     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-5 w-full">
        {/* ========================================================= */}
        {/* ALERT 1: Dealer Onboarding Approval Request (Amber Alert)  */}
        {/* ========================================================= */}
        <div className="w-full bg-gradient-to-r from-amber-50/60 via-white to-amber-50/20 rounded-2xl border border-amber-200/90 shadow-2xs p-5 sm:p-6 transition-all space-y-4">
          {/* Alert Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100/90 border border-amber-300/80 flex items-center justify-center text-amber-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Dealer Onboarding Approval Request
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                    ACTION REQUIRED
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Franchise dealership registration pending NZBN verification and pricing zone mapping.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-white text-amber-900 border border-amber-300/80 shadow-2xs">
                {pendingDealers.length} {pendingDealers.length === 1 ? "Application Pending" : "Applications Pending"}
              </span>
            </div>
          </div>

          {/* Alert Body */}
          {pendingDealers.length === 0 ? (
            <div className="py-6 px-4 bg-white/80 rounded-xl border border-amber-100 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All dealer applications processed. No pending authorizations required.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDealers.map((dealer) => {
                const currentAssignedZone = selectedZone[dealer.id] || dealer.pricingZoneId || "ZONE_1";

                return (
                  <div
                    key={dealer.id}
                    className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 shadow-2xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                  >
                    {/* Dealer Info */}
                    <div className="flex items-center gap-3.5 min-w-[280px]">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-900">
                            {dealer.legalTradingName}
                          </strong>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                            {dealer.dealerCode}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{dealer.address}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-slate-500">NZBN: {dealer.nzbn}</span>
                        </p>
                      </div>
                    </div>

                    {/* Contact & Zone Summary */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dealer.primaryContactName} ({dealer.primaryContactEmail})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Assigned Zone:</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono font-bold text-[11px] border border-slate-200">
                          {currentAssignedZone}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          audio.playSubtleClick();
                          setSelectedDealerForDetails(dealer);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Review Dossier</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(dealer.id)}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs cursor-pointer transition-colors"
                      >
                        Decline
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(dealer.id, currentAssignedZone)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorize</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Alert Footer */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-amber-200/50">
            <span>Requires administrative franchise authorization before stock ordering is enabled.</span>
            <button
              type="button"
              onClick={() => onNavigateTab("admin-dealers")}
              className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All Franchisees</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ALERT 2: Atomic Reservation Queue Request (Rose Alert)     */}
        {/* ========================================================= */}
        <div className="w-full bg-gradient-to-r from-rose-50/60 via-white to-rose-50/20 rounded-2xl border border-rose-200/90 shadow-2xs p-5 sm:p-6 transition-all space-y-4">
          {/* Alert Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100/90 border border-rose-300/80 flex items-center justify-center text-[#E11D48] shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Atomic Reservation Queue Request
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200 font-mono">
                    24H LOCK ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dealer exclusivity locks awaiting wholesale allocation confirmation or manual stock release.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-white text-rose-900 border border-rose-300/80 shadow-2xs">
                {heldVehicles.length} {heldVehicles.length === 1 ? "Active Lock" : "Active Locks"}
              </span>
            </div>
          </div>

          {/* Alert Body */}
          {heldVehicles.length === 0 ? (
            <div className="py-6 px-4 bg-white/80 rounded-xl border border-rose-100 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No active 24h exclusivity holds. All catalogue stock is available.</span>
            </div>
          ) : (
            <div className="space-y-3">
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
                    className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-rose-300 shadow-2xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                  >
                    {/* Vehicle & Image */}
                    <div className="flex items-center gap-3.5 min-w-[280px]">
                      <div className="w-16 h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={vehicle.images?.[0] || "/images/cars/kicks.png"}
                          alt={vehicle.model || "Vehicle"}
                          className="w-full h-full object-contain filter drop-shadow-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-900">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </strong>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                            #{vehicle.stockId}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs">
                          {vehicle.grade} · {vehicle.fuelType} · ★ Grade {vehicle.auctionGrade || "4.5"}
                        </p>
                      </div>
                    </div>

                    {/* Reserving Dealer & Guaranteed Price */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Reserved By</div>
                        <div className="font-bold text-slate-900">{dealerName} ({dealerCode})</div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Landed Buy Price</div>
                        <div className="font-mono font-bold text-slate-900">
                          ${price.totalBuyPriceNZD.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">NZD ({dealerZone})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-mono text-[11px] font-bold">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>24h Lock Active</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          audio.playSubtleClick();
                          const r = reservations.find((res) => res.vehicleId === vehicle.id && res.status === "ACTIVE_HOLD") || reservations[0];
                          if (r) setSelectedResForDetails(r);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inspect Hold</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReleaseReservation(vehicle.id)}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer transition-colors"
                      >
                        Release
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConfirmReservation(vehicle.id)}
                        className="px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
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

          {/* Alert Footer */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-rose-200/50">
            <span>24-hour exclusivity timer guarantees dealer price protection without duplicate allocation.</span>
            <button
              type="button"
              onClick={() => onNavigateTab("admin-reservations")}
              className="text-[#E11D48] hover:text-[#BE123C] font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Full Reservations Queue</span>
              <ArrowRight className="w-3 h-3" />
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
