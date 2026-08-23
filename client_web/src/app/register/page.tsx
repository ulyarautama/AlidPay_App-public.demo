"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { ChangeEvent, Suspense, SyntheticEvent, useState } from "react";
import { api } from "../lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { safeRedirectPath } from "../lib/navigation";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

function RegisterContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "pembeli",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"));
  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "role" ? value.toLowerCase() : value,
    }));
  }

  async function handleSubmitFormData(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      await api.get("/sanctum/csrf-cookie");
      await api.post("/api/register", formData);
      router.push(
        `/verify-email?email=${encodeURIComponent(formData.email)}&redirect=${encodeURIComponent(redirect)}`,
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="min-h-dvh bg-[#F5EFE6] text-[#181715]">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-4 sm:px-8 sm:py-6">
        {/* TOP */}
        <div className="flex shrink-0 items-center justify-between">
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
        <div className="flex flex-1 items-center justify-center py-6 lg:py-8">
          <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-[#DED9D0] bg-[#EFECE4] shadow-xl shadow-[#181715]/5 sm:rounded-[2rem] lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT */}
            <div className="hidden bg-[#181715] p-8 text-white lg:flex lg:flex-col xl:p-10">
              <div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                  Mulai dengan membuat akun
                </p>

                <h1 className="mt-3 text-4xl font-bold leading-[0.95] tracking-[-0.06em] xl:text-5xl">
                  Buka akses
                  <br />
                  ke AlidPay
                </h1>

                <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
                  Buat akun, verifikasi email, lalu mulai gunakan seluruh fitur
                  transaksi AlidPay.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    "Verifikasi akun",
                    "Mulai transaksi",
                    "Pantau prosesnya",
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
            <div className="min-w-0 bg-[#F5EFE6] p-5 sm:p-8 lg:p-10">
              <div className="mx-auto w-full max-w-md">
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.06em] sm:text-4xl">
                  Buat akun AlidPay.
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#75726B]">
                  Daftar sekarang dan mulai melakukan transaksi dengan lebih
                  aman.
                </p>

                <form
                  onSubmit={handleSubmitFormData}
                  className="mt-4 space-y-3 sm:mt-2"
                >
                  {/* NAME */}
                  <div>
                    <label
                      htmlFor="name"
                      className="text-xs font-bold uppercase tracking-[0.12em]"
                    >
                      Nama
                    </label>

                    <input
                      onChange={handleInputChange}
                      value={formData.name}
                      name="name"
                      id="name"
                      type="text"
                      placeholder="Nama lengkap"
                      autoComplete="name"
                      required
                      className="mt-2 w-full rounded-xl border border-[#D8D4CB] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#AAA59C] focus:border-[#C85A28] focus:ring-2 focus:ring-[#C85A28]/10"
                    />
                  </div>

                  {/* EMAIL */}
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
                      autoComplete="email"
                      required
                      className="mt-2 w-full rounded-xl border border-[#D8D4CB] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#AAA59C] focus:border-[#C85A28] focus:ring-2 focus:ring-[#C85A28]/10"
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="password"
                        className="text-xs font-bold uppercase tracking-[0.12em]"
                      >
                        Password
                      </label>

                      <span className="text-[10px] text-[#96928A]">
                        Password minimal 8 karakter
                      </span>
                    </div>

                    <input
                      onChange={handleInputChange}
                      value={formData.password}
                      name="password"
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="mt-2 w-full rounded-xl border border-[#D8D4CB] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#AAA59C] focus:border-[#C85A28] focus:ring-2 focus:ring-[#C85A28]/10"
                    />
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label
                      htmlFor="password_confirmation"
                      className="text-xs font-bold uppercase tracking-[0.12em]"
                    >
                      Konfirmasi password
                    </label>

                    <input
                      onChange={handleInputChange}
                      value={formData.password_confirmation}
                      name="password_confirmation"
                      id="password_confirmation"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="mt-2 w-full rounded-xl border border-[#D8D4CB] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#AAA59C] focus:border-[#C85A28] focus:ring-2 focus:ring-[#C85A28]/10"
                    />
                  </div>

                  {/* ROLE */}
                  <div>
                    <label
                      htmlFor="role"
                      className="text-xs font-bold uppercase tracking-[0.12em]"
                    >
                      Daftar sebagai
                    </label>

                    <select
                      onChange={handleInputChange}
                      value={formData.role}
                      name="role"
                      id="role"
                      required
                      className="mt-2 w-full appearance-none rounded-xl border border-[#D8D4CB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C85A28] focus:ring-2 focus:ring-[#C85A28]/10"
                    >
                      <option value="pembeli">Pembeli</option>

                      <option value="penjual">Penjual</option>
                    </select>
                  </div>

                  {/* TERMS */}
                  <div className="flex items-start gap-3">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 shrink-0 accent-[#C85A28]"
                    />

                    <label
                      htmlFor="terms"
                      className="text-xs leading-5 text-[#75726B]"
                    >
                      Saya menyetujui{" "}
                      <Link
                        href="/ketentuan"
                        target="_blank"
                        className="font-semibold text-[#C85A28] hover:underline"
                      >
                        Ketentuan Layanan
                      </Link>{" "}
                      dan{" "}
                      <Link
                        href="/privasi"
                        target="_blank"
                        className="font-semibold text-[#C85A28] hover:underline"
                      >
                        Kebijakan Privasi
                      </Link>{" "}
                      AlidPay.
                    </label>
                  </div>

                  {/* BUTTON */}
                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#181715] px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2A2926]"
                  >
                    Buat akun
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </form>

                {/* DIVIDER */}
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#DED9D0]" />

                  <span className="text-xs text-[#96928A]">atau</span>

                  <div className="h-px flex-1 bg-[#DED9D0]" />
                </div>

                {/* LOGIN LINK */}
                <p className="text-center text-sm text-[#75726B]">
                  Sudah punya akun?{" "}
                  <Link
                    href={`/login?redirect=${encodeURIComponent(redirect)}`}
                    className="font-bold text-[#C85A28] hover:underline"
                  >
                    Masuk
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE FOOTER */}
        <p className="shrink-0 text-center text-xs text-[#96928A]">
          © 2026 AlidPay
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
