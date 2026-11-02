"use client";

import React, { useState } from "react";
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
} from "lucide-react";

const MILESTONE_STEPS: { key: OrderMilestone; label: string }[] = [
  { key: "ORDER_CONFIRMED", label: "Confirmed" },
  { key: "JAPAN_VERIFICATION", label: "Japan Verification" },
  { key: "BOOKED_FOR_SHIPPING", label: "Shipment Booked" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "NZ_BORDER_PROCESSING", label: "Border Release" },
  { key: "COMPLIANCE", label: "MR2A Compliance" },
  { key: "READY_FOR_DELIVERY", label: "Ready for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function DealerOrdersView() {
  const { currentDealer } = useAuth();
  const { orders, reservations, releaseHold, respondToAdditionalCost } = useProgramme();
  const [activeTab, setActiveTab] = useState<"ORDERS" | "HOLDS">("ORDERS");
  const [showPriceBreakdown, setShowPriceBreakdown] = useState<boolean>(false);
  const [docNotice, setDocNotice] = useState<string | null>(null);

  // Filter orders for this dealer or all if not filtered
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

  const selectedOrder =
    dealerOrders.find((o) => o.id === selectedOrderId) || dealerOrders[0];

  const handleApproveCost = (orderId: string, costId: string) => {
    audio.playSuccessChime();
    respondToAdditionalCost(orderId, costId, "APPROVED");
  };

  const handleDeclineCost = (orderId: string, costId: string) => {
    audio.playSubtleClick();
    respondToAdditionalCost(orderId, costId, "DECLINED");
  };

  const handleReleaseMyHold = (vehicleId: string) => {
    audio.playSubtleClick();
    releaseHold(vehicleId, "Voluntary release by franchise dealer.");
  };

  const handleDownloadDoc = (docName: string) => {
    audio.playSuccessChime();
    setDocNotice(`Downloading verified document: ${docName}...`);
    setTimeout(() => setDocNotice(null), 3500);
  };

  const getMilestoneIndex = (milestone: OrderMilestone) => {
    if (milestone === "AWAITING_ADDITIONAL_COST") return 5;
    const idx = MILESTONE_STEPS.findIndex((s) => s.key === milestone);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header & Tab Navigation (US-16)                         */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
              Dealership Allocations (US-16)
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {currentDealer?.dealerCode || "NZ-NIS-AKL01"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Orders &amp; Shipments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active vehicle shipments, landed compliance documentation, and 24-hour exclusivity holds for {currentDealer?.legalTradingName || "Your Dealership"}.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              setActiveTab("ORDERS");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "ORDERS"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Ship className="w-3.5 h-3.5 text-slate-700" />
            <span>Active Orders</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800 font-mono">
              {dealerOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              setActiveTab("HOLDS");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "HOLDS"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>My 24h Holds</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
              {dealerHolds.length}
            </span>
          </button>
        </div>
      </div>

      {docNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{docNotice}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. TAB: My 24-Hour Exclusivity Holds                        */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "HOLDS" && (
        <div className="space-y-4">
          {dealerHolds.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Active Exclusivity Holds</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your dealership currently has no time-locked reservations. Browse the vehicle catalog to lock an available vehicle for 24 hours.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dealerHolds.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={res.vehicle?.images?.[0] || "/images/cars/kicks.png"}
                      alt={res.vehicle?.model || "Vehicle"}
                      className="w-24 h-16 object-contain rounded-xl border border-slate-100 bg-slate-50 p-1 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          #{res.vehicle.stockId}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 flex items-center gap-1 font-mono">
                          <Lock className="w-2.5 h-2.5 text-amber-600" />
                          <span>24h Atomic Lock</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {res.vehicle.year} {res.vehicle.make} {res.vehicle.model}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {res.vehicle.grade} · {res.vehicle.fuelType} · {res.vehicle.transmission} · {res.vehicle.odometerKm.toLocaleString()} {res.vehicle.odometerUnit || "km"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Guaranteed Landed Price
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ${res.priceSnapshot.totalBuyPriceNZD.toLocaleString()} NZD
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Hold Expiry Time
                      </span>
                      <span className="font-mono text-amber-700 font-semibold">
                        {new Date(res.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (24h)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Terms Snapshot
                      </span>
                      <span className="font-mono text-emerald-700 font-semibold">
                        {res.termsVersionSnapshot} Agreed
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReleaseMyHold(res.vehicleId)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Unlock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Release Hold</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. TAB: Active Orders & Shipments                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "ORDERS" && (
        <>
          {dealerOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Ship className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Active Orders Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your dealership has not placed any vehicle allocations. Browse the Stock Catalog to place a 24-hour hold.
              </p>
            </div>
          ) : (
            /* Two-Column Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Orders List (4 Cols) */}
              <div className="lg:col-span-4 space-y-2.5">
                {dealerOrders.map((order) => {
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
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-white border-[#E11D48] ring-1 ring-[#E11D48] shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-mono font-semibold text-slate-900">{order.orderNumber}</span>
                        {hasPendingCost ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                            Approval Needed
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {order.currentMilestone.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={order.vehicle?.images?.[0] || "/images/cars/kicks.png"}
                          alt={order.vehicle?.model || "Vehicle"}
                          className="w-14 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1 text-xs">
                          <div className="font-semibold text-slate-900 truncate">
                            {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
                          </div>
                          <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                            ${order.priceBreakdown.totalBuyPriceNZD.toLocaleString()} NZD
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Order Detail & Milestones (8 Cols) */}
              {selectedOrder && (
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
                  {/* Order Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500 font-mono">
                        {selectedOrder.orderNumber} · Ordered on {new Date(selectedOrder.orderedAt).toLocaleDateString()}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        {selectedOrder.vehicle.year} {selectedOrder.vehicle.make} {selectedOrder.vehicle.model}
                      </h2>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Stock: #{selectedOrder.vehicle.stockId} · VIN: {selectedOrder.vehicle.vinChassis} · {selectedOrder.vehicle.grade}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Total Buy Price (Fixed Landed)</span>
                      <span className="text-lg font-bold font-mono text-slate-900">
                        ${selectedOrder.priceBreakdown.totalBuyPriceNZD.toLocaleString()} NZD
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                        className="text-[11px] text-[#E11D48] hover:text-[#BE123C] font-semibold mt-1 flex items-center justify-end gap-1 cursor-pointer"
                      >
                        <span>{showPriceBreakdown ? "Hide Inclusions" : "View Cost Inclusions"}</span>
                        {showPriceBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Section 4 Commercial Inclusions Breakdown */}
                  {showPriceBreakdown && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
                        <span className="font-bold text-slate-900">Guaranteed Landed Cost Breakdown</span>
                        <span className="text-[10px] text-slate-500 font-mono">Pricing Profile: {selectedOrder.pricingZoneId}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Vehicle Acquisition:</span>
                          <span className="font-mono font-bold text-slate-800">${selectedOrder.priceBreakdown.fobNZD.toLocaleString()} NZD (¥{selectedOrder.priceBreakdown.fobJPY.toLocaleString()})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Standard Ocean Freight:</span>
                          <span className="font-mono font-bold text-slate-800">${selectedOrder.priceBreakdown.oceanFreightNZD.toLocaleString()} NZD</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Customs Entry &amp; GST:</span>
                          <span className="font-mono font-bold text-slate-800">${(selectedOrder.priceBreakdown.customsProcessingNZD + selectedOrder.priceBreakdown.gstNZD).toLocaleString()} NZD</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">MR2A Compliance Pass:</span>
                          <span className="font-mono font-bold text-slate-800">${selectedOrder.priceBreakdown.complianceInspectionNZD.toLocaleString()} NZD</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">2x Domestic Movements:</span>
                          <span className="font-mono font-bold text-slate-800">${selectedOrder.priceBreakdown.zoneDeliveryNZD.toLocaleString()} NZD</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Nissan Programme Fee:</span>
                          <span className="font-mono font-bold text-slate-800">${selectedOrder.priceBreakdown.programmeFeeNZD.toLocaleString()} NZD</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                        The fixed price assumes a standard compliance pass. Separately chargeable work will be identified at the time of invoicing.
                      </p>
                    </div>
                  )}

                  {/* Additional Cost Review Card (Only if needed) */}
                  {selectedOrder.additionalCosts.map((cost) => (
                    <div
                      key={cost.id}
                      className={`p-4 rounded-xl border ${
                        cost.status === "PENDING_DEALER_APPROVAL"
                          ? "bg-amber-50/50 border-amber-300"
                          : cost.status === "APPROVED"
                          ? "bg-emerald-50/50 border-emerald-300"
                          : "bg-slate-50 border-slate-200"
                      } space-y-2.5 text-xs`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">Compliance Defect Remediation:</span>
                        <span className="font-mono text-slate-900 font-bold">+${cost.amountNZD.toLocaleString()} NZD</span>
                      </div>

                      <p className="text-slate-600 leading-relaxed text-[11px]">{cost.description}</p>

                      {cost.status === "PENDING_DEALER_APPROVAL" ? (
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/60">
                          <button
                            type="button"
                            onClick={() => handleDeclineCost(selectedOrder.id, cost.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveCost(selectedOrder.id, cost.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                          >
                            Approve (+${cost.amountNZD} NZD)
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] font-semibold text-slate-500">Status: {cost.status}</div>
                      )}
                    </div>
                  ))}

                  {/* Minimal 8-Stage Milestone Stepper */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Delivery Milestones (US-17)
                    </h3>

                    <div className="space-y-3 pl-1">
                      {MILESTONE_STEPS.map((step, idx) => {
                        const currentIdx = getMilestoneIndex(selectedOrder.currentMilestone);
                        const isPassed = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        const log = selectedOrder.milestones.find((m) => m.key === step.key);

                        return (
                          <div key={step.key} className="flex items-start gap-3 relative">
                            {idx < MILESTONE_STEPS.length - 1 && (
                              <div
                                className={`absolute left-2.5 top-5 bottom-0 w-px ${
                                  isPassed ? "bg-slate-900" : "bg-slate-200"
                                }`}
                              />
                            )}

                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                isPassed
                                  ? "bg-slate-900 text-white"
                                  : isCurrent
                                  ? "bg-[#E11D48] text-white ring-2 ring-rose-200"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {isPassed ? "✓" : idx + 1}
                            </div>

                            <div className="flex-1 pb-3 text-xs">
                              <div className="flex items-center justify-between">
                                <span className={`font-medium ${isCurrent ? "text-[#E11D48] font-bold" : isPassed ? "text-slate-900" : "text-slate-400"}`}>
                                  {step.label}
                                </span>
                                {log?.completedAt && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(log.completedAt).toLocaleDateString()}
                                  </span>
                                )}
                                {!log?.completedAt && log?.eta && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    ETA: {log.eta}
                                  </span>
                                )}
                              </div>

                              {log?.notes && (
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{log.notes}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 5: Order Documents (Auction Sheet, JEVIC, BoL, Customs, MR2A) */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Compliance &amp; Shipping Documents</span>
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedOrder.documents?.length || 0} Available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedOrder.documents && selectedOrder.documents.length > 0 ? (
                        selectedOrder.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate" title={doc.name}>
                                {doc.name}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                                {doc.type.replace(/_/g, " ")} · {new Date(doc.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDownloadDoc(doc.name)}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-semibold shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Download className="w-3 h-3 text-slate-500" />
                              <span>PDF</span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-4 text-xs text-slate-400 italic">
                          No documents uploaded yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Note & Vessel Schedule */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Destination: <strong>{selectedOrder.deliveryAddress}</strong></span>
                    </div>
                    {selectedOrder.vesselName && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 shrink-0">
                        <Ship className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedOrder.vesselName} ({selectedOrder.voyageNumber || "Direct"})</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
