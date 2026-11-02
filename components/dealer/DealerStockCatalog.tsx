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
  SlidersHorizontal,
  RotateCcw,
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck,
  Heart,
  ArrowUpRight,
  ArrowRight,
  Lock,
  Gauge,
  Zap,
  Calendar,
  Car,
  X,
  Check,
  CheckCircle2,
  ChevronDown,
  MapPin,
  TrendingUp,
  Ship,
  FileCheck2,
} from "lucide-react";

interface DealerStockCatalogProps {
  onSelectVehicle?: (vehicleId: string) => void;
}

export default function DealerStockCatalog({ onSelectVehicle }: DealerStockCatalogProps = {}) {
  const router = useRouter();
  const { currentDealer } = useAuth();
  const { vehicles, reserveVehicle: atomicReserve } = useProgramme();

  const dealerZone = currentDealer?.pricingZoneId || "ZONE_1";

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("ALL");
  const [selectedFuel, setSelectedFuel] = useState("ALL");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
  const [selectedBudget, setSelectedBudget] = useState("ALL");
  const [sortBy, setSortBy] = useState<"PRICE_ASC" | "PRICE_DESC" | "KM_ASC" | "YEAR_DESC">("PRICE_ASC");

  // Layout View Mode (Grid vs List) with Smooth Transition
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");

  // Favorites / Shortlist State
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (e: React.MouseEvent, vehicleId: string) => {
    e.stopPropagation();
    audio.playSubtleClick();
    setFavorites((prev) => ({ ...prev, [vehicleId]: !prev[vehicleId] }));
  };

  // Reservation Modal (for quick reserve from card)
  const [reserveVehicle, setReserveVehicle] = useState<Vehicle | null>(null);

  // Reset all filters
  const handleResetFilters = () => {
    audio.playSubtleClick();
    setSearchQuery("");
    setSelectedModel("ALL");
    setSelectedFuel("ALL");
    setSelectedGrade("ALL");
    setSelectedBudget("ALL");
    setSortBy("PRICE_ASC");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedModel !== "ALL") count++;
    if (selectedFuel !== "ALL") count++;
    if (selectedGrade !== "ALL") count++;
    if (selectedBudget !== "ALL") count++;
    return count;
  }, [searchQuery, selectedModel, selectedFuel, selectedGrade, selectedBudget]);

  // Model Counts for Pills
  const modelStats = useMemo(() => {
    const list = [
      { key: "ALL", name: "All Models", count: 0 },
      { key: "Note", name: "Note e-Power", count: 0 },
      { key: "X-Trail", name: "X-Trail Hybrid", count: 0 },
      { key: "Serena", name: "Serena e-Power", count: 0 },
      { key: "Leaf", name: "Leaf e+ (EV)", count: 0 },
      { key: "Ariya", name: "Ariya EV", count: 0 },
      { key: "Kicks", name: "Kicks e-Power", count: 0 },
    ];

    vehicles.forEach((v) => {
      if (v.status !== "WITHDRAWN") {
        list[0].count++;
        list.slice(1).forEach((item) => {
          if (v.model.toLowerCase().includes(item.key.toLowerCase())) {
            item.count++;
          }
        });
      }
    });

    return list;
  }, [vehicles]);

  // Filtered & Sorted Stock (Live Synced with ProgrammeContext)
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
          const matchGrade = v.grade.toLowerCase().includes(q);
          if (!matchStock && !matchModel && !matchVin && !matchGrade) return false;
        }

        if (selectedModel !== "ALL" && !v.model.toLowerCase().includes(selectedModel.toLowerCase())) {
          return false;
        }

        if (selectedFuel !== "ALL" && v.fuelType !== selectedFuel) {
          return false;
        }

        if (selectedGrade !== "ALL") {
          const numGrade = parseFloat(v.auctionGrade);
          if (selectedGrade === "5.0" && numGrade < 5.0) return false;
          if (selectedGrade === "4.5" && numGrade < 4.5) return false;
          if (selectedGrade === "4.0" && numGrade < 4.0) return false;
        }

        const price = calculateLandedPrice(v.fobPriceJPY, dealerZone).totalBuyPriceNZD;
        if (selectedBudget === "UNDER_25K" && price >= 25000) return false;
        if (selectedBudget === "25K_35K" && (price < 25000 || price > 35000)) return false;
        if (selectedBudget === "OVER_35K" && price <= 35000) return false;

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
  }, [vehicles, searchQuery, selectedModel, selectedFuel, selectedGrade, selectedBudget, sortBy, dealerZone]);

  // Navigate directly to FULL PAGE Vehicle Details (INSIDE PORTAL)
  const handleOpenFullPageDetails = (vehicleId: string) => {
    audio.playSubtleClick();
    if (onSelectVehicle) {
      onSelectVehicle(vehicleId);
    } else {
      router.push(`/vehicles/${vehicleId}`);
    }
  };

  const handleReservationSuccess = (vehicleId: string) => {
    atomicReserve(vehicleId, currentDealer?.id || "DEALER_001");
  };

  const availableCount = filteredVehicles.filter((v) => v.status === "AVAILABLE").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Executive Showroom Header Banner                         */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A1322] via-[#0F1B2E] to-[#142239] p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        {/* Subtle Background Glow Elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#E11D48]/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#E11D48] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nissan NZ Certified Programme</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-semibold border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tokyo &amp; Yokohama HQ Direct Allocation</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Approved Used Vehicle Inventory
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Guaranteed landed pricing for <strong className="text-white">{currentDealer?.legalTradingName || "Auckland Nissan City"}</strong> ({dealerZone}). Every unit includes verified FOB acquisition, ocean RoRo transport, biosecurity clearance, 15% GST, and certified MR2A compliance entry pass.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Available</span>
              <span className="text-2xl font-black font-mono text-white mt-0.5 block">{availableCount}</span>
              <span className="text-[10px] text-emerald-400 font-semibold block">Ready to Ship</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Pricing Zone</span>
              <span className="text-xl font-black font-mono text-white mt-0.5 block">{dealerZone}</span>
              <span className="text-[10px] text-slate-300 font-semibold block">All Fees Included</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Next RoRo</span>
              <span className="text-sm font-black font-mono text-white mt-1 block">Vessel TP-2648</span>
              <span className="text-[10px] text-sky-400 font-semibold block">Departing 8 Nov</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Modern Filter & Controls Bar (Wide, Unrestricted Layout)  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-4">
        {/* Top Filter Row: Search + Powertrain + Grade + Budget + Sort + Grid/List */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Note, X-Trail, Serena, stock ID, or chassis..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Selectors & Sort */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Powertrain Selector */}
            <div className="relative">
              <select
                value={selectedFuel}
                onChange={(e) => {
                  audio.playSubtleClick();
                  setSelectedFuel(e.target.value);
                }}
                aria-label="Filter by Powertrain"
                className="appearance-none pl-3 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition-all cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Powertrains</option>
                <option value="e-Power">e-Power Hybrid</option>
                <option value="Hybrid">Standard Hybrid</option>
                <option value="100% Electric">100% Electric (EV)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Auction Grade Selector */}
            <div className="relative">
              <select
                value={selectedGrade}
                onChange={(e) => {
                  audio.playSubtleClick();
                  setSelectedGrade(e.target.value);
                }}
                aria-label="Filter by Auction Grade"
                className="appearance-none pl-3 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition-all cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Auction Grades</option>
                <option value="5.0">Grade 5.0 (Showroom)</option>
                <option value="4.5">Grade 4.5+ (Immaculate)</option>
                <option value="4.0">Grade 4.0+ (Verified)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Budget Selector */}
            <div className="relative">
              <select
                value={selectedBudget}
                onChange={(e) => {
                  audio.playSubtleClick();
                  setSelectedBudget(e.target.value);
                }}
                aria-label="Filter by Budget"
                className="appearance-none pl-3 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition-all cursor-pointer shadow-2xs"
              >
                <option value="ALL">Any Budget</option>
                <option value="UNDER_25K">&lt; $25,000 NZD</option>
                <option value="25K_35K">$25,000 – $35,000</option>
                <option value="OVER_35K">&gt; $35,000 NZD</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  audio.playSubtleClick();
                  setSortBy(e.target.value as "PRICE_ASC" | "PRICE_DESC" | "KM_ASC" | "YEAR_DESC");
                }}
                aria-label="Sort inventory"
                className="appearance-none pl-3 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition-all cursor-pointer shadow-2xs"
              >
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="KM_ASC">Lowest Mileage</option>
                <option value="YEAR_DESC">Newest Year</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Grid vs List Layout Toggle in Top Right */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
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

        {/* Bottom Filter Row: Model Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Models:
          </span>
          {modelStats.map((item) => {
            const isSelected = selectedModel === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  audio.playSubtleClick();
                  setSelectedModel(item.key);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#E11D48] text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70"
                }`}
              >
                <span>{item.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] ${
                    isSelected ? "bg-white/25 text-white" : "bg-white text-slate-600 border border-slate-200/80"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-[#E11D48] hover:text-[#BE123C] font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-auto transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. Empty State                                              */}
      {/* ─────────────────────────────────────────────────────────── */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-900">No vehicles match your search filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your model selector, powertrain filters, or clearing the keyword search.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        /* ───────────────────────────────────────────────────────── */
        /* 4A. GRID LAYOUT: Expansive Luxury Showroom Cards          */
        /* ───────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {filteredVehicles.map((vehicle, index) => {
            const price = calculateLandedPrice(vehicle.fobPriceJPY, dealerZone);
            const isAvailable = vehicle.status === "AVAILABLE";
            const isFav = !!favorites[vehicle.id];
            const isFeatured = index === 0;

            // Retail Estimate & Gross Margin
            const retailEstimate = Math.round(price.totalBuyPriceNZD * 1.28);
            const grossMargin = retailEstimate - price.totalBuyPriceNZD;

            return (
              <div
                key={vehicle.id}
                onClick={() => handleOpenFullPageDetails(vehicle.id)}
                className={`rounded-3xl border luxury-card overflow-hidden flex flex-col justify-between group cursor-pointer transition-smooth relative ${
                  isFeatured
                    ? "bg-gradient-to-b from-rose-50/20 via-white to-white border-rose-200/80"
                    : "bg-white border-slate-200/90"
                }`}
              >
                <div>
                  {/* Studio Hero Image Showcase with Ground Reflection Glow */}
                  <div className="relative aspect-[16/10] bg-gradient-to-b from-slate-50/80 via-slate-100/40 to-slate-50/80 overflow-hidden p-6 flex items-center justify-center studio-pedestal">
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-contain studio-car-drop group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500 ease-out select-none"
                    />

                    {/* Top-Left: Stock Code Glass Badge */}
                    <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-lg glass-badge text-[11px] font-mono font-bold text-slate-800 shadow-2xs">
                      {vehicle.stockId}
                    </div>

                    {/* Top-Right: Auction Grade Navy Pill + Heart Icon */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, vehicle.id)}
                        aria-label="Add to favorites"
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                          isFav
                            ? "bg-rose-500 text-white shadow-xs"
                            : "bg-white/80 text-slate-400 hover:text-rose-500 shadow-2xs"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-white" : ""}`} />
                      </button>

                      <div className="px-2.5 py-1 rounded-full bg-slate-900 text-[10px] font-mono font-bold text-white shadow-2xs flex items-center gap-1">
                        <span>★</span>
                        <span>Grade {vehicle.auctionGrade}</span>
                      </div>
                    </div>

                    {/* Bottom-Left: Location Yard Pill */}
                    <div className="absolute bottom-3 left-3.5 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/85 backdrop-blur-xs text-[10px] font-medium text-slate-700 border border-slate-200/60 shadow-2xs">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{vehicle.location.split("(")[0].trim()}</span>
                    </div>

                    {/* Reserved/Held Overlay */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
                          <Lock className="w-3.5 h-3.5 text-rose-400" />
                          Reserved (24h Hold Active)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vehicle Information */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E11D48]">
                          {vehicle.year} · {vehicle.transmission}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-slate-400">
                          {vehicle.vinChassis}
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#E11D48] transition-colors leading-snug truncate mt-0.5">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {vehicle.grade} · {vehicle.color} · JEVIC Verified
                      </p>
                    </div>

                    {/* The 3-Spec Pill Bar (Expansive Clean Matrix) */}
                    <div className="grid grid-cols-3 divide-x divide-slate-200/80 bg-slate-50/90 rounded-2xl border border-slate-200/70 p-2 text-center text-xs">
                      <div className="px-1">
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Odometer
                        </span>
                        <strong className="text-slate-800 font-bold font-mono text-[11px] block truncate">
                          {vehicle.odometerKm.toLocaleString()} km
                        </strong>
                      </div>

                      <div className="px-1">
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Drivetrain
                        </span>
                        <strong className="text-slate-800 font-bold text-[11px] block truncate">
                          {vehicle.driveType}
                        </strong>
                      </div>

                      <div className="px-1">
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Powertrain
                        </span>
                        <strong className="text-slate-800 font-bold text-[11px] block truncate">
                          {vehicle.fuelType}
                        </strong>
                      </div>
                    </div>

                    {/* Landed Pricing & Profit Margin Preview */}
                    <div className="pt-1 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Guaranteed Landed Price ({dealerZone})
                          </span>
                          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight leading-none mt-1">
                            ${price.totalBuyPriceNZD.toLocaleString()}
                            <span className="text-xs text-slate-500 font-normal ml-1">NZD</span>
                          </div>
                        </div>

                        {/* Dealer Gross Margin Callout */}
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block">Est. Retail Margin</span>
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            +${grossMargin.toLocaleString()} NZD
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>FOB, RoRo ocean freight, GST &amp; MR2A pass included</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenFullPageDetails(vehicle.id);
                    }}
                    className="flex-1 py-2.5 px-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-xs active:scale-[0.98] transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>View Specs</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        audio.playSubtleClick();
                        setReserveVehicle(vehicle);
                      }}
                      className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] text-white text-xs font-extrabold transition-all shadow-[0_3px_10px_rgba(225,29,72,0.22)] hover:shadow-[0_4px_16px_rgba(225,29,72,0.32)] active:scale-[0.98] text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Reserve (24h)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
                    >
                      Reserved
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ───────────────────────────────────────────────────────── */
        /* 4B. LIST LAYOUT: Wide Luxury Showroom Rows                */
        /* ───────────────────────────────────────────────────────── */
        <div className="space-y-4 animate-in fade-in duration-300">
          {filteredVehicles.map((vehicle) => {
            const price = calculateLandedPrice(vehicle.fobPriceJPY, dealerZone);
            const isAvailable = vehicle.status === "AVAILABLE";
            const isFav = !!favorites[vehicle.id];
            const retailEstimate = Math.round(price.totalBuyPriceNZD * 1.28);
            const grossMargin = retailEstimate - price.totalBuyPriceNZD;

            return (
              <div
                key={vehicle.id}
                onClick={() => handleOpenFullPageDetails(vehicle.id)}
                className="bg-white rounded-3xl border border-slate-200/90 luxury-card overflow-hidden flex flex-col md:flex-row items-stretch group cursor-pointer"
              >
                {/* Left: Thumbnail & Badges */}
                <div className="relative w-full md:w-72 h-52 md:h-auto bg-gradient-to-b from-slate-50/80 via-slate-100/40 to-slate-50/80 p-5 flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-slate-100 studio-pedestal">
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-contain studio-car-drop group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500 ease-out select-none"
                  />

                  {/* Stock ID badge */}
                  <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-lg glass-badge text-[10px] font-mono font-bold text-slate-800 shadow-2xs">
                    {vehicle.stockId}
                  </div>

                  {/* Auction Grade badge */}
                  <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-slate-900 text-[10px] font-mono font-bold text-white shadow-2xs flex items-center gap-1">
                    <span>★</span>
                    <span>Grade {vehicle.auctionGrade}</span>
                  </div>

                  {!isAvailable && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        Reserved
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle: Detailed Specs */}
                <div className="flex-1 p-6 space-y-3.5 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#E11D48]">
                          {vehicle.year} · {vehicle.transmission}
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#E11D48] transition-colors truncate">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {vehicle.grade} · Chassis {vehicle.vinChassis}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Export Port
                        </span>
                        <span className="text-xs font-semibold text-slate-700 block">
                          {vehicle.location}
                        </span>
                      </div>
                    </div>

                    {/* Inline Specs Pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-slate-800">
                          {vehicle.odometerKm.toLocaleString()} km
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{vehicle.fuelType}</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span>Drive: <strong className="text-slate-800">{vehicle.driveType}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span>Exterior: <strong className="text-slate-800">{vehicle.color}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Pre-Export Inspection defect summary */}
                  <div className="text-[11px] text-slate-500 line-clamp-1 pt-1 border-t border-slate-100">
                    <span className="font-bold text-slate-700">Japan Pre-Export Inspection: </span>
                    {vehicle.knownDefects.join(" • ")}
                  </div>
                </div>

                {/* Right: Landed Price & CTAs */}
                <div className="w-full md:w-72 p-6 bg-slate-50/70 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between shrink-0 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Guaranteed Landed Price ({dealerZone})
                    </span>
                    <div className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
                      ${price.totalBuyPriceNZD.toLocaleString()}
                      <span className="text-xs text-slate-500 font-normal ml-1">NZD</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-500">Gross Margin:</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        +${grossMargin.toLocaleString()} NZD
                      </span>
                    </div>

                    <p className="text-[10px] text-emerald-600 mt-2 font-semibold leading-tight flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>All fees, GST &amp; MR2A pass included</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFullPageDetails(vehicle.id);
                      }}
                      className="flex-1 py-2.5 px-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-xs active:scale-[0.98] transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Specs</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audio.playSubtleClick();
                          setReserveVehicle(vehicle);
                        }}
                        className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] text-white text-xs font-extrabold transition-all shadow-[0_3px_10px_rgba(225,29,72,0.22)] hover:shadow-[0_4px_16px_rgba(225,29,72,0.32)] active:scale-[0.98] text-center cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Reserve</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
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

      {/* Atomic Reservation Modal */}
      <AtomicReservationModal
        vehicle={reserveVehicle}
        onClose={() => setReserveVehicle(null)}
        onSuccess={handleReservationSuccess}
      />
    </div>
  );
}
