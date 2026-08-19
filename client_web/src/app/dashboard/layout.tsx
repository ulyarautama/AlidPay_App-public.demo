"use client";

import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/axios";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    api
      .get("/api/admin/me")
      .then(() => {
        if (active) setAuthChecked(true);
      })
      .catch(() => {
        if (active) {
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#6B1E2C]" />
          <p className="mt-4 text-xs font-semibold text-slate-400">
            Verifying secure admin session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B1E2C] text-white shadow-lg shadow-[#6B1E2C]/20">
              <ShieldCheck size={22} />
            </div>

            <div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">
                Alid<span className="text-[#6B1E2C]">Pay</span>
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Admin Panel
              </div>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Overview
          </p>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              href="/dashboard/transaction"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <CreditCard size={18} />
              Transactions
            </Link>

            <Link
              href="/dashboard/disputes"
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="flex items-center gap-3">
                <AlertTriangle size={18} />
                Disputes
              </span>

              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-[10px] font-bold text-red-600">
                3
              </span>
            </Link>
          </nav>

          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Management
          </p>

          <nav className="space-y-1">
            <Link
              href="/dashboard/users"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Users size={18} />
              Users
            </Link>

            <Link
              href="/dashboard/wallet"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Wallet size={18} />
              Finance
            </Link>

            <Link
              href="/dashboard/reports"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <BarChart3 size={18} />
              Reports
            </Link>
          </nav>

          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            System
          </p>

          <nav className="space-y-1">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Settings size={18} />
              Settings
            </Link>
          </nav>
        </div>

        {/* PROFILE */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6B1E2C] text-xs font-bold text-white">
              AD
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                Administrator
              </p>

              <p className="truncate text-xs text-slate-400">
                admin@alidpay.com
              </p>
            </div>

            <MoreHorizontal size={17} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="lg:pl-[260px]">
        {/* MOBILE TOPBAR */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-slate-200 bg-white/90 px-5 backdrop-blur-xl sm:px-8 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>

          <div className="ml-3">
            <p className="text-sm font-bold text-slate-900">AlidPay Admin</p>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
