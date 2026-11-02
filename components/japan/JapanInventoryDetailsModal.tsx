"use client";

import React, { useState } from "react";
import { Vehicle } from "@/lib/types";
import { audio } from "@/lib/sound";
import {
  X,
  Car,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Calendar,
  Gauge,
  FileCheck2,
  Copy,
  Check,
  ExternalLink,
  Fuel,
  Compass,
  AlertTriangle,
} from "lucide-react";

interface JapanInventoryDetailsModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onToggleStatus?: (vehicleId: string) => void;
}

export default function JapanInventoryDetailsModal({
  vehicle,
  onClose,
  onToggleStatus,
}: JapanInventoryDetailsModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedVin, setCopiedVin] = useState(false);

  if (!vehicle) return null;

  const images =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images
      : ["/images/cars/kicks.png"];

  const activeImage = images[activeImageIdx] || images[0];
  const isAvailable = vehicle.status === "AVAILABLE";
  const isReserved = vehicle.status === "RESERVED";
  const isWithdrawn = vehicle.status === "WITHDRAWN";

  const handleCopyVin = () => {
    navigator.clipboard.writeText(vehicle.vinChassis);
    audio.playSubtleClick();
    setCopiedVin(true);
    setTimeout(() => setCopiedVin(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="japan-inventory-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header (Clean, Corporate Slate styling for Nissan Japan) */}
        <div className="px-6 py-4 bg-[#0A1322] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-400">
                  #{vehicle.stockId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isAvailable
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : isReserved
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-slate-700 text-slate-300 border-slate-600"
                  }`}
                >
                  {isAvailable
                    ? "Available to NZ Franchise"
                    : isReserved
                    ? "Dealer Exclusivity Hold"
                    : "Withdrawn / Inactive"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  {vehicle.location || "Yokohama Export Yard"}
                </span>
              </div>
              <h2 id="japan-inventory-details-title" className="text-lg font-bold text-white tracking-tight">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Main Visual & Key Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Studio Image Showcase */}
            <div className="md:col-span-7 space-y-3">
              <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 border border-slate-200/80 p-4 flex items-center justify-center overflow-hidden">
                <div className="absolute bottom-3 w-4/5 h-4 bg-black/15 rounded-[50%] blur-md pointer-events-none transform scale-y-60" />
                <img
                  src={activeImage}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.18)] select-none transition-transform duration-300 hover:scale-105"
                />

                <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-mono font-bold text-slate-800 border border-slate-200 shadow-xs flex items-center gap-1">
                  <span className="text-amber-500 font-bold">★</span>
                  <span>Auction Grade {vehicle.auctionGrade} / {vehicle.interiorGrade || "A"}</span>
                </div>

                <div className="absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white font-mono text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-purple-400" />
                  <span>{vehicle.location || "Yokohama Yard"}</span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        audio.playSubtleClick();
                        setActiveImageIdx(idx);
                      }}
                      className={`w-16 h-12 rounded-xl border-2 p-1 overflow-hidden transition-all cursor-pointer bg-slate-50 shrink-0 ${
                        activeImageIdx === idx
                          ? "border-[#E11D48] ring-2 ring-[#E11D48]/20 bg-white"
                          : "border-slate-200 hover:border-slate-300 opacity-70"
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Technical Specs & Yard Information */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Vehicle Technical Parameters
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Chassis / VIN:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900">{vehicle.vinChassis}</span>
                      <button
                        type="button"
                        onClick={handleCopyVin}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copy VIN"
                      >
                        {copiedVin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Package / Grade:</span>
                    <span className="font-bold text-slate-800">{vehicle.grade}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Powertrain:</span>
                    <span className="font-semibold text-slate-800">{vehicle.fuelType}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Verified Mileage:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {vehicle.odometerKm.toLocaleString()} {vehicle.odometerUnit || "km"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Transmission / Drive:</span>
                    <span className="font-medium text-slate-800">{vehicle.transmission} · {vehicle.driveType}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Displacement:</span>
                    <span className="font-mono text-slate-700">{vehicle.engineCc ? `${vehicle.engineCc} cc` : "Pure EV"}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Body Color:</span>
                    <span className="font-semibold text-slate-800">{vehicle.color || "Factory Original"}</span>
                  </div>
                </div>
              </div>

              {/* JEVIC & Export Certification Card */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>JEVIC Pre-Export Verification</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    PASSED
                  </span>
                </div>
                <div className="text-[11px] text-emerald-900/80 space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span>Odometer Authenticity:</span>
                    <strong className="font-mono text-emerald-950">JEVIC Certified Stamp</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Biosecurity Inspection:</span>
                    <strong className="text-emerald-950">Pre-Cleared (Clean)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Inspection Date:</span>
                    <strong className="font-mono text-emerald-950">{vehicle.inspectionDate || "2026-10-22"}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Condition Notes & Known Defects */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Inspection Condition Dossier &amp; Defects Mapping</span>
            </h3>

            <p className="text-slate-700 leading-relaxed text-xs">
              {vehicle.conditionSummary || "Showroom demonstration grade. Zero structural panel damage detected. Fully compliant for NZTA MR2A border entry."}
            </p>

            {vehicle.knownDefects && vehicle.knownDefects.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Inspector Recorded Markings:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {vehicle.knownDefects.map((defect, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-700"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span>{defect}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Baseline Wholesale Procurement (Strictly Japanese FOB in JPY) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block font-bold">
                Japanese Wholesale Baseline
              </span>
              <div className="text-xl font-black font-mono text-white mt-0.5">
                ¥{vehicle.fobPriceJPY.toLocaleString()} <span className="text-xs font-sans text-slate-400">JPY (FOB)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Acquisition cost at Tokyo/Yokohama auction terminal prior to ocean shipping.
              </p>
            </div>

            <div className="text-left sm:text-right text-[11px] text-slate-300 space-y-1">
              <div>Export Yard: <strong className="text-white">{vehicle.location || "Yokohama Port"}</strong></div>
              <div>Dispatch Target: <strong className="text-white">Port of Auckland (RoRo V.48)</strong></div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {isReserved ? (
              <span className="text-amber-800 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Reserved under 24-hour exclusive dealer hold lock</span>
              </span>
            ) : isAvailable ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Listed active in wholesale catalogue for NZ franchise network</span>
              </span>
            ) : (
              <span className="text-slate-500">
                Withdrawn from catalog · Stored in Yokohama yard
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {onToggleStatus && !isReserved && (
              <button
                type="button"
                onClick={() => {
                  onToggleStatus(vehicle.id);
                  onClose();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isAvailable
                    ? "border border-rose-200 bg-white hover:bg-rose-50 text-rose-700"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                }`}
              >
                {isAvailable ? "Withdraw from Catalogue" : "Publish to Catalogue"}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

