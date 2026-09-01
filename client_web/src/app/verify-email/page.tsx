"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { safeRedirectPath } from "../lib/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../lib/transactions";

type VerificationErrorData = {
  message?: string;
  retry_after?: number;
  scope?: "resend_cooldown" | "resend_window" | "verification_block";
};

function verificationErrorData(error: unknown): VerificationErrorData {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return {};
  }

  const response = error.response;
  if (!response || typeof response !== "object" || !("data" in response)) {
    return {};
  }

  return (response.data ?? {}) as VerificationErrorData;
}

function initialResendWait(email: string): number {
  if (!email || typeof window === "undefined") return 0;

  const storedUntil = Number(
    sessionStorage.getItem(`alidpay:otp-resend:${email.toLowerCase()}`) ?? 0,
  );

  return Math.max(0, Math.ceil((storedUntil - Date.now()) / 1000));
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const email = searchParams.get("email") ?? "";
  const redirect = safeRedirectPath(searchParams.get("redirect"));

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendWait, setResendWait] = useState(0);
  const [verificationWait, setVerificationWait] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResendWait(initialResendWait(email));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [email]);

  useEffect(() => {
    if (resendWait <= 0 && verificationWait <= 0) return;

    const timer = window.setInterval(() => {
      setResendWait((seconds) => Math.max(0, seconds - 1));
      setVerificationWait((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendWait, verificationWait]);

  async function handleVerify() {
    if (verificationWait > 0) {
      setError(
        `Verifikasi masih dikunci. Coba lagi dalam ${Math.ceil(verificationWait / 60)} menit.`,
      );
      return;
    }

    if (code.length !== 6) {
      setError("Masukkan 6 digit kode verifikasi.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      await api.post("/api/verify-otp", {
        email,
        code,
      });
      await refreshUser();

      router.push(redirect);
    } catch (err: unknown) {
      const data = verificationErrorData(err);
      if (data.scope === "verification_block" && data.retry_after) {
        setVerificationWait(data.retry_after);
      }
      setError(apiErrorMessage(err, "Verifikasi gagal. Silakan coba lagi."));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || resendWait > 0 || verificationWait > 0) return;

    setResendLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await api.post("/api/resend-otp", { email });
      const cooldownSeconds = Number(response.data?.cooldown_seconds ?? 60);
      setResendWait(cooldownSeconds);
      sessionStorage.setItem(
        `alidpay:otp-resend:${email.toLowerCase()}`,
        String(Date.now() + cooldownSeconds * 1000),
      );
      setCode("");
      setNotice(response.data?.message ?? "Kode baru telah dikirim ke email Anda.");
    } catch (err: unknown) {
      const data = verificationErrorData(err);
      const retryAfter = Number(data.retry_after ?? 0);

      if (retryAfter > 0) {
        if (data.scope === "verification_block") {
          setVerificationWait(retryAfter);
        } else {
          setResendWait(retryAfter);
          sessionStorage.setItem(
            `alidpay:otp-resend:${email.toLowerCase()}`,
            String(Date.now() + retryAfter * 1000),
          );
        }
      }

      setError(apiErrorMessage(err, "Kode baru belum dapat dikirim."));
    } finally {
      setResendLoading(false);
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
                disabled={verificationWait > 0}
                className="mt-2 w-full rounded-xl border border-[#D8D4CB] bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-[#C85A28] focus:ring-2 focus:ring-[#C85A28]/10"
              />
            </div>

            {notice && (
              <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {notice}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6 || verificationWait > 0}
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

            <button
              type="button"
              onClick={handleResend}
              disabled={
                resendLoading || resendWait > 0 || verificationWait > 0 || !email
              }
              className="mt-3 w-full rounded-xl border border-[#C8C2B8] px-5 py-3 text-sm font-bold transition hover:border-[#181715] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {verificationWait > 0
                ? `Verifikasi dikunci ${Math.ceil(verificationWait / 60)} menit`
                : resendLoading
                  ? "Mengirim kode..."
                  : resendWait > 0
                    ? `Kirim ulang dalam ${resendWait} detik`
                    : "Kirim ulang kode"}
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
