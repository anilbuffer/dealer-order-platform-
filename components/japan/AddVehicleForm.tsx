"use client";

import React, { useState } from "react";
import { Vehicle } from "@/lib/types";
import { useProgramme } from "@/lib/programme-context";
import { audio } from "@/lib/sound";
import {
  Car,
  CheckCircle2,
  ArrowLeft,
  Plus,
} from "lucide-react";

interface AddVehicleFormProps {
  onSuccessReturn: () => void;
}

export default function AddVehicleForm({ onSuccessReturn }: AddVehicleFormProps) {
  const { addVehicle } = useProgramme();
  const [stockId, setStockId] = useState("NIS-2026-9055");
  const [vinChassis, setVinChassis] = useState("");
  const [model, setModel] = useState("Note e-Power");
  const [grade, setGrade] = useState("X Package");
  const [year, setYear] = useState(2022);
  const [odometerKm, setOdometerKm] = useState(26000);
  const [transmission, setTransmission] = useState("e-Power Drive");
  const [color, setColor] = useState("Pearl White");
  const [fuelType, setFuelType] = useState("e-Power");
  const [driveType, setDriveType] = useState("2WD");
  const [engineCc, setEngineCc] = useState(1200);
  const [auctionGrade, setAuctionGrade] = useState("4.5");
  const [interiorGrade, setInteriorGrade] = useState("A");
  const [exteriorGrade, setExteriorGrade] = useState("A");
  const [location, setLocation] = useState("Yokohama Yard (Bay 5)");
  const [fobPriceJPY, setFobPriceJPY] = useState(1850000);
  const [defectsText, setDefectsText] = useState("Verified clean pass, minor stone chip on left mirror.");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent, status: "DRAFT" | "AVAILABLE") => {
    e.preventDefault();
    if (!vinChassis.trim()) {
      alert("VIN Chassis number is mandatory.");
      return;
    }

    setIsSubmitting(true);
    audio.playSubtleClick();

    addVehicle({
      stockId,
      vinChassis,
      make: "Nissan",
      model,
      grade,
      year,
      odometerKm,
      transmission: transmission as Vehicle["transmission"],
      color,
      fuelType: fuelType as Vehicle["fuelType"],
      driveType: driveType as Vehicle["driveType"],
      engineCc,
      auctionGrade,
      interiorGrade,
      exteriorGrade,
      location,
      images: [imageUrl, "/images/cars/nissan-note.jpg"],
      conditionReportUrl: "https://example.com/reports/yokohama_pass.pdf",
      knownDefects: defectsText ? [defectsText] : ["Clean pass"],
      fobPriceJPY,
      status: status === "AVAILABLE" ? "AVAILABLE" : "WITHDRAWN",
    });

    setTimeout(() => {
      audio.playSuccessChime();
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Add Single Vehicle
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register a verified Japan export vehicle into the programme database (US-06)
          </p>
        </div>

        <button
          type="button"
          onClick={onSuccessReturn}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {isSuccess ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-soft">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Vehicle Registered Successfully</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto font-mono">
              Stock ID: {stockId} ({vinChassis}) is now published to the programme inventory.
            </p>
          </div>

          <button
            onClick={onSuccessReturn}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Return to Inventory Table
          </button>
        </div>
      ) : (
        <form className="bg-white rounded-xl border border-slate-200 p-6 shadow-soft space-y-5">
          {/* Section 1: Identification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Identification & Yard Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Stock ID *</label>
                <input
                  type="text"
                  required
                  value={stockId}
                  onChange={(e) => setStockId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">VIN / Chassis Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. E13-098412"
                  value={vinChassis}
                  onChange={(e) => setVinChassis(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Yard Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Specifications */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Vehicle Technical Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Model *</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="Note e-Power">Nissan Note e-Power</option>
                  <option value="X-Trail">Nissan X-Trail</option>
                  <option value="Serena e-Power">Nissan Serena e-Power</option>
                  <option value="Leaf e+">Nissan Leaf e+</option>
                  <option value="Ariya">Nissan Ariya</option>
                  <option value="Kicks e-Power">Nissan Kicks e-Power</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Grade / Trim</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Year *</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Odometer (km) *</label>
                <input
                  type="number"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="e-Power Drive">e-Power Drive</option>
                  <option value="Automatic">Automatic</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Powertrain</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="e-Power">e-Power</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="100% Electric">100% Electric</option>
                  <option value="Petrol">Petrol</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Condition & Pricing */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Condition & Commercial FOB Value
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Auction Grade *</label>
                <select
                  value={auctionGrade}
                  onChange={(e) => setAuctionGrade(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="5.0">5.0 (Near New)</option>
                  <option value="4.5">4.5 (Excellent)</option>
                  <option value="4.0">4.0 (Good)</option>
                  <option value="RA">RA (Repaired Minor)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Interior Grade</label>
                <select
                  value={interiorGrade}
                  onChange={(e) => setInteriorGrade(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Exterior Grade</label>
                <select
                  value={exteriorGrade}
                  onChange={(e) => setExteriorGrade(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">FOB Price (JPY) *</label>
                <input
                  type="number"
                  required
                  value={fobPriceJPY}
                  onChange={(e) => setFobPriceJPY(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-medium text-slate-700">Inspection Remarks / Defects</label>
              <input
                type="text"
                value={defectsText}
                onChange={(e) => setDefectsText(e.target.value)}
                placeholder="Inspector comments on tires, glass, minor blemishes..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-medium text-slate-700">Image URL / Media Asset</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onSuccessReturn}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, "DRAFT")}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, "AVAILABLE")}
              className="px-5 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold transition-colors shadow-soft cursor-pointer"
            >
              Publish to Programme
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

