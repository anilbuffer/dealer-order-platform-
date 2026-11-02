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
  ChevronDown,
  Car,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function DealerStockCatalog() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("ALL");
  const [selectedFuel, setSelectedFuel] = useState("ALL");
  const [sortBy, setSortBy] = useState<"PRICE_ASC" | "PRICE_DESC" | "KM_ASC" | "YEAR_DESC">("PRICE_ASC");

  // Modals
  const [inspectVehicle, setInspectVehicle] = useState<Vehicle | null>(null);
  const [reserveVehicle, setReserveVehicle] = useState<Vehicle | null>(null);

  // Filtered & Sorted Stock
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
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
        const priceA = calculateLandedPrice(a.fobPriceJPY, "ZONE_1").totalBuyPriceNZD;
        const priceB = calculateLandedPrice(b.fobPriceJPY, "ZONE_1").totalBuyPriceNZD;

        if (sortBy === "PRICE_ASC") return priceA - priceB;
        if (sortBy === "PRICE_DESC") return priceB - priceA;
        if (sortBy === "KM_ASC") return a.odometerKm - b.odometerKm;
        return b.year - a.year;
      });
  }, [vehicles, searchQuery, selectedModel, selectedFuel, sortBy]);

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

  const availableCount = filteredVehicles.filter((v) => v.status === "AVAILABLE").length;

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Minimal Header Banner (Required Info Only)              */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Available Stock
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auckland Nissan City · Zone 1 Landed Pricing (GST & MR2A Pass Included)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            Showing <strong className="text-slate-900">{availableCount}</strong> available units
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Sleek Filter Bar (No Heavy Text or Multi Colors)       */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, stock ID, or chassis..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
            />
          </div>

          {/* Model Selector */}
          <div className="w-full sm:w-44">
            <select
              value={selectedModel}
              onChange={(e) => {
                audio.playSubtleClick();
                setSelectedModel(e.target.value);
              }}
              aria-label="Filter by model"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer font-medium"
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
          <div className="w-full sm:w-44">
            <select
              value={sortBy}
              onChange={(e) => {
                audio.playSubtleClick();
                setSortBy(e.target.value as any);
              }}
              aria-label="Sort inventory"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer font-medium"
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
          {["ALL", "e-Power", "Hybrid", "100% Electric"].map((fuel) => (
            <button
              key={fuel}
              onClick={() => {
                audio.playSubtleClick();
                setSelectedFuel(fuel);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${selectedFuel === fuel
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {fuel === "ALL" ? "All" : fuel}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. Premium 16:10 Aspect Ratio Vehicle Cards               */}
      {/* ─────────────────────────────────────────────────────────── */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
          <Car className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-sm text-slate-900">No vehicles match your criteria</h3>
          <p className="text-xs text-slate-500">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map((vehicle) => {
            const price = calculateLandedPrice(vehicle.fobPriceJPY, "ZONE_1");
            const isAvailable = vehicle.status === "AVAILABLE";

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-soft hover:shadow-soft-md transition-smooth flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with 16:10 Aspect Ratio */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />

                    {/* Single subtle condition badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white font-mono text-[10px] font-semibold">
                        Grade {vehicle.auctionGrade}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-mono">
                        {vehicle.stockId}
                      </span>
                    </div>

                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5">
                          <Lock className="w-3 h-3" />
                          Reserved
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">
                        {vehicle.year} · {vehicle.transmission}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {vehicle.model} <span className="text-slate-500 font-normal">{vehicle.grade}</span>
                      </h3>
                    </div>

                    {/* Minimal Specs */}
                    <div className="flex items-center justify-between text-xs text-slate-600 py-1.5 border-y border-slate-100">
                      <span>{vehicle.odometerKm.toLocaleString()} km</span>
                      <span className="text-slate-300">•</span>
                      <span>{vehicle.fuelType}</span>
                      <span className="text-slate-300">•</span>
                      <span>{vehicle.driveType}</span>
                    </div>

                    {/* Clean Landed Price */}
                    <div className="pt-0.5 flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-500">Total Landed</span>
                      <span className="text-lg font-bold font-mono text-slate-900">
                        ${price.totalBuyPriceNZD.toLocaleString()} <span className="text-xs text-slate-500 font-normal">NZD</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      audio.playSubtleClick();
                      setInspectVehicle(vehicle);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer text-center"
                  >
                    Details
                  </button>

                  {isAvailable ? (
                    <button
                      onClick={() => {
                        audio.playSubtleClick();
                        setReserveVehicle(vehicle);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-medium transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Reserve</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed text-center"
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

      {/* Modals */}
      <VehicleDetailModal
        vehicle={inspectVehicle}
        onClose={() => setInspectVehicle(null)}
        onReserveClick={(v) => {
          setInspectVehicle(null);
          setReserveVehicle(v);
        }}
      />

      <AtomicReservationModal
        vehicle={reserveVehicle}
        onClose={() => setReserveVehicle(null)}
        onSuccess={handleReservationSuccess}
      />
    </div>
  );
}
