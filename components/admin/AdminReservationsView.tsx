"use client";

import React, { useState } from "react";
import { useProgramme } from "@/lib/programme-context";
import { ReservationRequest, ReservationStatus } from "@/lib/types";
import { audio } from "@/lib/sound";
import {
  Clock,
  Car,
  Lock,
  Unlock,
  CheckCircle2,
  Building2,
  MapPin,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  FileCheck2,
  User,
  XCircle,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AdminReservationsViewProps {
  onNavigateTab?: (tabId: string) => void;
}

export default function AdminReservationsView({ onNavigateTab }: AdminReservationsViewProps) {
  const { reservations, confirmAllocation, releaseHold, rejectReservation } = useProgramme();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [notification, setNotification] = useState<string | null>(null);
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);

  // Modal dialog state for recording decision & reason (US-14)
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "CONFIRM" | "RELEASE" | "REJECT";
    reservation: ReservationRequest | null;
    reason: string;
  }>({
    isOpen: false,
    type: "CONFIRM",
    reservation: null,
    reason: "",
  });

  const activeReservations = reservations.filter((r) => r.status === "ACTIVE_HOLD");
  const historyReservations = reservations.filter((r) => r.status !== "ACTIVE_HOLD");

  const openActionDialog = (type: "CONFIRM" | "RELEASE" | "REJECT", res: ReservationRequest) => {
    audio.playSubtleClick();
    const defaultReason =
      type === "CONFIRM"
        ? "Wholesale allocation confirmed by Autohub Ops. Purchase order issued."
        : type === "RELEASE"
          ? "Administrative hold released. Stock returned to available catalog."
          : "Allocation declined during wholesale review.";

    setActionModal({
      isOpen: true,
      type,
      reservation: res,
      reason: defaultReason,
    });
  };

  const handleExecuteAction = () => {
    if (!actionModal.reservation) return;
    const res = actionModal.reservation;
    const reasonText = actionModal.reason.trim();

    if (actionModal.type === "CONFIRM") {
      audio.playSuccessChime();
      confirmAllocation(res.vehicleId, reasonText);
      setNotification(`Confirmed allocation for ${res.vehicle.make} ${res.vehicle.model} (#${res.vehicle.stockId}) to ${res.dealerName}.`);
    } else if (actionModal.type === "RELEASE") {
      audio.playSubtleClick();
      releaseHold(res.vehicleId, reasonText);
      setNotification(`Released 24h exclusivity hold for #${res.vehicle.stockId}. Stock is now Available.`);
    } else if (actionModal.type === "REJECT") {
      audio.playSubtleClick();
      rejectReservation(res.id, reasonText);
      setNotification(`Rejected reservation ${res.requestId} for ${res.dealerName}. Reason logged.`);
    }

    setActionModal({ isOpen: false, type: "CONFIRM", reservation: null, reason: "" });
    setTimeout(() => setNotification(null), 4500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header Banner & Status                                  */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
              Commercial Allocation Control
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              ● Section 5 Data &amp; Status Model
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reservations &amp; 24-Hour Atomic Holds
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full compliance with Section 5 Minimum Data Model: dealer, vehicle, user, timestamps, status, price &amp; terms snapshot, acknowledgements, and decision audit.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              setActiveTab("ACTIVE");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "ACTIVE"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Active Holds</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
              {activeReservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              setActiveTab("HISTORY");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "HISTORY"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>History &amp; Decisions</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {historyReservations.length}
            </span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Active Tab: Active 24-Hour Holds                        */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "ACTIVE" && (
        <>
          {activeReservations.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-900">No Active 24-Hour Holds</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All Japanese certified stock is currently unreserved and available for franchise dealer ordering across all 5 geographic zones.
              </p>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab("admin-catalogue")}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Browse Vehicle Catalogue
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {activeReservations.map((res) => {
                const vehicle = res.vehicle;
                const isBreakdownOpen = expandedBreakdownId === res.id;

                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-6 shadow-xs transition-all space-y-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Vehicle & Image Info */}
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="relative w-32 h-22 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200/80 p-2 flex items-center justify-center shrink-0">
                          <img
                            src={vehicle.images?.[0] || "/images/cars/kicks.png"}
                            alt={vehicle.model || "Vehicle"}
                            className="w-full h-full object-contain filter drop-shadow-xs select-none"
                          />
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-slate-900/80 backdrop-blur-md text-[9px] font-mono font-bold text-amber-300">
                            ★ {vehicle.auctionGrade}
                          </div>
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              #{vehicle.stockId}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 flex items-center gap-1 font-mono">
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              <span>24h Lock Active</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              VIN: {vehicle.vinChassis}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900 truncate">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>

                          <p className="text-xs text-slate-500 truncate">
                            {vehicle.grade} · {vehicle.fuelType} · {vehicle.transmission} · {vehicle.odometerKm.toLocaleString()} {vehicle.odometerUnit || "km"} · {vehicle.location}
                          </p>
                        </div>
                      </div>

                      {/* Dealership & User Data */}
                      <div className="flex flex-wrap items-center gap-6 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Franchise Dealer
                          </span>
                          <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                            {res.dealerName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {res.dealerCode} · {res.priceSnapshot.zoneId}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Requesting User
                          </span>
                          <span className="font-bold text-slate-900 block truncate">
                            {res.userName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono truncate max-w-[170px] block">
                            {res.userEmail}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Guaranteed Landed Total
                          </span>
                          <span className="font-mono font-black text-slate-900 text-sm block">
                            ${res.priceSnapshot.totalBuyPriceNZD.toLocaleString()} NZD
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ¥{vehicle.fobPriceJPY.toLocaleString()} FOB
                          </span>
                        </div>

                        {/* Actions (US-14) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openActionDialog("CONFIRM", res)}
                            className="px-3.5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Order</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openActionDialog("RELEASE", res)}
                            className="px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Unlock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Release</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openActionDialog("REJECT", res)}
                            className="px-2.5 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Reject Request with Reason"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Minimum Data Snapshot Metadata Strip */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Hold Placed: </span>
                          <strong className="font-mono text-slate-900">
                            {new Date(res.requestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </strong>
                        </span>

                        <span className="flex items-center gap-1 text-slate-600">
                          <span>Expires: </span>
                          <strong className="font-mono text-amber-700">
                            {new Date(res.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (24h)
                          </strong>
                        </span>

                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                          <FileCheck2 className="w-3 h-3" />
                          <span>Terms Snapshot: {res.termsVersionSnapshot} Agreed</span>
                        </span>

                        <span className="flex items-center gap-1 text-slate-600">
                          <span>Cost Boundary Acknowledged: </span>
                          <strong className="text-slate-900">{res.acknowledgedBoundary ? "Yes" : "No"}</strong>
                        </span>

                        <span className="flex items-center gap-1 text-slate-600">
                          <span>Cancellation Policy Agreed: </span>
                          <strong className="text-slate-900">{res.acknowledgedCancellation ? "Yes" : "No"}</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedBreakdownId(isBreakdownOpen ? null : res.id)}
                        className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isBreakdownOpen ? "Hide Price Snapshot" : "View Price Snapshot"}</span>
                        {isBreakdownOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Collapsible Price Snapshot Breakdown (Section 4 & 5) */}
                    {isBreakdownOpen && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs animate-in fade-in">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">FOB JPY</span>
                          <span className="font-mono font-bold text-slate-900">¥{res.priceSnapshot.fobJPY.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">FOB NZD</span>
                          <span className="font-mono font-bold text-slate-900">${res.priceSnapshot.fobNZD.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">RoRo Freight</span>
                          <span className="font-mono font-bold text-slate-900">${res.priceSnapshot.oceanFreightNZD.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Customs &amp; GST</span>
                          <span className="font-mono font-bold text-slate-900">${(res.priceSnapshot.customsProcessingNZD + res.priceSnapshot.gstNZD).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">MR2A Compliance</span>
                          <span className="font-mono font-bold text-slate-900">${res.priceSnapshot.complianceInspectionNZD.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">2x NZ Delivery</span>
                          <span className="font-mono font-bold text-slate-900">${res.priceSnapshot.zoneDeliveryNZD.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Nissan Fee</span>
                          <span className="font-mono font-bold text-slate-900">${res.priceSnapshot.programmeFeeNZD.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. History Tab: Historical Decisions & Requests             */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "HISTORY" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-5">Request ID &amp; Date</th>
                  <th className="py-3 px-4">Vehicle Details</th>
                  <th className="py-3 px-4">Dealer &amp; User</th>
                  <th className="py-3 px-4">Landed Price</th>
                  <th className="py-3 px-4">Status &amp; Decision</th>
                  <th className="py-3 px-5">Audit Decision Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyReservations.map((res) => {
                  const isAllocated = res.status === "CONFIRMED_ALLOCATED";
                  const isReleased = res.status === "RELEASED";
                  const isRejected = res.status === "REJECTED";

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-slate-900">{res.requestId}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {new Date(res.requestedAt).toLocaleDateString()} {new Date(res.requestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {res.vehicle.year} {res.vehicle.make} {res.vehicle.model}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          #{res.vehicle.stockId} · VIN: {res.vehicle.vinChassis}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{res.dealerName}</div>
                        <div className="text-[10px] text-slate-500">{res.userName} ({res.priceSnapshot.zoneId})</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ${res.priceSnapshot.totalBuyPriceNZD.toLocaleString()} NZD
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${isAllocated
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isReleased
                                ? "bg-slate-100 text-slate-700 border border-slate-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                        >
                          {isAllocated && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {isReleased && <Unlock className="w-2.5 h-2.5" />}
                          {isRejected && <XCircle className="w-2.5 h-2.5" />}
                          <span>{res.status.replace(/_/g, " ")}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-5 max-w-sm">
                        <p className="text-slate-700 text-xs leading-snug">
                          {res.decisionReason || "—"}
                        </p>
                        {res.decidedBy && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Decided by: {res.decidedBy}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. Action Reason Dialog Modal (US-14)                      */}
      {/* ─────────────────────────────────────────────────────────── */}
      {actionModal.isOpen && actionModal.reservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {actionModal.type === "CONFIRM" && "Confirm Wholesale Allocation"}
                {actionModal.type === "RELEASE" && "Release 24-Hour Hold"}
                {actionModal.type === "REJECT" && "Reject Reservation Request"}
              </h3>
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, type: "CONFIRM", reservation: null, reason: "" })}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                <strong>Vehicle:</strong> {actionModal.reservation.vehicle.year}{" "}
                {actionModal.reservation.vehicle.make} {actionModal.reservation.vehicle.model} (
                #{actionModal.reservation.vehicle.stockId})
              </p>
              <p>
                <strong>Dealer:</strong> {actionModal.reservation.dealerName} ({actionModal.reservation.dealerCode})
              </p>
              <p>
                <strong>Guaranteed Landed Price:</strong> $
                {actionModal.reservation.priceSnapshot.totalBuyPriceNZD.toLocaleString()} NZD
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Decision &amp; Audit Reason (Mandatory under US-14)
              </label>
              <textarea
                rows={3}
                value={actionModal.reason}
                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                placeholder="Enter formal justification for audit and dealer notification..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, type: "CONFIRM", reservation: null, reason: "" })}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={!actionModal.reason.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 ${actionModal.type === "CONFIRM"
                    ? "bg-[#E11D48] hover:bg-[#BE123C]"
                    : actionModal.type === "RELEASE"
                      ? "bg-slate-800 hover:bg-slate-900"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
              >
                {actionModal.type === "CONFIRM" && "Confirm & Create Order"}
                {actionModal.type === "RELEASE" && "Release Back to Stock"}
                {actionModal.type === "REJECT" && "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
