"use client";

import React, { useState } from "react";
import { useProgramme } from "@/lib/programme-context";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
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
    setNotification(`Approved dealership and assigned to ${zone}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Dealer Rejection Handler
  const handleReject = (dealerId: string) => {
    audio.playSubtleClick();
    rejectDealer(dealerId);
    setNotification(`Dealer application declined.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1-Click Confirm Allocation
  const handleConfirmReservation = (vehicleId: string) => {
    audio.playSuccessChime();
    confirmAllocation(vehicleId, "Confirmed directly from Admin Operations Dashboard.");
    setNotification(`Allocation confirmed. Order generated and transferred to shipping pipeline.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1-Click Release Hold
  const handleReleaseReservation = (vehicleId: string) => {
    audio.playSubtleClick();
    releaseHold(vehicleId, "Hold released from Admin Operations Dashboard.");
    setNotification(`Reservation hold released. Vehicle returned to public catalogue.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
            Operations Command Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time action center for dealer onboarding approvals and 24-hour atomic reservation requests.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. ONLY TWO HORIZONTAL CARDS (As Requested)                 */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* ========================================================= */}
        {/* CARD 1: Dealer Onboarding Approval Request                 */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-all space-y-5">
          <div className="space-y-4">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-2xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Dealer Onboarding Approval Request
                  </h2>
                  <p className="text-xs text-slate-500">
                    Dealership registration and geographic zone verification
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                  pendingDealers.length > 0
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                {pendingDealers.length} Pending
              </span>
            </div>

            {/* Card Content */}
            {pendingDealers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-xs font-bold text-slate-800">All Dealerships Approved</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  There are no pending dealership onboarding requests. All active applicants have been verified.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingDealers.map((dealer) => {
                  const currentAssignedZone = selectedZone[dealer.id] || dealer.pricingZoneId || "ZONE_1";

                  return (
                    <div
                      key={dealer.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">
                              {dealer.legalTradingName}
                            </h3>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              {dealer.dealerCode}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{dealer.address}</span>
                          </p>
                        </div>

                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          NZBN: {dealer.nzbn}
                        </span>
                      </div>

                      {/* Contact & Terms Verification */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="text-slate-400 block">Primary Contact:</span>
                          <strong className="text-slate-800">{dealer.primaryContactName}</strong>
                          <span className="text-slate-500 block truncate">{dealer.primaryContactEmail}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Terms &amp; Boundary:</span>
                          <strong className="text-emerald-700 flex items-center gap-1 mt-0.5">
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{dealer.termsAcceptedVersion || "v2026.1"} Accepted</span>
                          </strong>
                        </div>
                      </div>

                      {/* Zone Assignment & Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-slate-600">Assign Pricing Zone:</label>
                          <select
                            value={currentAssignedZone}
                            onChange={(e) =>
                              setSelectedZone({
                                ...selectedZone,
                                [dealer.id]: e.target.value as ZoneId,
                              })
                            }
                            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          >
                            <option value="ZONE_1">Zone 1 (Auckland $650)</option>
                            <option value="ZONE_2">Zone 2 (Tauranga $850)</option>
                            <option value="ZONE_3">Zone 3 (Wellington $1,150)</option>
                            <option value="ZONE_4">Zone 4 (Canterbury $1,450)</option>
                            <option value="ZONE_5">Zone 5 (Otago $1,750)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleReject(dealer.id)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(dealer.id, currentAssignedZone)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Authorize</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card Footer Link */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Manage complete dealer onboarding registry
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab("admin-dealers")}
              className="text-xs font-bold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 cursor-pointer"
            >
              <span>View Dealers Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: Atomic Reservation Queue Request                   */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-all space-y-5">
          <div className="space-y-4">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-[#E11D48] shadow-2xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Atomic Reservation Queue Request
                  </h2>
                  <p className="text-xs text-slate-500">
                    24-hour exclusivity holds placed by franchise dealers
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                  heldVehicles.length > 0
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                {heldVehicles.length} Active Hold{heldVehicles.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Card Content */}
            {heldVehicles.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-xs font-bold text-slate-800">No Active 24h Holds</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  All Japanese export units are currently available for purchase across all 5 pricing zones.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {heldVehicles.map((vehicle) => {
                  const matchingRes = reservations.find(
                    (r) => r.vehicleId === vehicle.id && r.status === "ACTIVE_HOLD"
                  );
                  const dealerName = matchingRes?.dealerName || "Auckland Nissan City";
                  const dealerZone = matchingRes?.priceSnapshot.zoneId || "ZONE_1";
                  const price = matchingRes?.priceSnapshot || calculateLandedPrice(vehicle.fobPriceJPY, dealerZone);

                  return (
                    <div
                      key={vehicle.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-12 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={vehicle.images?.[0] || "/images/cars/kicks.png"}
                              alt={vehicle.model || "Vehicle"}
                              className="w-full h-full object-contain filter drop-shadow-xs"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-bold text-slate-500">
                                #{vehicle.stockId}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200 font-mono">
                                24h Lock Active
                              </span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 truncate">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                            <p className="text-[11px] text-slate-500 truncate">
                              {vehicle.grade} · {vehicle.fuelType} · {vehicle.odometerKm.toLocaleString()} {vehicle.odometerUnit || "km"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Landed Total</span>
                          <span className="font-mono font-bold text-slate-900 text-sm block">
                            ${price.totalBuyPriceNZD.toLocaleString()} NZD
                          </span>
                        </div>
                      </div>

                      {/* Dealership Info Strip */}
                      <div className="flex items-center justify-between text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="text-slate-400">Reserved Dealership: </span>
                          <strong className="text-slate-800">{dealerName}</strong>
                        </div>
                        <div className="font-mono text-slate-500">
                          Pricing Basis: <strong className="text-slate-700">{dealerZone}</strong>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleReleaseReservation(vehicle.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Unlock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Release Hold</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConfirmReservation(vehicle.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
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

          {/* Card Footer Link */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Manage complete atomic reservations &amp; history
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab("admin-reservations")}
              className="text-xs font-bold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Reservations Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
