"use client";

import React, { useState } from "react";
import { DealerAccount, ZoneId } from "@/lib/types";
import { useProgramme } from "@/lib/programme-context";
import { MOCK_PRICING_ZONES } from "@/lib/mock-data";
import { audio } from "@/lib/sound";
import {
  Users,
  CheckCircle2,
  XCircle,
  Building2,
  FileCheck2,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function DealerApprovalsView() {
  const { dealers, approveDealer, rejectDealer } = useProgramme();
  const [selectedZone, setSelectedZone] = useState<Record<string, ZoneId>>({
    DEALER_005: "ZONE_5",
  });
  const [notification, setNotification] = useState<string | null>(null);

  const pendingDealers = dealers.filter((d) => d.status === "PENDING_APPROVAL");
  const approvedDealers = dealers.filter((d) => d.status === "APPROVED");

  const handleApprove = (dealerId: string) => {
    audio.playSuccessChime();
    const assignedZone = selectedZone[dealerId] || "ZONE_1";
    approveDealer(dealerId, assignedZone);
    setNotification(`Dealership ${dealerId} approved successfully and assigned to ${assignedZone}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReject = (dealerId: string) => {
    audio.playSubtleClick();
    rejectDealer(dealerId);
    setNotification(`Dealership application ${dealerId} has been declined.`);
    setTimeout(() => setNotification(null), 4000);
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
              Dealer Authorizations
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Nissan NZ Franchise Network
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dealer Onboarding &amp; Zone Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify franchise applicant legal credentials, validate Terms of Trade (v2026.1) agreements, and assign geographic pricing profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
            {approvedDealers.length} Active Franchisees
          </span>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Pending Dealer Applications Queue                       */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Pending Applications ({pendingDealers.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Requires Zone assignment &amp; approval before stock catalog access is granted
          </span>
        </div>

        {pendingDealers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-700">All dealer applications have been reviewed</p>
            <p className="text-slate-400">New franchise dealer registrations will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDealers.map((dealer) => {
              const currentZone = selectedZone[dealer.id] || dealer.pricingZoneId;
              return (
                <div
                  key={dealer.id}
                  className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-6 space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-extrabold text-lg shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            {dealer.legalTradingName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                            PENDING AUTHORIZATION
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          Dealer Code: {dealer.dealerCode} · NZBN: {dealer.nzbn}
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{dealer.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-left md:text-right space-y-1 text-xs">
                      <div className="text-slate-600 flex items-center md:justify-end gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dealer.primaryContactEmail}</span>
                      </div>
                      <div className="text-slate-600 flex items-center md:justify-end gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dealer.primaryContactPhone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Primary Contact: <strong className="text-slate-700">{dealer.primaryContactName}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Verification Summary & Zone Assignment Bar */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Terms of Trade Compliance
                      </span>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mt-1">
                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                        <span>Terms {dealer.termsAcceptedVersion} Agreed</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Cost Boundary Policy
                      </span>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mt-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Commercial Policy Acknowledged</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                        Assign Geographic Pricing Zone
                      </label>
                      <select
                        value={currentZone}
                        onChange={(e) =>
                          setSelectedZone((prev) => ({
                            ...prev,
                            [dealer.id]: e.target.value as ZoneId,
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer font-medium"
                      >
                        {MOCK_PRICING_ZONES.map((z) => (
                          <option key={z.zoneId} value={z.zoneId}>
                            {z.zoneId}: {z.zoneName} (${z.deliveryCostNZD.toLocaleString()} NZD)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleReject(dealer.id)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-700 text-xs font-extrabold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                    >
                      Decline Application
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(dealer.id)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-extrabold transition-all shadow-[0_3px_12px_rgba(5,150,105,0.25)] hover:shadow-[0_4px_16px_rgba(5,150,105,0.35)] cursor-pointer flex items-center gap-2 active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authorize Franchise &amp; Assign Zone</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. Approved Franchise Network Table                        */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Approved Franchise Dealers ({approvedDealers.length})
            </h2>
            <p className="text-xs text-slate-500">
              Active Nissan New Zealand dealers with self-service ordering permissions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-5">Dealership</th>
                <th className="py-3 px-4">NZBN</th>
                <th className="py-3 px-4">Pricing Zone</th>
                <th className="py-3 px-4">Delivery Rate</th>
                <th className="py-3 px-4">Primary Contact</th>
                <th className="py-3 px-4">Terms Version</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvedDealers.map((d) => {
                const zone = MOCK_PRICING_ZONES.find((z) => z.zoneId === d.pricingZoneId);
                return (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      <div>{d.legalTradingName}</div>
                      <div className="text-[11px] font-mono text-slate-400 font-normal">
                        {d.dealerCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{d.nzbn}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono font-semibold text-slate-800 text-[11px]">
                        {d.pricingZoneId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${zone?.deliveryCostNZD.toLocaleString() || "650"} NZD
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{d.primaryContactName}</div>
                      <div className="text-[11px] text-slate-400">{d.primaryContactEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">
                      {d.termsAcceptedVersion}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
