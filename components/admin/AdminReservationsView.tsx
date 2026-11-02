"use client";

import React, { useState } from "react";
import { useProgramme } from "@/lib/programme-context";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
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
} from "lucide-react";

interface AdminReservationsViewProps {
  onNavigateTab?: (tabId: string) => void;
}

export default function AdminReservationsView({ onNavigateTab }: AdminReservationsViewProps) {
  const { vehicles, dealers, confirmAllocation, releaseHold } = useProgramme();
  const [notification, setNotification] = useState<string | null>(null);

  const heldVehicles = vehicles.filter((v) => v.status === "RESERVED");

  const handleConfirmHold = (vehicleId: string) => {
    audio.playSuccessChime();
    confirmAllocation(vehicleId);
    setNotification(`Allocation confirmed for vehicle ${vehicleId}. Transferred to Orders pipeline.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReleaseHold = (vehicleId: string) => {
    audio.playSubtleClick();
    releaseHold(vehicleId);
    setNotification(`Reservation hold released for vehicle ${vehicleId}. Returned to available stock.`);
    setTimeout(() => setNotification(null), 4000);
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
              ● Atomic Locks Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reservations &amp; 24-Hour Atomic Holds
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee franchise dealer time-locked inventory reservations, manage 24h countdown expirations, and confirm wholesale allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-mono">
            {heldVehicles.length} Active {heldVehicles.length === 1 ? "Hold" : "Holds"}
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
      {/* 2. Active Reservation Queue                                */}
      {/* ─────────────────────────────────────────────────────────── */}
      {heldVehicles.length === 0 ? (
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
          {heldVehicles.map((vehicle) => {
            const dealer = dealers.find((d) => d.id === vehicle.reservedByDealerId);
            const zone = dealer?.pricingZoneId || "ZONE_1";
            const price = calculateLandedPrice(vehicle.fobPriceJPY, zone);

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-6 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Vehicle & Image Info */}
                <div className="flex items-center gap-5 min-w-0">
                  <div className="relative w-28 h-20 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200/80 p-2 flex items-center justify-center shrink-0">
                    <img
                      src={vehicle.images[0]}
                      alt={vehicle.model}
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>24h Lock Active</span>
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 truncate">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>

                    <p className="text-xs text-slate-500 truncate">
                      {vehicle.grade} · {vehicle.fuelType} · {vehicle.transmission} · {vehicle.odometerKm.toLocaleString()} km
                    </p>
                  </div>
                </div>

                {/* Dealership & Commercial Data */}
                <div className="flex flex-wrap items-center gap-6 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Reserved Dealership
                    </span>
                    <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                      {dealer?.legalTradingName || "Franchise Dealer"}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {dealer?.dealerCode || vehicle.reservedByDealerId} · {zone}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Guaranteed Landed Price
                    </span>
                    <span className="font-mono font-black text-slate-900 text-sm block">
                      ${price.totalBuyPriceNZD.toLocaleString()} NZD
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ¥{vehicle.fobPriceJPY.toLocaleString()} FOB
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleConfirmHold(vehicle.id)}
                      className="px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Order</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReleaseHold(vehicle.id)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Unlock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Release Hold</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

