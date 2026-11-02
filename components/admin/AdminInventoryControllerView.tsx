"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/lib/types";
import { useProgramme } from "@/lib/programme-context";
import { calculateLandedPrice } from "@/lib/pricing-calculator";
import { audio } from "@/lib/sound";
import CatalogueDetailsModal from "./CatalogueDetailsModal";
import {
  Car,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowUpRight,
  Lock,
} from "lucide-react";

export default function AdminInventoryControllerView() {
  const router = useRouter();
  const { vehicles, toggleVehicleStatus } = useProgramme();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "RESERVED" | "WITHDRAWN">("ALL");
  const [modelFilter, setModelFilter] = useState("ALL");
  const [dossierVehicle, setDossierVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mStock = v.stockId.toLowerCase().includes(q);
        const mModel = v.model.toLowerCase().includes(q);
        const mVin = v.vinChassis.toLowerCase().includes(q);
        if (!mStock && !mModel && !mVin) return false;
      }

      if (statusFilter !== "ALL" && v.status !== statusFilter) {
        return false;
      }

      if (modelFilter !== "ALL" && !v.model.toLowerCase().includes(modelFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [vehicles, searchQuery, statusFilter, modelFilter]);

  const handleToggleStatus = (vehicleId: string) => {
    audio.playSubtleClick();
    toggleVehicleStatus(vehicleId);
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header Banner                                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
              Central Stock Control
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Yokohama &amp; Kobe Dispatch
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central export vehicle repository, Japanese yard staging (Yokohama/Kobe), and franchise dealer publication controls.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 font-mono text-slate-700 font-semibold border border-slate-200">
            {filteredVehicles.length} of {vehicles.length} Units Displayed
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Filter & Search Bar                                      */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stock ID, chassis VIN, or model..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
            />
          </div>

          <div className="w-full sm:w-44">
            <select
              value={modelFilter}
              onChange={(e) => {
                audio.playSubtleClick();
                setModelFilter(e.target.value);
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

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {(["ALL", "AVAILABLE", "RESERVED", "WITHDRAWN"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  audio.playSubtleClick();
                  setStatusFilter(st);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${statusFilter === st
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80"
                  }`}
              >
                {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. Central Inventory Table                                  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-5">Vehicle &amp; Stock ID</th>
                <th className="py-3 px-4">Chassis / VIN</th>
                <th className="py-3 px-4">Grade &amp; Odo</th>
                <th className="py-3 px-4">FOB Price (JPY)</th>
                <th className="py-3 px-4">Zone 1 Landed</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => {
                const price = calculateLandedPrice(vehicle.fobPriceJPY, "ZONE_1");
                const isWithdrawn = vehicle.status === "WITHDRAWN";
                const isReserved = vehicle.status === "RESERVED";

                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={vehicle.images?.[0] || "/images/cars/kicks.png"}
                          alt={vehicle.model || "Vehicle"}
                          className="w-14 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {vehicle.stockId} · {vehicle.grade}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {vehicle.vinChassis}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">Grade {vehicle.auctionGrade}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {vehicle.odometerKm.toLocaleString()} km
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      ¥{vehicle.fobPriceJPY.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${price.totalBuyPriceNZD.toLocaleString()} NZD
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {vehicle.location}
                    </td>

                    <td className="py-3.5 px-4">
                      {isReserved ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          RESERVED
                        </span>
                      ) : isWithdrawn ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                          WITHDRAWN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          AVAILABLE
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => { audio.playSubtleClick(); setDossierVehicle(vehicle); }}
                        className="p-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs hover:border-slate-300 inline-flex items-center"
                        title="View Full Page Details"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(vehicle.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${isWithdrawn
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                            : "bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 border border-slate-200/80"
                          }`}
                      >
                        {isWithdrawn ? "Republish" : "Withdraw"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Inventory Vehicle Dossier Modal */}
      {dossierVehicle && (
        <CatalogueDetailsModal
          vehicle={dossierVehicle}
          onClose={() => setDossierVehicle(null)}
          onNavigateToReservations={() => router.push("/admin/reservations")}
        />
      )}
    </div>
  );
}

