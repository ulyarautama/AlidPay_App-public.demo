"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import { api } from "../lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { safeRedirectPath } from "../lib/navigation";
import GoogleSignInButton from "./GoogleSignInButton";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

function LoginContent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [googleRole, setGoogleRole] = useState<"pembeli" | "penjual">("pembeli");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"));
  const addingAccount = searchParams.get("add_account") === "1";
  const { refreshUser, user } = useAuth();

  useEffect(() => {
    if (user && !addingAccount) {
      router.replace(redirect);
    }
  }, [addingAccount, redirect, router, user]);

  function getErrorMessage(err: unknown) {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.message
        ?? Object.values(err.response?.data?.errors ?? {}).flat().join(" ")
        ?? "Login gagal. Periksa data lalu coba lagi.";
    }

    return "Login gagal. Silakan coba lagi.";
  }
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }
  async function handleSubmitFormData(
    e: React.SyntheticEvent<HTMLFormElement>,
  ) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.get("/sanctum/csrf-cookie");
      await api.post("/api/login", formData);
      await refreshUser();
      router.replace(redirect);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFirebaseIdToken(idToken: string) {
    setGoogleSubmitting(true);
    setError(null);
    try {
      await api.get("/sanctum/csrf-cookie");
      await api.post("/api/login-firebase", {
        id_token: idToken,
        role: googleRole,
      });
      await refreshUser();
      router.replace(redirect);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGoogleSubmitting(false);
    }
  }

  if (user && !addingAccount) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6] text-sm font-semibold text-[#75726B]">
        Mengarahkan ke akunmu...
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-[#F5EFE6] text-[#181715]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8">
        {/* TOP */}
        <div className="flex items-center justify-between">
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
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#DED9D0] bg-[#EFECE4] shadow-xl shadow-[#181715]/5 lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT */}
            <div className="hidden bg-[#181715] p-10 text-white lg:flex lg:flex-col lg:justify-between">
              <div>
                <p className="mt-10 text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                  Selamat datang di AlidPay
                </p>

                <h1 className="mt-3 text-4xl font-bold leading-[0.95] tracking-[-0.06em] xl:text-5xl">
                  Kembali ke
                  <br />
                  transaksimu.
                </h1>

                <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
                  Masuk untuk melihat aktivitas akun dan melanjutkan transaksi
                  yang sedang berjalan.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    "Lihat transaksi aktif",
                    "Periksa permintaan masuk",
                    "Lanjutkan proses yang tertunda",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 border-t border-white/10 pt-3"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C85A28]">
                        <Check size={12} />
                      </div>

                      <p className="text-sm font-medium text-white/70">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="bg-[#F5EFE6] p-6 sm:p-10 lg:p-14">
              <div className="mx-auto max-w-md">
                <h2 className="mt-3 text-4xl font-bold tracking-[-0.06em]">
                  {addingAccount ? "Tambahkan akun AlidPay." : "Masuk ke AlidPay."}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#75726B]">
                  {addingAccount
                    ? "Verifikasi akun satu kali agar bisa dipilih langsung di perangkat ini."
                    : "Masuk ke akun untuk melanjutkan."}
                </p>

                <form
                  onSubmit={handleSubmitFormData}
                  className="mt-9 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="text-xs font-bold uppercase tracking-[0.12em]"
                    >
                      Email
                    </label>

                    <input
                      onChange={handleInputChange}
                      value={formData.email}
                      name="email"
                      id="email"
                      type="email"
                      placeholder="kamu@email.com"
                      className="mt-2 w-full rounded-xl border border-[#D8D4CB] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AAA59C] focus:border-[#C85A28] focus:ring-2 focus:ring-[#C85A28]/10"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-xs font-bold uppercase tracking-[0.12em]"
                      >
                        Password
                      </label>

                      <button
                        type="button"
                        className="text-xs font-semibold text-[#C85A28]"
                      >
                        Lupa password?
                      </button>
                    </div>

                    <input
                      onChange={handleInputChange}
                      value={formData.password}
                      name="password"
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-xl border border-[#D8D4CB] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AAA59C] focus:border-[#C85A28] focus:ring-2 focus:ring-[#C85A28]/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || googleSubmitting}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#181715] px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2A2926]"
                  >
                    {submitting ? "Memproses..." : "Masuk"}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </form>

                <div className="my-7 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#DED9D0]" />
                  <span className="text-xs text-[#96928A]">atau</span>
                  <div className="h-px flex-1 bg-[#DED9D0]" />
                </div>

                <div>
                  <p className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#96928A]">
                    Untuk akun Google baru, pilih peran
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#EFECE4] p-1">
                    {(["pembeli", "penjual"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setGoogleRole(role)}
                        aria-pressed={googleRole === role}
                        className={`rounded-lg px-4 py-2.5 text-xs font-bold capitalize transition ${
                          googleRole === role
                            ? "bg-white text-[#181715] shadow-sm"
                            : "text-[#96928A] hover:text-[#181715]"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <GoogleSignInButton
                    disabled={submitting || googleSubmitting}
                    onIdToken={handleFirebaseIdToken}
                    onError={(message) => setError(message || null)}
                  />
                </div>

                {error ? (
                  <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs leading-5 text-red-700">
                    {error}
                  </p>
                ) : null}

                <p className="mt-7 text-center text-sm text-[#75726B]">
                  Belum punya akun?{" "}
                  <Link
                    href={`/register?redirect=${encodeURIComponent(redirect)}`}
                    className="font-bold text-[#C85A28] hover:underline"
                  >
                    Daftar dengan akun AlidPay
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#96928A]">© 2026 AlidPay</p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
