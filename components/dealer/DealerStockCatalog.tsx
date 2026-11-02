"use client";

import React, { useState, useMemo } from "react";
import { Vehicle } from "@/lib/types";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
import VehicleDetailModal from "./VehicleDetailModal";
import AtomicReservationModal from "./AtomicReservationModal";
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Car,
  Gauge,
  Zap,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

export default function DealerStockCatalog() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("ALL");
  const [selectedFuel, setSelectedFuel] = useState("ALL");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
  const [sortBy, setSortBy] = useState<"PRICE_ASC" | "PRICE_DESC" | "KM_ASC" | "YEAR_DESC">("PRICE_ASC");

  // Modals
  const [inspectVehicle, setInspectVehicle] = useState<Vehicle | null>(null);
  const [reserveVehicle, setReserveVehicle] = useState<Vehicle | null>(null);

  // Filtered & Sorted Stock
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        // Search
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchStock = v.stockId.toLowerCase().includes(q);
          const matchModel = v.model.toLowerCase().includes(q);
          const matchVin = v.vinChassis.toLowerCase().includes(q);
          if (!matchStock && !matchModel && !matchVin) return false;
        }

        // Model
        if (selectedModel !== "ALL" && !v.model.toLowerCase().includes(selectedModel.toLowerCase())) {
          return false;
        }

        // Fuel
        if (selectedFuel !== "ALL" && v.fuelType !== selectedFuel) {
          return false;
        }

        // Grade
        if (selectedGrade === "4.5_PLUS") {
          const num = parseFloat(v.auctionGrade);
          if (isNaN(num) || num < 4.5) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = calculateLandedPrice(a.fobPriceJPY, "ZONE_1").totalBuyPriceNZD;
        const priceB = calculateLandedPrice(b.fobPriceJPY, "ZONE_1").totalBuyPriceNZD;

        if (sortBy === "PRICE_ASC") return priceA - priceB;
        if (sortBy === "PRICE_DESC") return priceB - priceA;
        if (sortBy === "KM_ASC") return a.odometerKm - b.odometerKm;
        return b.year - a.year;
      });
  }, [vehicles, searchQuery, selectedModel, selectedFuel, selectedGrade, sortBy]);

  const handleReservationSuccess = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              status: "RESERVED",
              reservedByDealerId: "DEALER_001",
              reservedAt: new Date().toISOString(),
            }
          : v
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header Dealership Profile & Pricing Zone Context Banner */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Auckland Dealership Portal
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Zone 1 Fixed Pricing Active
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Certified Japan Used Stock
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Prices displayed are guaranteed Total Buy Prices delivered to Greenlane, Auckland (Includes FOB, freight, GST, and MR2A pass).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Available Units</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              {filteredVehicles.filter((v) => v.status === "AVAILABLE").length} / {vehicles.length}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Clean, Non-Crowded Filter & Sort Controls               */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model, stock ID (e.g. NIS-2026-9041), or chassis..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all shadow-soft"
            />
          </div>

          {/* Model Selector Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={selectedModel}
              onChange={(e) => {
                audio.playSubtleClick();
                setSelectedModel(e.target.value);
              }}
              aria-label="Filter by vehicle model"
              className="w-full px-3 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all cursor-pointer font-medium"
            >
              <option value="ALL">All Models</option>
              <option value="Note">Nissan Note e-Power</option>
              <option value="X-Trail">Nissan X-Trail</option>
              <option value="Serena">Nissan Serena</option>
              <option value="Leaf">Nissan Leaf EV</option>
              <option value="Ariya">Nissan Ariya</option>
              <option value="Kicks">Nissan Kicks</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="w-full sm:w-52">
            <select
              value={sortBy}
              onChange={(e) => {
                audio.playSubtleClick();
                setSortBy(e.target.value as any);
              }}
              aria-label="Sort vehicle inventory"
              className="w-full px-3 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all cursor-pointer font-medium"
            >
              <option value="PRICE_ASC">Lowest Total Buy Price</option>
              <option value="PRICE_DESC">Highest Total Buy Price</option>
              <option value="KM_ASC">Lowest Odometer Mileage</option>
              <option value="YEAR_DESC">Newest Year</option>
            </select>
          </div>
        </div>

        {/* Minimal Pill Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Powertrain:</span>
          {["ALL", "e-Power", "Hybrid", "100% Electric"].map((fuel) => (
            <button
              key={fuel}
              onClick={() => {
                audio.playSubtleClick();
                setSelectedFuel(fuel);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-smooth cursor-pointer ${
                selectedFuel === fuel
                  ? "bg-slate-900 text-white shadow-soft"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              {fuel === "ALL" ? "All Engines" : fuel}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <span className="text-[11px] font-semibold text-slate-400 mr-1">Condition:</span>
          <button
            onClick={() => {
              audio.playSubtleClick();
              setSelectedGrade(selectedGrade === "4.5_PLUS" ? "ALL" : "4.5_PLUS");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-smooth cursor-pointer ${
              selectedGrade === "4.5_PLUS"
                ? "bg-emerald-600 text-white shadow-soft"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
            }`}
          >
            ★ Grade 4.5+ Only
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. 16:10 Aspect Ratio Vehicle Inventory Cards Grid        */}
      {/* ─────────────────────────────────────────────────────────── */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-soft">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-900">No Vehicles Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No stock matching your current filter criteria. Try clearing search filters or checking back as Japan teams upload new listings.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedModel("ALL");
              setSelectedFuel("ALL");
              setSelectedGrade("ALL");
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const price = calculateLandedPrice(vehicle.fobPriceJPY, "ZONE_1");
            const isAvailable = vehicle.status === "AVAILABLE";

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft hover:shadow-soft-md transition-smooth flex flex-col justify-between group"
              >
                <div>
                  {/* Aspect Ratio 16:10 Photo Header */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-spring"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white font-mono text-[11px] font-bold shadow-soft">
                        Grade {vehicle.auctionGrade}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-semibold border border-white/50">
                        {vehicle.fuelType}
                      </span>
                    </div>

                    {/* Stock ID Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-mono">
                        {vehicle.stockId}
                      </span>
                    </div>

                    {/* Status Overlay if not available */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-soft flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          Reserved
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vehicle Information */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-crimson-600">
                        {vehicle.year} · {vehicle.transmission}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-crimson-600 transition-colors truncate">
                        {vehicle.model}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{vehicle.grade}</p>
                    </div>

                    {/* Quick Specs Matrix */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Odometer</span>
                        <strong className="text-slate-800 font-semibold">
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
                          Total Buy Price (Zone 1)
                        </span>
                        <span className="text-lg font-extrabold text-slate-900 font-mono">
                          ${price.totalBuyPriceNZD.toLocaleString()}{" "}
                          <span className="text-xs text-slate-500 font-normal">NZD</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 mt-0.5">
                        ✓ FOB, RoRo, GST & MR2A compliance pass included
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      audio.playSubtleClick();
                      setInspectVehicle(vehicle);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    View Specs
                  </button>

                  {isAvailable ? (
                    <button
                      onClick={() => {
                        audio.playSubtleClick();
                        setReserveVehicle(vehicle);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold transition-all shadow-soft shadow-crimson-600/20 text-center cursor-pointer flex items-center justify-center gap-1 group/btn"
                    >
                      <span>Reserve</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed text-center"
                    >
                      Held
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vehicle Full Specs & Inspection Modal */}
      <VehicleDetailModal
        vehicle={inspectVehicle}
        onClose={() => setInspectVehicle(null)}
        onReserveClick={(v) => {
          setInspectVehicle(null);
          setReserveVehicle(v);
        }}
      />

      {/* Atomic Reservation Lock Modal */}
      <AtomicReservationModal
        vehicle={reserveVehicle}
        onClose={() => setReserveVehicle(null)}
        onSuccess={handleReservationSuccess}
      />
    </div>
  );
}

