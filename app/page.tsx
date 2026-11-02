"use client";

import React from "react";
import LoginPage from "@/components/login/LoginPage";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0A1322] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center font-bold text-lg animate-pulse">
            D
          </div>
          <p className="text-xs text-slate-400 font-mono">Loading Dealer Order Platform...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, render the minimal & clean Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Once authenticated, render the layout shell (68px header, 268px<->76px sidebar, RoleSwitcher)
  return <DashboardShell />;
}
