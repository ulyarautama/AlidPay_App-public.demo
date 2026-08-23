"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Check,
  ChevronRight,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
  Zap,
  UserPlus,
  User,
  Settings,
  Bell,
  Inbox,
  Copy,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { api } from "./lib/axios";
import { useActivityIndicators } from "./hooks/useActivityIndicators";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

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

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const tutorialSlides = [
  {
    image: "/tutorial/create-transaction.png",
    step: "01",
    title: "Buat transaksi",
    description: "Masukkan detail transaksi dan pihak yang terlibat.",
  },
  {
    image: "/tutorial/payment.png",
    step: "02",
    title: "Dana diamankan",
    description: "Pembayaran diamankan AlidPay selama transaksi berlangsung.",
  },
  {
    image: "/tutorial/progress.png",
    step: "03",
    title: "Pantau transaksi",
    description: "Pantau perkembangan transaksi langsung.",
  },
  {
    image: "/tutorial/completed.png",
    step: "04",
    title: "Transaksi selesai",
    description: "Dana diteruskan setelah transaksi selesai.",
  },
];

function youtubeEmbedUrl(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const videoId = url.hostname.includes("youtu.be")
      ? url.pathname.slice(1).split("/")[0]
      : url.searchParams.get("v") ??
        url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];

    return videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
      : null;
  } catch {
    return null;
  }
}

function App() {
  const { isLoggedIn, user, logout, loading: authLoading } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [alidPayIdCopied, setAlidPayIdCopied] = useState(false);
  const { notificationCount, pendingRequestCount } = useActivityIndicators(
    isLoggedIn ? user?.id : null,
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const tutorialYoutubeEmbed = youtubeEmbedUrl(
    process.env.NEXT_PUBLIC_TUTORIAL_YOUTUBE_URL,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((current) =>
        current === tutorialSlides.length - 1 ? 0 : current + 1,
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    try {
      await api.delete("/api/logout");
      logout();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCopyAlidPayId() {
    if (!user?.public_id) return;

    try {
      await navigator.clipboard.writeText(user.public_id);
      setAlidPayIdCopied(true);
      window.setTimeout(() => setAlidPayIdCopied(false), 1600);
    } catch (err) {
      console.error("Gagal menyalin ID AlidPay", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#181715]">
      {/* QUICK CREATE TRANSACTION */}
      {isLoggedIn && (
        <Link
          href="/create-transaction"
          className="group fixed bottom-7 right-7 z-50 hidden items-center gap-2.5 rounded-full bg-[#181715] px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#181715]/15 transition duration-300 hover:-translate-y-1 hover:bg-[#2a2926] lg:flex"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C85A28] text-white">
            <Plus
              size={16}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
          </span>
          Buat Transaksi
        </Link>
      )}
      {/* NAVBAR */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-5 sm:pt-4 lg:px-8 lg:pt-5">
          <nav className="flex min-h-16 items-center justify-between gap-3 rounded-[1.75rem] border border-[#D8D4CB]/90 bg-[#F5EFE6]/92 px-3.5 py-2.5 shadow-[0_12px_40px_rgba(24,23,21,0.04)] backdrop-blur-xl sm:min-h-[4.5rem] sm:rounded-full sm:px-5 lg:px-6">
            {/* Logo */}
            <a
              href="#hero"
              className="group flex min-w-0 items-center gap-2 sm:gap-2.5"
            >
              <div className="relative h-10 w-10 shrink-0 sm:h-12 sm:w-12 xl:h-14 xl:w-14">
                <Image
                  src="/alidpay-logo.png"
                  alt="AlidPay Logo"
                  fill
                  sizes="(min-width: 1280px) 56px, (min-width: 640px) 48px, 40px"
                  priority
                  className="object-contain transition-transform duration-300 group-hover:-translate-y-0.5"
                  style={{
                    filter:
                      "drop-shadow(0 1px 1px rgba(24,23,21,0.30)) drop-shadow(0 6px 8px rgba(24,23,21,0.16))",
                  }}
                />
              </div>

              <div
                className={`${playfair.className} hidden items-baseline sm:flex`}
              >
                <span className="text-[23px] font-black leading-none tracking-[-0.065em] text-[#181715] xl:text-[28px]">
                  Alid
                </span>

                <span className="text-[23px] font-black leading-none tracking-[-0.065em] text-[#C85A28] xl:text-[28px]">
                  Pay
                </span>
              </div>
            </a>

            {/* Desktop nav */}
            <div className="hidden items-center gap-6 text-sm font-medium text-[#75726B] xl:flex 2xl:gap-8">
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
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {authLoading ? (
                <div
                  role="status"
                  aria-label="Memeriksa sesi akun"
                  className="h-10 w-24 animate-pulse rounded-full bg-[#E0DDD5] sm:w-32"
                />
              ) : !isLoggedIn ? (
                <>
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
                  {/* DESKTOP ACTIONS */}
                  <div className="hidden items-center gap-2 md:flex">
                    <Link
                      href="/create-transaction"
                      aria-label="Buat transaksi"
                      className="group flex h-10 w-10 items-center justify-center gap-2 rounded-full border border-[#D8D4CB] bg-[#EFECE4] text-sm font-bold text-[#181715] transition hover:-translate-y-0.5 hover:bg-white xl:h-auto xl:w-auto xl:px-4 xl:py-2.5"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C85A28] text-white">
                        <Plus size={13} strokeWidth={2.5} />
                      </span>
                      <span className="hidden xl:inline">Buat transaksi</span>
                    </Link>

                    <Link
                      href="/transaction"
                      aria-label="Semua transaksi"
                      className="group flex h-10 w-10 items-center justify-center gap-2 rounded-full border border-[#D8D4CB] bg-[#EFECE4] text-sm font-bold text-[#181715] transition hover:-translate-y-0.5 hover:bg-white xl:h-auto xl:w-auto xl:px-4 xl:py-2.5"
                    >
                      <WalletCards size={17} />
                      <span className="hidden xl:inline">Semua transaksi</span>
                    </Link>

                    <Link
                      href="/notifications"
                      aria-label={`Notifikasi${notificationCount > 0 ? `, ${notificationCount} pembaruan belum dibaca` : ", tidak ada pembaruan baru"}`}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D8D4CB] bg-[#F5EFE6] text-[#181715] transition hover:bg-white"
                    >
                      <Bell size={18} strokeWidth={1.8} />

                      {notificationCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C85A28] px-1 text-[10px] font-bold text-white">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/requests"
                      aria-label={`Inbox${pendingRequestCount > 0 ? `, ${pendingRequestCount} permintaan masuk` : ", tidak ada permintaan baru"}`}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D8D4CB] bg-[#F5EFE6] text-[#181715] transition hover:bg-white"
                    >
                      <Inbox size={18} strokeWidth={1.8} />

                      {pendingRequestCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C85A28] px-1 text-[10px] font-bold text-white">
                          {pendingRequestCount > 9 ? "9+" : pendingRequestCount}
                        </span>
                      )}
                    </Link>
                  </div>

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

                    {profileOpen && (
                      <div className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[min(340px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-[#DCD8CF] bg-[#F5EFE6] shadow-2xl shadow-[#181715]/15">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-[#E0DDD5] bg-[#EFECE4] px-5 py-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#96928A]">
                              Akun AlidPay
                            </p>

                            <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-[#181715]">
                              {user?.name}
                            </p>

                            {user?.public_id && (
                              <div className="mt-1 flex min-w-0 items-center gap-1.5">
                                <p className="truncate font-mono text-[11px] font-semibold tracking-[0.02em] text-[#C85A28]">
                                  ID: {user.public_id}
                                </p>

                                <button
                                  type="button"
                                  onClick={handleCopyAlidPayId}
                                  aria-label={alidPayIdCopied ? "ID AlidPay tersalin" : "Salin ID AlidPay"}
                                  title={alidPayIdCopied ? "Tersalin" : "Salin ID AlidPay"}
                                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#75726B] transition hover:bg-white hover:text-[#C85A28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C85A28]/40"
                                >
                                  {alidPayIdCopied ? (
                                    <Check size={13} strokeWidth={2.4} />
                                  ) : (
                                    <Copy size={13} strokeWidth={2} />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          <span className="rounded-full border border-[#D0CCC3] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#75726B]">
                            {user?.role === "penjual" ? "Penjual" : "Pembeli"}
                          </span>
                        </div>

                        {/* MOBILE QUICK ACTIONS */}
                        <div className="border-b border-[#E0DDD5] p-3 md:hidden">
                          <Link
                            href="/create-transaction"
                            onClick={() => setProfileOpen(false)}
                            className="group flex items-center gap-3 rounded-xl bg-[#C85A28] px-4 py-3.5 text-sm font-bold text-white transition active:scale-[0.98]"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                              <Plus size={18} />
                            </div>

                            <div className="flex-1">
                              <p>Buat Transaksi</p>
                              <p className="mt-0.5 text-[11px] font-medium text-white/60">
                                Mulai transaksi baru
                              </p>
                            </div>

                            <ChevronRight size={17} />
                          </Link>

                          <Link
                            href="/transaction"
                            onClick={() => setProfileOpen(false)}
                            className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#181715] transition hover:bg-[#EFECE4]"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFECE4]">
                              <WalletCards size={17} />
                            </div>

                            <div className="flex-1">
                              <p>Semua Transaksi</p>
                              <p className="mt-0.5 text-[11px] font-medium text-[#96928A]">
                                Lihat seluruh aktivitas transaksi
                              </p>
                            </div>

                            <ChevronRight
                              size={17}
                              className="text-[#B2AEA6]"
                            />
                          </Link>
                        </div>

                        {/* MOBILE NOTIFICATION + INBOX */}
                        <div className="grid grid-cols-2 gap-2 border-b border-[#E0DDD5] p-3 md:hidden">
                          <Link
                            href="/notifications"
                            onClick={() => setProfileOpen(false)}
                            className="relative rounded-xl bg-[#EFECE4] p-4 transition hover:bg-white"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181715] text-white">
                                <Bell size={17} />
                              </div>

                              {notificationCount > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C85A28] px-1 text-[10px] font-bold text-white">
                                  {notificationCount > 9 ? "9+" : notificationCount}
                                </span>
                              )}
                            </div>

                            <p className="mt-4 text-sm font-bold">Notifikasi</p>
                            <p className="mt-1 text-[11px] text-[#96928A]">
                              {notificationCount > 0
                                ? `${notificationCount} pembaruan belum dibaca`
                                : "Tidak ada pembaruan baru"}
                            </p>
                          </Link>

                          <Link
                            href="/requests"
                            onClick={() => setProfileOpen(false)}
                            className="relative rounded-xl bg-[#EFECE4] p-4 transition hover:bg-white"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181715] text-white">
                                <Inbox size={17} />
                              </div>

                              {pendingRequestCount > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C85A28] px-1 text-[10px] font-bold text-white">
                                  {pendingRequestCount > 9 ? "9+" : pendingRequestCount}
                                </span>
                              )}
                            </div>

                            <p className="mt-4 text-sm font-bold">Inbox</p>
                            <p className="mt-1 text-[11px] text-[#96928A]">
                              {pendingRequestCount > 0
                                ? `${pendingRequestCount} permintaan perlu direspons`
                                : "Tidak ada permintaan baru"}
                            </p>
                          </Link>
                        </div>

                        {/* PROFILE INFO */}
                        <div className="border-b border-[#E0DDD5] px-5 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#181715] text-[#F5EFE6]">
                              <User size={24} strokeWidth={1.5} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-[#181715]">
                                {user?.name}
                              </p>

                              <p className="mt-1 truncate text-xs text-[#75726B]">
                                {user?.email}
                              </p>

                              <Link
                                href="/account/settings"
                                onClick={() => setProfileOpen(false)}
                                className="mt-2 inline-flex text-xs font-semibold text-[#C85A28]"
                              >
                                Lihat akun
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* SETTINGS */}
                        <div>
                          <Link
                            href="/account/settings"
                            onClick={() => setProfileOpen(false)}
                            className="group flex items-center gap-4 px-5 py-4 text-sm font-medium text-[#181715] transition hover:bg-[#EFECE4]"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFECE4] text-[#75726B]">
                              <Settings size={17} />
                            </div>

                            <div className="flex-1">
                              <p className="font-semibold">Pengaturan akun</p>
                              <p className="mt-0.5 text-[11px] text-[#96928A]">
                                Kelola akun dan preferensi
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="text-[#B2AEA6]"
                            />
                          </Link>

                          <Link
                            href="/account/switch"
                            onClick={() => setProfileOpen(false)}
                            className="group flex w-full items-center gap-4 border-t border-[#E0DDD5] px-5 py-4 text-left text-sm font-medium text-[#181715] transition hover:bg-[#EFECE4]"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFECE4] text-[#75726B]">
                              <UserPlus size={17} />
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
                              className="text-[#B2AEA6]"
                            />
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              handleLogout();
                            }}
                            className="flex w-full items-center justify-center border-t border-[#E0DDD5] px-5 py-4 text-sm font-bold text-[#C85A28] transition hover:bg-[#EFECE4]"
                          >
                            Keluar
                          </button>
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
        <section
          id="hero"
          className="relative scroll-mt-28 overflow-hidden px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-40 xl:pb-28"
        >
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] lg:gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:gap-14">
            <div className="min-w-0">
              <div className="flex max-w-4xl flex-col items-start gap-4 sm:gap-5">
                {/* Security Pill Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#C85A28]/20 bg-[#C85A28]/10 px-3 py-1.5 text-[11px] font-semibold tracking-normal text-[#C85A28] sm:px-3.5 sm:text-sm">
                  <span className="h-2 w-2 rounded-full bg-[#C85A28] motion-safe:animate-pulse" />
                  Sepenuhnya Terlindungi
                </div>

                {/* Main Headline */}
                <h1 className="text-[clamp(2.25rem,7.5vw,3.5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-[#181715] lg:text-[clamp(2.75rem,4.2vw,4.7rem)]">
                  <span className="block">Mulai transaksi</span>
                  <span className="block text-[#C85A28] sm:whitespace-nowrap">
                    dengan aman,
                  </span>
                  <span className="block">dengan siapa saja</span>
                </h1>
              </div>

              <p className="mt-6 max-w-xl text-sm leading-6 text-[#75726B] sm:mt-8 sm:text-base sm:leading-7 xl:text-lg">
                AlidPay menjaga dana selama transaksi berlangsung. Pembeli dan
                penjual tetap terlindungi dari awal hingga kesepakatan
                terpenuhi.
              </p>

              <div className="mt-7 grid gap-3 min-[420px]:grid-cols-2 sm:mt-9 sm:flex sm:flex-row">
                <Link
                  href="/get-started"
                  className="group flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#C85A28] px-6 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#C85A28]/20"
                >
                  Mulai transaksi
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <a
                  href="#cara-kerja"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D8D4CB] bg-[#F5EFE6]/70 px-6 py-3.5 text-sm font-bold transition hover:bg-[#EFECE4]"
                >
                  Lihat cara kerja
                  <ChevronRight size={16} />
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-11">
                <div className="flex -space-x-2">
                  {["A", "R", "D", "F"].map((letter) => (
                    <div
                      key={letter}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#F5EFE6] bg-[#181715] text-[11px] font-bold text-white sm:h-9 sm:w-9 sm:text-xs"
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

                  <p className="text-xs text-[#96928A]">
                    terlindungi dengan AlidPay
                  </p>
                </div>
              </div>
            </div>

            {/* VIDEO SHOWCASE */}
            <div className="relative mx-auto w-full max-w-[720px] lg:ml-auto lg:max-w-[600px]">
              {/* Desktop decoration */}
              <div className="absolute -inset-5 hidden rotate-2 rounded-[32px] border border-[#DDD8CE] bg-[#EFECE4] lg:block" />

              <div className="relative overflow-hidden rounded-[22px] border border-[#D8D4CB] bg-[#F5EFE6] p-1.5 shadow-[0_18px_50px_rgba(24,23,21,0.10)] sm:rounded-[28px] sm:p-2.5 lg:shadow-[0_24px_70px_rgba(24,23,21,0.12)]">
                {tutorialYoutubeEmbed ? (
                  <iframe
                    src={tutorialYoutubeEmbed}
                    title="Video tutorial menggunakan AlidPay"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="aspect-video w-full rounded-[17px] sm:rounded-[21px]"
                  />
                ) : (
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    poster="/videos/create-transaction.png"
                    aria-label="Video tutorial menggunakan AlidPay"
                    className="aspect-video w-full rounded-[17px] bg-black object-cover sm:rounded-[21px]"
                  >
                    <source src="/videos/alisya-liu.mp4" type="video/mp4" />
                    Browser kamu tidak mendukung pemutar video.
                  </video>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE / TRUST */}
        <section className="border-y border-[#E0DDD5] py-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#96928A]">
              Dibuat untuk transaksi yang lebih aman
            </p>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-bold text-[#75726B]">
              <span>DANA TERJAGA</span>
              <span>•</span>
              <span>ALUR JELAS</span>
              <span>•</span>
              <span>KEDUA PIHAK TERLINDUNGI</span>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section id="tentang" className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
                Mengapa AlidPay
              </p>

              <h2 className="mt-5 max-w-md text-4xl font-bold leading-[1] tracking-[-0.06em] sm:text-5xl">
                Rasa aman tidak seharusnya bergantung pada rasa percaya.
              </h2>
            </div>

            <div>
              <p className="max-w-3xl text-2xl font-medium leading-[1.35] tracking-[-0.03em] text-[#181715] sm:text-3xl">
                AlidPay membantu pembeli dan penjual bertransaksi dengan lebih
                terlindungi, bahkan ketika kedua pihak belum saling mengenal atau sepenuhnya percaya.
              </p>

              <p className="mt-7 max-w-2xl leading-7 text-[#75726B]">
                Dana dijaga selama transaksi berlangsung dan baru diteruskan
                ketika proses telah selesai sesuai kesepakatan. Dengan begitu,
                setiap pihak punya kepastian yang lebih jelas dari awal sampai
                akhir.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="keamanan" className="px-5 pb-24 sm:px-8 sm:pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex items-end justify-between gap-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#75726B]">
                  03 / Perlindungan
                </p>

                <h2 className="mt-4 text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
                  Dibuat agar transaksi terasa lebih pasti.
                </h2>
              </div>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[2rem] border border-[#E0DDD5] bg-[#E0DDD5] md:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Dana tidak langsung berpindah",
                  description:
                    "Pembayaran dijaga sampai transaksi benar benar mencapai tahap yang disepakati.",
                },
                {
                  icon: LockKeyhole,
                  title: "Kedua pihak punya kepastian",
                  description:
                    "Pembeli dan penjual bisa melihat progres transaksi tanpa bergantung pada janji sepihak.",
                },
                {
                  icon: Zap,
                  title: "Alur dibuat tetap sederhana",
                  description:
                    "Buat transaksi, sepakati detailnya, lanjutkan proses, lalu selesaikan dengan jelas.",
                },
              ].map((feature, index) => {
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
                  Cara kerja
                </p>

                <h2 className="mt-5 max-w-lg text-5xl font-bold leading-[0.95] tracking-[-0.07em] sm:text-6xl">
                  Empat langkah.
                  <br />
                  Satu alur yang jelas.
                </h2>

                <p className="mt-7 max-w-md leading-7 text-white/45">
                  Setiap tahap dibuat supaya pembeli dan penjual tahu apa yang
                  sedang terjadi dan apa yang harus dilakukan berikutnya.
                </p>
              </div>

              <div>
                {[
                  {
                    number: "01",
                    title: "Buat transaksi",
                    description:
                      "Masukkan detail transaksi dan pihak yang akan bertransaksi.",
                  },
                  {
                    number: "02",
                    title: "Sepakati dan lakukan pembayaran",
                    description:
                      "Setelah detail disetujui, pembeli melakukan pembayaran melalui alur AlidPay.",
                  },
                  {
                    number: "03",
                    title: "Jalankan transaksi",
                    description:
                      "Penjual melanjutkan kewajibannya sementara dana tetap dijaga selama proses berlangsung.",
                  },
                  {
                    number: "04",
                    title: "Selesaikan transaksi",
                    description:
                      "Setelah semua sesuai, transaksi dikonfirmasi selesai dan dana diteruskan.",
                  },
                ].map((step, index) => (
                  <div
                    key={step.number}
                    className={`group grid grid-cols-[60px_1fr] gap-5 py-7 ${
                      index !== 3 ? "border-b border-white/10" : ""
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

        {/* CTA */}
        <section className="px-5 mt-20 pb-24 sm:px-8 sm:pb-15">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#C85A28] px-7 py-14 text-white sm:px-12 sm:py-20">
              <div className="relative max-w-3xl">
                <h2 className="mt-5 text-5xl font-bold leading-[0.95] tracking-[-0.07em] sm:text-7xl">
                  Mulai transaksi
                  <br />
                  dengan lebih tenang.
                </h2>

                <p className="mt-7 max-w-xl text-base leading-7 text-white/70">
                  Buat transaksi pertamamu dengan alur yang lebih jelas dan
                  perlindungan yang dirancang untuk pembeli maupun penjual.
                </p>

                <Link
                  href="/get-started"
                  className="group mt-9 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#181715] transition hover:-translate-y-1 hover:shadow-xl"
                >
                  Mulai Transaksi
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E0DDD5] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a
              href="#hero"
              className="group flex items-center gap-2.5 md:gap-3"
            >
              <div className="relative h-10 w-10 shrink-0 md:h-12 md:w-12">
                <Image
                  src="/alidpay-logo.png"
                  alt="AlidPay Logo"
                  fill
                  sizes="48px"
                  className="object-contain transition-transform duration-300 group-hover:-translate-y-0.5"
                  style={{
                    filter:
                      "drop-shadow(0 1px 1px rgba(24,23,21,0.30)) drop-shadow(0 5px 7px rgba(24,23,21,0.14))",
                  }}
                />
              </div>

              <div className={`${playfair.className} flex items-baseline`}>
                <span className="text-[22px] font-black leading-none tracking-[-0.065em] text-[#181715] md:text-[25px]">
                  Alid
                </span>

                <span className="text-[22px] font-black leading-none tracking-[-0.065em] text-[#C85A28] md:text-[25px]">
                  Pay
                </span>
              </div>
            </a>

            <p className="mt-3 max-w-xs text-xs leading-5 text-[#96928A]">
              Membantu pembeli dan penjual bertransaksi dengan lebih aman,
              jelas, dan terlindungi.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-semibold text-[#75726B]">
            <Link href="/privasi" className="hover:text-[#181715]">
              Privasi
            </Link>

            <Link href="/ketentuan" className="hover:text-[#181715]">
              Ketentuan
            </Link>

            <Link href="/bantuan" className="hover:text-[#181715]">
              Bantuan
            </Link>

            <span>© 2026 AlidPay</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
