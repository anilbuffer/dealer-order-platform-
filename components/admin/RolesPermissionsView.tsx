"use client";

import React, { useState } from "react";
import { useProgramme } from "@/lib/programme-context";
import { UserRole } from "@/lib/types";
import { audio } from "@/lib/sound";
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  RotateCcw,
  Save,
  Users,
  Building2,
  Car,
  DollarSign,
  FileSpreadsheet,
  FileCheck,
  Eye,
  Sliders,
} from "lucide-react";

interface PermissionDef {
  key: string;
  name: string;
  description: string;
  category: "INVENTORY" | "COMMERCIAL" | "COMPLIANCE" | "ADMINISTRATION";
}

const PERMISSION_DEFINITIONS: PermissionDef[] = [
  // 1. Inventory & Vehicle Catalog
  {
    key: "inventory.browse",
    name: "Browse Stock Catalog",
    description: "Search, filter, and inspect live Tokyo/Yokohama inventory.",
    category: "INVENTORY",
  },
  {
    key: "inventory.view_fob",
    name: "View JPY FOB Wholesale",
    description: "Access supplier baseline auction purchase cost in Japanese Yen.",
    category: "INVENTORY",
  },
  {
    key: "inventory.view_landed",
    name: "View Landed NZD Buy Price",
    description: "Inspect itemized delivery, freight, GST, and MR2A compliance costs.",
    category: "INVENTORY",
  },
  {
    key: "inventory.reserve_hold",
    name: "24-Hour Atomic Hold Lock",
    description: "Execute exclusive reservation lock preventing duplicate allocation.",
    category: "INVENTORY",
  },
  {
    key: "inventory.create_edit",
    name: "Add & Edit Vehicle Specs",
    description: "Create stock entries, edit VIN chassis, powertrain, and auction grade.",
    category: "INVENTORY",
  },
  {
    key: "inventory.batch_upload",
    name: "Batch Manifest Excel Upload",
    description: "Ingest bulk vehicle manifests via Excel (.xlsx) and CSV spreadsheets.",
    category: "INVENTORY",
  },

  // 2. Commercial & Pricing Operations
  {
    key: "commercial.view_margins",
    name: "Retail Gross Margin Calculator",
    description: "View benchmark trade price, estimated gross profit, and dealer ROI.",
    category: "COMMERCIAL",
  },
  {
    key: "commercial.configure_zones",
    name: "Configure Pricing Zones (1-5)",
    description: "Update domestic delivery tariffs and compliance pricing constants.",
    category: "COMMERCIAL",
  },
  {
    key: "commercial.approve_dealers",
    name: "Approve Dealer Onboarding",
    description: "Review franchise applications, assign pricing zones, and clear credit.",
    category: "COMMERCIAL",
  },
  {
    key: "commercial.override_costs",
    name: "Attach Additional Logistic Costs",
    description: "Add or dispute port storage, demurrage, and compliance repair charges.",
    category: "COMMERCIAL",
  },

  // 3. Inspection & Border Compliance
  {
    key: "compliance.view_auction_sheet",
    name: "Inspect Auction Sheets & Defects",
    description: "Access high-resolution Japanese auction inspection sheets and defect maps.",
    category: "COMPLIANCE",
  },
  {
    key: "compliance.jevic_signoff",
    name: "JEVIC Odometer Sign-Off",
    description: "Verify electronic odometer authenticity and radiation safety stamp.",
    category: "COMPLIANCE",
  },
  {
    key: "compliance.mr2a_certification",
    name: "MR2A Entry Certification",
    description: "Issue 1-year WoF, brake roller results, and Landata registration clearance.",
    category: "COMPLIANCE",
  },
  {
    key: "compliance.biosecurity_export",
    name: "Biosecurity & MPI Clearance",
    description: "Export quarantine heat treatment and border biosecurity dossiers.",
    category: "COMPLIANCE",
  },

  // 4. Platform Administration & Governance
  {
    key: "admin.manage_users",
    name: "User Account Management",
    description: "Invite platform personnel, assign dealerships, and revoke sessions.",
    category: "ADMINISTRATION",
  },
  {
    key: "admin.manage_roles",
    name: "Modify RBAC Matrix",
    description: "Configure granular operational boundaries and privilege matrices.",
    category: "ADMINISTRATION",
  },
  {
    key: "admin.view_audit_log",
    name: "Immutable Audit Event Log",
    description: "Inspect chronological ledger of all platform commercial actions.",
    category: "ADMINISTRATION",
  },
  {
    key: "admin.export_financials",
    name: "Export Financial & Customs Dossiers",
    description: "Generate CSV reports for NZ Customs, IRD GST returns, and accounting.",
    category: "ADMINISTRATION",
  },
];

// Initial default permission matrix
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  AUTOHUB_ADMIN: [
    "inventory.browse",
    "inventory.view_fob",
    "inventory.view_landed",
    "inventory.reserve_hold",
    "inventory.create_edit",
    "inventory.batch_upload",
    "commercial.view_margins",
    "commercial.configure_zones",
    "commercial.approve_dealers",
    "commercial.override_costs",
    "compliance.view_auction_sheet",
    "compliance.jevic_signoff",
    "compliance.mr2a_certification",
    "compliance.biosecurity_export",
    "admin.manage_users",
    "admin.manage_roles",
    "admin.view_audit_log",
    "admin.export_financials",
  ],
  NISSAN_JAPAN: [
    "inventory.browse",
    "inventory.view_fob",
    "inventory.create_edit",
    "inventory.batch_upload",
    "compliance.view_auction_sheet",
    "compliance.jevic_signoff",
    "compliance.biosecurity_export",
    "commercial.override_costs",
  ],
  DEALER_ADMIN: [
    "inventory.browse",
    "inventory.view_landed",
    "inventory.reserve_hold",
    "commercial.view_margins",
    "compliance.view_auction_sheet",
    "admin.manage_users",
  ],
  DEALER_USER: [
    "inventory.browse",
    "inventory.view_landed",
    "inventory.reserve_hold",
    "commercial.view_margins",
    "compliance.view_auction_sheet",
  ],
  READONLY_AUDITOR: [
    "compliance.view_auction_sheet",
    "compliance.jevic_signoff",
    "compliance.mr2a_certification",
    "admin.view_audit_log",
    "admin.export_financials",
  ],
};

const ROLES_META: {
  role: UserRole;
  title: string;
  badgeBg: string;
  badgeText: string;
  tier: string;
  description: string;
}[] = [
  {
    role: "AUTOHUB_ADMIN",
    title: "Operations Central Controller",
    badgeBg: "bg-rose-50 border-rose-200",
    badgeText: "text-[#E11D48]",
    tier: "Tier 1 · Full Authority",
    description: "Central platform management, RoRo transit scheduling, dealer approvals, and cost overrides.",
  },
  {
    role: "NISSAN_JAPAN",
    title: "Yokohama Procurement Lead",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    tier: "Tier 2 · Export Procurement",
    description: "Stock creation, batch manifests, JEVIC odometer verification, and Japan yard marshalling.",
  },
  {
    role: "DEALER_ADMIN",
    title: "Franchise Dealer Principal",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    tier: "Tier 3 · Franchise Executive",
    description: "Dealership governance, terms acceptance, gross profit visibility, and sales team invites.",
  },
  {
    role: "DEALER_USER",
    title: "Dealership Sales & Buyer",
    badgeBg: "bg-slate-100 border-slate-200",
    badgeText: "text-slate-800",
    tier: "Tier 4 · Inventory Buyer",
    description: "Vehicle search, 360 photography, landed NZD buy prices, and 24-hour atomic hold lock.",
  },
  {
    role: "READONLY_AUDITOR",
    title: "Border Compliance Auditor",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-800",
    tier: "Tier 5 · Regulatory Read-Only",
    description: "Independent audit trail inspection, MR2A compliance verification, and customs exports.",
  },
];

export const WHO_ENTERS_WHAT = [
  {
    id: 1,
    information: "Vehicle model, year, grade",
    enteredBy: "Nissan Japan",
    actorBadge: "bg-purple-50 text-purple-700 border-purple-200",
    category: "Stock Specification",
    component: "Single & Batch Vehicle Entry",
    description: "Export yard vehicle catalog profile, manufacture year, and auction grade classification.",
  },
  {
    id: 2,
    information: "Chassis / VIN / Stock ID",
    enteredBy: "Nissan Japan",
    actorBadge: "bg-purple-50 text-purple-700 border-purple-200",
    category: "Identity & Provenance",
    component: "Vehicle Ingestion Engine",
    description: "Original Japanese deregistration document number and unique chassis tracking identifier.",
  },
  {
    id: 3,
    information: "Odometer and specifications",
    enteredBy: "Nissan Japan",
    actorBadge: "bg-purple-50 text-purple-700 border-purple-200",
    category: "Technical Parameters",
    component: "Certified Inspection Ingestion",
    description: "JEVIC certified digital odometer reading (km), powertrain, displacement, and fuel type.",
  },
  {
    id: 4,
    information: "Vehicle photographs",
    enteredBy: "Nissan Japan",
    actorBadge: "bg-purple-50 text-purple-700 border-purple-200",
    category: "Media & Imagery",
    component: "Multi-Angle Photo Storage",
    description: "High-resolution exterior, interior, engine bay, chassis, and tyre condition photo suite.",
  },
  {
    id: 5,
    information: "Condition report and defects",
    enteredBy: "Nissan Japan",
    actorBadge: "bg-purple-50 text-purple-700 border-purple-200",
    category: "Quality Assurance",
    component: "Auction Sheet & Defect Mapping",
    description: "Japanese auction inspection sheets, panel scratch/dent map, interior grade, and radiation stamp.",
  },
  {
    id: 6,
    information: "Vehicle acquisition cost",
    enteredBy: "Nissan Japan, subject to confirmation",
    actorBadge: "bg-purple-50 text-purple-700 border-purple-200",
    category: "Baseline Procurement",
    component: "FOB JPY Wholesale Pricing",
    description: "Wholesale Japan purchase cost in JPY, confirmed prior to export manifest clearance.",
  },
  {
    id: 7,
    information: "Geographic zones",
    enteredBy: "Autohub Admin",
    actorBadge: "bg-blue-50 text-blue-700 border-blue-200",
    category: "Logistics Policy",
    component: "Dealer Approval & Zone Mapping",
    description: "Assignments of Zones 1–5 to approved franchise dealerships based on their physical delivery depot.",
  },
  {
    id: 8,
    information: "Fixed-cost profiles",
    enteredBy: "Autohub Admin",
    actorBadge: "bg-blue-50 text-blue-700 border-blue-200",
    category: "Tariff Baseline",
    component: "Programme Cost Constants",
    description: "Door-to-door RoRo ocean freight, marine insurance cover, and Auckland/Lyttelton port charges.",
  },
  {
    id: 9,
    information: "Standard delivery costs",
    enteredBy: "Autohub Admin",
    actorBadge: "bg-blue-50 text-blue-700 border-blue-200",
    category: "Domestic Movement",
    component: "Linehaul Transport Profiles",
    description: "Two-stage NZ domestic delivery carrier movements to the dealership's physical facility.",
  },
  {
    id: 10,
    information: "Compliance cost components",
    enteredBy: "Autohub Admin",
    actorBadge: "bg-blue-50 text-blue-700 border-blue-200",
    category: "Regulatory Entry",
    component: "MR2A Compliance Schedule",
    description: "Standard entry compliance pass, 1-year WoF, brake roller results, and Landata administration.",
  },
  {
    id: 11,
    information: "Programme component",
    enteredBy: "Autohub Admin",
    actorBadge: "bg-blue-50 text-blue-700 border-blue-200",
    category: "Franchise Governance",
    component: "Nissan Programme Policy",
    description: "Nissan New Zealand certified used vehicle programme royalty and quality seal fee.",
  },
  {
    id: 12,
    information: "Final dealer price calculation",
    enteredBy: "Backend pricing engine",
    actorBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    category: "Deterministic Pricing",
    component: "Landed Pricing Engine",
    description: "Automated real-time calculation producing guaranteed landed buy price with zero dealer estimation.",
  },
  {
    id: 13,
    information: "Dealer-visible Total Buy Price",
    enteredBy: "Dealer Portal",
    actorBadge: "bg-rose-50 text-rose-700 border-rose-200",
    category: "Franchise Interface",
    component: "Stock Catalog & Detail View",
    description: "Clean, transparent landed buy price presented to authorized dealership buyers.",
  },
];

export default function RolesPermissionsView() {
  const { users } = useProgramme();

  const [activeViewTab, setActiveViewTab] = useState<"WHO_ENTERS_WHAT" | "RBAC_MATRIX">(
    "WHO_ENTERS_WHAT"
  );

  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>(
    DEFAULT_ROLE_PERMISSIONS
  );
  const [selectedRole, setSelectedRole] = useState<UserRole>("AUTOHUB_ADMIN");
  const [isSaved, setIsSaved] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const togglePermission = (role: UserRole, permKey: string) => {
    audio.playSubtleClick();
    setIsSaved(false);
    setRolePermissions((prev) => {
      const currentList = prev[role] || [];
      const hasPerm = currentList.includes(permKey);
      const nextList = hasPerm
        ? currentList.filter((k) => k !== permKey)
        : [...currentList, permKey];
      return { ...prev, [role]: nextList };
    });
  };

  const handleSave = () => {
    audio.playSuccessChime();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    audio.playSubtleClick();
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setIsSaved(false);
  };

  const categories = [
    { id: "ALL", label: "All Operational Categories" },
    { id: "INVENTORY", label: "Vehicle & Catalog" },
    { id: "COMMERCIAL", label: "Pricing & Commercial" },
    { id: "COMPLIANCE", label: "JEVIC & Compliance" },
    { id: "ADMINISTRATION", label: "Governance & Security" },
  ];

  const filteredPermissions = PERMISSION_DEFINITIONS.filter(
    (p) => filterCategory === "ALL" || p.category === filterCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header Banner & Action Buttons                          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
              Governance & Security Framework
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● RBAC Matrix Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Roles & Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure granular operational boundaries, financial visibility, and regulatory sign-offs across all 5 platform user tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save RBAC Matrix</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {isSaved && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Role permissions matrix updated successfully across all active platform sessions.</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* View Switcher: Who Enters What vs Granular RBAC Matrix       */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => {
            audio.playSubtleClick();
            setActiveViewTab("WHO_ENTERS_WHAT");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeViewTab === "WHO_ENTERS_WHAT"
              ? "border-[#E11D48] text-[#E11D48]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>1. Who enters what? (Operational Data Ownership)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audio.playSubtleClick();
            setActiveViewTab("RBAC_MATRIX");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeViewTab === "RBAC_MATRIX"
              ? "border-[#E11D48] text-[#E11D48]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Granular RBAC Privilege Matrix</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* VIEW A: 1. WHO ENTERS WHAT? (OPERATIONAL DATA OWNERSHIP)   */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeViewTab === "WHO_ENTERS_WHAT" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-purple-900">Nissan Japan</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                  6 items
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Specs, VIN, Odometer, Photos, Condition Report &amp; FOB Wholesale Cost.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-blue-900">Autohub Admin</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                  5 items
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Geographic Zones (1–5), Fixed Costs, Delivery, Compliance &amp; Programme fees.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-emerald-900">Pricing Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  1 item
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Deterministic real-time Landed Price calculation (zero manual dealer guesswork).
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-rose-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-rose-900">Dealer Portal</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
                  1 item
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Dealer-visible guaranteed Total Buy Price &amp; 24h atomic hold lock.
              </div>
            </div>
          </div>

          {/* Table: Who Enters What */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  1. Who enters what? — Operational Data Ownership Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official boundary matrix defining authoring authority, pricing baseline, and visibility roles.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 font-semibold shadow-2xs">
                v2026.1 Official Policy
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A1322] text-white uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold w-12 text-center">#</th>
                    <th className="py-3.5 px-4 font-semibold w-[260px]">Information</th>
                    <th className="py-3.5 px-4 font-semibold w-[240px]">Entered / Managed by</th>
                    <th className="py-3.5 px-4 font-semibold w-[160px]">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Scope &amp; System Component</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {WHO_ENTERS_WHAT.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-bold">
                        {item.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.information}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${item.actorBadge}`}
                        >
                          {item.enteredBy}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="text-slate-800 font-semibold text-[11px]">
                          {item.component}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.description}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* VIEW B: GRANULAR RBAC PRIVILEGE MATRIX                      */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeViewTab === "RBAC_MATRIX" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 2. Platform Roles Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {ROLES_META.map((meta) => {
              const userCount = users.filter((u) => u.role === meta.role).length;
              const permCount = (rolePermissions[meta.role] || []).length;
              const isSelected = selectedRole === meta.role;

              return (
                <div
                  key={meta.role}
                  onClick={() => {
                    audio.playSubtleClick();
                    setSelectedRole(meta.role);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-white border-[#E11D48] shadow-md ring-1 ring-[#E11D48]"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeBg} ${meta.badgeText}`}>
                        {meta.tier}
                      </span>
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {meta.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                      {meta.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{userCount} Users</span>
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {permCount}/{PERMISSION_DEFINITIONS.length} Perms
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  audio.playSubtleClick();
                  setFilterCategory(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                  filterCategory === cat.id
                    ? "bg-[#0A1322] text-white shadow-2xs font-semibold"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 4. Granular Permissions Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A1322] text-white uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold w-[360px]">
                      Operational Capability &amp; Scope
                    </th>
                    {ROLES_META.map((meta) => (
                      <th
                        key={meta.role}
                        className={`py-3.5 px-3 font-semibold text-center min-w-[130px] ${
                          selectedRole === meta.role ? "bg-[#1B2A42]" : ""
                        }`}
                      >
                        <div className="truncate">{meta.title}</div>
                        <div className="text-[9px] font-normal text-slate-400 normal-case mt-0.5">
                          {meta.role}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPermissions.map((perm) => {
                    return (
                      <tr key={perm.key} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{perm.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-normal">
                              {perm.key}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {perm.description}
                          </p>
                        </td>

                        {ROLES_META.map((meta) => {
                          const isAllowed = (rolePermissions[meta.role] || []).includes(perm.key);
                          const isHighlight = selectedRole === meta.role;

                          return (
                            <td
                              key={meta.role}
                              onClick={() => togglePermission(meta.role, perm.key)}
                              className={`py-3.5 px-3 text-center align-middle cursor-pointer group transition-colors ${
                                isHighlight ? "bg-slate-50/80" : ""
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                    isAllowed
                                      ? meta.role === "AUTOHUB_ADMIN"
                                        ? "bg-[#E11D48] text-white shadow-2xs"
                                        : "bg-emerald-500 text-white shadow-2xs"
                                      : "border border-slate-200 text-transparent group-hover:border-slate-300"
                                  }`}
                                >
                                  {isAllowed ? (
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  ) : (
                                    <span className="text-[9px] text-slate-300 opacity-0 group-hover:opacity-100">
                                      +
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 5. Policy Enforcement Notice                               */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block">
            Commercial Principle: Zero Blind Purchasing
          </span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Certified franchise dealers are exclusively permitted to hold vehicles when itemized landed prices are fully calculated in NZD. Only central controllers (AUTOHUB_ADMIN) and export marshalling directors (NISSAN_JAPAN) hold raw JPY FOB wholesale cost visibility.
          </p>
        </div>
      </div>
    </div>
  );
}

