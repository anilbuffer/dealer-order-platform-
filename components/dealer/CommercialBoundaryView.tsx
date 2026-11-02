"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, FileText, ShieldCheck, Info } from "lucide-react";

export default function CommercialBoundaryView() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Commercial Policy & Pricing Boundary
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              v2026.1 Terms of Trade
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Commercial Cost Boundary
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent policy governing fixed Total Buy Price inclusions versus separately chargeable compliance items.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Acknowledged by Dealership</span>
        </div>
      </div>

      {/* Two Column Comparative Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Fixed Inclusions */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-100 text-emerald-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Included in Total Buy Price</h2>
              <p className="text-[11px] text-emerald-700">Covered in your fixed landed invoice</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <strong className="text-slate-900 block">Vehicle Acquisition Cost (Japan FOB)</strong>
                Direct vehicle purchase cost converted from JPY to NZD at agreed exchange rates.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <strong className="text-slate-900 block">Standard Door-to-Door RoRo Shipment</strong>
                Marine transit from Yokohama / Kobe terminal to Port of Auckland.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <strong className="text-slate-900 block">Customs Clearance & NZ GST (15%)</strong>
                Import tariffs, biosecurity import clearance, and New Zealand GST.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <strong className="text-slate-900 block">Standard MR2A Entry Compliance Pass</strong>
                Initial entry certification inspection by certified NZ compliance technicians.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <strong className="text-slate-900 block">Two Standard NZ Delivery Carrier Movements</strong>
                Transfer from port to compliance center, and compliance center to your dealership address.
              </div>
            </li>
          </ul>
        </div>

        {/* Right Column: Separately Chargeable */}
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-amber-100 text-amber-800">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Potential Additional Cost</h2>
              <p className="text-[11px] text-amber-700">Evidenced & approved prior to work</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                !
              </span>
              <div>
                <strong className="text-slate-900 block">Non-Standard Compliance Repairs</strong>
                Remediation of unexpected mechanical defects, seatbelts, or structural rust required for MR2A.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                !
              </span>
              <div>
                <strong className="text-slate-900 block">Specialized Engineering Certifications</strong>
                LVVTA certifications, brake test certificates, or structural evidence documentation.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                !
              </span>
              <div>
                <strong className="text-slate-900 block">Border Flag Bio-Security Clearance</strong>
                MPI bio-security decontamination washes or specialized quarantine holding.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                !
              </span>
              <div>
                <strong className="text-slate-900 block">Non-Standard Storage & Secondary Redelivery</strong>
                Demurrage costs if dealer holds delivery, or transport to non-primary locations.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                !
              </span>
              <div>
                <strong className="text-slate-900 block">Dealer-Requested Accessories & Detailing</strong>
                Towbars, audio headunit localization, tinting, or ceramic paint protection.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Governance & Approval Workflow Note */}
      <div className="bg-[#0A1322] text-white p-6 rounded-2xl border border-[#1B2A42] shadow-soft space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Info className="w-4 h-4 text-crimson-500" />
          <span>Variation Approval Protocol (US-18)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          AutoHub cannot charge any additional repair or certification expense without providing photographic inspection evidence and receiving explicit written/portal approval from an authorized dealer principal. If a dealer declines a proposed variation, the vehicle will be re-evaluated for release or alternative resolution under the Nissan Programme governance.
        </p>
      </div>
    </div>
  );
}

