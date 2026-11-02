"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Globe2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import DealerRegistrationModal from "@/components/onboarding/DealerRegistrationModal";

type ActiveTab = "DEALER" | "ADMIN" | "JAPAN";

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("DEALER");
  const [email, setEmail] = useState("dealer@aucklandnissan.co.nz");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setErrorMsg("");
    if (tab === "DEALER") {
      setEmail("dealer@aucklandnissan.co.nz");
    } else if (tab === "ADMIN") {
      setEmail("ops@autohub.co.nz");
    } else {
      setEmail("kenji.sato@nissan.co.jp");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      const success = loginAs(email);
      if (success) {
        if (activeTab === "DEALER") {
          router.push("/dealer/stocks");
        } else if (activeTab === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/japan/inventory");
        }
      } else {
        setErrorMsg("Unrecognized email address. Click 'Auto-fill demo' to use pre-configured test account.");
      }
      setIsSubmitting(false);
    }, 350);
  };

  const getPortalButtonText = () => {
    if (activeTab === "DEALER") return "Sign in to Dealer Portal";
    if (activeTab === "ADMIN") return "Sign in to Admin Console";
    return "Sign in to Japan Inventory";
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* LEFT HALF: Minimal & Clean Dark Brand Canvas */}
      <div className="relative w-full lg:w-1/2 bg-[#0A1322] flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden text-white border-b lg:border-b-0 lg:border-r border-[#1B2A42]">
        {/* Subtle background ambient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-crimson-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Project Name & Programme Badge */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] flex items-center justify-center font-bold text-lg text-white shadow-soft shadow-crimson-600/30">
            D
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-tight">
              Dealer Order Platform
            </h1>
            <p className="text-[11px] font-medium tracking-wide text-slate-400">
              Nissan Used Vehicle Programme
            </p>
          </div>
        </div>

        {/* Center: Clean & Minimal Hero (Less text as requested) */}
        <div className="relative z-10 my-10 lg:my-0 space-y-5 max-w-lg">
          {/* Subtle live indicator badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F1B2E] border border-[#1B2A42] text-xs text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-500"></span>
            </span>
            <span>Japan Direct Allocation · NZ Programme</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.15]">
            Source smarter from{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E11D48] via-[#FB7185] to-[#FDA4AF]">
              Japan to New Zealand.
            </span>
          </h2>

          {/* Short, focused single line */}
          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            Direct self-service vehicle ordering channel for approved Nissan dealers with guaranteed landed pricing.
          </p>

          {/* 3 Minimal Inline Tags */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1B2E] border border-[#1B2A42]">
              <span className="text-emerald-400 font-bold">✓</span> Certified Japan Stock
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1B2E] border border-[#1B2A42]">
              <span className="text-crimson-400 font-bold">✓</span> Atomic Reservation
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1B2E] border border-[#1B2A42]">
              <span className="text-blue-400 font-bold">✓</span> Door-to-Door Tracking
            </span>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="relative z-10 text-xs text-slate-500 pt-4 border-t border-[#1B2A42]">
          <span>© 2026 Dealer Order Platform · Nissan Used Vehicle Programme</span>
        </div>
      </div>

      {/* RIGHT HALF: Light Canvas Modern Sign-In Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Card Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Sign in to Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select your workspace or sign in with your credentials.
            </p>
          </div>

          {/* Role Toggle Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleTabChange("DEALER")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "DEALER"
                  ? "bg-white text-slate-900 shadow-soft"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Car className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dealer Login</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("ADMIN")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "ADMIN"
                  ? "bg-white text-slate-900 shadow-soft"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Operations</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("JAPAN")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "JAPAN"
                  ? "bg-white text-slate-900 shadow-soft"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Nissan Japan</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  {activeTab === "DEALER" ? "Registered Dealer Email" : "Work / Corporate Email"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "DEALER") setEmail("dealer@aucklandnissan.co.nz");
                    if (activeTab === "ADMIN") setEmail("ops@autohub.co.nz");
                    if (activeTab === "JAPAN") setEmail("kenji.sato@nissan.co.jp");
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Auto-fill demo
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@dealership.co.nz"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all shadow-soft"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => alert("Password reset link will be sent to the registered email.")}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition-all shadow-soft"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl font-medium text-sm transition-all shadow-soft shadow-crimson-600/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{getPortalButtonText()}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="pt-2 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3 h-3 text-amber-500/80" />
              <span>256-bit Encrypted Session · Dealer Order Platform Direct Link</span>
            </div>
          </div>

          {/* Dealer Registration Link (US-01 / AC-01) */}
          <div className="pt-3 border-t border-slate-200/80 text-center">
            <p className="text-xs text-slate-500">
              New Nissan NZ Dealership?{" "}
              <Link
                href="/register"
                className="font-semibold text-crimson-600 hover:text-crimson-700 hover:underline cursor-pointer"
              >
                Register Dealership Application →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Registration & Terms Acceptance Modal */}
      <DealerRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          setActiveTab("DEALER");
          setEmail("dealer@aucklandnissan.co.nz");
        }}
      />
    </div>
  );
}
