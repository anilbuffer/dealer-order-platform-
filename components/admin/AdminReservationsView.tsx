"use client";

import React, { useState } from "react";
import { useProgramme } from "@/lib/programme-context";
import { ReservationRequest } from "@/lib/types";
import { audio } from "@/lib/sound";
import ReservationDetailsModal from "./ReservationDetailsModal";
import {
  Clock,
  Car,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Building2,
  Search,
  Eye,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface AdminReservationsViewProps {
  onNavigateTab?: (tabId: string) => void;
}

export default function AdminReservationsView({ onNavigateTab }: AdminReservationsViewProps) {
  const { reservations, confirmAllocation, releaseHold, rejectReservation } = useProgramme();

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedResForDetails, setSelectedResForDetails] = useState<ReservationRequest | null>(null);

  // Quick Action Modal for confirm/release justification
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

  const filteredActive = activeReservations.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.requestId.toLowerCase().includes(q) ||
      r.dealerName.toLowerCase().includes(q) ||
      r.dealerCode.toLowerCase().includes(q) ||
      r.vehicle?.model?.toLowerCase().includes(q) ||
      r.vehicle?.stockId?.toLowerCase().includes(q) ||
      r.vehicle?.vinChassis?.toLowerCase().includes(q)
    );
  });

  const filteredHistory = historyReservations.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.requestId.toLowerCase().includes(q) ||
      r.dealerName.toLowerCase().includes(q) ||
      r.dealerCode.toLowerCase().includes(q) ||
      r.vehicle?.model?.toLowerCase().includes(q) ||
      r.vehicle?.stockId?.toLowerCase().includes(q)
    );
  });

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
      setNotification(`Confirmed allocation for #${res.vehicle.stockId} to ${res.dealerName}.`);
    } else if (actionModal.type === "RELEASE") {
      audio.playSubtleClick();
      releaseHold(res.vehicleId, reasonText);
      setNotification(`Released 24h hold for #${res.vehicle.stockId}. Stock is now Available.`);
    } else if (actionModal.type === "REJECT") {
      audio.playSubtleClick();
      rejectReservation(res.id, reasonText);
      setNotification(`Declined reservation ${res.requestId} for ${res.dealerName}.`);
    }

    setActionModal({ isOpen: false, type: "CONFIRM", reservation: null, reason: "" });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header Banner & Scope Tab Switcher                      */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
              Wholesale Allocation Control
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              24-Hour Atomic Locks
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reservations ({activeTab === "ACTIVE" ? activeReservations.length : historyReservations.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor dealer exclusivity hold countdowns and sign off on wholesale allocation confirmations.
          </p>
        </div>

        {/* Tab switch matching left menu count with smooth touch scrolling */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto hide-scrollbar touch-scroll max-w-full">
          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              setActiveTab("ACTIVE");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "ACTIVE"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Active Holds</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono font-bold">
              {activeReservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              setActiveTab("HISTORY");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "HISTORY"
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
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
      {/* 2. Compact Search & Filter Toolbar                         */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by stock ID, model, dealer code, or VIN..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all font-medium"
          />
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          {activeTab === "ACTIVE"
            ? `${filteredActive.length} of ${activeReservations.length} Active Holds Displayed`
            : `${filteredHistory.length} of ${historyReservations.length} Historical Records`}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. ACTIVE HOLDS LIST (Clean, Uncrowded Row Cards)           */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "ACTIVE" && (
        <div className="space-y-3">
          {filteredActive.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800">No Active 24-Hour Holds</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All certified Japanese inventory units are available for dealer purchase.
              </p>
            </div>
          ) : (
            filteredActive.map((res) => {
              const vehicle = res.vehicle;
              const price = res.priceSnapshot;

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 text-xs"
                >
                  {/* Column 1: Vehicle Preview & Spec */}
                  <div className="flex items-center gap-3.5 min-w-[280px]">
                    <div className="w-20 h-14 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0">
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
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                          #{vehicle.stockId}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">
                        {vehicle.grade} · {vehicle.fuelType} · ★ Grade {vehicle.auctionGrade || "4.5"}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        VIN: {vehicle.vinChassis}
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Dealership & Requesting User */}
                  <div className="min-w-[220px] space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Reserving Dealership
                    </span>
                    <strong className="text-xs font-bold text-slate-900 block truncate">
                      {res.dealerName}
                    </strong>
                    <div className="text-[11px] text-slate-500">
                      {res.userName} · <span className="font-mono text-slate-700 font-bold">{price.zoneId}</span>
                    </div>
                  </div>

                  {/* Column 3: Guaranteed Landed Price */}
                  <div className="min-w-[170px] space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Landed Wholesale Price
                    </span>
                    <div className="font-mono font-black text-slate-900 text-sm">
                      ${price.totalBuyPriceNZD.toLocaleString()} <span className="text-[10px] font-sans text-slate-500">NZD</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Section 4 Locked</span>
                    </span>
                  </div>

                  {/* Column 4: 24h Lock Status */}
                  <div className="min-w-[140px] space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Exclusivity Status
                    </span>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold text-[11px]">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>24h Lock Active</span>
                    </div>
                  </div>

                  {/* Column 5: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end xl:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        audio.playSubtleClick();
                        setSelectedResForDetails(res);
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dossier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openActionDialog("RELEASE", res)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Release
                    </button>

                    <button
                      type="button"
                      onClick={() => openActionDialog("CONFIRM", res)}
                      className="px-3.5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Allocation</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. HISTORY TAB (Clean, Elegant Table)                       */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "HISTORY" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto touch-scroll navy-scrollbar">
            <table className="w-full text-left text-xs text-slate-600 min-w-[760px]">
              <thead className="bg-[#0A1322] text-white text-[10px] font-bold uppercase tracking-wider border-b border-[#1B2A42]">
                <tr>
                  <th className="py-3.5 px-5 text-slate-200">Request ID</th>
                  <th className="py-3.5 px-4 text-slate-200">Vehicle</th>
                  <th className="py-3.5 px-4 text-slate-200">Dealership</th>
                  <th className="py-3.5 px-4 text-slate-200">Landed Price</th>
                  <th className="py-3.5 px-4 text-slate-200">Decision</th>
                  <th className="py-3.5 px-4 text-slate-200">Audit Reason</th>
                  <th className="py-3.5 px-5 text-right text-slate-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((res) => {
                  const isAllocated = res.status === "CONFIRMED_ALLOCATED";
                  const isReleased = res.status === "RELEASED";

                  return (
                    <tr
                      key={res.id}
                      onClick={() => {
                        audio.playSubtleClick();
                        setSelectedResForDetails(res);
                      }}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {res.requestId}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-[#E11D48] transition-colors">
                          {res.vehicle.year} {res.vehicle.model}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          #{res.vehicle.stockId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{res.dealerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{res.dealerCode}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ${res.priceSnapshot.totalBuyPriceNZD.toLocaleString()} NZD
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isAllocated
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isReleased
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isAllocated ? "CONFIRMED" : isReleased ? "RELEASED" : res.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {res.decisionReason || "—"}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            audio.playSubtleClick();
                            setSelectedResForDetails(res);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>Dossier</span>
                        </button>
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
      {/* 5. Minimal Action Reason Dialog Modal                       */}
      {/* ─────────────────────────────────────────────────────────── */}
      {actionModal.isOpen && actionModal.reservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {actionModal.type === "CONFIRM" && "Confirm Wholesale Allocation"}
                {actionModal.type === "RELEASE" && "Release 24-Hour Hold"}
                {actionModal.type === "REJECT" && "Decline Reservation"}
              </h3>
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, type: "CONFIRM", reservation: null, reason: "" })}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                <strong>Vehicle:</strong> {actionModal.reservation.vehicle.year}{" "}
                {actionModal.reservation.vehicle.make} {actionModal.reservation.vehicle.model} (
                #{actionModal.reservation.vehicle.stockId})
              </p>
              <p>
                <strong>Dealer:</strong> {actionModal.reservation.dealerName}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Audit Justification Note
              </label>
              <textarea
                rows={2}
                value={actionModal.reason}
                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                placeholder="Enter justification for audit log..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, type: "CONFIRM", reservation: null, reason: "" })}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={!actionModal.reason.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
                  actionModal.type === "CONFIRM"
                    ? "bg-[#E11D48] hover:bg-[#BE123C]"
                    : actionModal.type === "RELEASE"
                    ? "bg-slate-800 hover:bg-slate-900"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Execute {actionModal.type}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Details Dossier Modal */}
      {selectedResForDetails && (
        <ReservationDetailsModal
          reservation={selectedResForDetails}
          onClose={() => setSelectedResForDetails(null)}
          onConfirmAllocation={(vid, reason) => {
            confirmAllocation(vid, reason);
            setNotification("Wholesale allocation confirmed and order issued.");
            setTimeout(() => setNotification(null), 4000);
          }}
          onReleaseHold={(vid, reason) => {
            releaseHold(vid, reason);
            setNotification("Exclusivity hold released back to catalogue.");
            setTimeout(() => setNotification(null), 4000);
          }}
          onRejectReservation={(rid, reason) => {
            rejectReservation(rid, reason);
            setNotification("Reservation declined with audit reason.");
            setTimeout(() => setNotification(null), 4000);
          }}
        />
      )}
    </div>
  );
}
