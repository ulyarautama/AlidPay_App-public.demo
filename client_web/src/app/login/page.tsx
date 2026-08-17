"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Suspense, useState } from "react";
import { api } from "../lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";

function LoginContent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { refreshUser } = useAuth();
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
    try {
      await api.get("/sanctum/csrf-cookie");
      await api.post("/api/login", formData);
      await refreshUser();
      router.push(redirect);
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <main className="min-h-screen bg-[#F5EFE6] text-[#181715]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-[-0.04em]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181715] text-[#F5EFE6]">
              A
            </div>

            <span className="text-lg">AlidPay</span>
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C85A28]">
                  <ShieldCheck size={22} />
                </div>

                <p className="mt-10 text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                  Welcome back
                </p>

                <h1 className="mt-4 text-5xl font-bold leading-[0.95] tracking-[-0.07em]">
                  Transaksi
                  <br />
                  lebih tenang.
                </h1>

                <p className="mt-6 max-w-sm text-sm leading-6 text-white/45">
                  Masuk ke akun AlidPay untuk membuat transaksi, melihat status
                  pembayaran, dan mengelola transaksi kamu.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/40">
                <LockKeyhole size={15} />
                Protected by AlidPay
              </div>
            </div>

            {/* FORM */}
            <div className="bg-[#F5EFE6] p-6 sm:p-10 lg:p-12">
              <div className="mx-auto max-w-md">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C85A28]">
                  Account
                </p>

                <h2 className="mt-3 text-4xl font-bold tracking-[-0.06em]">
                  Masuk ke AlidPay.
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#75726B]">
                  Masukkan akun kamu untuk melanjutkan.
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
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#181715] px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2A2926]"
                  >
                    Masuk
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

                <p className="text-center text-sm text-[#75726B]">
                  Belum punya akun?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-[#C85A28] hover:underline"
                  >
                    Daftar sekarang
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#96928A]">
          © 2026 AlidPay · Safer transactions, made simple.
        </p>
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