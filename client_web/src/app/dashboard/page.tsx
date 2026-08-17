"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PackageCheck,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const transactionData = [
  { day: "Sen", value: 42 },
  { day: "Sel", value: 58 },
  { day: "Rab", value: 47 },
  { day: "Kam", value: 76 },
  { day: "Jum", value: 68 },
  { day: "Sab", value: 91 },
  { day: "Min", value: 84 },
];

const recentTransactions = [
  {
    id: "01m06vp3wrcjxd8d8",
    title: "Akun Game 2 Juta",
    buyer: "Auridia",
    seller: "Ulyara",
    amount: "Rp2.400.000",
    status: "Dana Dicairkan",
    statusType: "success",
    time: "2 menit lalu",
  },
  {
    id: "01m06vp2abcjxd8d7",
    title: "iPhone 13 Pro",
    buyer: "Rizky",
    seller: "Dimas Store",
    amount: "Rp7.500.000",
    status: "Dana Ditahan",
    statusType: "warning",
    time: "8 menit lalu",
  },
  {
    id: "01m06vp1xyzjxd8d6",
    title: "Laptop ThinkPad",
    buyer: "Fajar",
    seller: "TechZone",
    amount: "Rp5.200.000",
    status: "Barang Dikirim",
    statusType: "info",
    time: "15 menit lalu",
  },
  {
    id: "01m06vp0qwejxd8d5",
    title: "Akun Steam",
    buyer: "Naufal",
    seller: "GameVault",
    amount: "Rp850.000",
    status: "Sengketa",
    statusType: "danger",
    time: "27 menit lalu",
  },
];

const disputes = [
  {
    id: "#DSP-00128",
    title: "Barang tidak sesuai deskripsi",
    transaction: "Akun Steam Premium",
    user: "Naufal",
    amount: "Rp850.000",
    priority: "Tinggi",
    time: "27 menit lalu",
  },
  {
    id: "#DSP-00127",
    title: "Penjual tidak mengirim barang",
    transaction: "Voucher Game",
    user: "Raka",
    amount: "Rp350.000",
    priority: "Sedang",
    time: "1 jam lalu",
  },
  {
    id: "#DSP-00126",
    title: "Barang berbeda dari pesanan",
    transaction: "Mechanical Keyboard",
    user: "Kevin",
    amount: "Rp1.250.000",
    priority: "Sedang",
    time: "2 jam lalu",
  },
];

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconClass,
  positive = true,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  iconClass: string;
  positive?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        <span
          className={`flex items-center gap-1 font-semibold ${
            positive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </span>

        <span className="text-slate-400">vs bulan lalu</span>
      </div>
    </div>
  );
}

function StatusBadge({
  type,
  children,
}: {
  type: string;
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    warning: "bg-amber-50 text-amber-700 ring-amber-600/10",
    info: "bg-blue-50 text-blue-700 ring-blue-600/10",
    danger: "bg-red-50 text-red-700 ring-red-600/10",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
        styles[type] ?? styles.info
      }`}
    >
      {children}
    </span>
  );
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              className="flex items-center gap-3 rounded-xl bg-[#6B1E2C]/10 px-3 py-2.5 text-sm font-semibold text-[#6B1E2C]"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              href="/dashboard/transactions"
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

        {/* ADMIN PROFILE */}
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

      {/* MAIN */}
      <main className="lg:pl-[260px]">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                Dashboard Overview
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Pantau aktivitas AlidPay secara keseluruhan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50">
              <Bell size={19} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6B1E2C] text-xs font-bold text-white">
                AD
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Administrator
                </p>
                <p className="text-[10px] text-slate-400">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="mx-auto max-w-[1600px] p-5 sm:p-8">
          {/* WELCOME */}
          <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-sm font-medium text-[#6B1E2C]">
                Selamat datang kembali 👋
              </p>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Admin Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Berikut ringkasan aktivitas AlidPay hari ini.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
              <Clock3 size={15} />
              Last updated: Baru saja
            </div>
          </section>

          {/* STATISTICS */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Volume Transaksi"
              value="Rp284,6 Jt"
              change="+18,4%"
              icon={CircleDollarSign}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Total Transaksi"
              value="1.284"
              change="+12,8%"
              icon={CreditCard}
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="Dispute Aktif"
              value="12"
              change="+3,2%"
              icon={AlertTriangle}
              iconClass="bg-red-50 text-red-600"
              positive={false}
            />

            <StatCard
              title="Total Pengguna"
              value="8.492"
              change="+9,7%"
              icon={Users}
              iconClass="bg-violet-50 text-violet-600"
            />
          </section>

          {/* CHART + SYSTEM */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
            {/* CHART */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Aktivitas Transaksi
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Jumlah transaksi dalam 7 hari terakhir
                  </p>
                </div>

                <button className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
                  7 Hari
                  <ChevronRight size={13} className="rotate-90" />
                </button>
              </div>

              <div className="mt-8 flex h-[260px] items-end gap-3 sm:gap-5">
                {transactionData.map((item) => {
                  const max = 100;
                  const height = `${(item.value / max) * 100}%`;

                  return (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                    >
                      <div className="relative flex h-full w-full items-end justify-center">
                        <div
                          className="group relative w-full max-w-[52px] rounded-t-lg bg-[#6B1E2C] transition-all duration-500 hover:bg-[#8A2E3F]"
                          style={{ height }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                            {item.value}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-medium text-slate-400">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SYSTEM STATUS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">System Status</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Kondisi layanan AlidPay
                  </p>
                </div>

                <CheckCircle2 size={21} className="text-emerald-500" />
              </div>

              <div className="mt-6 space-y-4">
                {[
                  ["API Server", "Operational"],
                  ["Database", "Operational"],
                  ["Realtime / WebSocket", "Operational"],
                  ["Payment Service", "Operational"],
                ].map(([name, status]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
                      <span className="text-sm font-medium text-slate-700">
                        {name}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-600">
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <p className="text-xs font-bold text-emerald-800">
                      Semua sistem normal
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-emerald-700">
                      Tidak ada gangguan yang terdeteksi saat ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="mt-6">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">Quick Actions</h3>
              <p className="mt-1 text-xs text-slate-400">
                Akses cepat ke modul administrasi
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/dashboard/disputes"
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <AlertTriangle size={20} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">
                    Review Disputes
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    12 dispute menunggu
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="text-slate-300 transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/dashboard/transactions"
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <PackageCheck size={20} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">
                    Transactions
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Lihat semua transaksi
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="text-slate-300 transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/dashboard/users"
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                  <Users size={20} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">
                    Manage Users
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    8.492 pengguna
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="text-slate-300 transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/dashboard/reports"
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <FileText size={20} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Reports</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Analisis & laporan
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="text-slate-300 transition group-hover:translate-x-1"
                />
              </Link>
            </div>
          </section>

          {/* RECENT TRANSACTIONS + DISPUTES */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
            {/* TRANSACTIONS */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Transaksi Terbaru
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Aktivitas transaksi terbaru
                  </p>
                </div>

                <Link
                  href="/dashboard/transactions"
                  className="flex items-center gap-1 text-xs font-semibold text-[#6B1E2C] hover:underline"
                >
                  Lihat semua
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-3 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <PackageCheck size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {transaction.title}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {transaction.buyer} → {transaction.seller}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold text-slate-800">
                          {transaction.amount}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {transaction.time}
                        </p>
                      </div>

                      <StatusBadge type={transaction.statusType}>
                        {transaction.status}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DISPUTES */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <h3 className="font-bold text-slate-900">Dispute Terbaru</h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Membutuhkan perhatian admin
                  </p>
                </div>

                <Link
                  href="/dashboard/disputes"
                  className="flex items-center gap-1 text-xs font-semibold text-[#6B1E2C] hover:underline"
                >
                  Kelola
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {disputes.map((dispute) => (
                  <Link
                    href="/dashboard/disputes"
                    key={dispute.id}
                    className="block p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                          <AlertTriangle size={16} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {dispute.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {dispute.transaction}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                          dispute.priority === "Tinggi"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {dispute.priority}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between pl-12">
                      <span className="text-[11px] text-slate-400">
                        {dispute.id} · {dispute.user}
                      </span>

                      <span className="text-xs font-bold text-slate-700">
                        {dispute.amount}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                <Link
                  href="/dashboard/disputes"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B1E2C] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#561824]"
                >
                  <AlertTriangle size={15} />
                  Buka Dispute Center
                </Link>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row">
            <p>© 2026 AlidPay Admin Panel</p>

            <div className="flex gap-4">
              <span>System v1.0.0</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                All systems operational
              </span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
