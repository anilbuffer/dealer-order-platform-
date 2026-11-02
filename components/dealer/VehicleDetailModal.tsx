"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Vehicle, LandedPriceBreakdown } from "@/lib/types";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
import {
  X,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Gauge,
  Zap,
  ChevronRight,
  Info,
  Car,
} from "lucide-react";

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onReserveClick: (vehicle: Vehicle) => void;
}

export default function VehicleDetailModal({
  vehicle,
  onClose,
  onReserveClick,
}: VehicleDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!vehicle) return null;

  // Calculate landed price for Auckland Dealer (Zone 1)
  const price: LandedPriceBreakdown = calculateLandedPrice(vehicle.fobPriceJPY, "ZONE_1");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-hover border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#0A1322] text-white flex items-center justify-between border-b border-[#1B2A42] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-300">
              {vehicle.stockId}
            </span>
            <span className="text-xs text-slate-400">VIN Chassis: {vehicle.vinChassis}</span>
          </div>

          <button
            onClick={() => {
              audio.playSubtleClick();
              onClose();
            }}
            aria-label="Close vehicle details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1B2A42] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Header Title & Condition Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-crimson-600 uppercase tracking-wider">
                  {vehicle.year} · {vehicle.make}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{vehicle.location}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {vehicle.model} <span className="text-slate-500 font-normal">{vehicle.grade}</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Auction Grade
                </div>
                <div className="text-xl font-extrabold text-slate-900">{vehicle.auctionGrade}</div>
                <div className="text-[10px] text-slate-500">
                  Int {vehicle.interiorGrade} · Ext {vehicle.exteriorGrade}
                </div>
              </div>
            </div>
          </div>

          {/* Gallery & Quick Specs Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Photos (7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-soft">
                <img
                  src={vehicle.images[activeImageIdx] || vehicle.images[0]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                  Photo {activeImageIdx + 1} of {vehicle.images.length}
                </div>
              </div>

              {vehicle.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {vehicle.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        audio.playSubtleClick();
                        setActiveImageIdx(idx);
                      }}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIdx === idx ? "border-crimson-600 ring-2 ring-crimson-500/20" : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Technical Specification Grid (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-50/70 rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Vehicle Specifications
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">Odometer</span>
                  <strong className="text-slate-900 font-bold text-sm">
                    {vehicle.odometerKm.toLocaleString()} km
                  </strong>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">Transmission</span>
                  <strong className="text-slate-900 font-bold text-sm">
                    {vehicle.transmission}
                  </strong>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">Powertrain</span>
                  <strong className="text-slate-900 font-bold text-sm">{vehicle.fuelType}</strong>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">Drive Layout</span>
                  <strong className="text-slate-900 font-bold text-sm">{vehicle.driveType}</strong>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">Color Finish</span>
                  <strong className="text-slate-900 font-bold text-sm">{vehicle.color}</strong>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">Displacement</span>
                  <strong className="text-slate-900 font-bold text-sm">
                    {vehicle.engineCc > 0 ? `${vehicle.engineCc} cc` : "Pure EV"}
                  </strong>
                </div>
              </div>

              {/* Inspection notes */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Yokohama Yard Inspection Notes</span>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  {vehicle.knownDefects.map((defect, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>{defect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Landed Pricing Breakdown (US-11 Commercial Boundary) */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-soft">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pricing Schedule · Auckland Dealership
                </span>
                <h3 className="text-base font-bold text-white">
                  Guaranteed Landed Total Buy Price:{" "}
                  <span className="text-emerald-400 font-mono">
                    ${price.totalBuyPriceNZD.toLocaleString()} NZD
                  </span>
                </h3>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-medium">
                Zone 1 Fixed Rate
              </span>
            </div>

            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-slate-100">
              <div>
                <span className="text-slate-400 text-[11px] block">Vehicle FOB Cost (Japan)</span>
                <span className="font-semibold text-slate-900">
                  ¥{vehicle.fobPriceJPY.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  (${price.fobNZD.toLocaleString()} NZD)
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">RoRo Ocean Shipment</span>
                <span className="font-semibold text-slate-900">
                  ${price.oceanFreightNZD.toLocaleString()} NZD
                </span>
                <span className="text-[10px] text-slate-400 block">Yokohama $\rightarrow$ Auckland</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Customs & Entry GST</span>
                <span className="font-semibold text-slate-900">
                  ${(price.customsProcessingNZD + price.gstNZD).toLocaleString()} NZD
                </span>
                <span className="text-[10px] text-slate-400 block">15% GST + Clearances</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Compliance & Zone 1 Moves</span>
                <span className="font-semibold text-slate-900">
                  ${(price.complianceInspectionNZD + price.zoneDeliveryNZD + price.programmeFeeNZD).toLocaleString()} NZD
                </span>
                <span className="text-[10px] text-emerald-600 block">MR2A pass + 2 deliveries</span>
              </div>
            </div>

            {/* Commercial boundary reminder */}
            <div className="p-4 bg-slate-50 text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                <strong>Commercial Boundary Disclosure:</strong> This fixed price includes standard compliance pass (MR2A) and two standard NZ carrier movements to your registered dealership address. Any remedial repair work required to pass compliance will be evidenced and approved by you separately before work commences.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom CTA Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[11px] text-slate-500">Landed Auckland Buy Price</div>
            <div className="text-xl font-extrabold text-slate-900 font-mono">
              ${price.totalBuyPriceNZD.toLocaleString()} <span className="text-xs text-slate-500 font-normal">NZD</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                audio.playSubtleClick();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Back to Catalog
            </button>

            {vehicle.status === "AVAILABLE" ? (
              <button
                onClick={() => {
                  audio.playSubtleClick();
                  onReserveClick(vehicle);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold transition-all shadow-soft shadow-crimson-600/20 group cursor-pointer"
              >
                <span>Reserve Vehicle Now</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : (
              <span className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                Vehicle Reserved by Dealer
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

