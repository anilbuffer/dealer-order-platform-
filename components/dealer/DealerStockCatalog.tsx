"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/lib/types";
import { useProgramme } from "@/lib/programme-context";
import { useAuth } from "@/lib/auth-context";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
import AtomicReservationModal from "./AtomicReservationModal";
import {
  Search,
  Car,
  Lock,
  ArrowRight,
  ArrowUpRight,
  LayoutGrid,
  List,
  Gauge,
  Zap,
  Calendar,
} from "lucide-react";

export default function DealerStockCatalog() {
  const router = useRouter();
  const { currentDealer } = useAuth();
  const { vehicles, reserveVehicle: atomicReserve } = useProgramme();

  const dealerZone = currentDealer?.pricingZoneId || "ZONE_1";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("ALL");
  const [selectedFuel, setSelectedFuel] = useState("ALL");
  const [sortBy, setSortBy] = useState<"PRICE_ASC" | "PRICE_DESC" | "KM_ASC" | "YEAR_DESC">("PRICE_ASC");

  // Layout View Mode (Grid vs List) with Smooth Transition
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");

  // Reservation Modal (for quick reserve)
  const [reserveVehicle, setReserveVehicle] = useState<Vehicle | null>(null);

  // Filtered & Sorted Stock (Live Synced)
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        // Hide withdrawn stock from dealer catalog
        if (v.status === "WITHDRAWN") return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchStock = v.stockId.toLowerCase().includes(q);
          const matchModel = v.model.toLowerCase().includes(q);
          const matchVin = v.vinChassis.toLowerCase().includes(q);
          if (!matchStock && !matchModel && !matchVin) return false;
        }

        if (selectedModel !== "ALL" && !v.model.toLowerCase().includes(selectedModel.toLowerCase())) {
          return false;
        }

        if (selectedFuel !== "ALL" && v.fuelType !== selectedFuel) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = calculateLandedPrice(a.fobPriceJPY, dealerZone).totalBuyPriceNZD;
        const priceB = calculateLandedPrice(b.fobPriceJPY, dealerZone).totalBuyPriceNZD;

        if (sortBy === "PRICE_ASC") return priceA - priceB;
        if (sortBy === "PRICE_DESC") return priceB - priceA;
        if (sortBy === "KM_ASC") return a.odometerKm - b.odometerKm;
        return b.year - a.year;
      });
  }, [vehicles, searchQuery, selectedModel, selectedFuel, sortBy, dealerZone]);

  // Navigate directly to FULL PAGE Vehicle Details (NO MODAL)
  const handleOpenFullPageDetails = (vehicleId: string) => {
    audio.playSubtleClick();
    router.push(`/vehicles/${vehicleId}`);
  };

  const handleReservationSuccess = (vehicleId: string) => {
    atomicReserve(vehicleId, currentDealer?.id || "DEALER_001");
  };

  const availableCount = filteredVehicles.filter((v) => v.status === "AVAILABLE").length;

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header Banner & View Toggle (Grid / List in Top Right)   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Available Stock
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentDealer?.legalTradingName || "Auckland Nissan City"} · {dealerZone} Landed Pricing (GST &amp; MR2A Pass Included)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            Showing <strong className="text-slate-900">{availableCount}</strong> units
          </span>

          {/* Grid vs List Layout Toggle in Top Right */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                setViewMode("GRID");
              }}
              title="Grid View"
              aria-label="Grid View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                viewMode === "GRID"
                  ? "bg-white text-slate-950 shadow-xs border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playSubtleClick();
                setViewMode("LIST");
              }}
              title="List View"
              aria-label="List View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                viewMode === "LIST"
                  ? "bg-white text-slate-950 shadow-xs border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Sleek Filter Bar                                         */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Quick Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, stock ID, or chassis..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
            />
          </div>

          {/* Model Selector */}
          <div className="w-full sm:w-48">
            <select
              value={selectedModel}
              onChange={(e) => {
                audio.playSubtleClick();
                setSelectedModel(e.target.value);
              }}
              aria-label="Filter by model"
              className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer font-medium"
            >
              <option value="ALL">All Models</option>
              <option value="Note">Note e-Power</option>
              <option value="X-Trail">X-Trail</option>
              <option value="Serena">Serena</option>
              <option value="Leaf">Leaf EV</option>
              <option value="Ariya">Ariya</option>
              <option value="Kicks">Kicks</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => {
                audio.playSubtleClick();
                setSortBy(e.target.value as any);
              }}
              aria-label="Sort inventory"
              className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer font-medium"
            >
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="KM_ASC">Lowest Kilometres</option>
              <option value="YEAR_DESC">Newest Year</option>
            </select>
          </div>
        </div>

        {/* Minimal Engine Type Pills */}
        <div className="flex items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Engine:</span>
          {["ALL", "e-Power", "Hybrid", "100% Electric"].map((fuel) => {
            const isActive = selectedFuel === fuel;
            return (
              <button
                key={fuel}
                type="button"
                onClick={() => {
                  audio.playSubtleClick();
                  setSelectedFuel(fuel);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#0A1322] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {fuel === "ALL" ? "All" : fuel}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. Empty State                                             */}
      {/* ─────────────────────────────────────────────────────────── */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-sm text-slate-900">No vehicles match your criteria</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
        </div>
      ) : viewMode === "GRID" ? (
        /* ───────────────────────────────────────────────────────── */
        /* 4A. GRID LAYOUT: Classic Nissan Brand Card Style          */
        /* ───────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {filteredVehicles.map((vehicle) => {
            const price = calculateLandedPrice(vehicle.fobPriceJPY, dealerZone);
            const isAvailable = vehicle.status === "AVAILABLE";

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div
                    onClick={() => handleOpenFullPageDetails(vehicle.id)}
                    className="relative aspect-[16/10] bg-slate-50/60 cursor-pointer overflow-hidden p-4 flex items-center justify-center"
                  >
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 select-none drop-shadow-sm"
                    />

                    {/* Stock ID badge */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-mono font-semibold text-slate-700 shadow-xs border border-slate-200/80">
                      {vehicle.stockId}
                    </div>

                    {/* Auction Grade badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-900 text-[10px] font-mono font-bold text-white shadow-xs">
                      Grade {vehicle.auctionGrade}
                    </div>

                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm">
                          <Lock className="w-3.5 h-3.5" />
                          Reserved
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vehicle Information (Classic Brand Card Style) */}
                  <div className="p-5 space-y-3">
                    <div
                      onClick={() => handleOpenFullPageDetails(vehicle.id)}
                      className="cursor-pointer"
                    >
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
                        {vehicle.year} · {vehicle.transmission}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#E11D48] transition-colors truncate mt-0.5">
                        {vehicle.model}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{vehicle.grade}</p>
                    </div>

                    {/* Quick Specs Matrix */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Odometer</span>
                        <strong className="text-slate-800 font-semibold font-mono">
                          {vehicle.odometerKm.toLocaleString()} km
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Drive Layout</span>
                        <strong className="text-slate-800 font-semibold">{vehicle.driveType}</strong>
                      </div>
                    </div>

                    {/* Landed Pricing Section */}
                    <div className="pt-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Total Buy Price ({dealerZone})
                        </span>
                        <span className="text-lg font-extrabold text-slate-900 font-mono">
                          ${price.totalBuyPriceNZD.toLocaleString()}{" "}
                          <span className="text-xs text-slate-500 font-normal">NZD</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">
                        ✓ FOB, RoRo, GST &amp; MR2A compliance pass included
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenFullPageDetails(vehicle.id)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>View Specs</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => {
                        audio.playSubtleClick();
                        setReserveVehicle(vehicle);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Reserve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
                    >
                      Held
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ───────────────────────────────────────────────────────── */
        /* 4B. LIST LAYOUT: Smooth Wide Rows Layout                  */
        /* ───────────────────────────────────────────────────────── */
        <div className="space-y-4 animate-in fade-in duration-300">
          {filteredVehicles.map((vehicle) => {
            const price = calculateLandedPrice(vehicle.fobPriceJPY, dealerZone);
            const isAvailable = vehicle.status === "AVAILABLE";

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-stretch group"
              >
                {/* Left: Thumbnail & Badges */}
                <div
                  onClick={() => handleOpenFullPageDetails(vehicle.id)}
                  className="relative w-full md:w-64 h-48 md:h-auto bg-slate-50/60 p-3 flex items-center justify-center cursor-pointer shrink-0 border-b md:border-b-0 md:border-r border-slate-100"
                >
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 select-none drop-shadow-sm"
                  />

                  {/* Stock ID badge */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-mono font-semibold text-slate-700 shadow-xs border border-slate-200/80">
                    {vehicle.stockId}
                  </div>

                  {/* Auction Grade badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-mono font-bold text-white shadow-xs">
                    Grade {vehicle.auctionGrade}
                  </div>

                  {!isAvailable && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm">
                        <Lock className="w-3.5 h-3.5" />
                        Reserved
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle: Detailed Specs */}
                <div
                  onClick={() => handleOpenFullPageDetails(vehicle.id)}
                  className="flex-1 p-5 space-y-3 cursor-pointer min-w-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
                        {vehicle.year} · {vehicle.transmission}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#E11D48] transition-colors truncate">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {vehicle.grade} · Chassis {vehicle.vinChassis}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Location
                      </span>
                      <span className="text-xs font-semibold text-slate-700 block">
                        {vehicle.location}
                      </span>
                    </div>
                  </div>

                  {/* Inline Specs Pills */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono font-semibold text-slate-800">
                        {vehicle.odometerKm.toLocaleString()} km
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                      <Zap className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vehicle.fuelType}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span>Drive: <strong className="text-slate-800">{vehicle.driveType}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span>Exterior: <strong className="text-slate-800">{vehicle.color}</strong></span>
                    </div>
                  </div>

                  {/* Defects log preview */}
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    <span className="font-semibold text-slate-600">Inspection Note: </span>
                    {vehicle.knownDefects.join(" • ")}
                  </div>
                </div>

                {/* Right: Landed Price & CTAs */}
                <div className="w-full md:w-64 p-5 bg-slate-50/70 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between shrink-0 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Total Buy Price ({dealerZone})
                    </span>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                      ${price.totalBuyPriceNZD.toLocaleString()}
                      <span className="text-xs text-slate-500 font-normal ml-1">NZD</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 mt-1 font-medium leading-tight">
                      ✓ Delivered to Dealership (All fees &amp; GST included)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenFullPageDetails(vehicle.id)}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Specs</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={() => {
                          audio.playSubtleClick();
                          setReserveVehicle(vehicle);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>Reserve</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
                      >
                        Held
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Atomic Reservation Modal (Only triggered if user reserves directly from card) */}
      <AtomicReservationModal
        vehicle={reserveVehicle}
        onClose={() => setReserveVehicle(null)}
        onSuccess={handleReservationSuccess}
      />
    </div>
  );
}
