"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { audio } from "@/lib/sound";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ChevronRight,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface FormData {
  dealershipName: string;
  dealerCode: string;
  nzbn: string;
  region: string;
  physicalAddress: string;
  postalCode: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  dispatchEmail: string;
  acceptTerms: boolean;
  acceptCostBoundary: boolean;
}

const STEPS = [
  {
    id: 1,
    title: "Dealership Entity",
    subtitle: "Legal name, Nissan code & location",
    icon: Building2,
  },
  {
    id: 2,
    title: "Authorized Contacts",
    subtitle: "Designated buyer & portal credentials",
    icon: Mail,
  },
  {
    id: 3,
    title: "Commercial Boundary",
    subtitle: "Terms of Trade & landed pricing rules",
    icon: FileText,
  },
  {
    id: 4,
    title: "Review & Submit",
    subtitle: "Verification & Autohub authorization",
    icon: ShieldCheck,
  },
];

export default function DealerRegistrationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState<FormData>({
    dealershipName: "",
    dealerCode: "",
    nzbn: "",
    region: "Auckland",
    physicalAddress: "",
    postalCode: "",
    contactName: "",
    contactTitle: "Dealer Principal",
    contactEmail: "",
    contactPhone: "",
    dispatchEmail: "",
    acceptTerms: false,
    acceptCostBoundary: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.dealershipName.trim()) newErrors.dealershipName = "Legal / Trading Name is required";
      if (!formData.dealerCode.trim()) newErrors.dealerCode = "Nissan Dealer Code is required";
      if (!formData.physicalAddress.trim()) newErrors.physicalAddress = "Physical delivery address is required";
    }

    if (step === 2) {
      if (!formData.contactName.trim()) newErrors.contactName = "Primary Contact Name is required";
      if (!formData.contactEmail.trim() || !formData.contactEmail.includes("@")) {
        newErrors.contactEmail = "Valid business email is required";
      }
      if (!formData.contactPhone.trim()) newErrors.contactPhone = "Direct phone number is required";
    }

    if (step === 3) {
      if (!formData.acceptTerms) newErrors.acceptTerms = "Terms of Trade must be explicitly accepted";
      if (!formData.acceptCostBoundary) {
        newErrors.acceptCostBoundary = "Commercial Additional-Cost Boundary acknowledgement is mandatory";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      audio.playSubtleClick();
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    audio.playSubtleClick();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    // Only allow clicking previous steps or current step
    if (stepId < currentStep) {
      audio.playSubtleClick();
      setCurrentStep(stepId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(1) && validateStep(2) && validateStep(3)) {
      audio.playSuccessChime();
      setIsSubmitted(true);
    }
  };

  const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* LEFT SIDEBAR: Full Height Dark Navy Canvas with Step Tabs */}
      {/* ─────────────────────────────────────────────────────────── */}
      <aside className="w-full lg:w-[380px] xl:w-[420px] bg-[#0A1322] border-b lg:border-b-0 lg:border-r border-[#1B2A42] text-white flex flex-col justify-between p-6 sm:p-8 lg:p-10 shrink-0">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] flex items-center justify-center font-bold text-lg text-white shadow-soft shadow-crimson-600/30">
              D
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight leading-tight">
                Dealer Order Platform
              </h1>
              <p className="text-[11px] font-medium text-slate-400">
                Nissan Used Vehicle Programme · NZ
              </p>
            </div>
          </div>

          {/* Progress Overview Bar */}
          <div className="p-4 rounded-2xl bg-[#0F1B2E] border border-[#1B2A42] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Application Progress</span>
              <span className="font-mono text-crimson-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#1B2A42] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-crimson-600 to-crimson-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(progressPercent, 10)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>

          {/* Vertical Step Tabs */}
          <nav aria-label="Registration Steps" className="space-y-2">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPassed = currentStep > step.id || isSubmitted;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  disabled={step.id > currentStep}
                  className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl transition-all text-left group relative ${
                    isActive
                      ? "bg-white/10 text-white nav-active-glow shadow-soft border border-white/10"
                      : isPassed
                      ? "text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
                      : "text-slate-500 cursor-not-allowed opacity-60"
                  }`}
                >
                  {/* Step Number Circle */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isActive
                        ? "bg-crimson-600 text-white shadow-soft"
                        : isPassed
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-[#142239] text-slate-500 border border-[#1B2A42]"
                    }`}
                  >
                    {isPassed && !isActive ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs text-white flex items-center justify-between">
                      <span>{step.title}</span>
                      {isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-crimson-600/30 text-rose-300 border border-crimson-500/40">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {step.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Help & Navigation Card */}
        <div className="pt-6 border-t border-[#1B2A42] space-y-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>256-bit Encrypted Programme Verification</span>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>

            <span className="text-[10px] text-slate-400 font-mono">v2026.1 Brief</span>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* RIGHT SIDE: Step Form Cards (Clean & Simple Light Canvas)  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto">
          {/* SUCCESS CONFIRMATION VIEW (US-01 / AC-01) */}
          {isSubmitted ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-soft space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-soft">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Application Successfully Logged</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Dealership Onboarding Received
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-900">{formData.contactName}</strong>. Your franchise application for{" "}
                  <strong className="text-slate-900">{formData.dealershipName}</strong> (Code:{" "}
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">
                    {formData.dealerCode}
                  </code>
                  ) is now securely stored in the programme database.
                </p>
              </div>

              {/* Status Callout - AC-01 Acceptance */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-left text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Current State: Blocked Pending Autohub Authorization (AC-01)</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Under the Nissan Used Vehicle Programme security rules, stock catalogue visibility and price calculations remain blocked until an Autohub Administrator verifies your dealer code and assigns your <strong>Geographic Pricing Zone</strong>.
                </p>
                <div className="pt-1 text-[11px] text-amber-700">
                  You will receive an automated notification at <strong className="font-mono">{formData.contactEmail}</strong> once approved.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-soft cursor-pointer"
                >
                  Return to Sign In Portal
                </button>
                <button
                  type="button"
                  onClick={() => alert("Application PDF receipt generated with UTC timestamp and terms hash.")}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Download Application Copy
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-soft">
              {/* Step Header */}
              <div className="mb-8 pb-4 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-crimson-600">
                    Step {currentStep} of {STEPS.length}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                    {STEPS[currentStep - 1].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {STEPS[currentStep - 1].subtitle}
                  </p>
                </div>
              </div>

              {/* ────────────────────────────────────────────── */}
              {/* STEP 1: Dealership Entity Information          */}
              {/* ────────────────────────────────────────────── */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Legal / Trading Dealership Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.dealershipName}
                        onChange={(e) => updateField("dealershipName", e.target.value)}
                        placeholder="e.g. Auckland Nissan City Ltd"
                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white rounded-xl border ${
                          errors.dealershipName ? "border-crimson-500 ring-1 ring-crimson-500" : "border-slate-200"
                        } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all`}
                      />
                    </div>
                    {errors.dealershipName && (
                      <p className="text-[11px] text-crimson-600">{errors.dealershipName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Nissan Dealer Code *
                      </label>
                      <input
                        type="text"
                        value={formData.dealerCode}
                        onChange={(e) => updateField("dealerCode", e.target.value.toUpperCase())}
                        placeholder="e.g. NZ-NIS-AKL04"
                        className={`w-full px-3.5 py-2.5 text-sm font-mono bg-white rounded-xl border ${
                          errors.dealerCode ? "border-crimson-500 ring-1 ring-crimson-500" : "border-slate-200"
                        } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all`}
                      />
                      {errors.dealerCode && (
                        <p className="text-[11px] text-crimson-600">{errors.dealerCode}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        NZBN (NZ Business Number)
                      </label>
                      <input
                        type="text"
                        value={formData.nzbn}
                        onChange={(e) => updateField("nzbn", e.target.value)}
                        placeholder="942903829..."
                        className="w-full px-3.5 py-2.5 text-sm font-mono bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Geographic Region / Island *
                      </label>
                      <select
                        value={formData.region}
                        onChange={(e) => updateField("region", e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all"
                      >
                        <option value="Auckland">Auckland Metro (Zone 1)</option>
                        <option value="Waikato">Waikato / Bay of Plenty (Zone 2)</option>
                        <option value="Wellington">Wellington / Lower North Island (Zone 3)</option>
                        <option value="Canterbury">Canterbury / South Island (Zone 4)</option>
                        <option value="Otago">Otago / Southland (Zone 4)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Postal Code</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => updateField("postalCode", e.target.value)}
                        placeholder="e.g. 1051"
                        className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Dealership Physical Delivery Address *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.physicalAddress}
                        onChange={(e) => updateField("physicalAddress", e.target.value)}
                        placeholder="Street address where vehicles will be delivered"
                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white rounded-xl border ${
                          errors.physicalAddress ? "border-crimson-500 ring-1 ring-crimson-500" : "border-slate-200"
                        } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all`}
                      />
                    </div>
                    {errors.physicalAddress && (
                      <p className="text-[11px] text-crimson-600">{errors.physicalAddress}</p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Standard pricing includes two NZ domestic carrier delivery movements to this address.
                    </p>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────── */}
              {/* STEP 2: Authorized Contacts                    */}
              {/* ────────────────────────────────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Primary Contact Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => updateField("contactName", e.target.value)}
                        placeholder="e.g. Jason Bell"
                        className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border ${
                          errors.contactName ? "border-crimson-500 ring-1 ring-crimson-500" : "border-slate-200"
                        } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all`}
                      />
                      {errors.contactName && (
                        <p className="text-[11px] text-crimson-600">{errors.contactName}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Role / Position</label>
                      <input
                        type="text"
                        value={formData.contactTitle}
                        onChange={(e) => updateField("contactTitle", e.target.value)}
                        placeholder="Dealer Principal / General Manager"
                        className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Business Email (Sign-In) *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => updateField("contactEmail", e.target.value)}
                          placeholder="jason@dealership.co.nz"
                          className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white rounded-xl border ${
                            errors.contactEmail ? "border-crimson-500 ring-1 ring-crimson-500" : "border-slate-200"
                          } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all`}
                        />
                      </div>
                      {errors.contactEmail && (
                        <p className="text-[11px] text-crimson-600">{errors.contactEmail}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Direct Phone / Mobile *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          value={formData.contactPhone}
                          onChange={(e) => updateField("contactPhone", e.target.value)}
                          placeholder="+64 21 000 0000"
                          className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white rounded-xl border ${
                            errors.contactPhone ? "border-crimson-500 ring-1 ring-crimson-500" : "border-slate-200"
                          } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all`}
                        />
                      </div>
                      {errors.contactPhone && (
                        <p className="text-[11px] text-crimson-600">{errors.contactPhone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Secondary Logistics / Dispatch Notification Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.dispatchEmail}
                      onChange={(e) => updateField("dispatchEmail", e.target.value)}
                      placeholder="logistics@dealership.co.nz"
                      className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all"
                    />
                    <p className="text-[11px] text-slate-400">
                      Receives shipping arrival and compliance milestone notices.
                    </p>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────── */}
              {/* STEP 3: Commercial Boundary & Terms (US-02)    */}
              {/* ────────────────────────────────────────────── */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Price Boundary Comparison Box */}
                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/70">
                    <div className="px-4 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Dealer-Visible Commercial Boundary</span>
                      <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                        v2026.1 Official Policy
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5">
                        <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Included in Total Buy Price:
                        </span>
                        <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                          <li>Vehicle FOB acquisition cost (Japan)</li>
                          <li>Standard door-to-door RoRo ocean shipment</li>
                          <li>NZ Customs processing & NZ GST</li>
                          <li>Standard MR2A compliance inspection</li>
                          <li>Two standard NZ delivery carrier movements</li>
                          <li>Nissan programme component fee</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 space-y-1.5">
                        <span className="font-bold text-amber-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Potential Additional Cost:
                        </span>
                        <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                          <li>Non-standard compliance repairs</li>
                          <li>Repair certification / engineering evidence</li>
                          <li>Parts & labour beyond standard inspection</li>
                          <li>Border flag bio-security clearance</li>
                          <li>Non-standard storage or regional redelivery</li>
                          <li>Dealer-requested accessories or grooming</li>
                        </ul>
                      </div>
                    </div>

                    <div className="px-4 py-2.5 bg-slate-100/50 border-t border-slate-200 text-[11px] text-slate-500 italic">
                      Notice: Fixed pricing assumes a standard compliance pass. Any separately chargeable work will be identified and evidenced prior to work execution.
                    </div>
                  </div>

                  {/* Mandatory Checkbox 1: Terms of Trade */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.acceptTerms
                        ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300"
                        : errors.acceptTerms
                        ? "bg-crimson-50/40 border-crimson-300 ring-1 ring-crimson-300"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => updateField("acceptTerms", e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-crimson-600 focus:ring-crimson-500 border-slate-300"
                    />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 block mb-0.5">
                        Acceptance of Nissan NZ Programme Terms of Trade (v2026.1) *
                      </strong>
                      I confirm that our dealership accepts the Terms of Trade governing stock assessment, 24-hour reservation holding rules, and binding purchase allocations.
                    </div>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-[11px] text-crimson-600 mt-1">{errors.acceptTerms}</p>
                  )}

                  {/* Mandatory Checkbox 2: Additional Cost Boundary */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.acceptCostBoundary
                        ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300"
                        : errors.acceptCostBoundary
                        ? "bg-crimson-50/40 border-crimson-300 ring-1 ring-crimson-300"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.acceptCostBoundary}
                      onChange={(e) => updateField("acceptCostBoundary", e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-crimson-600 focus:ring-crimson-500 border-slate-300"
                    />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 block mb-0.5">
                        Commercial Additional-Cost Boundary Acknowledgement *
                      </strong>
                      I acknowledge that fixed prices assume a standard compliance pass. Any unexpected repairs or certifications will be evidenced and approved separately before work commences.
                    </div>
                  </label>
                  {errors.acceptCostBoundary && (
                    <p className="text-[11px] text-crimson-600 mt-1">{errors.acceptCostBoundary}</p>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────── */}
              {/* STEP 4: Review & Final Submission              */}
              {/* ────────────────────────────────────────────── */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-800">1. Dealership Entity</span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-crimson-600 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 block">Dealership:</span>
                        <strong className="text-slate-900">{formData.dealershipName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Dealer Code:</span>
                        <strong className="text-slate-900 font-mono">{formData.dealerCode}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Region:</span>
                        <span className="text-slate-900">{formData.region}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Physical Address:</span>
                        <span className="text-slate-900 truncate block">{formData.physicalAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-800">2. Primary Contact</span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-crimson-600 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 block">Contact Name:</span>
                        <strong className="text-slate-900">{formData.contactName} ({formData.contactTitle})</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Business Email:</span>
                        <strong className="text-slate-900 font-mono">{formData.contactEmail}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Direct Phone:</span>
                        <span className="text-slate-900 font-mono">{formData.contactPhone}</span>
                      </div>
                      {formData.dispatchEmail && (
                        <div>
                          <span className="text-slate-400 block">Dispatch Email:</span>
                          <span className="text-slate-900 font-mono">{formData.dispatchEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-1.5 text-emerald-900">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Commercial Boundary & Terms Confirmed</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Both Terms of Trade (v2026.1) and Additional-Cost Boundary acknowledgements have been evidenced and will be archived with an immutable UTC audit event upon submission.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Controls Footer */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cancel Application</span>
                  </Link>
                )}

                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold transition-all shadow-soft shadow-crimson-600/20 group cursor-pointer"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold transition-all shadow-soft shadow-crimson-600/30 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Dealership Application</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

