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
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Gauge,
  Zap,
  Calendar,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  Car,
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
  const [activeTimeframe, setActiveTimeframe] = useState<"1W" | "1M" | "3M" | "6M" | "1Y">("6M");
  const [selectedCostPart, setSelectedCostPart] = useState<number>(0);

  // Specifications Accordions (Matching FindAuto clean structure)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    performance: true,
    exterior: false,
    safety: false,
    technical: false,
    interior: false,
    dimensions: false,
  });

  const toggleSection = (key: string) => {
    audio.playSubtleClick();
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  const costBreakdownItems = [
    { label: "FOB Export Acquisition", amount: price.fobNZD, note: `¥${vehicle.fobPriceJPY.toLocaleString()} converted` },
    { label: "RoRo Ocean Freight", amount: price.oceanFreightNZD, note: "Yokohama to Ports of Auckland" },
    { label: "Customs & 15% NZ GST", amount: price.customsProcessingNZD + price.gstNZD, note: "Cleared border entry" },
    { label: "MR2A Compliance & Delivery", amount: price.complianceInspectionNZD + price.zoneDeliveryNZD + price.programmeFeeNZD, note: "Zone 1 metro delivery + 2 tow moves" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Internal Portal Navigation Bar                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Back button & Breadcrumb */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Stock</span>
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
            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
              {vehicle.stockId}
            </span>
          </div>
        </div>

        {/* Right: Pricing Tier Badge & Quick Reserve */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pricing Tier:
            </span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
              {dealerZone} Landed
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
      {/* 2. Main Vehicle Details Canvas (FindAuto Layout)            */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-xs space-y-10">
        {/* TOP SECTION: Hero Car Left + Landed Cost Options Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT COLUMN: Large Studio Car + Spec Row + Thumbnails */}
          <div className="lg:col-span-6 space-y-6">
            {/* Main Studio Car Showcase */}
            <div className="relative aspect-[16/10] w-full flex items-center justify-center p-6 bg-gradient-to-b from-slate-50/80 via-slate-100/40 to-slate-50/80 rounded-3xl border border-slate-200/80 overflow-hidden studio-pedestal">
              <img
                src={vehicle.images[activeImageIdx] || vehicle.images[0]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-contain studio-car-drop select-none transition-all duration-300"
              />

              {/* Auction Grade badge on image */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-xs font-bold shadow-md flex items-center gap-1">
                <span>★</span>
                <span>Grade {vehicle.auctionGrade}</span>
              </div>

              {vehicle.status !== "AVAILABLE" && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                  <span className="px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-xs shadow-md flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-400" />
                    Vehicle Held / Reserved (24h Lock)
                  </span>
                </div>
              )}
            </div>

            {/* 4 Micro Specs Strip with Icons (FindAuto Reference) */}
            <div className="grid grid-cols-4 gap-2 text-xs text-slate-600 px-1 py-1">
              <div className="flex items-center gap-1.5 truncate">
                <Zap className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{vehicle.transmission}</span>
              </div>

              <div className="flex items-center gap-1.5 truncate">
                <Gauge className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono truncate">{vehicle.odometerKm.toLocaleString()} km</span>
              </div>

              <div className="flex items-center gap-1.5 truncate">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">1 Japan Owner</span>
              </div>

              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{vehicle.year} Registration</span>
              </div>
            </div>

            {/* 5 Thumbnails Angle Strip */}
            <div className="flex items-center gap-3 pt-1">
              {vehicle.images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    audio.playSubtleClick();
                    setActiveImageIdx(idx);
                  }}
                  className={`relative flex-1 aspect-[16/11] rounded-2xl overflow-hidden border p-1.5 flex items-center justify-center cursor-pointer transition-all ${
                    activeImageIdx === idx
                      ? "border-[#E11D48] ring-2 ring-[#E11D48]/20 bg-rose-50/20"
                      : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                  }`}
                >
                  <img src={img} alt="Angle preview" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Title, Landed Price, Cost Card & CTA */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {vehicle.make} - {vehicle.model}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {vehicle.grade} · {vehicle.fuelType} · Chassis {vehicle.vinChassis} · Yokohama Direct Export
              </p>
            </div>

            {/* Big Bold Landed Price */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                ${price.totalBuyPriceNZD.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                for guaranteed landed price ({dealerZone} Delivery Included)
              </span>
            </div>

            {/* Finance Options / Landed Cost Breakdown Card (Nissan Brand Style) */}
            <div className="p-6 rounded-3xl border border-slate-200/90 bg-white shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Finance &amp; Landed Cost Schedule
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Left: Down Payment Ratio Crimson Polygon Visual */}
                <div className="sm:col-span-5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Down Payment Ratio
                  </span>

                  {/* Brand Rose Gradient Wedge Shape */}
                  <div className="relative w-full h-24 rounded-2xl bg-gradient-to-tr from-rose-100/70 via-rose-200/80 to-rose-300/90 border border-rose-300 flex flex-col justify-end p-3 overflow-hidden">
                    <div className="absolute top-2 right-2.5 text-[10px] font-mono text-rose-950 font-bold">
                      {dealerZone} Fixed
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-rose-950 font-mono block">
                        ${price.totalBuyPriceNZD.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-rose-900 font-medium block">
                        NZ Guaranteed Landed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Cost Parts Breakdown Options */}
                <div className="sm:col-span-7 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Cost Breakdown Components
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {costBreakdownItems.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedCostPart(i)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                          selectedCostPart === i
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-[10px] font-semibold truncate opacity-80">{item.label}</div>
                        <div className="font-mono font-bold text-xs mt-0.5">
                          ${item.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Big Crimson Brand Button (Nissan Brand Accent) */}
              <button
                type="button"
                onClick={() => {
                  audio.playSubtleClick();
                  setIsReserveModalOpen(true);
                }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E11D48] via-[#BE123C] to-[#9F1239] hover:from-[#BE123C] hover:to-[#881337] text-white font-extrabold text-sm tracking-wide transition-all shadow-[0_6px_22px_rgba(225,29,72,0.35)] hover:shadow-[0_8px_28px_rgba(225,29,72,0.45)] active:scale-[0.99] cursor-pointer text-center flex items-center justify-center gap-2.5"
              >
                <Lock className="w-4 h-4" />
                <span>Reserve Vehicle (24h Atomic Lock)</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Specifications Accordion + Avg Price Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-8 border-t border-slate-100">
          {/* LEFT COLUMN: Specifications Accordion List */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Specifications
            </h2>

            {/* Section 1: Performance */}
            <div className="border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => toggleSection("performance")}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800 py-2 cursor-pointer"
              >
                <span>Performance</span>
                {openSections.performance ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openSections.performance && (
                <div className="pt-3 grid grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">0-100 km/h</span>
                    <strong className="text-slate-900">7.90 seconds</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Top Speed</span>
                    <strong className="text-slate-900">170 km/h</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Auction Grade</span>
                    <strong className="text-slate-900 font-mono">Grade {vehicle.auctionGrade}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Engine Power</span>
                    <strong className="text-slate-900">100 kW (e-Power)</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Engine Torque</span>
                    <strong className="text-slate-900 font-mono">280 Nm</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Drive Type</span>
                    <strong className="text-slate-900">{vehicle.driveType}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Exterior Features & Inspection */}
            <div className="border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => toggleSection("exterior")}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800 py-2 cursor-pointer"
              >
                <span>Exterior Features &amp; Inspection</span>
                {openSections.exterior ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openSections.exterior && (
                <div className="pt-2 text-xs text-slate-600 space-y-1.5">
                  <p>
                    Body Color: <strong className="text-slate-900">{vehicle.color}</strong>
                  </p>
                  <p>
                    Exterior Rating:{" "}
                    <strong className="text-slate-900">Grade {vehicle.exteriorGrade}</strong>
                  </p>
                  <p>
                    Yokohama Pre-shipment:{" "}
                    <strong className="text-rose-700">Passed radiation inspection (&lt;0.08 μSv/h) &amp; physical de-registration</strong>
                  </p>
                  <p>Known Defect Log: {vehicle.knownDefects.join(", ")}</p>
                </div>
              )}
            </div>

            {/* Section 3: Safety & ADAS */}
            <div className="border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => toggleSection("safety")}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800 py-2 cursor-pointer"
              >
                <span>Safety &amp; ADAS</span>
                {openSections.safety ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openSections.safety && (
                <div className="pt-2 text-xs text-slate-600 space-y-1">
                  <p>• Nissan Emergency Braking &amp; Forward Collision Warning</p>
                  <p>• ProPILOT Autonomous Lane Keep &amp; Radar Adaptive Cruise</p>
                  <p>• Around View 360 Camera with Moving Object Detection</p>
                  <p>• Front &amp; Curtain SRS Airbags</p>
                </div>
              )}
            </div>

            {/* Section 4: Technical & MR2A Compliance */}
            <div className="border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => toggleSection("technical")}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800 py-2 cursor-pointer"
              >
                <span>Technical &amp; MR2A Entry Compliance</span>
                {openSections.technical ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openSections.technical && (
                <div className="pt-2 text-xs text-slate-600 space-y-1 leading-relaxed">
                  <p>• Standard entry compliance pass (MR2A certification) is included in the fixed landed price.</p>
                  <p>• Autohub biosecurity border clearance and customs processing guaranteed.</p>
                  <p>• Includes 2 metro transport moves (Port to Compliance Centre, Compliance Centre to Dealership Yard).</p>
                </div>
              )}
            </div>

            {/* Section 5: Interior Features */}
            <div className="border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => toggleSection("interior")}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800 py-2 cursor-pointer"
              >
                <span>Interior Features</span>
                {openSections.interior ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openSections.interior && (
                <div className="pt-2 text-xs text-slate-600 space-y-1">
                  <p>• Interior Condition: <strong className="text-slate-900">Grade {vehicle.interiorGrade}</strong></p>
                  <p>• Electronic Parking Brake with Auto-Hold</p>
                  <p>• Nissan Connect Touchscreen with Apple CarPlay / Android Auto</p>
                  <p>• Automatic Climate Control with Clean Air Filtration</p>
                </div>
              )}
            </div>

            {/* Section 6: Dimensions */}
            <div className="border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => toggleSection("dimensions")}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800 py-2 cursor-pointer"
              >
                <span>Dimensions &amp; Weight</span>
                {openSections.dimensions ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openSections.dimensions && (
                <div className="pt-2 text-xs text-slate-600">
                  <p>Length: 4,045 mm · Width: 1,695 mm · Height: 1,520 mm · Kerb Weight: 1,220 kg</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Avg Price Range Chart (Brand Identity) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Avg Price Range <span className="text-xs font-normal text-slate-400">(for this model in NZ)</span>
              </h3>

              {/* Timeframe Selector Pills */}
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

            {/* Minimal Line Chart Container (Brand Crimson Theme) */}
            <div className="p-6 rounded-3xl border border-slate-200/90 bg-white shadow-sm space-y-3">
              <div className="h-44 w-full relative">
                {/* Y-Axis Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-300">
                  <div className="w-full flex justify-between"><span>$36k</span></div>
                  <div className="w-full flex justify-between"><span>$34k</span></div>
                  <div className="w-full flex justify-between"><span>$32k</span></div>
                  <div className="w-full flex justify-between"><span>$30k</span></div>
                  <div className="w-full flex justify-between"><span>$28k</span></div>
                </div>

                {/* SVG Line Graph */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 340 160" fill="none">
                  {/* Trend Line (Crimson Brand Color) */}
                  <path
                    d="M 10 130 L 70 120 L 140 100 L 210 50 L 280 80"
                    stroke="#E11D48"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Nodes */}
                  <circle cx="10" cy="130" r="3" fill="#E11D48" />
                  <circle cx="70" cy="120" r="3" fill="#E11D48" />
                  <circle cx="140" cy="100" r="3" fill="#E11D48" />
                  <circle cx="210" cy="50" r="4.5" fill="#E11D48" />
                  <circle cx="280" cy="80" r="3" fill="#E11D48" />

                  {/* Vertical Marker Line */}
                  <line x1="210" y1="20" x2="210" y2="155" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                </svg>

                {/* Black Marker Tag */}
                <div className="absolute top-12 left-[62%] -translate-x-1/2 px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold shadow-md">
                  ${retailEstimateNZD.toLocaleString()}
                </div>
              </div>

              {/* X-Axis Month Labels */}
              <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
              </div>
            </div>

            {/* Margin Insight Callout */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Your Guaranteed Landed Price</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  ${price.totalBuyPriceNZD.toLocaleString()} NZD
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#E11D48] block text-[11px] font-semibold">Dealer Gross Margin</span>
                <span className="font-extrabold text-[#E11D48] font-mono text-base">
                  +${dealerMarginNZD.toLocaleString()} NZD
                </span>
              </div>
            </div>
          </div>
        </div>
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
