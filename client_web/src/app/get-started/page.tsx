"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Globe,
  Link2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

type Device = "mobile" | "desktop";

export default function GetStartedPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");

  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkDevice = () => {
      const mobile =
        /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ||
        window.innerWidth < 768;

      setDevice(mobile ? "mobile" : "desktop");
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F5EFE6] text-[#181715]">
      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#D49A2B]/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#C85A28]/10 blur-3xl" />
      </div>

      {/* NAVBAR */}
      <header className="relative z-10 px-5 pt-5 sm:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group hidden items-center gap-2.5 md:flex md:gap-3"
          >
            <div className="relative h-10 w-10 shrink-0 md:h-14 md:w-14 lg:h-16 lg:w-16">
              <Image
                src="/alidpay-logo.png"
                alt="AlidPay Logo"
                fill
                sizes="(min-width: 1024px) 64px, (min-width: 768px) 56px, 40px"
                priority
                className="object-contain transition-transform duration-300 group-hover:-translate-y-0.5"
                style={{
                  filter:
                    "drop-shadow(0 1px 1px rgba(24,23,21,0.30)) drop-shadow(0 6px 8px rgba(24,23,21,0.16))",
                }}
              />
            </div>

            <div
              className={`${playfair.className} hidden items-baseline md:flex`}
            >
              <span className="text-[25px] font-black leading-none tracking-[-0.065em] text-[#181715] lg:text-[30px]">
                Alid
              </span>

              <span className="text-[25px] font-black leading-none tracking-[-0.065em] text-[#C85A28] lg:text-[30px]">
                Pay
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#75726B] transition hover:text-[#181715]"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
        </nav>
      </header>

      {/* MAIN */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-8 sm:pt-32">
        {/* HERO */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DDD9D0] bg-[#EFECE4] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#75726B]">
            <Sparkles size={13} className="text-[#D49A2B]" />
            Mulai dengan AlidPay
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-[clamp(3.2rem,7vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.075em]">
            Pilih cara
            <br />
            <span className="text-[#C85A28]">kamu bertransaksi.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-[#75726B] sm:text-lg">
            Gunakan AlidPay melalui aplikasi atau langsung dari browser. Pilih
            cara yang paling sesuai untuk memulai transaksi.
          </p>
        </div>

        {/* DEVICE SELECTOR */}
        <div className="mx-auto mt-12 flex w-fit rounded-full border border-[#DCD8CF] bg-[#EFECE4] p-1.5">
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              device === "mobile"
                ? "bg-[#181715] text-white shadow-lg"
                : "text-[#75726B] hover:text-[#181715]"
            }`}
          >
            <Smartphone size={16} />
            Aplikasi
          </button>

          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              device === "desktop"
                ? "bg-[#181715] text-white shadow-lg"
                : "text-[#75726B] hover:text-[#181715]"
            }`}
          >
            <Globe size={16} />
            Web
          </button>
        </div>

        {/* MAIN EXPERIENCE */}
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {/* PRIMARY CARD */}
          <div className="relative min-h-[580px] overflow-hidden rounded-[2rem] bg-[#181715] p-7 text-white sm:p-10">
            {/* DECORATIVE TEXT */}
            <div className="pointer-events-none absolute -right-8 -top-16 select-none text-[190px] font-black leading-none tracking-[-0.12em] text-white/[0.035]">
              A
            </div>

            {device === "mobile" ? <MobileExperience /> : <WebExperience />}
          </div>

          {/* SECONDARY CARD */}
          <div className="flex flex-col overflow-hidden rounded-[2rem] border border-[#DDD9D0] bg-[#EFECE4]">
            <div className="flex-1 p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#96928A]">
                {device === "mobile"
                  ? "Aplikasi AlidPay"
                  : "Langsung dari browser"}
              </p>

              <h2 className="mt-5 text-3xl font-bold leading-[1] tracking-[-0.06em]">
                {device === "mobile"
                  ? "Transaksi dalam genggaman."
                  : "Mulai tanpa menginstal aplikasi."}
              </h2>

              <p className="mt-5 text-sm leading-6 text-[#75726B]">
                {device === "mobile"
                  ? "Buat, kelola, dan pantau transaksi langsung melalui aplikasi AlidPay."
                  : "Buat dan kelola transaksi langsung melalui browser tanpa perlu mengunduh aplikasi."}
              </p>

              {/* FEATURE LIST */}
              <div className="mt-9 space-y-4">
                {(device === "mobile"
                  ? [
                      "Notifikasi transaksi",
                      "Pantau seluruh transaksi",
                      "Keamanan biometrik",
                      "Akses lebih praktis",
                    ]
                  : [
                      "Tanpa instal aplikasi",
                      "Buat transaksi langsung",
                      "Bagikan tautan transaksi",
                      "Akses melalui browser",
                    ]
                ).map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D49A2B] text-white">
                      <Check size={13} strokeWidth={3} />
                    </div>

                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM CTA */}
            <div className="border-t border-[#DCD8CF] p-7 sm:p-9">
              {device === "mobile" ? (
                <div className="space-y-3">
                  <StoreButton store="Google Play" />

                  <StoreButton store="App Store" />

                  <p className="pt-2 text-center text-[11px] text-[#96928A]">
                    Sudah punya AlidPay?
                    <button
                      type="button"
                      className="ml-1 font-bold text-[#181715]"
                    >
                      Buka aplikasi
                    </button>
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    isLoggedIn
                      ? router.push("/create-transaction")
                      : setShowAuthModal(true)
                  }
                  className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#C85A28] px-6 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#C85A28]/20"
                >
                  Mulai transaksi
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM NOTE */}
        <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-[#E0DDD5] pt-7 text-xs text-[#96928A] sm:flex-row">
          <p>
            {device === "mobile"
              ? "Unduh aplikasi AlidPay untuk pengalaman yang lebih lengkap."
              : "Belum punya akun? Kamu bisa membuatnya sebelum memulai transaksi."}
          </p>
        </div>
      </section>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#181715]/45 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="
        relative
        w-full
        max-w-md
        max-h-[calc(100dvh-24px)]
        overflow-y-auto
        overflow-x-hidden
        rounded-[1.5rem]
        border
        border-[#DCD8CF]
        bg-[#F5EFE6]
        shadow-2xl
        shadow-[#181715]/20

        [scrollbar-width:none]
        [-ms-overflow-style:none]
        [&::-webkit-scrollbar]:hidden

        sm:max-h-[calc(100dvh-40px)]
        sm:rounded-[2rem]
      "
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="sticky left-full top-4 z-20 mr-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
              aria-label="Tutup"
            >
              <X size={17} />
            </button>

            {/* TOP DARK */}
            <div className="-mt-9 bg-[#181715] px-6 pb-7 pt-6 text-white sm:px-8 sm:pb-8 sm:pt-7">
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 sm:mt-6 sm:text-xs">
                Akses akun diperlukan
              </p>

              <h2 className="mt-2 max-w-sm text-[28px] font-bold leading-[0.98] tracking-[-0.06em] sm:text-4xl">
                Masuk sebelum
                <br />
                memulai transaksi.
              </h2>

              <p className="mt-3 max-w-sm text-[13px] leading-5 text-white/45 sm:mt-4 sm:text-sm sm:leading-6">
                AlidPay membutuhkan akun untuk menghubungkan transaksi dengan
                pihak yang tepat dan menyimpan seluruh prosesnya.
              </p>
            </div>

            {/* CONTENT */}
            <div className="px-6 py-5 sm:px-8 sm:py-6">
              {/* INFO */}
              <div className="rounded-xl border border-[#E0DDD5] bg-[#EFECE4] p-3.5 sm:rounded-2xl sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold sm:text-sm">
                      Kenapa perlu akun?
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-[#75726B] sm:text-xs sm:leading-5">
                      Akun digunakan untuk menyimpan transaksi, melihat
                      perkembangan proses, dan memastikan hanya pihak terkait
                      yang dapat mengelolanya.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-5 grid gap-3">
                <Link
                  href="/login?redirect=/create-transaction"
                  onClick={() => setShowAuthModal(false)}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-[#181715] px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2A2926]"
                >
                  Masuk ke AlidPay
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/register?redirect=/create-transaction"
                  onClick={() => setShowAuthModal(false)}
                  className="group flex items-center justify-center gap-2 rounded-xl border border-[#D8D4CB] bg-white px-5 py-3.5 text-sm font-bold text-[#181715] transition hover:-translate-y-0.5 hover:bg-[#EFECE4]"
                >
                  Belum punya akun? Daftar
                  <ArrowRight
                    size={16}
                    className="text-[#C85A28] transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="mt-4 block w-full text-center text-xs font-semibold text-[#96928A] transition hover:text-[#181715]"
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MobileExperience() {
  return (
    <div className="relative flex h-full min-h-[520px] flex-col">
      <div className="relative z-10 max-w-[55%]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
          Aplikasi AlidPay
        </p>

        <h2 className="mt-5 text-5xl font-bold leading-[0.94] tracking-[-0.07em] sm:text-6xl">
          AlidPay
          <br />
          <span className="text-[#D49A2B]">dalam genggaman</span>
        </h2>

        <p className="mt-6 max-w-sm text-sm leading-6 text-white/45">
          Pantau pendapatan, transaksi aktif, dan pesanan langsung melalui
          aplikasi AlidPay.
        </p>
      </div>

      {/* FLUTTER SELLER DASHBOARD MOCKUP */}
      <div className="absolute -bottom-[155px] -right-3 hidden rotate-[-5deg] sm:block">
        <div className="w-[270px] overflow-hidden rounded-[2.7rem] border-[7px] border-[#292824] bg-[#F5EFE6] shadow-2xl shadow-black/40">
          {/* PHONE TOP */}
          <div className="relative bg-[#F5EFE6] px-4 pb-5 pt-6 text-[#181715]">
            <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#181715]/15" />

            {/* HEADER */}
            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[8px] font-extrabold tracking-[0.12em] text-[#C85A28]">
                  PENJUAL
                </p>

                <p className="mt-0.5 text-[16px] font-extrabold tracking-[-0.04em]">
                  Zuma
                </p>
              </div>

              <div className="rounded-full border border-[#E0DDD5] bg-white px-2.5 py-1.5">
                <p className="text-[7px] font-semibold">ID: @ALID-ZUMA</p>
              </div>
            </div>

            {/* BALANCE CARD */}
            <div className="mt-5 rounded-[14px] bg-[#181715] p-4 text-white">
              <div className="flex items-center justify-between">
                <p className="text-[8px] font-bold tracking-[0.08em]">
                  TOTAL PENDAPATAN CAIR
                </p>

                <div className="h-3 w-3 rounded-full border border-white/25" />
              </div>

              <p className="mt-2 text-[21px] font-extrabold tracking-[-0.04em] text-[#C89A56]">
                Rp8.450.000
              </p>

              <div className="my-4 h-px bg-white/10" />

              <div className="grid grid-cols-2 divide-x divide-white/10">
                <div className="pr-3">
                  <p className="text-[7px] font-bold text-white/70">TERTAHAN</p>

                  <p className="mt-1 text-[10px] font-bold text-[#C89A56]">
                    Rp2.450.000
                  </p>
                </div>

                <div className="pl-3">
                  <p className="text-[7px] font-bold text-white/70">
                    PERLU DIKIRIM
                  </p>

                  <p className="mt-1 text-[10px] font-bold text-[#C89A56]">
                    2 Transaksi
                  </p>
                </div>
              </div>
            </div>

            {/* CREATE BUTTON */}
            <div className="mt-4 flex items-center justify-center gap-2 rounded-[11px] border border-[#181715] bg-white py-3">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#181715] text-[10px] font-bold">
                +
              </span>

              <p className="text-[9px] font-bold">Buat Transaksi Baru</p>
            </div>

            {/* SUMMARY */}
            <div className="mt-4 grid grid-cols-2 border-y border-[#E0DDD5] py-3">
              <div className="text-center">
                <p className="text-[17px] font-extrabold text-[#10B981]">12</p>

                <p className="text-[8px] font-semibold">Selesai</p>
              </div>

              <div className="border-l border-[#E0DDD5] text-center">
                <p className="text-[17px] font-extrabold">18</p>

                <p className="text-[8px] font-semibold">Total Riwayat</p>
              </div>
            </div>

            {/* ORDERS */}
            <div className="mt-4">
              <p className="text-[11px] font-extrabold">Daftar Pesanan</p>

              <div className="mt-2 flex gap-1.5">
                <span className="rounded-md bg-[#181715] px-2 py-1 text-[7px] font-bold text-[#F5EFE6]">
                  Semua
                </span>

                <span className="rounded-md bg-[#EFECE4] px-2 py-1 text-[7px] font-semibold">
                  Diproses
                </span>

                <span className="rounded-md bg-[#EFECE4] px-2 py-1 text-[7px] font-semibold">
                  Selesai
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <MobileOrder
                  title="MacBook Pro M3"
                  value="Rp18.499.000"
                  status="Dana ditahan"
                />

                <MobileOrder
                  title="Desain Website"
                  value="Rp2.500.000"
                  status="Diproses"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOWNLOAD */}
      <div className="relative z-10 mt-auto pt-12 sm:max-w-[50%]">
        <div className="mb-4 flex items-center gap-2 text-xs text-white/40">
          <Download size={14} />
          Tersedia untuk Android & iOS
        </div>

        <div className="grid gap-2">
          <StoreButton store="Google Play" dark />
          <StoreButton store="App Store" dark />
        </div>
      </div>
    </div>
  );
}

function WebExperience() {
  return (
    <div className="flex h-full min-h-[520px] flex-col">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
          AlidPay Web
        </p>

        <h2 className="mt-5 max-w-xl text-5xl font-bold leading-[0.94] tracking-[-0.07em] sm:text-6xl">
          Mulai transaksi
          <br />
          <span className="text-[#C85A28]">langsung di sini.</span>
        </h2>

        <p className="mt-6 max-w-md text-sm leading-6 text-white/45">
          Buat transaksi langsung melalui browser tanpa perlu menginstal
          aplikasi.
        </p>
      </div>

      {/* REAL ALIDPAY CREATE TRANSACTION MOCKUP */}
      <div className="mt-auto pt-10">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#F5EFE6] text-[#181715] shadow-2xl shadow-black/30">
          {/* BROWSER CHROME */}
          <div className="flex items-center gap-1.5 border-b border-[#E0DDD5] bg-[#EFECE4] px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-[#181715]/20" />
            <span className="h-2 w-2 rounded-full bg-[#181715]/20" />
            <span className="h-2 w-2 rounded-full bg-[#181715]/20" />

            <div className="ml-3 flex-1 rounded-md bg-[#F5EFE6] px-3 py-1 text-[8px] text-[#96928A]">
              alidpay.com/create-transaction
            </div>
          </div>

          {/* APP HEADER */}
          <div className="flex h-10 items-center justify-between border-b border-[#E0DDD5] px-4">
            <ArrowLeft size={11} />

            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#181715] text-[7px] font-black text-[#F5EFE6]">
                A
              </div>

              <span className="text-[8px] font-extrabold">AlidPay</span>
            </div>

            <span />
          </div>

          {/* CREATE CONTENT */}
          <div className="p-5">
            <div>
              <h3 className="text-[24px] font-extrabold leading-none tracking-[-0.055em]">
                Buat <span className="text-[#C85A28]">transaksi</span>
              </h3>

              <p className="mt-2 max-w-[390px] text-[8px] leading-4 text-[#75726B]">
                Buat transaksi AlidPay, tentukan pihak yang akan bertransaksi,
                lalu periksa detail sebelum melanjutkan.
              </p>
            </div>

            {/* MODE SELECTOR */}
            <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-[#E0DDD5]">
              <div className="relative flex items-center gap-2 bg-white/60 p-2.5">
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#D49A2B]" />

                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#181715] text-white">
                  <UserRound size={10} />
                </div>

                <div>
                  <p className="text-[7px] font-extrabold">
                    Pengguna terdaftar
                  </p>

                  <p className="text-[6px] text-[#75726B]">
                    Sudah punya ID AlidPay
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#181715]/5 text-[#75726B]">
                  <Link2 size={10} />
                </div>

                <div>
                  <p className="text-[7px] font-extrabold text-[#181715]/55">
                    Melalui tautan
                  </p>

                  <p className="text-[6px] text-[#75726B]">
                    Bagikan tautan transaksi
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="mt-4 space-y-3">
              <PreviewField
                label="BARANG, JASA ATAU PESANAN APAPUN"
                value="MacBook Pro M3 — 16GB"
              />

              <PreviewField label="ID PEMBELI" value="@ALID-8K4M2P9X" />

              <PreviewField label="KONTAK PEMBELI" value="0812 3456 7890" />

              {/* AMOUNT */}
              <div>
                <p className="text-[6px] font-extrabold tracking-[0.12em] text-[#75726B]">
                  NOMINAL TRANSAKSI
                </p>

                <div className="mt-1 flex items-end border-b border-[#181715] pb-1">
                  <span className="mr-1 text-[9px] font-extrabold text-[#D49A2B]">
                    Rp
                  </span>

                  <span className="text-[18px] font-extrabold tracking-[-0.04em]">
                    18.499.000
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <div className="flex w-fit items-center gap-2 rounded-md bg-[#181715] px-4 py-2.5 text-[7px] font-extrabold text-white">
                  Lanjut ke ringkasan
                  <ArrowRight size={9} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[6px] font-extrabold tracking-[0.12em] text-[#75726B]">
        {label}
      </p>

      <div className="mt-1 border-b border-[#E0DDD5] pb-1.5">
        <p className="text-[8px] font-semibold">{value}</p>
      </div>
    </div>
  );
}

function StoreButton({
  store,
  dark = false,
}: {
  store: string;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
        dark
          ? "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
          : "border-[#DCD8CF] bg-[#F5EFE6] text-[#181715] hover:bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            dark ? "bg-white text-[#181715]" : "bg-[#181715] text-white"
          }`}
        >
          {store === "Google Play" ? (
            <span className="text-xs font-black">▶</span>
          ) : (
            <span className="text-sm font-black"></span>
          )}
        </div>

        <div>
          <p
            className={`text-[9px] ${
              dark ? "text-white/40" : "text-[#96928A]"
            }`}
          >
            Unduh di
          </p>

          <p className="text-sm font-bold">{store}</p>
        </div>
      </div>

      <ArrowRight
        size={16}
        className="transition-transform group-hover:translate-x-1"
      />
    </button>
  );
}

function MiniTransaction({ title, status }: { title: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E0DDD5] bg-[#EFECE4] p-2.5">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-[#181715]" />

        <p className="text-[9px] font-bold">{title}</p>
      </div>

      <p className="text-[8px] font-semibold text-[#96928A]">{status}</p>
    </div>
  );
}

function MobileOrder({
  title,
  value,
  status,
}: {
  title: string;
  value: string;
  status: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#E0DDD5] bg-[#EFECE4] p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[8px] font-extrabold">{title}</p>

          <p className="mt-0.5 text-[7px] text-[#75726B]">{status}</p>
        </div>

        <p className="shrink-0 text-[8px] font-bold text-[#C85A28]">{value}</p>
      </div>
    </div>
  );
}

function FakeInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E0DDD5] bg-[#EFECE4] p-3">
      <p className="text-[8px] font-bold uppercase tracking-wider text-[#96928A]">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold">{value}</p>
    </div>
  );
}
