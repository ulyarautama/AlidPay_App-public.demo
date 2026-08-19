"use client";

import { api } from "@/app/lib/axios";
import {
  ArrowRight,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.get("/sanctum/csrf-cookie");
      const response = await api.post("/api/admin/auth/login", {
        email,
        password,
      });
      setChallengeId(response.data.challenge_id);
      setEmailHint(response.data.email_hint);
      setStep("mfa");
    } catch (caught) {
      setError(extractMessage(caught, "Login admin gagal."));
    } finally {
      setLoading(false);
    }
  }

  async function submitMfa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.post("/api/admin/auth/verify-mfa", {
        challenge_id: challengeId,
        code,
      });
      router.replace(redirect.startsWith("/dashboard") ? redirect : "/dashboard");
      router.refresh();
    } catch (caught) {
      setError(extractMessage(caught, "Kode verifikasi tidak valid."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F5F7] text-[#172033]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#172033] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-white/10" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6B1E2C]">
              <ShieldCheck size={23} />
            </div>
            <div>
              <p className="text-base font-black">AlidPay</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                Secure Admin Access
              </p>
            </div>
          </div>

          <div className="relative max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D58B98]">
              Restricted area
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-[-0.05em]">
              Protecting trust,
              <br />one decision at a time.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/45">
              Setiap login diverifikasi melalui password dan kode sekali pakai
              yang dikirim ke email admin terdaftar. Semua tindakan sensitif
              dicatat dalam audit log.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {[
              ["Password", "Layer 01"],
              ["Email MFA", "Layer 02"],
              ["Audit Log", "Always on"],
            ].map(([label, meta]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold">{label}</p>
                <p className="mt-1 text-[9px] uppercase tracking-wide text-white/30">
                  {meta}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2E7E9] text-[#6B1E2C] lg:hidden">
              <ShieldCheck size={23} />
            </div>

            <div className="mb-8">
              <div className="mb-5 flex items-center gap-2">
                <span className={`h-1.5 flex-1 rounded-full ${step === "credentials" || step === "mfa" ? "bg-[#6B1E2C]" : "bg-slate-200"}`} />
                <span className={`h-1.5 flex-1 rounded-full ${step === "mfa" ? "bg-[#6B1E2C]" : "bg-slate-200"}`} />
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6B1E2C]">
                {step === "credentials" ? "Admin authentication" : "Email verification"}
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                {step === "credentials" ? "Masuk ke admin panel" : "Verifikasi email Anda"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {step === "credentials"
                  ? "Gunakan akun admin terpisah dari akun buyer atau seller."
                  : `Masukkan 6 digit kode yang dikirim ke ${emailHint}.`}
              </p>
            </div>

            {step === "credentials" ? (
              <form onSubmit={submitCredentials} className="space-y-5">
                <Field
                  label="Email admin"
                  icon={<MailCheck size={17} />}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="admin@alidpay.com"
                />
                <Field
                  label="Password"
                  icon={<LockKeyhole size={17} />}
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Minimal 12 karakter"
                />
                <SubmitButton loading={loading} label="Lanjut verifikasi email" />
              </form>
            ) : (
              <form onSubmit={submitMfa} className="space-y-5">
                <label className="block">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                    Kode verifikasi
                  </span>
                  <div className="relative mt-2">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      autoFocus
                      required
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={code}
                      onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 font-mono text-lg font-black tracking-[0.35em] outline-none transition focus:border-[#6B1E2C] focus:ring-4 focus:ring-[#6B1E2C]/5"
                    />
                  </div>
                </label>
                <SubmitButton loading={loading} label="Verifikasi & masuk" />
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setCode("");
                    setError(null);
                  }}
                  className="w-full text-xs font-bold text-slate-400 hover:text-[#6B1E2C]"
                >
                  Ganti email atau password
                </button>
              </form>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            <div className="mt-8 flex items-center gap-2 border-t border-slate-200 pt-5 text-[10px] leading-5 text-slate-400">
              <KeyRound size={14} className="shrink-0" />
              Sesi MFA berlaku maksimal 30 menit dan menggunakan cookie HttpOnly.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <div className="relative mt-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          required
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-13 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-[#6B1E2C] focus:ring-4 focus:ring-[#6B1E2C]/5"
        />
      </div>
    </label>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      disabled={loading}
      className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#6B1E2C] px-5 text-sm font-bold text-white shadow-lg shadow-[#6B1E2C]/15 transition hover:-translate-y-0.5 hover:bg-[#581824] disabled:cursor-wait disabled:opacity-60"
    >
      {loading ? "Memproses..." : label}
      {!loading && <ArrowRight size={16} className="transition group-hover:translate-x-1" />}
    </button>
  );
}

function extractMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    return (
      (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message ?? fallback
    );
  }

  return fallback;
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContent />
    </Suspense>
  );
}
