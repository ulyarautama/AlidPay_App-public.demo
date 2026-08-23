"use client";

import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/axios";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RememberedAccount = {
  id: string;
  public_id: string;
  name: string;
  email: string;
  role: "pembeli" | "penjual";
  current: boolean;
};

export default function AccountSwitcherPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [accounts, setAccounts] = useState<RememberedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    api
      .get("/api/account-switcher/accounts")
      .then((response) => {
        if (active) setAccounts(response.data.accounts ?? []);
      })
      .catch(() => {
        if (active) setError("Daftar akun belum dapat dimuat.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function switchAccount(account: RememberedAccount) {
    if (account.current || switchingId) return;

    try {
      setSwitchingId(account.id);
      setError(null);
      await api.post("/api/account-switcher/switch", {
        user_id: account.id,
      });
      await refreshUser();
      router.replace("/");
      router.refresh();
    } catch {
      setError("Akun gagal diganti. Tambahkan ulang akun lalu coba lagi.");
      setSwitchingId(null);
    }
  }

  if (authLoading || !user || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6]">
        <Loader2 size={28} className="animate-spin text-[#C85A28]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-10 text-[#181715] sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.replace("/")}
          className="flex items-center gap-2 text-xs font-bold text-[#75726B] transition hover:text-[#181715]"
        >
          <ArrowLeft size={15} /> Kembali ke halaman utama
        </button>

        <header className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D8D4CB] bg-[#EFECE4] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#75726B]">
            <ShieldCheck size={13} /> Pemilih akun
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
            Pilih akun AlidPay.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#75726B]">
            Berpindah ke akun yang sudah dipercaya pada perangkat ini tanpa
            mengetik ulang password.
          </p>
        </header>

        <section className="mt-8 overflow-hidden rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4]">
          {accounts.map((account, index) => (
            <button
              key={account.id}
              type="button"
              disabled={account.current || switchingId !== null}
              onClick={() => void switchAccount(account)}
              className={`flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-white disabled:cursor-default disabled:opacity-100 sm:px-6 ${index > 0 ? "border-t border-[#DCD8CF]" : ""}`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${account.current ? "bg-[#181715] text-white" : "bg-[#F5EFE6] text-[#75726B]"}`}
              >
                {switchingId === account.id ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <UserRound size={20} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-bold">{account.name}</p>
                  {account.current && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
                      <Check size={11} /> Sedang digunakan
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-[#75726B]">
                  {account.email}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#96928A]">
                  {account.role} · {account.public_id}
                </p>
              </div>

              {!account.current && (
                <ChevronRight size={18} className="shrink-0 text-[#B2AEA6]" />
              )}
            </button>
          ))}
        </section>

        {error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}

        <Link
          href="/login?add_account=1&redirect=/account/switch"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#181715] px-5 py-3.5 text-sm font-bold transition hover:bg-[#181715] hover:text-white"
        >
          <Plus size={17} /> Tambahkan akun lain
        </Link>

        <p className="mt-4 text-center text-[11px] leading-5 text-[#96928A]">
          Akun baru perlu diverifikasi satu kali. Daftar akun dipercaya selama
          30 hari pada browser ini.
        </p>
      </div>
    </main>
  );
}
