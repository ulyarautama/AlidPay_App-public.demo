"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Globe,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

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
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#D49A2B]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#C85A28]/10 blur-3xl" />

        <div className="absolute left-[8%] top-[35%] h-px w-[84%] bg-[#E0DDD5]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 px-5 pt-5 sm:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181715] text-sm font-bold text-white transition-transform duration-300 group-hover:rotate-6">
              A
            </div>

            <span className="text-lg font-bold tracking-[-0.04em]">
              AlidPay
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#75726B] transition hover:text-[#181715]"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </nav>
      </header>

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-8 sm:pt-32">
        {/* Eyebrow */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DDD9D0] bg-[#EFECE4] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#75726B]">
            <Sparkles size={13} className="text-[#D49A2B]" />
            Your transaction starts here
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-[clamp(3.2rem,7vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.075em]">
            Choose your
            <br />
            <span className="text-[#C85A28]">way to transact.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-[#75726B] sm:text-lg">
            Use AlidPay wherever you are. Get the full mobile experience or
            start instantly from your browser.
          </p>
        </div>

        {/* Device selector */}
        <div className="mx-auto mt-12 flex w-fit rounded-full border border-[#DCD8CF] bg-[#EFECE4] p-1.5">
          <button
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              device === "mobile"
                ? "bg-[#181715] text-white shadow-lg"
                : "text-[#75726B] hover:text-[#181715]"
            }`}
          >
            <Smartphone size={16} />
            Mobile
          </button>

          <button
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

        {/* Main experience */}
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Primary card */}
          <div className="relative min-h-[580px] overflow-hidden rounded-[2rem] bg-[#181715] p-7 text-white sm:p-10">
            {/* Decorative text */}
            <div className="pointer-events-none absolute -right-8 -top-16 select-none text-[190px] font-black leading-none tracking-[-0.12em] text-white/[0.035]">
              A
            </div>

            {device === "mobile" ? <MobileExperience /> : <WebExperience />}
          </div>

          {/* Secondary card */}
          <div className="flex flex-col overflow-hidden rounded-[2rem] border border-[#DDD9D0] bg-[#EFECE4]">
            <div className="flex-1 p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#96928A]">
                {device === "mobile" ? "Mobile first" : "No download"}
              </p>

              <h2 className="mt-5 text-3xl font-bold leading-[1] tracking-[-0.06em]">
                {device === "mobile"
                  ? "Everything in your pocket."
                  : "Start without installing anything."}
              </h2>

              <p className="mt-5 text-sm leading-6 text-[#75726B]">
                {device === "mobile"
                  ? "Create, manage and track your transactions with the AlidPay app."
                  : "Create your transaction directly from the browser. Fast, simple and ready when you are."}
              </p>

              {/* Feature list */}
              <div className="mt-9 space-y-4">
                {(device === "mobile"
                  ? [
                      "Push transaction notifications",
                      "Track all transactions",
                      "Biometric security",
                      "Faster checkout",
                    ]
                  : [
                      "No app required",
                      "Instant transaction creation",
                      "Shareable payment links",
                      "Works on any modern browser",
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

            {/* Bottom CTA */}
            <div className="border-t border-[rgb(220,216,207)] p-7 sm:p-9">
              {device === "mobile" ? (
                <div className="space-y-3">
                  <StoreButton store="Google Play" />

                  <StoreButton store="App Store" />

                  <p className="pt-2 text-center text-[11px] text-[#96928A]">
                    Already have AlidPay?
                    <button className="ml-1 font-bold text-[#181715]">
                      Open app
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
                  Create a transaction
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-[#E0DDD5] pt-7 text-xs text-[#96928A] sm:flex-row">
          <p>
            {device === "mobile"
              ? "Download AlidPay for the complete experience."
              : "No account? You can create one when you start."}
          </p>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            AlidPay is ready
          </div>
        </div>
      </section>
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#181715]/45 px-5 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#DCD8CF] bg-[#F5EFE6] shadow-2xl shadow-[#181715]/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#DCD8CF] bg-[#EFECE4] text-[#75726B] transition hover:bg-white hover:text-[#181715]"
              aria-label="Tutup"
            >
              <X size={17} />
            </button>

            {/* TOP DARK */}
            <div className="bg-[#181715] px-7 pb-8 pt-7 text-white sm:px-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C85A28]">
                <LockKeyhole size={21} />
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                Secure transaction
              </p>

              <h2 className="mt-3 max-w-sm text-3xl font-bold leading-[0.98] tracking-[-0.06em] sm:text-4xl">
                Sebentar.
                <br />
                Kamu belum masuk.
              </h2>

              <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
                Untuk membuat transaksi dan menjaga dana tetap aman, kamu perlu
                masuk ke akun AlidPay terlebih dahulu.
              </p>
            </div>

            {/* CONTENT */}
            <div className="px-7 py-7 sm:px-9">
              <div className="rounded-2xl border border-[#E0DDD5] bg-[#EFECE4] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">Kenapa harus masuk?</p>

                    <p className="mt-1 text-xs leading-5 text-[#75726B]">
                      Akun diperlukan untuk menyimpan transaksi, melacak
                      pembayaran, dan memastikan hanya kamu yang bisa mengelola
                      transaksi tersebut.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 grid gap-3">
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
                className="mt-5 block w-full text-center text-xs font-semibold text-[#96928A] transition hover:text-[#181715]"
              >
                Nanti saja
              </button>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-center gap-2 border-t border-[#E0DDD5] bg-[#EFECE4] px-5 py-3.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#96928A]">
                Protected by AlidPay
              </span>
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
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
          Recommended
        </p>

        <h2 className="mt-5 max-w-lg text-5xl font-bold leading-[0.94] tracking-[-0.07em] sm:text-6xl">
          AlidPay
          <br />
          <span className="text-[#D49A2B]">in your pocket.</span>
        </h2>

        <p className="mt-6 max-w-md text-sm leading-6 text-white/45">
          Your transactions, notifications and payment security — always one tap
          away.
        </p>
      </div>

      {/* Phone mockup */}
      <div className="absolute bottom-[-180px] right-[-10px] hidden rotate-[-7deg] sm:block">
        <div className="w-[250px] rounded-[2.5rem] border-[7px] border-[#292824] bg-[#F5EFE6] p-3 shadow-2xl">
          <div className="rounded-[2rem] bg-[#F5EFE6] p-4 text-[#181715]">
            <div className="mx-auto mb-8 h-1 w-20 rounded-full bg-[#181715]/20" />

            <p className="text-[9px] font-bold uppercase tracking-widest text-[#96928A]">
              Good afternoon
            </p>

            <p className="mt-1 text-lg font-bold">Zuma</p>

            <div className="mt-5 rounded-2xl bg-[#181715] p-4 text-white">
              <p className="text-[9px] text-white/40">Protected balance</p>

              <p className="mt-1 text-xl font-bold">Rp2.450.000</p>

              <div className="mt-4 flex items-center gap-1 text-[9px] text-[#10B981]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                Protected
              </div>
            </div>

            <p className="mt-5 text-[9px] font-bold uppercase tracking-wider text-[#96928A]">
              Active transactions
            </p>

            <div className="mt-2 space-y-2">
              <MiniTransaction title="MacBook Pro" status="Shipping" />

              <MiniTransaction title="iPhone 15" status="Waiting" />

              <MiniTransaction title="Keyboard" status="Completed" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="relative z-10 mt-auto pt-12 sm:max-w-[55%]">
        <div className="mb-4 flex items-center gap-2 text-xs text-white/40">
          <Download size={14} />
          Available on iOS & Android
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
          Browser experience
        </p>

        <h2 className="mt-5 max-w-xl text-5xl font-bold leading-[0.94] tracking-[-0.07em] sm:text-6xl">
          Start
          <br />
          <span className="text-[#C85A28]">right here.</span>
        </h2>

        <p className="mt-6 max-w-md text-sm leading-6 text-white/45">
          No download. No waiting. Create a transaction and send the secure
          payment link to anyone.
        </p>
      </div>

      {/* Browser mockup */}
      <div className="mt-auto pt-12">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#F5EFE6] text-[#181715] shadow-2xl">
          {/* Browser top */}
          <div className="flex items-center gap-1.5 border-b border-[#E0DDD5] bg-[#EFECE4] px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-[#181715]/20" />
            <span className="h-2 w-2 rounded-full bg-[#181715]/20" />
            <span className="h-2 w-2 rounded-full bg-[#181715]/20" />

            <div className="ml-4 flex-1 rounded-md bg-[#F5EFE6] px-3 py-1 text-[9px] text-[#96928A]">
              alidpay.com/create
            </div>
          </div>

          {/* Browser content */}
          <div className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#96928A]">
                  New transaction
                </p>

                <p className="mt-1 text-xl font-bold tracking-[-0.04em]">
                  Create payment
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181715] text-xs font-bold text-white">
                A
              </div>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <FakeInput label="Product" value="MacBook Pro M3" />
              <FakeInput label="Amount" value="Rp18.499.000" />
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-[#C85A28] px-4 py-3 text-white">
              <span className="text-xs font-bold">Generate secure link</span>

              <ArrowRight size={15} />
            </div>
          </div>
        </div>
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
            Download on
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
