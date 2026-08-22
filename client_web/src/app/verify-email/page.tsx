"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { safeRedirectPath } from "../lib/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../lib/transactions";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const email = searchParams.get("email") ?? "";
  const redirect = safeRedirectPath(searchParams.get("redirect"));

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify() {
    if (code.length !== 6) {
      setError("Masukkan 6 digit kode verifikasi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/verify-otp", {
        email,
        code,
      });
      await refreshUser();

      router.push(redirect);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Verifikasi gagal. Silakan coba lagi."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#F5EFE6] text-[#181715]">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-6 sm:px-8">
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
            className="flex items-center gap-2 text-sm font-semibold text-[#75726B]"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md rounded-[2rem] border border-[#DED9D0] bg-[#EFECE4] p-8 shadow-xl shadow-[#181715]/5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#181715] text-white">
              <ShieldCheck size={24} />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#C85A28]">
              Verify your email
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em]">
              Verifikasi email.
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#75726B]">
              Kami telah mengirimkan kode verifikasi ke:
            </p>

            <p className="mt-2 font-bold">{email}</p>

            <div className="mt-8">
              <label
                htmlFor="code"
                className="text-xs font-bold uppercase tracking-[0.12em]"
              >
                Kode verifikasi
              </label>

              <input
                id="code"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="mt-2 w-full rounded-xl border border-[#D8D4CB] bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-[#C85A28] focus:ring-2 focus:ring-[#C85A28]/10"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#181715] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#2A2926] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                "Memverifikasi..."
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  Verifikasi email
                </>
              )}
            </button>

            <p className="mt-6 text-center text-xs leading-5 text-[#96928A]">
              Kode berlaku selama 10 menit. Akun belum dibuat sebelum email
              berhasil diverifikasi.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#96928A]">
          © 2026 AlidPay · Safer transactions, made simple.
        </p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
