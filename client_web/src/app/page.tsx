"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Check,
  ChevronRight,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
  UserPlus,
  User,
  Settings,
  Bell,
  Inbox,
} from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { api } from "./lib/axios";

const steps = [
  {
    number: "01",
    title: "Buat transaksi",
    description:
      "Masukkan detail barang, harga, dan informasi penjual dalam beberapa langkah.",
  },
  {
    number: "02",
    title: "Bayar dengan aman",
    description:
      "Dana kamu diamankan oleh AlidPay sebelum penjual mulai memproses pesanan.",
  },
  {
    number: "03",
    title: "Terima barang",
    description:
      "Penjual mengirim barang. Kamu punya waktu untuk memastikan semuanya sesuai.",
  },
  {
    number: "04",
    title: "Dana diteruskan",
    description: "Setelah transaksi selesai, dana diteruskan kepada penjual.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Dana lebih aman",
    description:
      "Pembayaran tidak langsung diteruskan ke penjual sebelum transaksi selesai.",
  },
  {
    icon: LockKeyhole,
    title: "Pembeli terlindungi",
    description:
      "Kamu punya kontrol terhadap kapan transaksi dianggap selesai.",
  },
  {
    icon: Zap,
    title: "Proses simpel",
    description:
      "Tidak perlu proses ribet. Buat transaksi, bayar, terima barang, selesai.",
  },
];

function App() {
  const { isLoggedIn, user, refreshUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const pendingRequests = 2;

  async function handleLogout() {
    try {
      await api.delete("/api/logout");
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#181715]">
      {/* QUICK CREATE TRANSACTION */}
      {isLoggedIn && (
        <Link
          href="/create-transaction"
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-[#181715] px-4 py-3 text-sm font-bold text-white shadow-xl shadow-[#181715]/15 transition duration-300 hover:-translate-y-1 hover:bg-[#2a2926] sm:bottom-7 sm:right-7 sm:px-5 sm:py-3.5"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C85A28] text-white">
            <Plus
              size={16}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
          </span>

          <span className="hidden sm:inline">Buat Transaksi</span>
          <span className="sm:hidden">Buat Transaksi</span>
        </Link>
      )}
      {/* NAVBAR */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-5 pt-5 sm:px-8">
          <nav className="flex items-center justify-between rounded-full border border-[#E0DDD5]/80 bg-[#F5EFE6]/90 px-5 py-3 backdrop-blur-xl">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181715] text-[#F5EFE6]">
                <span className="text-sm font-bold">A</span>
              </div>

              <span className="md:text-lg hidden font-bold tracking-[-0.04em]">
                AlidPay
              </span>
            </a>

            {/* Desktop nav */}
            <div className="hidden items-center gap-8 text-sm font-medium text-[#75726B] md:flex">
              <a href="#cara-kerja" className="transition hover:text-[#181715]">
                Cara kerja
              </a>

              <a href="#keamanan" className="transition hover:text-[#181715]">
                Keamanan
              </a>

              <a href="#tentang" className="transition hover:text-[#181715]">
                Tentang
              </a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isLoggedIn ? (
                <>
                  {/* BELUM LOGIN */}
                  <Link
                    href="/login"
                    className="hidden px-3 py-2 text-sm font-semibold text-[#181715] transition hover:text-[#C85A28] sm:block"
                  >
                    Masuk
                  </Link>

                  <Link
                    href="/register"
                    className="group flex items-center gap-2 rounded-full bg-[#181715] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2a2926]"
                  >
                    Mulai
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </>
              ) : (
                <>
                  {/* SUDAH LOGIN — BUAT TRANSAKSI */}
                  <Link
                    href="/create-transaction"
                    className="group flex items-center gap-2 rounded-full border border-[#D8D4CB] bg-[#EFECE4] px-3.5 py-2.5 text-sm font-bold text-[#181715] transition hover:-translate-y-0.5 hover:bg-white sm:px-4"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C85A28] text-white">
                      <Plus size={13} strokeWidth={2.5} />
                    </span>

                    <span className="hidden sm:inline">Buat Transaksi</span>
                  </Link>

                  <Link
                    href="/transaction"
                    className="group flex items-center gap-2 rounded-full border border-[#D8D4CB] bg-[#EFECE4] px-3.5 py-2.5 text-sm font-bold text-[#181715] transition hover:-translate-y-0.5 hover:bg-white sm:px-4"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C85A28] text-white">
                      <Plus size={13} strokeWidth={2.5} />
                    </span>

                    <span className="hidden sm:inline">Semua Transaksi</span>
                  </Link>

                  {/* NOTIFICATIONS */}
                  <Link
                    href="/notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D8D4CB] bg-[#F5EFE6] text-[#181715] transition hover:bg-white"
                    aria-label="Notifications"
                  >
                    <Bell size={18} strokeWidth={1.8} />

                    {/* unread badge */}
                    <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-[#C85A28]" />
                  </Link>

                  {/* REQUESTS */}
                  <Link
                    href="/requests"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D8D4CB] bg-[#F5EFE6] text-[#181715] transition hover:bg-white"
                    aria-label="Transaction requests"
                  >
                    <Inbox size={18} strokeWidth={1.8} />

                    {pendingRequests > 0 && (
                      <span className="absolute -right-1 -top-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-[#C85A28] px-1 text-[10px] font-bold text-white">
                        {pendingRequests > 9 ? "9+" : pendingRequests}
                      </span>
                    )}
                  </Link>

                  {/* PROFILE */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((prev) => !prev)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#181715] bg-[#181715] text-[#F5EFE6] transition hover:-translate-y-0.5 hover:shadow-md"
                      aria-label="Profile menu"
                      aria-expanded={profileOpen}
                    >
                      <User size={18} strokeWidth={1.8} />
                    </button>

                    {/* DROPDOWN */}
                    {profileOpen && (
                      <div className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[340px] overflow-hidden rounded-2xl border border-[#DCD8CF] bg-[#F5EFE6] shadow-2xl shadow-[#181715]/15">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-[#E0DDD5] bg-[#EFECE4] px-5 py-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#96928A]">
                              Akun AlidPay
                            </p>

                            <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-[#181715]">
                              Profil kamu
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              handleLogout();
                            }}
                            className="rounded-md px-2 py-1 text-xs font-semibold text-[#75726B] transition hover:bg-[#F5EFE6] hover:text-[#C85A28]"
                          >
                            Sign out
                          </button>
                        </div>

                        {/* ACCOUNT */}
                        <div className="border-b border-[#E0DDD5] px-5 py-5">
                          <div className="flex items-center gap-4">
                            {/* AVATAR */}
                            <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-[#181715] text-[#F5EFE6] shadow-sm">
                              <User size={30} strokeWidth={1.5} />
                            </div>

                            {/* INFO */}
                            <div className="min-w-0 flex-1">
                              {/* NAME + ROLE */}
                              <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate text-sm font-bold tracking-[-0.02em] text-[#181715]">
                                  {user?.name}
                                </p>

                                <span className="shrink-0 rounded-full border border-[#D0CCC3] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#75726B]">
                                  {user?.role === "penjual"
                                    ? "Penjual"
                                    : "Pembeli"}
                                </span>
                              </div>

                              {/* EMAIL */}
                              <p className="mt-1.5 truncate text-xs text-[#75726B]">
                                {user?.email}
                              </p>

                              {/* ACCOUNT LINK */}
                              <Link
                                href="/account"
                                onClick={() => setProfileOpen(false)}
                                className="mt-3 inline-flex rounded-md border border-[#C85A28] px-2.5 py-1.5 text-xs font-semibold text-[#C85A28] transition hover:bg-[#C85A28] hover:text-white"
                              >
                                Lihat akun
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* MENU */}
                        <div className="bg-[#F5EFE6]">
                          {/* SETTINGS */}
                          <Link
                            href="/account/settings"
                            onClick={() => setProfileOpen(false)}
                            className="group flex items-center gap-4 px-5 py-4 text-sm font-medium text-[#181715] transition hover:bg-[#EFECE4]"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFECE4] text-[#75726B] transition group-hover:bg-[#C85A28] group-hover:text-white">
                              <Settings size={17} strokeWidth={1.7} />
                            </div>

                            <div className="flex-1">
                              <p className="font-semibold">Pengaturan akun</p>

                              <p className="mt-0.5 text-[11px] text-[#96928A]">
                                Kelola akun dan preferensi
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="text-[#B2AEA6] transition group-hover:translate-x-0.5 group-hover:text-[#C85A28]"
                            />
                          </Link>

                          {/* SWITCH ACCOUNT */}
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              // TODO: switch account
                            }}
                            className="group flex w-full items-center gap-4 border-t border-[#E0DDD5] px-5 py-4 text-left text-sm font-medium text-[#181715] transition hover:bg-[#EFECE4]"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFECE4] text-[#75726B] transition group-hover:bg-[#C85A28] group-hover:text-white">
                              <UserPlus size={17} strokeWidth={1.7} />
                            </div>

                            <div className="flex-1">
                              <p className="font-semibold">
                                Masuk dengan akun lain
                              </p>

                              <p className="mt-0.5 text-[11px] text-[#96928A]">
                                Gunakan akun AlidPay lainnya
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="text-[#B2AEA6] transition group-hover:translate-x-0.5 group-hover:text-[#C85A28]"
                            />
                          </button>
                        </div>

                        {/* FOOTER STATUS */}
                        <div className="flex items-center gap-2 border-t border-[#E0DDD5] bg-[#EFECE4] px-5 py-3">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />

                          <span className="text-[11px] font-semibold text-[#75726B]">
                            Akun aktif
                          </span>

                          <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-[#96928A]">
                            {user?.role === "penjual" ? "Penjual" : "Pembeli"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden px-5 pb-24 pt-36 sm:px-8 sm:pt-44 lg:pb-32">
          {/* Decorative typography */}
          <div className="pointer-events-none absolute -right-20 top-28 hidden select-none text-[180px] font-black leading-none tracking-[-0.1em] text-[#EDE8DE] lg:block">
            PAY
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            {/* Copy */}
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#E0DDD5] bg-[#EFECE4] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#75726B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                Escrow payment platform
              </div>

              <h1 className="max-w-4xl text-[clamp(3.5rem,7vw,7rem)] font-bold leading-[0.91] tracking-[-0.075em]">
                Transaksi
                <br />
                <span className="text-[#C85A28]">tanpa rasa</span>
                <br />
                was-was.
              </h1>

              <p className="mt-8 max-w-xl text-base leading-7 text-[#75726B] sm:text-lg">
                AlidPay menjaga dana tetap aman sampai transaksi benar-benar
                selesai. Pembeli dan penjual sama-sama terlindungi, dari
                pembayaran sampai barang diterima.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/get-started"
                  className="group flex items-center justify-center gap-3 rounded-full bg-[#C85A28] px-6 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#C85A28]/20"
                >
                  Mulai transaksi
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <button className="flex items-center justify-center gap-2 rounded-full border border-[#D8D4CB] px-6 py-3.5 text-sm font-bold transition hover:bg-[#EFECE4]">
                  Lihat cara kerja
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="mt-12 flex items-center gap-5">
                <div className="flex -space-x-2">
                  {["A", "R", "D", "F"].map((letter, index) => (
                    <div
                      key={letter}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#F5EFE6] bg-[#181715] text-xs font-bold text-white"
                    >
                      {letter}
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-bold">10.000+</span>
                    <span className="text-[#75726B]">transaksi</span>
                  </div>

                  <p className="text-xs text-[#96928A]">protected by AlidPay</p>
                </div>
              </div>
            </div>

            {/* TRANSACTION CARD */}
            <div className="relative mx-auto w-full max-w-[520px] lg:ml-auto">
              {/* Back card */}
              <div className="absolute -right-4 -top-4 h-full w-full rotate-3 rounded-[2rem] border border-[#E0DDD5] bg-[#EFECE4]" />

              <div className="absolute -bottom-5 -left-5 h-full w-full -rotate-2 rounded-[2rem] border border-[#E0DDD5] bg-[#F0EBE0]" />

              {/* Main card */}
              <div className="relative rounded-[2rem] border border-[#DCD8CF] bg-[#181715] p-5 text-white shadow-2xl shadow-[#181715]/10 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                      AlidPay
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      Transaction protected
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <ShieldCheck size={19} />
                  </div>
                </div>

                <div className="mt-12">
                  <p className="text-xs text-white/40">Transaction value</p>

                  <p className="mt-1 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
                    Rp18.499.000
                  </p>
                </div>

                {/* Product */}
                <div className="mt-8 rounded-2xl bg-white/[0.07] p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#181715]">
                      <WalletCards size={25} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">MacBook Pro M3</p>

                      <p className="mt-1 text-sm text-white/40">
                        Electronics · 1 item
                      </p>
                    </div>

                    <div className="ml-auto text-right">
                      <p className="text-sm font-semibold">1x</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-[#10B981]/10 p-3">
                    <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#10B981]">
                      <Check size={13} />
                    </div>

                    <p className="text-[11px] font-semibold">Paid</p>
                  </div>

                  <div className="rounded-xl bg-[#D49A2B]/10 p-3">
                    <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#D49A2B]">
                      <ArrowRight size={13} />
                    </div>

                    <p className="text-[11px] font-semibold">Shipping</p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      <Check size={13} />
                    </div>

                    <p className="text-[11px] font-semibold text-white/40">
                      Complete
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-xs">
                  <span className="text-white/40">Funds protected</span>

                  <span className="flex items-center gap-1.5 font-semibold text-[#10B981]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    Secured by AlidPay
                  </span>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-8 -right-3 rounded-2xl border border-[#E0DDD5] bg-[#F5EFE6] p-4 shadow-xl sm:-right-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C85A28] text-white">
                    <LockKeyhole size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-[#75726B]">Payment protected</p>
                    <p className="text-sm font-bold">Your money is safe.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE / TRUST */}
        <section className="border-y border-[#E0DDD5] py-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#96928A]">
              Built for safer transactions
            </p>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-bold text-[#75726B]">
              <span>BUYER FIRST</span>
              <span>•</span>
              <span>SECURE PAYMENT</span>
              <span>•</span>
              <span>Penjual PROTECTED</span>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section id="tentang" className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
                Why AlidPay
              </p>

              <h2 className="mt-5 max-w-md text-4xl font-bold leading-[1] tracking-[-0.06em] sm:text-5xl">
                Internet commerce should feel safer.
              </h2>
            </div>

            <div>
              <p className="max-w-3xl text-2xl font-medium leading-[1.35] tracking-[-0.03em] text-[#181715] sm:text-3xl">
                Kami membuat transaksi antara orang yang belum saling percaya
                menjadi lebih sederhana.
              </p>

              <p className="mt-7 max-w-2xl leading-7 text-[#75726B]">
                AlidPay bertindak sebagai pihak ketiga yang menjaga dana selama
                proses transaksi berlangsung. Jadi pembeli tidak perlu langsung
                percaya kepada penjual, dan penjual juga tidak perlu takut
                mengirim barang tanpa kepastian pembayaran.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="keamanan" className="px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex items-end justify-between gap-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#75726B]">
                  03 / Protection
                </p>

                <h2 className="mt-4 text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
                  Built around trust.
                </h2>
              </div>

              <Sparkles className="hidden text-[#D49A2B] sm:block" size={32} />
            </div>

            <div className="grid gap-px overflow-hidden rounded-[2rem] border border-[#E0DDD5] bg-[#E0DDD5] md:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="bg-[#F5EFE6] p-7 transition hover:bg-[#EFECE4] sm:p-9"
                  >
                    <div className="mb-16 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#181715] text-white">
                        <Icon size={20} />
                      </div>

                      <span className="text-xs font-bold text-[#B2AEA6]">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold tracking-[-0.03em]">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#75726B]">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="cara-kerja"
          className="bg-[#181715] px-5 py-24 text-white sm:px-8 sm:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#D49A2B]">
                  How it works
                </p>

                <h2 className="mt-5 max-w-lg text-5xl font-bold leading-[0.95] tracking-[-0.07em] sm:text-6xl">
                  Four steps.
                  <br />
                  Zero drama.
                </h2>

                <p className="mt-7 max-w-md leading-7 text-white/45">
                  AlidPay menjaga alur transaksi tetap jelas untuk semua pihak.
                </p>
              </div>

              <div>
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className={`group grid grid-cols-[60px_1fr] gap-5 py-7 ${
                      index !== steps.length - 1
                        ? "border-b border-white/10"
                        : ""
                    }`}
                  >
                    <span className="text-sm font-bold text-[#D49A2B]">
                      {step.number}
                    </span>

                    <div>
                      <h3 className="text-2xl font-bold tracking-[-0.04em]">
                        {step.title}
                      </h3>

                      <p className="mt-2 max-w-lg text-sm leading-6 text-white/40 transition group-hover:text-white/60">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BIG STATEMENT */}
        <section className="overflow-hidden px-5 py-24 sm:px-8 sm:py-36">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
              A better way to transact
            </p>

            <h2 className="mt-7 max-w-6xl text-5xl font-bold leading-[0.92] tracking-[-0.075em] sm:text-7xl lg:text-[6.5rem]">
              Jangan cuma percaya.
              <br />
              <span className="text-[#C85A28]">Gunakan sistem.</span>
            </h2>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#C85A28] px-7 py-14 text-white sm:px-12 sm:py-20">
              <div className="absolute -right-10 -top-32 text-[250px] font-black leading-none tracking-[-0.1em] text-white/[0.06]">
                A
              </div>

              <div className="relative max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/60">
                  Start today
                </p>

                <h2 className="mt-5 text-5xl font-bold leading-[0.95] tracking-[-0.07em] sm:text-7xl">
                  Siap transaksi
                  <br />
                  dengan tenang?
                </h2>

                <p className="mt-7 max-w-xl text-base leading-7 text-white/70">
                  Buat transaksi pertamamu dan rasakan pengalaman pembayaran
                  yang dirancang dengan keamanan sebagai prioritas.
                </p>

                <button className="group mt-9 flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#181715] transition hover:-translate-y-1 hover:shadow-xl">
                  Mulai dengan AlidPay
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E0DDD5] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#181715] text-xs font-bold text-white">
                A
              </div>

              <span className="font-bold tracking-[-0.03em]">AlidPay</span>
            </div>

            <p className="mt-3 text-xs text-[#96928A]">
              Safer transactions, made simple.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-semibold text-[#75726B]">
            <a href="#" className="hover:text-[#181715]">
              Privacy
            </a>

            <a href="#" className="hover:text-[#181715]">
              Terms
            </a>

            <a href="#" className="hover:text-[#181715]">
              Help
            </a>

            <span>© 2026 AlidPay</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
