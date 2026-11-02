"use client";

import React, { useState } from "react";
import { Order, OrderMilestone } from "@/lib/types";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { audio } from "@/lib/sound";
import {
  Package,
  Ship,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

const MILESTONE_STEPS: { key: OrderMilestone; label: string }[] = [
  { key: "ORDER_CONFIRMED", label: "Confirmed" },
  { key: "JAPAN_VERIFICATION", label: "Japan Verification" },
  { key: "BOOKED_FOR_SHIPPING", label: "Shipment Booked" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "NZ_BORDER_PROCESSING", label: "Border Customs" },
  { key: "COMPLIANCE", label: "MR2A Compliance" },
  { key: "READY_FOR_DELIVERY", label: "Ready for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function DealerOrdersView() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(MOCK_ORDERS[1].id);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleApproveCost = (orderId: string, costId: string) => {
    audio.playSuccessChime();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            currentMilestone: "COMPLIANCE",
            additionalCosts: ord.additionalCosts.map((c) =>
              c.id === costId ? { ...c, status: "APPROVED", decidedAt: new Date().toISOString() } : c
            ),
          };
        }
        return ord;
      })
    );
  };

  const handleDeclineCost = (orderId: string, costId: string) => {
    audio.playSubtleClick();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            additionalCosts: ord.additionalCosts.map((c) =>
              c.id === costId ? { ...c, status: "DECLINED", decidedAt: new Date().toISOString() } : c
            ),
          };
        }
        return ord;
      })
    );
  };

  const getMilestoneIndex = (milestone: OrderMilestone) => {
    if (milestone === "AWAITING_ADDITIONAL_COST") return 5; // during compliance
    const idx = MILESTONE_STEPS.findIndex((s) => s.key === milestone);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Orders & Milestones
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Live RoRo Logistics Link
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dealership Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time status updates across Japan yard preparation, ocean shipping, border release, and MR2A compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            {orders.length} Active Orders
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Orders List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Active Dealership Orders
          </h2>

          <div className="space-y-3">
            {orders.map((order) => {
              const isSelected = order.id === selectedOrderId;
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
                  className={`p-4 rounded-2xl border transition-smooth cursor-pointer text-left ${
                    isSelected
                      ? "bg-white border-crimson-600 ring-2 ring-crimson-500/10 shadow-soft-md"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-soft"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {order.orderNumber}
                    </span>
                    {hasPendingCost ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Action Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {order.currentMilestone.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={order.vehicle.images[0]}
                      alt={order.vehicle.model}
                      className="w-16 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1 text-xs">
                      <div className="font-bold text-slate-900 truncate">
                        {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        Stock: {order.vehicle.stockId}
                      </div>
                      <div className="text-slate-900 font-bold font-mono text-[11px] mt-0.5">
                        ${order.priceBreakdown.totalBuyPriceNZD.toLocaleString()} NZD Landed
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Order Detail & Milestone Stepper (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-soft space-y-6">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-crimson-600">
                  {selectedOrder.orderNumber}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">
                  Ordered on {new Date(selectedOrder.orderedAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {selectedOrder.vehicle.year} {selectedOrder.vehicle.make} {selectedOrder.vehicle.model}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Agreed Buy Price</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                ${selectedOrder.priceBreakdown.totalBuyPriceNZD.toLocaleString()} NZD
              </span>
            </div>
          </div>

          {/* Conditional Action: Additional Cost Variation Alert (US-18) */}
          {selectedOrder.additionalCosts.map((cost) => (
            <div
              key={cost.id}
              className={`p-5 rounded-2xl border ${
                cost.status === "PENDING_DEALER_APPROVAL"
                  ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300"
                  : cost.status === "APPROVED"
                  ? "bg-emerald-50/70 border-emerald-300"
                  : "bg-slate-50 border-slate-200"
              } space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      cost.status === "PENDING_DEALER_APPROVAL"
                        ? "text-amber-600 animate-pulse"
                        : "text-slate-500"
                    }`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Additional Cost Variation (US-18)
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    cost.status === "PENDING_DEALER_APPROVAL"
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : cost.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-slate-200 text-slate-700 border-slate-300"
                  }`}
                >
                  {cost.status.replace(/_/g, " ")}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{cost.description}</p>

              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-slate-500 text-[11px]">Proposed Repair Amount:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm ml-2">
                    +${cost.amountNZD.toLocaleString()} NZD
                  </span>
                </div>

                {cost.evidenceDocumentUrl && (
                  <button
                    onClick={() =>
                      alert("Opening inspection certificate & seatbelt defect photograph.")
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Inspection Evidence</span>
                  </button>
                )}
              </div>

              {cost.status === "PENDING_DEALER_APPROVAL" && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => handleDeclineCost(selectedOrder.id, cost.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
                  >
                    Decline Variation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveCost(selectedOrder.id, cost.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-soft cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Proceed (+${cost.amountNZD} NZD)</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* 9-Stage Milestone Stepper */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Milestone Progression (Yokohama $\rightarrow$ Auckland)
            </h3>

            <div className="space-y-3">
              {MILESTONE_STEPS.map((step, idx) => {
                const currentIdx = getMilestoneIndex(selectedOrder.currentMilestone);
                const isPassed = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                // Match with completed log
                const completedLog = selectedOrder.milestones.find((m) => m.key === step.key);

                return (
                  <div key={step.key} className="flex items-start gap-3.5 relative group">
                    {/* Connecting line */}
                    {idx < MILESTONE_STEPS.length - 1 && (
                      <div
                        className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-px ${
                          isPassed ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isPassed
                          ? "bg-emerald-500 text-white shadow-soft"
                          : isCurrent
                          ? "bg-crimson-600 text-white ring-4 ring-crimson-100 animate-pulse"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    {/* Step Description */}
                    <div className="min-w-0 flex-1 pb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold ${
                            isCurrent
                              ? "text-crimson-600"
                              : isPassed
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        {completedLog?.completedAt && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(completedLog.completedAt).toLocaleDateString()}
                          </span>
                        )}
                        {!completedLog?.completedAt && completedLog?.eta && (
                          <span className="text-[10px] text-blue-600 font-mono">
                            ETA: {completedLog.eta}
                          </span>
                        )}
                      </div>

                      {completedLog?.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {completedLog.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Details Footer */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-crimson-600" />
              <span>Dealership Delivery Destination</span>
            </div>
            <p className="text-slate-600">{selectedOrder.deliveryAddress}</p>
            {selectedOrder.vesselName && (
              <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-200/60">
                <Ship className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  Vessel: <strong className="text-slate-800">{selectedOrder.vesselName}</strong> (Voyage: {selectedOrder.voyageNumber})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

