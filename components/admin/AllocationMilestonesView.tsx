"use client";

import React, { useState } from "react";
import { Order, OrderMilestone, AdditionalCostItem } from "@/lib/types";
import { useProgramme } from "@/lib/programme-context";
import { audio } from "@/lib/sound";
import AdditionalCostCreatorModal from "./AdditionalCostCreatorModal";
import {
  Ship,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Calendar,
  Anchor,
  FileCheck2,
} from "lucide-react";

const MILESTONE_SEQUENCE: { key: OrderMilestone; label: string }[] = [
  { key: "ORDER_CONFIRMED", label: "Order Confirmed" },
  { key: "JAPAN_VERIFICATION", label: "Japan Verification" },
  { key: "BOOKED_FOR_SHIPPING", label: "Booked Shipping" },
  { key: "IN_TRANSIT", label: "In Transit (RoRo)" },
  { key: "NZ_BORDER_PROCESSING", label: "NZ Border" },
  { key: "COMPLIANCE", label: "MR2A Compliance" },
  { key: "READY_FOR_DELIVERY", label: "Ready Delivery" },
  { key: "DELIVERED", label: "Delivered Yard" },
];

export default function AllocationMilestonesView() {
  const { orders, advanceOrderMilestone, attachAdditionalCost: addCost } = useProgramme();
  const [selectedOrderForCost, setSelectedOrderForCost] = useState<Order | null>(null);
  const [editingMilestoneOrderId, setEditingMilestoneOrderId] = useState<string | null>(null);
  const [nextMilestoneKey, setNextMilestoneKey] = useState<OrderMilestone>("NZ_BORDER_PROCESSING");
  const [milestoneNotes, setMilestoneNotes] = useState("MPI biosecurity heat treatment and border discharge verified.");
  const [notification, setNotification] = useState<string | null>(null);

  const handleAdvanceMilestone = (orderId: string) => {
    audio.playSuccessChime();
    advanceOrderMilestone(orderId, nextMilestoneKey, milestoneNotes);
    setEditingMilestoneOrderId(null);
    setNotification(`Order ${orderId} successfully advanced to ${nextMilestoneKey}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCostCreated = (orderId: string, costItem: AdditionalCostItem) => {
    addCost(orderId, costItem);
    setNotification(`Additional compliance cost item attached to Order ${orderId}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header Banner                                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
              Logistics Controller
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              9-Stage RoRo Progression
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Order Allocations &amp; Logistics Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Advance shipping milestones, update vessel voyage ETAs, and manage compliance variation repairs across the dealer network.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 font-mono text-slate-700 font-semibold border border-slate-200">
            {orders.length} Active Programme Orders
          </span>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Order Cards with Interactive Milestones                 */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {orders.map((order) => {
          const isAwaitingVariation = order.currentMilestone === "AWAITING_ADDITIONAL_COST";
          const isEditingThis = editingMilestoneOrderId === order.id;

          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border p-6 space-y-6 shadow-sm transition-all ${
                isAwaitingVariation ? "border-rose-300" : "border-slate-200/90"
              }`}
            >
              {/* Order Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={order.vehicle.images[0]}
                    alt={order.vehicle.model}
                    className="w-20 h-14 object-contain rounded-xl border border-slate-200 bg-slate-50 p-1 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                        {order.pricingZoneId}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {order.vehicle.year} {order.vehicle.make} {order.vehicle.model} ({order.vehicle.grade})
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Chassis: {order.vehicle.vinChassis} · Allocated Dealer: <strong className="text-slate-800">{order.dealerName}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                    <Ship className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.vesselName} ({order.voyageNumber})</span>
                  </div>
                  <div className="text-slate-500">
                    ETA Delivery: <strong className="text-slate-900 font-mono">{order.etaDeliveryDate}</strong>
                  </div>
                  <div className="text-slate-900 font-mono font-bold text-sm">
                    ${order.priceBreakdown.totalBuyPriceNZD.toLocaleString()} NZD
                  </div>
                </div>
              </div>

              {/* 9-Stage Milestone Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Logistics Journey</span>
                  <span className="font-mono text-[#E11D48] normal-case font-semibold">
                    Current: {order.currentMilestone}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {MILESTONE_SEQUENCE.map((stage, idx) => {
                    const milestoneObj = order.milestones.find((m) => m.key === stage.key);
                    const isDone = !!milestoneObj?.completedAt;
                    const isCurrent = order.currentMilestone === stage.key;

                    return (
                      <div
                        key={stage.key}
                        className={`p-2 rounded-xl text-center text-[10px] border transition-all ${
                          isDone
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                            : isCurrent
                            ? "bg-[#E11D48] text-white border-[#E11D48] font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        <div className="truncate">{stage.label}</div>
                        <div className="text-[9px] mt-0.5 font-mono opacity-80">
                          {isDone ? "Done" : isCurrent ? "Active" : `Step ${idx + 1}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Cost Alert (If flagged) */}
              {order.additionalCosts.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Compliance Variation Attached ({order.additionalCosts[0].status})</span>
                    </div>
                    <span className="font-mono font-bold text-rose-950 text-sm">
                      +${order.additionalCosts[0].amountNZD.toLocaleString()} NZD
                    </span>
                  </div>
                  <p className="text-rose-800 text-[11px] leading-relaxed">
                    {order.additionalCosts[0].description}
                  </p>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="text-slate-500 text-[11px]">
                  Carrier notes: <span className="text-slate-700 font-medium">Standard Yokohama coastal departure confirmed.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForCost(order)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Attach Variation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audio.playSubtleClick();
                      setEditingMilestoneOrderId(isEditingThis ? null : order.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Advance Milestone</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Advance Milestone Inline Drawer */}
              {isEditingThis && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in text-xs">
                  <div className="font-bold text-slate-900">
                    Advance Order Milestone for {order.orderNumber}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Select Destination Milestone
                      </label>
                      <select
                        value={nextMilestoneKey}
                        onChange={(e) => setNextMilestoneKey(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="NZ_BORDER_PROCESSING">NZ Border Processing</option>
                        <option value="COMPLIANCE">MR2A Compliance Inspection</option>
                        <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                        <option value="DELIVERED">Delivered to Dealership Yard</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Carrier Milestone Notes
                      </label>
                      <input
                        type="text"
                        value={milestoneNotes}
                        onChange={(e) => setMilestoneNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingMilestoneOrderId(null)}
                      className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdvanceMilestone(order.id)}
                      className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold"
                    >
                      Confirm Milestone Advance
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Cost Creator Modal */}
      <AdditionalCostCreatorModal
        order={selectedOrderForCost}
        onClose={() => setSelectedOrderForCost(null)}
        onSubmit={handleCostCreated}
      />
    </div>
  );
}
