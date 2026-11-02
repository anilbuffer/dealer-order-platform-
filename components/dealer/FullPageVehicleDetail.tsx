"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Vehicle, LandedPriceBreakdown } from "@/lib/types";
import { useProgramme } from "@/lib/programme-context";
import { useAuth } from "@/lib/auth-context";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
import AtomicReservationModal from "./AtomicReservationModal";
import {
  ArrowLeft,
  Gauge,
  Zap,
  Calendar,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  Car,
  TrendingUp,
  Ship,
  FileCheck2,
  FileText,
  Sparkles,
  MapPin,
  Check,
  ChevronDown,
  Download,
  ShieldAlert,
  HelpCircle,
  Radio,
  SlidersHorizontal,
} from "lucide-react";

interface FullPageVehicleDetailProps {
  vehicleId?: string;
  vehicleData?: Vehicle;
  onBack?: () => void;
}

export default function FullPageVehicleDetail({
  vehicleId,
  vehicleData,
  onBack,
}: FullPageVehicleDetailProps) {
  const router = useRouter();
  const { vehicles, reserveVehicle: atomicReserve } = useProgramme();
  const { currentDealer, currentUser } = useAuth();
  const isAdmin = currentUser?.role === "AUTOHUB_ADMIN";
  const dealerZone = currentDealer?.pricingZoneId || "ZONE_1";

  // Find vehicle from live programme context
  const rawVehicle =
    vehicleData ||
    vehicles.find((v) => v.id === vehicleId) ||
    vehicles[0] ||
    MOCK_VEHICLES[0];

  // Guarantee transparent studio PNG cutouts from MOCK_VEHICLES always take precedence
  const mockMatch = MOCK_VEHICLES.find((m) => m.id === rawVehicle.id);
  const vehicle = {
    ...rawVehicle,
    images: mockMatch?.images || rawVehicle.images,
  };

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  // Specifications Accordions state (PERFORMANCE open by default matching reference)
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    PERFORMANCE: true,
    INSPECTION: false,
    SAFETY: false,
    COMPLIANCE: false,
    DIMENSIONS: false,
  });

  const toggleAccordion = (key: string) => {
    audio.playSubtleClick();
    setOpenAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBack = () => {
    audio.playSubtleClick();
    if (onBack) {
      onBack();
    } else {
      router.push("/dealer/stocks");
    }
  };

  const price: LandedPriceBreakdown = calculateLandedPrice(vehicle.fobPriceJPY, dealerZone);
  const retailEstimateNZD = Math.round(price.totalBuyPriceNZD * 1.28);
  const dealerMarginNZD = retailEstimateNZD - price.totalBuyPriceNZD;
  const marginPercentage = ((dealerMarginNZD / price.totalBuyPriceNZD) * 100).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Portal Navigation & Action Bar                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Back button & Breadcrumbs */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Stock Catalog</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <button
              type="button"
              onClick={handleBack}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Stock Catalog
            </button>
            <span>/</span>
            <span className="text-slate-500">Nissan</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{vehicle.model}</span>
            <span>/</span>
            <span className="font-mono text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border border-slate-200">
              #{vehicle.stockId}
            </span>
          </div>
        </div>

        {/* Right: Clean Status & Pricing Tier Profile */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile:</span>
            <span className="text-slate-800">{dealerZone} Landed</span>
          </div>

          {vehicle.status === "AVAILABLE" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for Allocation</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Active 24-Hour Hold</span>
            </span>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Top Stage: Studio Vehicle View + Acquisition Card        */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ───────────────────────────────────────────────────────── */}
        {/* LEFT COLUMN: Vehicle Presentation + 4 Quick Spec Badges   */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Main Vehicle Studio Showcase */}
          <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100/70 border border-slate-200/80 shadow-md group flex items-center justify-center p-6">
            {/* Realistic studio floor contact shadow directly beneath tires */}
            <div className="absolute bottom-6 w-4/5 h-6 bg-black/15 rounded-[50%] blur-lg pointer-events-none transform scale-y-50" />

            <img
              src={vehicle.images[activeImageIdx] || vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              className={`w-full h-full select-none transition-all duration-300 relative z-10 ${
                (vehicle.images[activeImageIdx] || vehicle.images[0]).endsWith('.png')
                  ? "object-contain filter drop-shadow-[0_16px_22px_rgba(0,0,0,0.16)] group-hover:scale-105"
                  : "object-cover rounded-2xl"
              }`}
            />

            {/* Top-Left: Auction Grade Pill */}
            <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 font-mono text-xs font-bold border border-slate-200/80 shadow-xs flex items-center gap-1.5">
              <span className="text-amber-500 font-bold">★</span>
              <span>Grade {vehicle.auctionGrade} / {vehicle.interiorGrade}</span>
            </div>

            {/* Top-Right: Photo Index Counter */}
            <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-700 font-mono text-[11px] font-bold border border-slate-200/80 shadow-xs">
              {activeImageIdx + 1} / {Math.min(vehicle.images.length, 5)} Photos
            </div>

            {vehicle.status !== "AVAILABLE" && (
              <div className="absolute inset-0 z-30 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center">
                <div className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-slate-700">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>24-Hour Atomic Hold Active</span>
                </div>
              </div>
            )}
          </div>

          {/* 4-Badge Pill Row (Exactly directly below vehicle image as in reference!) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-2xs">
              <Car className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{vehicle.fuelType} · {vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-2xs">
              <Gauge className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono truncate">{vehicle.odometerKm.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">1 Japan Owner</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-2xs">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{vehicle.year} Registration</span>
            </div>
          </div>

          {/* Clean Compact Thumbnails Strip */}
          <div className="flex items-center gap-2 pt-1">
            {vehicle.images.slice(0, 8).map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  audio.playSubtleClick();
                  setActiveImageIdx(idx);
                }}
                className={`relative w-16 h-11 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-50 flex items-center justify-center p-1 shrink-0 ${activeImageIdx === idx
                    ? "border-[#E11D48] ring-2 ring-[#E11D48]/20 shadow-xs bg-white"
                    : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                  }`}
              >
                <img
                  src={img}
                  alt={`Angle preview ${idx + 1}`}
                  className={`w-full h-full ${img.endsWith('.png') ? 'object-contain filter drop-shadow-xs' : 'object-cover rounded-md'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* RIGHT COLUMN: Executive Wholesale Acquisition Card        */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
            {/* Header: Make & Model Title + Spec Subtitle */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span className="uppercase tracking-wider font-extrabold text-[#E11D48]">
                  Nissan Certified Pre-Owned
                </span>
                <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold border border-slate-200/60">
                  {vehicle.vinChassis}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {vehicle.make} - {vehicle.model}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {vehicle.grade} · {vehicle.engineCc || 2000}cc {vehicle.fuelType} · Auction Grade {vehicle.auctionGrade}
              </p>
            </div>

            {/* Landed Pricing Display */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                  ${price.totalBuyPriceNZD.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  NZD Guaranteed Landed ({dealerZone})
                </span>
              </div>
              {isAdmin ? (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mt-1">
                  <span>Japanese FOB Baseline: <strong className="text-slate-800">¥{vehicle.fobPriceJPY.toLocaleString()} JPY</strong></span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">Standard Fixed Landed Formula Applied</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Fixed commercial landed allocation price. Standard MR2A pass &amp; 15% GST fully covered.
                </p>
              )}
            </div>

            {/* Dealership Wholesale Margin Box (Adapted cleanly for B2B) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xs space-y-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Wholesale Economics
                  </span>
                  <div className="text-xl font-bold font-mono tracking-tight text-white mt-0.5">
                    ${price.totalBuyPriceNZD.toLocaleString()} <span className="text-xs font-normal text-slate-400">Landed</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-medium text-slate-400 block">Projected Dealer Margin</span>
                  <div className="inline-flex items-center gap-1 mt-0.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+${dealerMarginNZD.toLocaleString()} NZD ({marginPercentage}%)</span>
                  </div>
                </div>
              </div>

              {/* Progress Indicator for Margin */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Landed Buy: <strong className="text-white font-mono">${price.totalBuyPriceNZD.toLocaleString()}</strong></span>
                  <span>Est. NZ Retail: <strong className="text-emerald-400 font-mono">${retailEstimateNZD.toLocaleString()}</strong></span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden flex">
                  <div style={{ width: `${Math.round((price.totalBuyPriceNZD / retailEstimateNZD) * 100)}%` }} className="bg-[#E11D48] h-full" />
                  <div style={{ width: `${Math.round((dealerMarginNZD / retailEstimateNZD) * 100)}%` }} className="bg-emerald-500 h-full" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300/90 pt-2 border-t border-white/10">
                <span className="text-[11px] text-slate-400">
                  Delivery Zone: <strong className="text-white font-mono">{dealerZone}</strong>
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All duties &amp; MR2A pass included
                </span>
              </div>
            </div>

            {/* Primary Action Button (24-Hour Atomic Hold) */}
            <div className="space-y-2.5 pt-1">
              {vehicle.status === "AVAILABLE" ? (
                <button
                  type="button"
                  onClick={() => {
                    audio.playSubtleClick();
                    setIsReserveModalOpen(true);
                  }}
                  className="w-full py-4 px-5 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-black text-sm tracking-wide transition-all shadow-[0_4px_16px_rgba(225,29,72,0.35)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.45)] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Reserve Vehicle (24-Hour Atomic Hold)</span>
                </button>
              ) : (
                <div className="w-full py-4 px-5 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs text-center flex items-center justify-center gap-2 border border-slate-200">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Vehicle Held Under 24-Hour Network Lock</span>
                </div>
              )}

              {/* Trust Guarantee Badges */}
              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Zero initial deposit
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> 24h floorplan hold
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> 100% Fixed Landed Price
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. Bottom Stage: Specifications & Verification Documents   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Vehicle Specifications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive factory technical data, auction evaluation, and pre-export certification.
            </p>
          </div>

          {/* Official Verification Document Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                alert("Opening Japan Auction Sheet PDF for " + vehicle.stockId);
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Auction Sheet (PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                alert("Opening JEVIC Odometer Certificate for " + vehicle.stockId);
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>JEVIC Certificate</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
            {/* ACCORDION 1: PERFORMANCE (Open by default) */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleAccordion("PERFORMANCE")}
                className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-slate-900 hover:text-[#E11D48] transition-colors py-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#E11D48]" />
                  <span>PERFORMANCE &amp; POWERTRAIN</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openAccordion.PERFORMANCE ? "rotate-180 text-slate-900" : ""
                    }`}
                />
              </button>

              {openAccordion.PERFORMANCE && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 pt-3.5 pb-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">0–100 km/h</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">7.90 seconds</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Top Speed</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">185 km/h</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">System / Engine</span>
                    <strong className="text-slate-900 text-sm block mt-0.5 truncate">{vehicle.fuelType} (HR12DE + EM47)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Displacement</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">{vehicle.engineCc || 1200} cc</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Power Output</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">100 kW (136 PS)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Instant Torque</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">280 Nm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Drivetrain</span>
                    <strong className="text-slate-900 text-sm block mt-0.5">{vehicle.driveType}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Transmission</span>
                    <strong className="text-slate-900 text-sm block mt-0.5">{vehicle.transmission}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Fuel / Battery</span>
                    <strong className="text-slate-900 text-sm block mt-0.5">{vehicle.fuelType}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 2: JAPAN INSPECTION & CONDITION */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleAccordion("INSPECTION")}
                className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-slate-900 hover:text-[#E11D48] transition-colors py-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#E11D48]" />
                  <span>JAPAN INSPECTION &amp; CONDITION</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openAccordion.INSPECTION ? "rotate-180 text-slate-900" : ""
                    }`}
                />
              </button>

              {openAccordion.INSPECTION && (
                <div className="space-y-3 pt-3.5 pb-2 text-xs">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Auction Grade</span>
                      <strong className="text-base font-black text-slate-900 font-mono block mt-0.5">★ {vehicle.auctionGrade}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Interior Grade</span>
                      <strong className="text-base font-black text-slate-900 block mt-0.5">Grade {vehicle.interiorGrade}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Exterior Grade</span>
                      <strong className="text-base font-black text-slate-900 block mt-0.5">Grade {vehicle.exteriorGrade}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800">JEVIC Odometer Certification</span>
                      </div>
                      <span className="text-emerald-700 font-mono font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        100% Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800">Yokohama Port Radiation Screening (&lt;0.08 μSv/h)</span>
                      </div>
                      <span className="text-emerald-700 font-mono font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Zero Detected
                      </span>
                    </div>
                  </div>

                  {vehicle.knownDefects && vehicle.knownDefects.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Pre-Export Condition Log:</span>
                      <ul className="space-y-1">
                        {vehicle.knownDefects.map((defect, i) => (
                          <li key={i} className="flex items-center gap-2 text-slate-600 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{defect}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ACCORDION 3: SAFETY & ADAS */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleAccordion("SAFETY")}
                className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-slate-900 hover:text-[#E11D48] transition-colors py-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E11D48]" />
                  <span>SAFETY &amp; ADAS SPECIFICATIONS</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openAccordion.SAFETY ? "rotate-180 text-slate-900" : ""
                    }`}
                />
              </button>

              {openAccordion.SAFETY && (
                <div className="space-y-2 pt-3.5 pb-2 text-xs">
                  <div className="flex items-center gap-2.5 py-1 text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ProPILOT Autonomous Highway Cruise &amp; Steering Assist</span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1 text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Intelligent Emergency Autonomous Forward Braking</span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1 text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Around View 360° Monitor with Moving Object Detection</span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1 text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lane Departure Prevention &amp; Blind Spot Intervention</span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1 text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full Curtain &amp; Dual Front SRS Airbags (ANCAP 5-Star Equivalent)</span>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 4: COMPLIANCE & BORDER SPECIFICATIONS */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleAccordion("COMPLIANCE")}
                className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-slate-900 hover:text-[#E11D48] transition-colors py-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-[#E11D48]" />
                  <span>COMPLIANCE &amp; BORDER SPECIFICATIONS</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openAccordion.COMPLIANCE ? "rotate-180 text-slate-900" : ""
                    }`}
                />
              </button>

              {openAccordion.COMPLIANCE && (
                <div className="space-y-2 pt-3.5 pb-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Departure Port:</span>
                    <strong className="text-slate-900">Yokohama RoRo Terminal, Japan</strong>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Destination Port:</span>
                    <strong className="text-slate-900">Ports of Auckland (Fergusson Wharf)</strong>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">NZTA Entry Compliance:</span>
                    <strong className="text-emerald-700 font-semibold">MR2A Certification Pass Included</strong>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Warrant of Fitness:</span>
                    <strong className="text-slate-900">1-Year NZ WoF Issued</strong>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Biosecurity Clearance:</span>
                    <strong className="text-slate-900">MPI Decontaminated &amp; Steam Cleared</strong>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 5: DIMENSIONS & CAPACITIES */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleAccordion("DIMENSIONS")}
                className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-slate-900 hover:text-[#E11D48] transition-colors py-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#E11D48]" />
                  <span>DIMENSIONS &amp; CAPACITIES</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openAccordion.DIMENSIONS ? "rotate-180 text-slate-900" : ""
                    }`}
                />
              </button>

              {openAccordion.DIMENSIONS && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 pt-3.5 pb-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Length</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">4,770 mm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Width</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">1,740 mm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Height</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">1,865 mm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Wheelbase</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">2,860 mm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Curb Weight</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">1,670 kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Seating</span>
                    <strong className="text-slate-900 text-sm block mt-0.5">5–7 Seats</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Atomic Reservation Modal */}
      <AtomicReservationModal
        vehicle={isReserveModalOpen ? vehicle : null}
        onClose={() => setIsReserveModalOpen(false)}
        onSuccess={(vId) => {
          atomicReserve(
            vId,
            currentDealer?.id || "DEALER_001",
            currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email } : undefined
          );
          setIsReserveModalOpen(false);
          handleBack();
        }}
      />
    </div>
  );
}
