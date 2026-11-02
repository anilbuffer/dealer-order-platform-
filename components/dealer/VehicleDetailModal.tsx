"use client";

import React, { useState } from "react";
import { Vehicle, LandedPriceBreakdown } from "@/lib/types";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
import { X, ChevronRight, FileText } from "lucide-react";

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

  const price: LandedPriceBreakdown = calculateLandedPrice(vehicle.fobPriceJPY, "ZONE_1");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-hover border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#0A1322] text-white flex items-center justify-between border-b border-[#1B2A42] shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-slate-300 font-semibold">{vehicle.stockId}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-mono">{vehicle.vinChassis}</span>
          </div>

          <button
            onClick={() => {
              audio.playSubtleClick();
              onClose();
            }}
            aria-label="Close"
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">
                {vehicle.year} · {vehicle.transmission} · {vehicle.fuelType}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                {vehicle.make} {vehicle.model} <span className="text-slate-500 font-normal">{vehicle.grade}</span>
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Auction Grade
              </span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {vehicle.auctionGrade} <span className="text-xs font-normal text-slate-500">(Int {vehicle.interiorGrade} / Ext {vehicle.exteriorGrade})</span>
              </span>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={vehicle.images[activeImageIdx] || vehicle.images[0]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
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
                    className={`relative w-16 h-11 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIdx === idx ? "border-crimson-600" : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clean Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 text-[11px] block">Odometer</span>
              <strong className="text-slate-900 font-semibold">{vehicle.odometerKm.toLocaleString()} km</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 text-[11px] block">Drive Type</span>
              <strong className="text-slate-900 font-semibold">{vehicle.driveType}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 text-[11px] block">Color</span>
              <strong className="text-slate-900 font-semibold">{vehicle.color}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 text-[11px] block">Displacement</span>
              <strong className="text-slate-900 font-semibold">{vehicle.engineCc > 0 ? `${vehicle.engineCc} cc` : "Electric"}</strong>
            </div>
          </div>

          {/* Defect / Inspection Notes */}
          {vehicle.knownDefects.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-700 block">Inspection Notes:</span>
              <ul className="text-slate-600 space-y-0.5 list-disc list-inside text-[11px]">
                {vehicle.knownDefects.map((defect, i) => (
                  <li key={i}>{defect}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Premium Landed Cost Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Landed Cost Schedule (Zone 1 Auckland)</span>
              <span className="text-slate-500 font-mono text-[11px]">15% GST Included</span>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">FOB Acquisition</span>
                <span className="font-semibold text-slate-900 font-mono">${price.fobNZD.toLocaleString()} NZD</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">RoRo Freight</span>
                <span className="font-semibold text-slate-900 font-mono">${price.oceanFreightNZD.toLocaleString()} NZD</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Customs & GST</span>
                <span className="font-semibold text-slate-900 font-mono">${(price.customsProcessingNZD + price.gstNZD).toLocaleString()} NZD</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Compliance & Delivery</span>
                <span className="font-semibold text-slate-900 font-mono">${(price.complianceInspectionNZD + price.zoneDeliveryNZD + price.programmeFeeNZD).toLocaleString()} NZD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[11px] text-slate-500">Total Landed Buy Price</div>
            <div className="text-xl font-bold font-mono text-slate-900">
              ${price.totalBuyPriceNZD.toLocaleString()} <span className="text-xs text-slate-500 font-normal">NZD</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audio.playSubtleClick();
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {vehicle.status === "AVAILABLE" && (
              <button
                onClick={() => {
                  audio.playSubtleClick();
                  onReserveClick(vehicle);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Reserve Vehicle</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
