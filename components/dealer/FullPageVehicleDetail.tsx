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
  ExternalLink,
  BatteryCharging,
  Radio,
  Clock,
  Info,
  MapPin,
  Check,
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
  const { currentDealer } = useAuth();
  const dealerZone = currentDealer?.pricingZoneId || "ZONE_1";

  // Find vehicle from live programme context
  const vehicle =
    vehicleData ||
    vehicles.find((v) => v.id === vehicleId) ||
    vehicles[0] ||
    MOCK_VEHICLES[0];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"SPECS" | "INSPECTION" | "COMPLIANCE" | "MARKET">("SPECS");
  const [activeTimeframe, setActiveTimeframe] = useState<"1W" | "1M" | "3M" | "6M" | "1Y">("6M");

  const handleBack = () => {
    audio.playSubtleClick();
    if (onBack) {
      onBack();
    } else {
      router.push("/");
    }
  };

  const price: LandedPriceBreakdown = calculateLandedPrice(vehicle.fobPriceJPY, dealerZone);
  const retailEstimateNZD = Math.round(price.totalBuyPriceNZD * 1.28);
  const dealerMarginNZD = retailEstimateNZD - price.totalBuyPriceNZD;
  const marginPercentage = ((dealerMarginNZD / price.totalBuyPriceNZD) * 100).toFixed(1);

  const costBreakdownItems = [
    {
      label: "FOB Export Acquisition",
      amount: price.fobNZD,
      sublabel: `¥${vehicle.fobPriceJPY.toLocaleString()} JPY Converted`,
      percentage: Math.round((price.fobNZD / price.totalBuyPriceNZD) * 100),
      color: "bg-slate-900",
    },
    {
      label: "RoRo Ocean Freight",
      amount: price.oceanFreightNZD,
      sublabel: "Yokohama to Ports of Auckland",
      percentage: Math.round((price.oceanFreightNZD / price.totalBuyPriceNZD) * 100),
      color: "bg-blue-600",
    },
    {
      label: "NZ Customs & 15% GST",
      amount: price.customsProcessingNZD + price.gstNZD,
      sublabel: "Cleared border biosecurity entry",
      percentage: Math.round(((price.customsProcessingNZD + price.gstNZD) / price.totalBuyPriceNZD) * 100),
      color: "bg-emerald-600",
    },
    {
      label: "MR2A Compliance & Towing",
      amount: price.complianceInspectionNZD + price.zoneDeliveryNZD + price.programmeFeeNZD,
      sublabel: `${dealerZone} delivery + MR2A entry pass`,
      percentage: Math.round(
        ((price.complianceInspectionNZD + price.zoneDeliveryNZD + price.programmeFeeNZD) / price.totalBuyPriceNZD) * 100
      ),
      color: "bg-[#E11D48]",
    },
  ];

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
            <span className="text-slate-900 font-semibold">{vehicle.model}</span>
            <span>/</span>
            <span className="font-mono text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border border-slate-200">
              {vehicle.stockId}
            </span>
          </div>
        </div>

        {/* Right: Pricing Tier Badge & Quick Reserve */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pricing Profile:
            </span>
            <span className="font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200/80">
              {dealerZone} Guaranteed Landed
            </span>
          </div>

          {vehicle.status === "AVAILABLE" ? (
            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                setIsReserveModalOpen(true);
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] text-white text-xs font-extrabold transition-all shadow-[0_3px_12px_rgba(225,29,72,0.28)] hover:shadow-[0_4px_16px_rgba(225,29,72,0.38)] active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Reserve (24h Hold)</span>
            </button>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Currently Reserved</span>
            </span>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Top Hero Stage: Clean Studio Showcase + Acquisition     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ───────────────────────────────────────────────────────── */}
        {/* LEFT COLUMN: Clean Edge-to-Edge Vehicle Showcase          */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-3">
          {/* Main Vehicle Photo */}
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs">
            <img
              src={vehicle.images[activeImageIdx] || vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover select-none transition-all duration-300"
            />

            {/* Gradient Overlay for Crisp Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Top-Left: Auction Grade */}
            <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-amber-300 font-mono text-xs font-bold border border-white/10 shadow-xs flex items-center gap-1.5">
              <span>★</span>
              <span>Grade {vehicle.auctionGrade} / {vehicle.interiorGrade}</span>
            </div>

            {/* Top-Right: Export Yard Origin */}
            <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-slate-200 text-xs font-medium border border-white/10 shadow-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{vehicle.location.split("(")[0].trim()}</span>
            </div>

            {/* Bottom-Left: Stock Code */}
            <div className="absolute bottom-3.5 left-3.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-mono font-bold text-white border border-white/15">
              {vehicle.stockId}
            </div>

            {/* Bottom-Right: Radiation Passed */}
            <div className="absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Radiation &lt;0.08 μSv/h Passed</span>
            </div>

            {vehicle.status !== "AVAILABLE" && (
              <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center">
                <div className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-slate-700">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>24-Hour Atomic Hold Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Clean Thumbnails Carousel Strip */}
          <div className="flex items-center gap-2.5">
            {vehicle.images.slice(0, 5).map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  audio.playSubtleClick();
                  setActiveImageIdx(idx);
                }}
                className={`relative flex-1 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImageIdx === idx
                    ? "border-[#E11D48] ring-2 ring-[#E11D48]/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="Angle preview" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* RIGHT COLUMN: Clean Commercial Acquisition Terminal       */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
            {/* Header: Title, Specs & VIN */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>{vehicle.year} · {vehicle.transmission}</span>
                <span className="font-mono text-slate-500 font-semibold">{vehicle.vinChassis}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {vehicle.make} {vehicle.model}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-2 flex-wrap">
                <span>{vehicle.grade}</span>
                <span className="text-slate-300">•</span>
                <span>{vehicle.odometerKm.toLocaleString()} km</span>
                <span className="text-slate-300">•</span>
                <span>{vehicle.fuelType}</span>
                <span className="text-slate-300">•</span>
                <span>{vehicle.color}</span>
              </div>
            </div>

            {/* Landed Pricing & Retail Margin Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Guaranteed Landed Price ({dealerZone})
                  </span>
                  <div className="text-3xl font-black font-mono tracking-tight text-slate-900 mt-0.5">
                    ${price.totalBuyPriceNZD.toLocaleString()}
                    <span className="text-xs text-slate-500 font-normal ml-1">NZD</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-medium text-slate-400 block">Est. Retail Margin</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    +${dealerMarginNZD.toLocaleString()} ({marginPercentage}%)
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span>Est. NZ Retail: <strong>${retailEstimateNZD.toLocaleString()} NZD</strong></span>
                <span className="text-emerald-600 font-medium">✓ 15% GST &amp; MR2A included</span>
              </div>
            </div>

            {/* Itemized Cost Breakdown (Clean 2-Column Table) */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Itemized Landed Cost Breakdown
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {costBreakdownItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-medium block truncate">
                      {item.label}
                    </span>
                    <strong className="text-xs font-mono font-bold text-slate-800 block mt-0.5">
                      ${item.amount.toLocaleString()} NZD
                    </strong>
                    <span className="text-[10px] text-slate-500 block truncate">{item.sublabel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reserve Button CTA */}
            {vehicle.status === "AVAILABLE" ? (
              <button
                type="button"
                onClick={() => {
                  audio.playSubtleClick();
                  setIsReserveModalOpen(true);
                }}
                className="w-full py-3.5 px-5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Reserve Vehicle (24-Hour Atomic Hold)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed text-center flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Vehicle Currently Held by Network Dealer</span>
              </button>
            )}

            <p className="text-[11px] text-slate-400 text-center">
              Zero deposit required · Locks out other NZ franchise dealers for 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. Tabbed Specifications & Verification Terminal (Full Width) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
          {[
            { key: "SPECS", label: "Powertrain & Specs", icon: Zap },
            { key: "INSPECTION", label: "Auction Sheet & Inspection", icon: FileCheck2 },
            { key: "COMPLIANCE", label: "MR2A Compliance & Logistics", icon: Ship },
            { key: "MARKET", label: "NZ Retail Price Benchmark", icon: TrendingUp },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  audio.playSubtleClick();
                  setActiveTab(tab.key as any);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: POWERTRAIN & SPECS */}
        {activeTab === "SPECS" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200 text-xs">
            {/* Performance Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#E11D48]" />
                <span>Performance &amp; Powertrain</span>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Engine / System:</span>
                  <strong className="text-slate-900">{vehicle.fuelType} (HR12DE + EM47)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Engine Displacement:</span>
                  <strong className="text-slate-900 font-mono">{vehicle.engineCc || 1200} cc</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Power Output:</span>
                  <strong className="text-slate-900">100 kW (136 PS)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Instant Torque:</span>
                  <strong className="text-slate-900 font-mono">280 Nm</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Drivetrain:</span>
                  <strong className="text-slate-900">{vehicle.driveType}</strong>
                </div>
              </div>
            </div>

            {/* ADAS Safety & ProPILOT */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#E11D48]" />
                <span>ADAS &amp; Safety Systems</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 py-1 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ProPILOT Autonomous Highway Cruise</span>
                </div>
                <div className="flex items-center gap-2 py-1 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Intelligent Emergency Autonomous Braking</span>
                </div>
                <div className="flex items-center gap-2 py-1 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Around View 360° Monitor with Moving Detect</span>
                </div>
                <div className="flex items-center gap-2 py-1 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Lane Keep Assist &amp; Blind Spot Warning</span>
                </div>
                <div className="flex items-center gap-2 py-1 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full Curtain &amp; Front SRS Airbags (ANCAP 5-Star)</span>
                </div>
              </div>
            </div>

            {/* Interior & Equipment */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#E11D48]" />
                <span>Cockpit &amp; Equipment</span>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Interior Condition:</span>
                  <strong className="text-slate-900 font-mono">Grade {vehicle.interiorGrade} (Immaculate)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Infotainment:</span>
                  <strong className="text-slate-900">NissanConnect 9" Touchscreen</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Smartphone Link:</span>
                  <strong className="text-slate-900">Apple CarPlay / Android Auto</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Climate:</span>
                  <strong className="text-slate-900">Automatic Clean-Air Filter</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Keyless:</span>
                  <strong className="text-slate-900">Intelligent Key + Push Button</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INSPECTION & AUCTION SHEET */}
        {activeTab === "INSPECTION" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200 text-xs">
            {/* Condition Report Summary */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#E11D48]" />
                <span>Japan Export Auction Certificate Summary</span>
              </h4>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Overall Grade</span>
                  <strong className="text-lg font-mono font-black text-slate-900">
                    ★ {vehicle.auctionGrade}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Interior Grade</span>
                  <strong className="text-lg font-mono font-black text-slate-900">
                    {vehicle.interiorGrade}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Exterior Grade</span>
                  <strong className="text-lg font-mono font-black text-slate-900">
                    {vehicle.exteriorGrade}
                  </strong>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-slate-800 text-xs">Pre-Export Defect Log:</h5>
                <ul className="space-y-1.5">
                  {vehicle.knownDefects.map((defect, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{defect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Autohub Border Entry Verification Checklist</span>
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                  <div>
                    <strong className="text-slate-900 block">JEVIC Odometer Certification</strong>
                    <span className="text-[11px] text-slate-500 font-mono">Digital audit verified against Japan MLIT database</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    100% Passed
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                  <div>
                    <strong className="text-slate-900 block">MPI Biosecurity &amp; Cleanliness Pass</strong>
                    <span className="text-[11px] text-slate-500">Decontamination and high-pressure steam pre-treatment</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Certified
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                  <div>
                    <strong className="text-slate-900 block">Radiation Screening (&lt;0.08 μSv/h)</strong>
                    <span className="text-[11px] text-slate-500">Yokohama Port geiger scan before vessel loading</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Zero Detected
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPLIANCE & LOGISTICS */}
        {activeTab === "COMPLIANCE" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Ship className="w-4 h-4 text-blue-600" />
                <span>Ocean RoRo Logistics Schedule</span>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Departure Port:</span>
                  <strong className="text-slate-900">Yokohama RoRo Terminal, Japan</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Destination Port:</span>
                  <strong className="text-slate-900">Ports of Auckland (Fergusson Wharf)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Assigned RoRo Carrier:</span>
                  <strong className="text-slate-900 font-mono">Trans-Pacific V.48 (Vessel TP-2648)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Estimated Transit Time:</span>
                  <strong className="text-slate-900">14 Days Direct Voyage</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Customs Release:</span>
                  <strong className="text-slate-900">Autohub Direct Bond Clearance</strong>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>MR2A Entry Certification (NZTA Pass)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Standard entry compliance pass (MR2A certification) is fully included in the guaranteed landed price. This covers:
              </p>
              <ul className="space-y-1.5 pt-1">
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Full physical brake roller &amp; suspension testing</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Warrant of Fitness (WoF) 1-year issue</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>MR2A form registered directly in NZTA Landata database</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>2 Metro Tow Moves (Port to Center, Center to Dealership)</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 4: NZ RETAIL BENCHMARK CURVE */}
        {activeTab === "MARKET" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Historical NZ Retail Market Price Curve
                </h4>
                <p className="text-xs text-slate-500">
                  Trading data for verified {vehicle.year} {vehicle.make} {vehicle.model} units across NZ dealer networks.
                </p>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                {(["1W", "1M", "3M", "6M", "1Y"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      audio.playSubtleClick();
                      setActiveTimeframe(t);
                    }}
                    className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                      activeTimeframe === t
                        ? "bg-[#E11D48] text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimal Line Chart Container */}
            <div className="p-6 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-3">
              <div className="h-48 w-full relative">
                {/* Y-Axis Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-300">
                  <div className="w-full flex justify-between"><span>$38k</span></div>
                  <div className="w-full flex justify-between"><span>$35k</span></div>
                  <div className="w-full flex justify-between"><span>$32k</span></div>
                  <div className="w-full flex justify-between"><span>$29k</span></div>
                  <div className="w-full flex justify-between"><span>$26k</span></div>
                </div>

                {/* SVG Line Graph */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 340 160" fill="none">
                  {/* Trend Line (Crimson Brand Color) */}
                  <path
                    d="M 10 130 L 70 120 L 140 100 L 210 50 L 280 70"
                    stroke="#E11D48"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Nodes */}
                  <circle cx="10" cy="130" r="3.5" fill="#E11D48" />
                  <circle cx="70" cy="120" r="3.5" fill="#E11D48" />
                  <circle cx="140" cy="100" r="3.5" fill="#E11D48" />
                  <circle cx="210" cy="50" r="5" fill="#E11D48" />
                  <circle cx="280" cy="70" r="3.5" fill="#E11D48" />

                  {/* Vertical Marker Line */}
                  <line x1="210" y1="20" x2="210" y2="155" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                </svg>

                {/* Black Marker Tag: Retail Estimate */}
                <div className="absolute top-10 left-[62%] -translate-x-1/2 px-3 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold shadow-md">
                  ${retailEstimateNZD.toLocaleString()} NZD
                </div>
              </div>

              {/* X-Axis Month Labels */}
              <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
                <span>Oct 2025</span>
                <span>Nov 2025</span>
                <span>Dec 2025</span>
                <span>Jan 2026</span>
                <span>Feb 2026</span>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Average Days to Sell</span>
                <strong className="text-lg font-bold text-slate-900 block mt-0.5">18 Days</strong>
                <span className="text-[10px] text-emerald-600 font-semibold">Fast turnover model</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">NZ Market Demand</span>
                <strong className="text-lg font-bold text-emerald-700 block mt-0.5">High (Tier 1)</strong>
                <span className="text-[10px] text-slate-500">Popular NZ commuter choice</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Your Gross Profit</span>
                <strong className="text-lg font-bold text-[#E11D48] font-mono block mt-0.5">
                  +${dealerMarginNZD.toLocaleString()} NZD
                </strong>
                <span className="text-[10px] text-[#E11D48] font-semibold">+{marginPercentage}% Mark-up</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Atomic Reservation Modal */}
      <AtomicReservationModal
        vehicle={isReserveModalOpen ? vehicle : null}
        onClose={() => setIsReserveModalOpen(false)}
        onSuccess={(vId) => {
          atomicReserve(vId, currentDealer?.id || "DEALER_001");
          setIsReserveModalOpen(false);
          handleBack();
        }}
      />
    </div>
  );
}
