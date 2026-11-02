"use client";

import React, { useState, useEffect } from "react";
import { Order, OrderMilestone, ReservationRequest } from "@/lib/types";
import { useProgramme } from "@/lib/programme-context";
import { useAuth } from "@/lib/auth-context";
import { audio } from "@/lib/sound";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  Ship,
  Lock,
  Unlock,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building2,
  FileCheck2,
  Copy,
  Check,
  Search,
  Filter,
  ArrowRight,
  Eye,
  X,
  Truck,
  Sparkles,
  Info,
  Layers,
  Calendar,
  DollarSign,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";

const MILESTONE_STEPS: { key: OrderMilestone; label: string; actor: string; desc: string }[] = [
  { key: "ORDER_CONFIRMED", label: "Order Confirmed", actor: "Dealership & Autohub Ops", desc: "Wholesale allocation accepted and entered into programme schedule." },
  { key: "JAPAN_VERIFICATION", label: "Japan Export Verification", actor: "Japan Logistics Hub", desc: "Physical yard inspection, JEVIC odometer verification & export deregistration." },
  { key: "BOOKED_FOR_SHIPPING", label: "Shipment & Berth Booked", actor: "AutoHub Shipping Ops", desc: "RoRo vessel space confirmed and port staging completed." },
  { key: "IN_TRANSIT", label: "Pacific Ocean Transit", actor: "Trans-Pacific RoRo Lines", desc: "Coastal and ocean transit across Pacific corridor to Ports of Auckland." },
  { key: "NZ_BORDER_PROCESSING", label: "NZ Border & Customs Release", actor: "NZ Customs & MPI", desc: "MPI biosecurity heat treatment and cleared GST import entry assessment." },
  { key: "COMPLIANCE", label: "MR2A Technical Compliance", actor: "VINZ / VTNZ Compliance Centre", desc: "NZTA standard safety pass, brake testing, and EV state of health certification." },
  { key: "READY_FOR_DELIVERY", label: "Ready for Dealership Delivery", actor: "AutoHub Domestic Carrier", desc: "Compliance plate stamped; carrier dispatch to franchise drop-off yard." },
  { key: "DELIVERED", label: "Delivered to Dealership", actor: "Franchise Receiving Yard", desc: "Final handover, transport receipt signed, and entered into yard inventory." },
];

export default function DealerOrdersView() {
  const { currentDealer } = useAuth();
  const { orders, reservations, releaseHold, respondToAdditionalCost, confirmAllocation } = useProgramme();

  const [activeTab, setActiveTab] = useState<"ORDERS" | "HOLDS">("ORDERS");
  const [showPriceBreakdown, setShowPriceBreakdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<{ name: string; type: string; date: string } | null>(null);
  const [viewingDefectPhoto, setViewingDefectPhoto] = useState<boolean>(false);
  const [confirmingHoldVehicleId, setConfirmingHoldVehicleId] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [mobileSubTab, setMobileSubTab] = useState<"LIST" | "DETAIL">("LIST");

  // Filter orders for this dealer
  const dealerOrders = orders.filter(
    (o) => !currentDealer?.id || o.dealerId === currentDealer.id
  );

  // Filter 24h holds for this dealer
  const dealerHolds = reservations.filter(
    (r) =>
      r.status === "ACTIVE_HOLD" &&
      (!currentDealer?.id || r.dealerId === currentDealer.id)
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    dealerOrders[0]?.id || ""
  );

  // Keep selected order valid
  const selectedOrder =
    dealerOrders.find((o) => o.id === selectedOrderId) || dealerOrders[0];

  // Filtered orders list by search query and milestone
  const filteredOrders = dealerOrders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.vehicle.vinChassis.toLowerCase().includes(q) ||
      order.vehicle.stockId.toLowerCase().includes(q) ||
      order.vehicle.model.toLowerCase().includes(q) ||
      (order.vesselName && order.vesselName.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "IN_TRANSIT" && (order.currentMilestone === "IN_TRANSIT" || order.currentMilestone === "BOOKED_FOR_SHIPPING")) ||
      (statusFilter === "BORDER" && (order.currentMilestone === "NZ_BORDER_PROCESSING" || order.currentMilestone === "COMPLIANCE" || order.currentMilestone === "AWAITING_ADDITIONAL_COST")) ||
      (statusFilter === "READY" && (order.currentMilestone === "READY_FOR_DELIVERY" || order.currentMilestone === "DELIVERED"));

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalFleetValueNZD = dealerOrders.reduce(
    (sum, o) => sum + (o.priceBreakdown?.totalBuyPriceNZD || 0),
    0
  );
  const onHighSeasCount = dealerOrders.filter(
    (o) => o.currentMilestone === "IN_TRANSIT" || o.currentMilestone === "BOOKED_FOR_SHIPPING"
  ).length;
  const inComplianceCount = dealerOrders.filter(
    (o) => o.currentMilestone === "NZ_BORDER_PROCESSING" || o.currentMilestone === "COMPLIANCE" || o.currentMilestone === "AWAITING_ADDITIONAL_COST"
  ).length;
  const pendingActionsCount = dealerOrders.reduce(
    (count, o) => count + o.additionalCosts.filter((c) => c.status === "PENDING_DEALER_APPROVAL").length,
    0
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    audio.playSubtleClick();
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleApproveCost = (orderId: string, costId: string) => {
    audio.playSuccessChime();
    respondToAdditionalCost(orderId, costId, "APPROVED");
    setToastNotice("Compliance defect remediation approved. Added to invoice per Section 4 terms.");
    setTimeout(() => setToastNotice(null), 4000);
  };

  const handleDeclineCost = (orderId: string, costId: string) => {
    audio.playSubtleClick();
    respondToAdditionalCost(orderId, costId, "DECLINED");
    setToastNotice("Remediation declined. Autohub Compliance team has been notified for reassessment.");
    setTimeout(() => setToastNotice(null), 4000);
  };

  const handleReleaseMyHold = (vehicleId: string) => {
    audio.playSubtleClick();
    releaseHold(vehicleId, "Voluntary release by franchise dealer.");
    setToastNotice("24-Hour Exclusivity Hold released. Vehicle returned to wholesale catalog.");
    setTimeout(() => setToastNotice(null), 4000);
  };

  const handleConfirmHoldToOrder = (vehicleId: string) => {
    audio.playSuccessChime();
    confirmAllocation(vehicleId, "Confirmed wholesale allocation by franchise dealer principal.");
    setConfirmingHoldVehicleId(null);
    setActiveTab("ORDERS");
    setToastNotice("Order successfully generated! Vehicle transitioned to wholesale shipment pipeline.");
    setTimeout(() => setToastNotice(null), 4500);
  };

  const handleDownloadDoc = (docName: string) => {
    audio.playSuccessChime();
    setToastNotice(`Downloading verified official document: ${docName}...`);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const getMilestoneIndex = (milestone: OrderMilestone) => {
    if (milestone === "AWAITING_ADDITIONAL_COST") return 5;
    const idx = MILESTONE_STEPS.findIndex((s) => s.key === milestone);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Executive Top Header & Dealership Brand Ribbon (US-16)  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0B1527] to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Ambient lighting glows */}
        <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase tracking-wider border border-rose-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Dealership Allocations (US-16)</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">
                Dealer Code: {currentDealer?.dealerCode || "NZ-NIS-AKL01"}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Zone 1 Schedule Applied</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Orders &amp; Shipments
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-rose-400" />
                <span>{currentDealer?.legalTradingName || "Auckland Nissan City Ltd"}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Receiving Yard: 360 Great South Road, Greenlane</span>
              </span>
            </div>
          </div>

          {/* Tab Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm self-start lg:self-center">
            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                setActiveTab("ORDERS");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "ORDERS"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Ship className={`w-3.5 h-3.5 ${activeTab === "ORDERS" ? "text-[#E11D48]" : "text-slate-300"}`} />
              <span>Active Orders</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === "ORDERS" ? "bg-slate-100 text-slate-900" : "bg-white/20 text-white"
              }`}>
                {dealerOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                setActiveTab("HOLDS");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "HOLDS"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${activeTab === "HOLDS" ? "text-amber-500" : "text-amber-400"}`} />
              <span>24h Exclusivity Holds</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === "HOLDS" ? "bg-amber-100 text-amber-900" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {dealerHolds.length}
              </span>
            </button>
          </div>
        </div>

        {/* 4 Executive Quick-Glance KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Fleet Capital Value
            </span>
            <span className="text-xl font-black font-mono text-white mt-1 block">
              ${totalFleetValueNZD.toLocaleString()} NZD
            </span>
            <span className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{dealerOrders.length} Allocated Units</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Pacific RoRo Transit
            </span>
            <span className="text-xl font-black font-mono text-blue-400 mt-1 block">
              {onHighSeasCount} Units At Sea
            </span>
            <span className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
              <Ship className="w-3 h-3 text-blue-400" />
              <span>Pacific Corridor to Auckland</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              MR2A Compliance Centre
            </span>
            <span className="text-xl font-black font-mono text-indigo-300 mt-1 block">
              {inComplianceCount} In Verification
            </span>
            <span className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
              <BadgeCheck className="w-3 h-3 text-indigo-400" />
              <span>VINZ Auckland Pass Pending</span>
            </span>
          </div>

          <div className={`p-4 rounded-2xl border text-left ${
            pendingActionsCount > 0
              ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
              : "bg-white/5 border-white/10 text-slate-300"
          }`}>
            <span className="text-[10px] uppercase font-bold tracking-wider block">
              Remediation Action
            </span>
            <span className={`text-xl font-black font-mono mt-1 block ${pendingActionsCount > 0 ? "text-amber-400" : "text-white"}`}>
              {pendingActionsCount} {pendingActionsCount === 1 ? "Sign-off" : "Sign-offs"}
            </span>
            <span className="text-[11px] mt-0.5 flex items-center gap-1">
              {pendingActionsCount > 0 ? (
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Defect review required</span>
                </span>
              ) : (
                <span className="text-slate-400">All milestones on schedule</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Global Interactive Notification Toast */}
      {toastNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. TAB: My 24-Hour Exclusivity Holds                        */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "HOLDS" && (
        <div className="space-y-6">
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-amber-900 block">
                Atomic Exclusivity Guarantee (Section 3.3):
              </strong>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Vehicles locked under your 24-hour exclusivity hold are strictly protected server-side against competing dealer requests. The fixed landed buy price and Section 4 commercial boundary are locked at reservation time. You may convert to a confirmed wholesale order at any time before expiration.
              </p>
            </div>
          </div>

          {dealerHolds.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Active Exclusivity Holds</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Your dealership currently holds no time-locked reservations. Browse the Vehicle Catalogue to claim a 24-hour guaranteed price lock on available stock.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dealerHolds.map((res) => {
                const expiresDate = new Date(res.expiresAt);
                const isExpiringSoon = expiresDate.getTime() - Date.now() < 6 * 60 * 60 * 1000;

                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Top tags */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            #{res.vehicle.stockId}
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 flex items-center gap-1 font-mono">
                            <Lock className="w-2.5 h-2.5 text-amber-600" />
                            <span>24h Lock Active</span>
                          </span>
                        </div>

                        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isExpiringSoon
                            ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>Expires: {expiresDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </span>
                      </div>

                      {/* Studio Vehicle Preview */}
                      <div className="bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl p-4 border border-slate-100 flex items-center justify-center h-44 relative overflow-hidden group">
                        <img
                          src={res.vehicle?.images?.[0] || "/images/cars/kicks.png"}
                          alt={res.vehicle?.model || "Vehicle"}
                          className="max-h-36 w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                          VIN: {res.vehicle.vinChassis}
                        </div>
                      </div>

                      {/* Vehicle Spec */}
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {res.vehicle.year} {res.vehicle.make} {res.vehicle.model}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {res.vehicle.grade} · {res.vehicle.fuelType} · {res.vehicle.odometerKm.toLocaleString()} {res.vehicle.odometerUnit || "km"} · Grade {res.vehicle.auctionGrade || "4.5"}
                        </p>
                      </div>

                      {/* Guaranteed Landed Price Snapshot */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Guaranteed Landed Total:</span>
                          <span className="font-mono text-base font-black text-slate-900">
                            ${res.priceSnapshot.totalBuyPriceNZD.toLocaleString()} NZD
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-200/60">
                          <span>Terms Snapshot: {res.termsVersionSnapshot} Agreed</span>
                          <span>FOB: ¥{res.priceSnapshot.fobJPY.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingHoldVehicleId(res.vehicleId)}
                        className="flex-1 py-3 px-4 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Wholesale Order</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReleaseMyHold(res.vehicleId)}
                        className="py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Unlock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Release</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. TAB: Active Orders & Shipments                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "ORDERS" && (
        <div className="space-y-6">
          {/* Search & Filter Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Order #, VIN, model or vessel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                {[
                  { id: "ALL", label: "All Milestones" },
                  { id: "IN_TRANSIT", label: "On Vessel" },
                  { id: "BORDER", label: "NZ Compliance" },
                  { id: "READY", label: "Ready / Yard" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      audio.playSubtleClick();
                      setStatusFilter(chip.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === chip.id
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono shrink-0">
              Showing <strong>{filteredOrders.length}</strong> of {dealerOrders.length} Orders
            </div>
          </div>

          {dealerOrders.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mx-auto">
                <Ship className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Wholesale Orders Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Your franchise dealership does not currently have active vehicle allocations. Browse the Stock Catalog to place a 24-hour exclusivity lock.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile Sub-Tab Pill Bar (Orders List vs Order Details Cockpit) */}
              <div className="lg:hidden flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    audio.playSubtleClick();
                    setMobileSubTab("LIST");
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    mobileSubTab === "LIST"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All Orders ({filteredOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audio.playSubtleClick();
                    setMobileSubTab("DETAIL");
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    mobileSubTab === "DETAIL"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Details: {selectedOrder?.orderNumber || "Selected"}
                </button>
              </div>

              {/* Two-Column Cockpit Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Orders Cards List (4.5 Cols) */}
                <div className={`lg:col-span-4 space-y-3 ${mobileSubTab === "DETAIL" ? "hidden lg:block" : "block"}`}>
                  {filteredOrders.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                      No orders match your filter criteria.
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      const isSelected = order.id === (selectedOrder?.id || selectedOrderId);
                      const hasPendingCost = order.additionalCosts.some(
                        (c) => c.status === "PENDING_DEALER_APPROVAL"
                      );

                      return (
                        <div
                          key={order.id}
                          onClick={() => {
                            audio.playSubtleClick();
                            setSelectedOrderId(order.id);
                            setMobileSubTab("DETAIL");
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                            isSelected
                              ? "bg-white border-[#E11D48] ring-2 ring-rose-500/20 shadow-md"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                          }`}
                        >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E11D48]" />
                        )}

                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-mono font-bold text-slate-900">
                            {order.orderNumber}
                          </span>

                          {hasPendingCost ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>Approval Needed</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                              {order.currentMilestone.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>

                        {/* Vehicle Card Body */}
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={order.vehicle?.images?.[0] || "/images/cars/kicks.png"}
                              alt={order.vehicle?.model || "Vehicle"}
                              className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="font-bold text-sm text-slate-900 truncate">
                              {order.vehicle.year} {order.vehicle.model}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">
                              VIN: {order.vehicle.vinChassis} · {order.vehicle.odometerKm.toLocaleString()} km
                            </div>
                            <div className="flex items-center justify-between pt-0.5">
                              <span className="font-mono font-black text-xs text-slate-900">
                                ${order.priceBreakdown.totalBuyPriceNZD.toLocaleString()} NZD
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ETA {order.etaDeliveryDate ? new Date(order.etaDeliveryDate).toLocaleDateString([], { month: "short", day: "numeric" }) : "TBD"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Yard Tag */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">Greenlane Dealership Yard</span>
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {order.vesselName ? order.vesselName.split(" ")[0] : "RoRo Carrier"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Detailed Order Operations & Tracking Cockpit (7.5 Cols) */}
              {selectedOrder && (
                <div className={`lg:col-span-8 space-y-6 ${mobileSubTab === "LIST" ? "hidden lg:block" : "block"}`}>
                  {/* Mobile Back to Orders Button */}
                  <div className="lg:hidden">
                    <button
                      type="button"
                      onClick={() => setMobileSubTab("LIST")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      ← Back to Orders List
                    </button>
                  </div>
                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* Hero Vehicle & Identification Block                         */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            #{selectedOrder.vehicle.stockId}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                            Order: {selectedOrder.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#E11D48] border border-rose-100">
                            {selectedOrder.vehicle.fuelType}
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                          {selectedOrder.vehicle.year} {selectedOrder.vehicle.make} {selectedOrder.vehicle.model}
                        </h2>

                        <p className="text-xs text-slate-500 font-medium">
                          {selectedOrder.vehicle.grade} · {selectedOrder.vehicle.transmission} · {selectedOrder.vehicle.engineCc}cc · Color: {selectedOrder.vehicle.color}
                        </p>

                        {/* 1-Click Copy VIN & Stock */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-500">
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400">VIN:</span>
                            <strong className="text-slate-800">{selectedOrder.vehicle.vinChassis}</strong>
                            <button
                              type="button"
                              onClick={() => handleCopy(selectedOrder.vehicle.vinChassis, "vin")}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                              title="Copy VIN"
                            >
                              {copiedField === "vin" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400">Auction Grade:</span>
                            <strong className="text-slate-800">★ {selectedOrder.vehicle.auctionGrade || "4.5"} / {selectedOrder.vehicle.interiorGrade || "A"}</strong>
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400">Odometer:</span>
                            <strong className="text-slate-800">{selectedOrder.vehicle.odometerKm.toLocaleString()} {selectedOrder.vehicle.odometerUnit || "km"}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Block */}
                      <div className="sm:text-right shrink-0 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Total Buy Price (Fixed Landed)
                        </span>
                        <div className="text-2xl font-black font-mono text-slate-900">
                          ${selectedOrder.priceBreakdown.totalBuyPriceNZD.toLocaleString()} <span className="text-xs font-sans text-slate-500">NZD</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          FOB: ¥{selectedOrder.priceBreakdown.fobJPY.toLocaleString()} ({selectedOrder.pricingZoneId})
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            audio.playSubtleClick();
                            setShowPriceBreakdown(!showPriceBreakdown);
                          }}
                          className="text-[11px] text-[#E11D48] hover:text-[#BE123C] font-bold mt-2 flex items-center sm:justify-end gap-1 cursor-pointer"
                        >
                          <span>{showPriceBreakdown ? "Hide Inclusions" : "View Cost Inclusions"}</span>
                          {showPriceBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Studio Showcase Vehicle Image */}
                    <div className="bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-100 rounded-2xl p-6 border border-slate-100 flex items-center justify-center relative overflow-hidden">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)]" />
                      <img
                        src={selectedOrder.vehicle?.images?.[0] || "/images/cars/kicks.png"}
                        alt={selectedOrder.vehicle?.model || "Vehicle"}
                        className="max-h-52 w-full object-contain filter drop-shadow-xl relative z-10"
                      />
                    </div>

                    {/* Section 4 Commercial Inclusions Breakdown (Expandable) */}
                    {showPriceBreakdown && (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-slate-900">
                              Section 4 Commercial Inclusions Guarantee
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Assigned Profile: {selectedOrder.pricingZoneId} (Upper North Island)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[11px]">
                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                            <span className="text-slate-400 block font-medium">Vehicle Acquisition:</span>
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              ${selectedOrder.priceBreakdown.fobNZD.toLocaleString()} NZD
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">¥{selectedOrder.priceBreakdown.fobJPY.toLocaleString()}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                            <span className="text-slate-400 block font-medium">RoRo Ocean Freight:</span>
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              ${selectedOrder.priceBreakdown.oceanFreightNZD.toLocaleString()} NZD
                            </span>
                            <span className="text-[10px] text-slate-400">Direct RoRo Liner</span>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                            <span className="text-slate-400 block font-medium">Customs &amp; NZ GST:</span>
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              ${(selectedOrder.priceBreakdown.customsProcessingNZD + selectedOrder.priceBreakdown.gstNZD).toLocaleString()} NZD
                            </span>
                            <span className="text-[10px] text-slate-400">MPI Bio &amp; 15% GST Entry</span>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                            <span className="text-slate-400 block font-medium">MR2A Compliance Pass:</span>
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              ${selectedOrder.priceBreakdown.complianceInspectionNZD.toLocaleString()} NZD
                            </span>
                            <span className="text-[10px] text-slate-400">NZTA Structural Standards</span>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                            <span className="text-slate-400 block font-medium">2x Domestic Movements:</span>
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              ${selectedOrder.priceBreakdown.zoneDeliveryNZD.toLocaleString()} NZD
                            </span>
                            <span className="text-[10px] text-slate-400">Port ➔ Center ➔ Yard</span>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                            <span className="text-slate-400 block font-medium">Nissan Programme Fee:</span>
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              ${selectedOrder.priceBreakdown.programmeFeeNZD.toLocaleString()} NZD
                            </span>
                            <span className="text-[10px] text-slate-400">Provenance &amp; Quality Audit</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Section 4 Commercial Boundary Rule:</strong> The fixed price assumes a standard compliance pass. Separately chargeable work will be identified at the time of invoicing.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* Live RoRo Maritime Vessel Tracker Banner                    */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                          <Ship className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">
                            RoRo Ocean Transit &amp; Marine Logistics
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">
                            Vessel: {selectedOrder.vesselName || "Trans-Pacific RoRo V.48"} ({selectedOrder.voyageNumber || "Direct"})
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-blue-50 font-mono text-[11px] font-bold text-blue-700 border border-blue-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span>Voyage In Transit</span>
                      </span>
                    </div>

                    {/* Visual Sea Track Route */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1527] to-slate-900 text-white space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Port of Departure</span>
                          <strong className="text-sm text-white block mt-0.5">Yokohama RoRo Terminal</strong>
                          <span className="text-[10px] text-slate-400 font-mono">Japan (Departed Oct 24)</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Port of Arrival</span>
                          <strong className="text-sm text-white block mt-0.5">Ports of Auckland</strong>
                          <span className="text-[10px] text-blue-300 font-mono font-bold">ETA: Nov 08 (Berth 3)</span>
                        </div>
                      </div>

                      {/* Ship Progress Bar */}
                      <div className="relative pt-2 pb-1">
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 via-rose-500 to-emerald-400 rounded-full w-[78%]" />
                        </div>
                        <div className="absolute top-0 left-[76%] -translate-x-1/2 flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg border border-slate-200">
                            <Ship className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                        <span>Speed: 18.2 knots</span>
                        <span className="text-slate-300">Transit: 78% Completed</span>
                        <span>Corridor: South Pacific Route</span>
                      </div>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* Defect Remediation & Additional Cost Action (US-18, AC-09) */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  {selectedOrder.additionalCosts.length > 0 && (
                    <div className="space-y-4">
                      {selectedOrder.additionalCosts.map((cost) => {
                        const isPending = cost.status === "PENDING_DEALER_APPROVAL";
                        const isApproved = cost.status === "APPROVED";

                        return (
                          <div
                            key={cost.id}
                            className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                              isPending
                                ? "bg-amber-50/70 border-amber-300"
                                : isApproved
                                ? "bg-emerald-50/60 border-emerald-300"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/80">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <h3 className="font-bold text-sm text-slate-900">
                                  Compliance Defect Remediation Sign-Off (US-18)
                                </h3>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-mono text-base font-black text-slate-900">
                                  +${cost.amountNZD.toLocaleString()} NZD
                                </span>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                                  isPending
                                    ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                }`}>
                                  {isPending ? "Action Required" : cost.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed">
                              {cost.description}
                            </p>

                            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200 text-xs space-y-1.5">
                              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                                <span>Remediation Facility: <strong>VINZ Penrose Compliance Hub</strong></span>
                                <span className="font-mono text-slate-400">Proposed: {cost.proposedAt ? new Date(cost.proposedAt).toLocaleDateString() : "Active"}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 italic">
                                {cost.notes || "Nissan OEM replacement component held in stock. Turnaround time: 24 hours."}
                              </p>
                            </div>

                            {/* Actions & Photographic Evidence */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  audio.playSubtleClick();
                                  setViewingDefectPhoto(true);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Inspect Photographic Evidence</span>
                              </button>

                              {isPending && (
                                <div className="flex items-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDeclineCost(selectedOrder.id, cost.id)}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                                  >
                                    Decline Remediation
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveCost(selectedOrder.id, cost.id)}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Approve (+${cost.amountNZD} NZD)</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* 8-Stage Agreed Milestone Stepper (US-16, US-17)            */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          Agreed Order Delivery Milestones (US-17)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Traceable sign-offs from Yokohama export terminal to franchise yard delivery.
                        </p>
                      </div>

                      <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        8 Agreed Stages
                      </span>
                    </div>

                    <div className="space-y-4 pl-2">
                      {MILESTONE_STEPS.map((step, idx) => {
                        const currentIdx = getMilestoneIndex(selectedOrder.currentMilestone);
                        const isPassed = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        const log = selectedOrder.milestones.find((m) => m.key === step.key);

                        return (
                          <div key={step.key} className="flex items-start gap-4 relative">
                            {idx < MILESTONE_STEPS.length - 1 && (
                              <div
                                className={`absolute left-3 top-7 bottom-0 w-0.5 ${
                                  isPassed ? "bg-slate-900" : "bg-slate-200"
                                }`}
                              />
                            )}

                            {/* Step Indicator Ball */}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-2xs z-10 ${
                                isPassed
                                  ? "bg-slate-900 text-white"
                                  : isCurrent
                                  ? "bg-[#E11D48] text-white ring-4 ring-rose-100 animate-pulse"
                                  : "bg-slate-100 text-slate-400 border border-slate-200"
                              }`}
                            >
                              {isPassed ? "✓" : idx + 1}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-4 text-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-bold text-sm ${
                                      isCurrent
                                        ? "text-[#E11D48]"
                                        : isPassed
                                        ? "text-slate-900"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-50 text-[#E11D48] border border-rose-200">
                                      Active Current
                                    </span>
                                  )}
                                </div>

                                <div className="text-right">
                                  {log?.completedAt ? (
                                    <span className="text-[11px] text-slate-500 font-mono font-medium">
                                      Completed: {new Date(log.completedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                  ) : log?.eta ? (
                                    <span className="text-[11px] text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">
                                      ETA: {log.eta}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      Pending prior milestone
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                                {log?.notes || step.desc}
                              </p>

                              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-mono">
                                <span>Sign-off Actor: <strong className="text-slate-600">{log?.updatedBy || step.actor}</strong></span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* Verified Digital Document & Compliance Vault (Section 5)   */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <FileCheck2 className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">
                            Compliance &amp; Shipping Documents Vault
                          </h3>
                          <p className="text-xs text-slate-500">
                            Legally binding auction reports, JEVIC certificates, and MR2A compliance papers.
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {selectedOrder.documents?.length || 0} Verified Documents
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedOrder.documents && selectedOrder.documents.length > 0 ? (
                        selectedOrder.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 shadow-2xs group"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  {doc.type.replace(/_/g, " ")}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(doc.uploadedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 pt-1" title={doc.name}>
                                {doc.name}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                              <span className="text-[10px] text-slate-400 font-mono">
                                Official Digital Seal
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    audio.playSubtleClick();
                                    setViewingDocument({
                                      name: doc.name,
                                      type: doc.type,
                                      date: new Date(doc.uploadedAt).toLocaleDateString(),
                                    });
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-slate-500" />
                                  <span>View</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadDoc(doc.name)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>PDF</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-6 text-xs text-slate-400 italic">
                          No documents uploaded yet for this allocation.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* Destination Yard Delivery Protocol                          */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-600">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#E11D48] shrink-0" />
                        <span className="font-bold text-slate-900">Designated Franchise Delivery Destination:</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {selectedOrder.deliveryAddress || "360 Great South Road, Greenlane, Auckland 1051"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Transporter low-loader access cleared · Authorized Yard Receiver: <strong>David Miller (+64 9 520 8899)</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Arrival Date</span>
                      <strong className="text-sm font-mono text-slate-900">
                        {selectedOrder.etaDeliveryDate ? new Date(selectedOrder.etaDeliveryDate).toLocaleDateString("en-NZ", { dateStyle: "long" }) : "Nov 08, 2026"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL: Official Document Viewer Simulation                  */}
      {/* ─────────────────────────────────────────────────────────── */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setViewingDocument(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Official Programme Record
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {viewingDocument.name}
                </h3>
              </div>
            </div>

            {/* Document Certificate Sheet Simulation */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-4 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-[11px] text-slate-500">
                <span>DOC-ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                <span>Issued: {viewingDocument.date}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">DOCUMENT CLASSIFICATION:</span>
                  <strong className="text-slate-900">{viewingDocument.type.replace(/_/g, " ")}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ISSUING AUTHORITY:</span>
                  <strong className="text-slate-900">JEVIC / NZTA Authorised Agency</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ODOMETER VERIFICATION:</span>
                  <strong className="text-emerald-700">Tamper-Proof Pass (Zero Anomalies)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DIGITAL SIGNATURE HASH:</span>
                  <strong className="text-slate-700 truncate block">SHA-256: 4f8b1c...99a0</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-sans leading-relaxed">
                This document certifies that the vehicle meets the Japanese export biosecurity standard and NZTA Entry Certification preconditions under the Nissan Used Vehicle Programme.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewingDocument(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadDoc(viewingDocument.name);
                  setViewingDocument(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sealed PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL: Photographic Defect Evidence Viewer (US-18)          */}
      {/* ─────────────────────────────────────────────────────────── */}
      {viewingDefectPhoto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setViewingDefectPhoto(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Compliance Technical Inspection Photo
                </h3>
                <p className="text-xs text-slate-500">
                  Item: Driver Seatbelt Retractor Slow Recoil (Auckland VINZ Centre)
                </p>
              </div>
            </div>

            {/* Simulated Defect Evidence Image */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 relative h-64 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
                alt="Seatbelt retractor inspection"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="bg-rose-600 px-2 py-0.5 rounded text-[10px] font-bold">DEFECT FLAGGED</span>
                  <span>VIN: T32-849201</span>
                </div>
                <p className="text-[11px] text-slate-200 mt-1 font-sans">
                  Retractor fails 3-second tension test. Replacement required for MR2A plate stamping.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-xs font-bold text-slate-900">
                Remediation Cost: $480 NZD
              </span>
              <button
                type="button"
                onClick={() => setViewingDefectPhoto(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL: Confirm Hold into Active Order (US-12, US-14)        */}
      {/* ─────────────────────────────────────────────────────────── */}
      {confirmingHoldVehicleId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setConfirmingHoldVehicleId(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Confirm Wholesale Order Allocation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                By confirming, this vehicle will immediately transition from 24-hour exclusivity hold to an official wholesale order. The fixed landed buy price will be locked under your Zone 1 profile.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Dealership Code:</span>
                <strong className="font-mono text-slate-900">{currentDealer?.dealerCode || "NZ-NIS-AKL01"}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Commercial Boundary:</span>
                <span className="text-emerald-700 font-semibold">Section 4 Acknowledged</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Terms Version:</span>
                <span className="font-mono text-slate-900">v2026.1 Binding</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingHoldVehicleId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmHoldToOrder(confirmingHoldVehicleId)}
                className="px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Generate Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
