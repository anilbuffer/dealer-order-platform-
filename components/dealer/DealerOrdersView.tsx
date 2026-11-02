"use client";

import React, { useState } from "react";
import { Order, OrderMilestone } from "@/lib/types";
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
  const { orders, respondToAdditionalCost } = useProgramme();

  // Filter orders for this dealer or all if not filtered
  const dealerOrders = orders.filter(
    (o) => !currentDealer?.id || o.dealerId === currentDealer.id
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

  const getMilestoneIndex = (milestone: OrderMilestone) => {
    if (milestone === "AWAITING_ADDITIONAL_COST") return 5;
    const idx = MILESTONE_STEPS.findIndex((s) => s.key === milestone);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Orders &amp; Shipments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active vehicle shipments and delivery tracking for {currentDealer?.legalTradingName || "Your Dealership"}
          </p>
        </div>

        <span className="text-xs text-slate-500">
          <strong className="text-slate-900 font-mono">{dealerOrders.length}</strong> active units
        </span>
      </div>

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
                      src={order.vehicle.images[0]}
                      alt={order.vehicle.model}
                      className="w-14 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
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
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Total Buy Price</span>
                  <span className="text-lg font-bold font-mono text-slate-900">
                    ${selectedOrder.priceBreakdown.totalBuyPriceNZD.toLocaleString()} NZD
                  </span>
                </div>
              </div>

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
                  Delivery Milestones
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

              {/* Delivery Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Destination: {selectedOrder.deliveryAddress}</span>
                </div>
                {selectedOrder.vesselName && (
                  <span className="text-[11px] font-mono text-slate-500">
                    Vessel: {selectedOrder.vesselName}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
