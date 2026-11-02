"use client";

import React, { useState } from "react";
import { Vehicle } from "@/lib/types";
import { useProgramme } from "@/lib/programme-context";
import { audio } from "@/lib/sound";
import JapanInventoryDetailsModal from "./JapanInventoryDetailsModal";
import {
  Search,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  ArrowUpDown,
  Car,
  Filter,
  Eye,
  MoreVertical,
} from "lucide-react";

interface JapanInventoryViewProps {
  onNavigateAdd: () => void;
  onNavigateBatch: () => void;
}

export default function JapanInventoryView({
  onNavigateAdd,
  onNavigateBatch,
}: JapanInventoryViewProps) {
  const { vehicles, toggleVehicleStatus } = useProgramme();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState<Vehicle | null>(null);

  const filteredVehicles = vehicles.filter((v) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchStock = v.stockId.toLowerCase().includes(q);
      const matchModel = v.model.toLowerCase().includes(q);
      const matchVin = v.vinChassis.toLowerCase().includes(q);
      if (!matchStock && !matchModel && !matchVin) return false;
    }

    if (statusFilter !== "ALL" && v.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const handleToggleStatus = (vehicleId: string) => {
    audio.playSubtleClick();
    toggleVehicleStatus(vehicleId);
  };

  const availableCount = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const reservedCount = vehicles.filter((v) => v.status === "RESERVED").length;

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Export Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Nissan Motor Co. Japan · Yokohama & Kobe Export Terminals
          </p>
        </div>

        <div className="flex items-center gap-2">


          <button
            onClick={() => {
              audio.playSubtleClick();
              onNavigateAdd();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Required Info Only) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-soft">
          <span className="text-[11px] text-slate-400 block">Total Listed</span>
          <span className="text-xl font-bold font-mono text-slate-900">{vehicles.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-soft">
          <span className="text-[11px] text-slate-400 block">Available to NZ</span>
          <span className="text-xl font-bold font-mono text-slate-900">{availableCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-soft">
          <span className="text-[11px] text-slate-400 block">Dealer Reserved</span>
          <span className="text-xl font-bold font-mono text-slate-900">{reservedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-soft">
          <span className="text-[11px] text-slate-400 block">Yard Location</span>
          <span className="text-xs font-semibold text-slate-800 mt-1 block">Yokohama Terminal</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stock ID, chassis, or model..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {["ALL", "AVAILABLE", "RESERVED", "WITHDRAWN"].map((st) => (
            <button
              key={st}
              onClick={() => {
                audio.playSubtleClick();
                setStatusFilter(st);
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {st === "ALL" ? "All Units" : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table (Clean, Restrained, Monochromatic) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Vehicle / Model</th>
                <th className="py-3 px-4">Stock ID & VIN</th>
                <th className="py-3 px-4">Grade / Odometer</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">FOB Price (JPY)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => {
                const isAvailable = vehicle.status === "AVAILABLE";
                const isReserved = vehicle.status === "RESERVED";

                return (
                  <tr
                    key={vehicle.id}
                    onClick={() => {
                      audio.playSubtleClick();
                      setSelectedVehicleForDetails(vehicle);
                    }}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={vehicle.images?.[0] || "/images/cars/kicks.png"}
                          alt={vehicle.model || "Vehicle"}
                          className="w-12 h-9 object-contain rounded-md border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">
                            {vehicle.year} {vehicle.model}
                          </div>
                          <div className="text-[11px] text-slate-500">{vehicle.grade}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-800">{vehicle.stockId}</div>
                      <div className="text-[10px] text-slate-400">{vehicle.vinChassis}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">Grade {vehicle.auctionGrade}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {vehicle.odometerKm.toLocaleString()} km
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                      {vehicle.location}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ¥{vehicle.fobPriceJPY.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${isAvailable
                            ? "bg-slate-900 text-white"
                            : isReserved
                              ? "bg-amber-100 text-amber-900"
                              : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audio.playSubtleClick();
                          setSelectedVehicleForDetails(vehicle);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>Details</span>
                      </button>
                      {isReserved ? (
                        <span className="text-[11px] text-slate-400 italic">Held by Dealer</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(vehicle.id)}
                          className="text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                        >
                          {isAvailable ? "Withdraw" : "Publish"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Japan Inventory Vehicle Dossier Modal */}
      {selectedVehicleForDetails && (
        <JapanInventoryDetailsModal
          vehicle={selectedVehicleForDetails}
          onClose={() => setSelectedVehicleForDetails(null)}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}

