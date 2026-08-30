"use client";

import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/axios";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSaved(false);
      await api.put("/api/user/profile", {
        name: cleanName,
        phone: phone.trim() || null,
      });
      await refreshUser();
      setSaved(true);
    } catch {
      setError("Pengaturan akun gagal disimpan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6]">
        <Loader2 size={28} className="animate-spin text-[#C85A28]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-10 text-[#181715] sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.replace("/")}
          className="flex items-center gap-2 text-xs font-bold text-[#75726B] transition hover:text-[#181715]"
        >
          <ArrowLeft size={15} />
          Kembali ke halaman utama
        </button>

        <header className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D8D4CB] bg-[#EFECE4] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#75726B]">
            <ShieldCheck size={13} /> Pengaturan akun
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
            Kelola informasi akunmu.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#75726B]">
            Perbarui nama dan nomor telepon yang digunakan pada akun AlidPay.
          </p>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-[0.75fr_1.25fr]">
          <aside className="rounded-[1.75rem] border border-[#DCD8CF] bg-[#181715] p-6 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <UserRound size={24} />
            </div>
            <p className="mt-5 break-words text-lg font-bold">{user.name}</p>
            <p className="mt-1 break-all text-xs text-white/45">{user.email}</p>
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                Peran akun
              </p>
              <p className="mt-2 text-sm font-semibold capitalize">{user.role}</p>
            </div>
            {user.public_id && (
              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                  ID AlidPay
                </p>
                <p className="mt-2 break-all font-mono text-xs text-white/70">
                  {user.public_id}
                </p>
              </div>
            )}
            {(process.env.NEXT_PUBLIC_TEST_BALANCE_ENABLED === "true" ||
              (process.env.NEXT_PUBLIC_TEST_BALANCE_ENABLED !== "false" &&
                process.env.NODE_ENV === "development")) && <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                Saldo uji AlidPay · Dev/Test
              </p>
              <p className="mt-2 text-lg font-bold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(Number(user.balance))}
              </p>
              <button
                type="button"
                onClick={() => router.push("/account/top-up?return=/account/settings")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#181715]"
              >
                <Wallet size={15} /> Isi saldo uji
              </button>
            </div>}
          </aside>

          <form
            onSubmit={submit}
            className="rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-8"
          >
            <label className="block text-xs font-bold text-[#75726B]">
              Nama lengkap
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={255}
                className="mt-2 h-12 w-full rounded-xl border border-[#D8D4CB] bg-[#F5EFE6] px-4 text-sm font-semibold outline-none transition focus:border-[#181715]"
              />
            </label>

            <label className="mt-5 block text-xs font-bold text-[#75726B]">
              Nomor telepon
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                maxLength={20}
                placeholder="Contoh: 081234567890"
                className="mt-2 h-12 w-full rounded-xl border border-[#D8D4CB] bg-[#F5EFE6] px-4 text-sm font-semibold outline-none transition focus:border-[#181715]"
              />
            </label>

            <label className="mt-5 block text-xs font-bold text-[#75726B]">
              Email
              <input
                value={user.email}
                readOnly
                className="mt-2 h-12 w-full cursor-not-allowed rounded-xl border border-[#D8D4CB] bg-[#E4E0D7] px-4 text-sm font-semibold text-[#75726B]"
              />
            </label>
            <p className="mt-2 text-[11px] leading-5 text-[#96928A]">
              Email login tidak dapat diubah dari halaman ini demi keamanan akun.
            </p>

            {error && (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}
            {saved && (
              <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={16} /> Pengaturan akun berhasil disimpan.
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#181715] px-5 text-sm font-bold text-white transition hover:bg-[#2A2926] disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
