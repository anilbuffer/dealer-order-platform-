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
} from "lucide-react";

export default function DealerStockCatalog() {
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

  // Mobile Filters Drawer Toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  // Model Counts for Sidebar Badges
  const modelCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "Note": 0,
      "X-Trail": 0,
      "Serena": 0,
      "Leaf": 0,
      "Ariya": 0,
      "Kicks": 0,
    };

    vehicles.forEach((v) => {
      if (v.status !== "WITHDRAWN") {
        Object.keys(counts).forEach((key) => {
          if (v.model.toLowerCase().includes(key.toLowerCase())) {
            counts[key]++;
          }
        });
      }
    });

    return counts;
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
      {/* 1. Header Banner & Top Controls                             */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E11D48] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
              Official Nissan NZ Approved Export Stock
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Tokyo &amp; Yokohama Stock
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Available Stock Catalog
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {currentDealer?.legalTradingName || "Auckland Nissan City"} · Fixed {dealerZone} Landed Pricing (GST, Ocean RoRo &amp; MR2A Compliance Included)
          </p>
        </div>

        {/* Right Controls: Filter Toggle (Mobile) + Sort + Grid/List Switch */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => {
              audio.playSubtleClick();
              setShowMobileFilters(!showMobileFilters);
            }}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#E11D48] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                audio.playSubtleClick();
                setSortBy(e.target.value as "PRICE_ASC" | "PRICE_DESC" | "KM_ASC" | "YEAR_DESC");
              }}
              aria-label="Sort inventory"
              className="appearance-none pl-3 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/90 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition-all cursor-pointer shadow-2xs"
            >
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="KM_ASC">Lowest Kilometres</option>
              <option value="YEAR_DESC">Newest Model Year</option>
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
              <span className="hidden sm:inline">Grid</span>
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
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Main Marketplace Grid (Sidebar Left + Catalog Right)     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ───────────────────────────────────────────────────────── */}
        {/* LEFT COLUMN: Sticky Filter Sidebar (Carzone Reference)    */}
        {/* ───────────────────────────────────────────────────────── */}
        <aside
          className={`lg:col-span-3 space-y-5 ${
            showMobileFilters ? "block" : "hidden lg:block"
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-5 sticky top-24">
            {/* Sidebar Title & Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-bold text-slate-900 tracking-tight">
                  Stock Filters
                </span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#E11D48] text-white text-[10px] font-bold font-mono">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#E11D48] hover:text-[#BE123C] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* 1. Quick Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Model, chassis, stock ID..."
                  className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Nissan Models List with Unit Counts */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Nissan Model
              </label>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    audio.playSubtleClick();
                    setSelectedModel("ALL");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedModel === "ALL"
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  <span>All Models</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                      selectedModel === "ALL"
                        ? "bg-white/20 text-white"
                        : "bg-white text-slate-600 border border-slate-200/80"
                    }`}
                  >
                    {vehicles.filter((v) => v.status !== "WITHDRAWN").length}
                  </span>
                </button>

                {[
                  { key: "Note", name: "Note e-Power", count: modelCounts["Note"] },
                  { key: "X-Trail", name: "X-Trail Hybrid", count: modelCounts["X-Trail"] },
                  { key: "Serena", name: "Serena e-Power", count: modelCounts["Serena"] },
                  { key: "Leaf", name: "Leaf e+ (EV)", count: modelCounts["Leaf"] },
                  { key: "Ariya", name: "Ariya EV", count: modelCounts["Ariya"] },
                  { key: "Kicks", name: "Kicks e-Power", count: modelCounts["Kicks"] },
                ].map((item) => {
                  const isSelected = selectedModel === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        audio.playSubtleClick();
                        setSelectedModel(isSelected ? "ALL" : item.key);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#E11D48] text-white shadow-2xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-white text-slate-600 border border-slate-200/80"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Powertrain & Fuel Type Pills */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Powertrain
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: "ALL", label: "All Types" },
                  { key: "e-Power", label: "e-Power" },
                  { key: "Hybrid", label: "Hybrid" },
                  { key: "100% Electric", label: "100% EV" },
                ].map((fuel) => {
                  const isActive = selectedFuel === fuel.key;
                  return (
                    <button
                      key={fuel.key}
                      type="button"
                      onClick={() => {
                        audio.playSubtleClick();
                        setSelectedFuel(fuel.key);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                      }`}
                    >
                      {fuel.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Auction Grade Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Auction Grade (Condition)
              </label>
              <div className="space-y-1">
                {[
                  { key: "ALL", label: "All Auction Grades" },
                  { key: "5.0", label: "Grade 5.0 (Showroom)" },
                  { key: "4.5", label: "Grade 4.5+ (Immaculate)" },
                  { key: "4.0", label: "Grade 4.0+ (Verified Good)" },
                ].map((grade) => {
                  const isActive = selectedGrade === grade.key;
                  return (
                    <button
                      key={grade.key}
                      type="button"
                      onClick={() => {
                        audio.playSubtleClick();
                        setSelectedGrade(grade.key);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                      }`}
                    >
                      <span>{grade.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Budget Filter (Landed NZD) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Landed Price Budget
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: "ALL", label: "Any Budget" },
                  { key: "UNDER_25K", label: "< $25k NZD" },
                  { key: "25K_35K", label: "$25k–$35k" },
                  { key: "OVER_35K", label: "> $35k NZD" },
                ].map((b) => {
                  const isActive = selectedBudget === b.key;
                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => {
                        audio.playSubtleClick();
                        setSelectedBudget(b.key);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nissan NZ Direct Guarantee Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="w-4 h-4 text-[#E11D48]" />
                <span className="text-xs font-bold">Autohub Direct Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                All vehicles carry genuine export auction certificates, verified JEVIC odometers, and guaranteed MR2A compliance entry pass.
              </p>
            </div>
          </div>
        </aside>

        {/* ───────────────────────────────────────────────────────── */}
        {/* RIGHT COLUMN: Inventory Listings (Grid vs List Layout)    */}
        {/* ───────────────────────────────────────────────────────── */}
        <main className="lg:col-span-9 space-y-5">
          {/* Active Filter Chips & Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-semibold text-slate-500">
                Found <strong className="text-slate-900 font-bold">{filteredVehicles.length}</strong> Nissan units
              </span>

              {/* Active Filter Badges */}
              {selectedModel !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-[#E11D48] font-bold text-[11px] border border-rose-200/80">
                  Model: {selectedModel}
                  <button
                    type="button"
                    onClick={() => setSelectedModel("ALL")}
                    className="hover:text-[#BE123C] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedFuel !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                  Powertrain: {selectedFuel}
                  <button
                    type="button"
                    onClick={() => setSelectedFuel("ALL")}
                    className="hover:text-slate-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedGrade !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                  Grade: {selectedGrade}+
                  <button
                    type="button"
                    onClick={() => setSelectedGrade("ALL")}
                    className="hover:text-slate-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedBudget !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                  Budget Filter
                  <button
                    type="button"
                    onClick={() => setSelectedBudget("ALL")}
                    className="hover:text-slate-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for Immediate RoRo Vessel Booking</span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────── */}
          {/* EMPTY STATE                                             */}
          {/* ─────────────────────────────────────────────────────── */}
          {filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Car className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-900">No vehicles match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your model selector, powertrain filters, or clearing the search keyword.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === "GRID" ? (
            /* ───────────────────────────────────────────────────── */
            /* 3A. GRID LAYOUT: Carzone Classic Luxury Cards         */
            /* ───────────────────────────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {filteredVehicles.map((vehicle, index) => {
                const price = calculateLandedPrice(vehicle.fobPriceJPY, dealerZone);
                const isAvailable = vehicle.status === "AVAILABLE";
                const isFav = !!favorites[vehicle.id];
                const isFeatured = index === 0;

                return (
                  <div
                    key={vehicle.id}
                    onClick={() => handleOpenFullPageDetails(vehicle.id)}
                    className={`rounded-2xl border luxury-card overflow-hidden flex flex-col justify-between group cursor-pointer transition-smooth relative ${
                      isFeatured
                        ? "bg-gradient-to-b from-rose-50/25 via-white to-white border-rose-200/80"
                        : "bg-white border-slate-200/90"
                    }`}
                  >
                    <div>
                      {/* Image Studio Container with Realistic Pedestal Glow */}
                      <div className="relative aspect-[16/10] bg-gradient-to-b from-slate-50/80 via-slate-100/40 to-slate-50/80 overflow-hidden p-4 flex items-center justify-center studio-pedestal">
                        <img
                          src={vehicle.images[0]}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-contain studio-car-drop group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500 ease-out select-none"
                        />

                        {/* Top-Left: Stock Code Glass Badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg glass-badge text-[11px] font-mono font-bold text-slate-800 shadow-2xs">
                          {vehicle.stockId}
                        </div>

                        {/* Top-Right: Auction Grade Navy Pill + Heart Icon */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
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
                        <div className="absolute bottom-2.5 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-xs text-[10px] font-medium text-slate-600 border border-slate-200/60 shadow-2xs">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{vehicle.location.split("(")[0].trim()}</span>
                        </div>

                        {/* Reserved/Held Overlay */}
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                            <span className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
                              <Lock className="w-3.5 h-3.5 text-rose-400" />
                              Reserved (24h Hold)
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
                            <span className="text-[11px] font-semibold text-slate-500">
                              Chassis {vehicle.vinChassis.split("-")[0]}
                            </span>
                          </div>

                          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#E11D48] transition-colors leading-snug truncate mt-0.5">
                            {vehicle.model}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            {vehicle.grade} · {vehicle.color}
                          </p>
                        </div>

                        {/* The 3-Spec Pill Bar (Carzone Reference Style) */}
                        <div className="grid grid-cols-3 divide-x divide-slate-200/80 bg-slate-50/90 rounded-xl border border-slate-200/70 p-2 text-center text-xs">
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

                        {/* Landed Pricing & Carzone Circular Arrow Row */}
                        <div className="pt-1 flex items-end justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Total Landed Price ({dealerZone})
                            </span>
                            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight leading-none mt-0.5">
                              ${price.totalBuyPriceNZD.toLocaleString()}
                              <span className="text-xs text-slate-500 font-normal ml-1">NZD</span>
                            </div>
                            <p className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>FOB, RoRo, GST &amp; MR2A pass included</span>
                            </p>
                          </div>

                          {/* Carzone Circular Action Arrow Button */}
                          <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#E11D48] text-slate-700 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs shrink-0">
                            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
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
            /* ───────────────────────────────────────────────────── */
            /* 3B. LIST LAYOUT: Smooth Wide Rows Layout              */
            /* ───────────────────────────────────────────────────── */
            <div className="space-y-4 animate-in fade-in duration-300">
              {filteredVehicles.map((vehicle) => {
                const price = calculateLandedPrice(vehicle.fobPriceJPY, dealerZone);
                const isAvailable = vehicle.status === "AVAILABLE";
                const isFav = !!favorites[vehicle.id];

                return (
                  <div
                    key={vehicle.id}
                    onClick={() => handleOpenFullPageDetails(vehicle.id)}
                    className="bg-white rounded-2xl border border-slate-200/90 luxury-card overflow-hidden flex flex-col md:flex-row items-stretch group cursor-pointer"
                  >
                    {/* Left: Thumbnail & Badges */}
                    <div className="relative w-full md:w-64 h-48 md:h-auto bg-gradient-to-b from-slate-50/80 via-slate-100/40 to-slate-50/80 p-4 flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-slate-100 studio-pedestal">
                      <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-contain studio-car-drop group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500 ease-out select-none"
                      />

                      {/* Stock ID badge */}
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg glass-badge text-[10px] font-mono font-bold text-slate-800 shadow-2xs">
                        {vehicle.stockId}
                      </div>

                      {/* Auction Grade badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-900 text-[10px] font-mono font-bold text-white shadow-2xs flex items-center gap-1">
                        <span>★</span>
                        <span>Grade {vehicle.auctionGrade}</span>
                      </div>

                      {!isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                            Reserved
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Detailed Specs */}
                    <div className="flex-1 p-5 space-y-3 min-w-0 flex flex-col justify-between">
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
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-3">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono font-bold text-slate-800">
                              {vehicle.odometerKm.toLocaleString()} km
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                            <Zap className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-800">{vehicle.fuelType}</span>
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                            <span>Drive: <strong className="text-slate-800">{vehicle.driveType}</strong></span>
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                            <span>Exterior: <strong className="text-slate-800">{vehicle.color}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Inspection Defect summary */}
                      <div className="text-[11px] text-slate-500 line-clamp-1 pt-1">
                        <span className="font-bold text-slate-700">Pre-Export Note: </span>
                        {vehicle.knownDefects.join(" • ")}
                      </div>
                    </div>

                    {/* Right: Landed Price & CTAs */}
                    <div className="w-full md:w-64 p-5 bg-slate-50/70 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between shrink-0 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Total Landed Price ({dealerZone})
                        </span>
                        <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                          ${price.totalBuyPriceNZD.toLocaleString()}
                          <span className="text-xs text-slate-500 font-normal ml-1">NZD</span>
                        </div>
                        <p className="text-[10px] text-emerald-600 mt-1 font-semibold leading-tight flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
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
        </main>
      </div>

      {/* Atomic Reservation Modal (Triggered when user clicks quick reserve on card) */}
      <AtomicReservationModal
        vehicle={reserveVehicle}
        onClose={() => setReserveVehicle(null)}
        onSuccess={handleReservationSuccess}
      />
    </div>
  );
}