"use client";

import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/axios";
import {
  clearAccountSelectionRequirement,
  requireAccountSelection,
} from "@/app/lib/accountSelection";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type RememberedAccount = {
  id: string;
  public_id: string;
  name: string;
  email: string;
  role: "pembeli" | "penjual";
  current: boolean;
};

function AccountSwitcherContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectionRequired = searchParams.get("required") === "1";
  const { loading: authLoading, refreshUser, logout } = useAuth();
  const [accounts, setAccounts] = useState<RememberedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<RememberedAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accountLimitReached = accounts.length >= 2;
  const missingRole = accounts.some((account) => account.role === "pembeli")
    ? "Penjual"
    : "Pembeli";

  useEffect(() => {
    if (selectionRequired) requireAccountSelection();
  }, [selectionRequired]);

  useEffect(() => {
    let active = true;

    api
      .get("/api/account-switcher/accounts")
      .then((response) => {
        if (!active) return;

        const rememberedAccounts = response.data.accounts ?? [];
        if (rememberedAccounts.length === 0) {
          clearAccountSelectionRequirement();
          router.replace("/login");
          return;
        }

        setAccounts(rememberedAccounts);
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
  }, [router]);

  async function switchAccount(account: RememberedAccount) {
    if (account.current || switchingId || removingId) return;

    try {
      setSwitchingId(account.id);
      setError(null);
      await api.post("/api/account-switcher/switch", {
        user_id: account.id,
      });
      clearAccountSelectionRequirement();
      await refreshUser();
      router.replace("/");
      router.refresh();
    } catch {
      setError("Akun gagal diganti. Tambahkan ulang akun lalu coba lagi.");
      setSwitchingId(null);
    }
  }

  async function removeAccount(account: RememberedAccount) {
    if (switchingId || removingId) return;

    try {
      setRemovingId(account.id);
      setError(null);

      const response = await api.delete(
        `/api/account-switcher/accounts/${account.id}`,
      );

      setRemoveTarget(null);
      const remainingAccounts = accounts.filter(
        (remembered) => remembered.id !== account.id,
      );
      const rememberedAccountsCount = Number(
        response.data.remembered_accounts_count ?? remainingAccounts.length,
      );

      if (response.data.current_account_removed) {
        setAccounts(remainingAccounts);
        setRemovingId(null);
        logout();

        if (rememberedAccountsCount > 0) {
          requireAccountSelection();
        } else {
          clearAccountSelectionRequirement();
        }

        router.replace(
          rememberedAccountsCount > 0
            ? "/account/switch?required=1"
            : "/login",
        );
        router.refresh();
        return;
      }

      if (rememberedAccountsCount === 0) {
        clearAccountSelectionRequirement();
        router.replace("/login");
        router.refresh();
        return;
      }

      setAccounts(remainingAccounts);
      setRemovingId(null);
    } catch {
      setError("Akun gagal dikeluarkan dari perangkat. Coba lagi.");
      setRemoveTarget(null);
      setRemovingId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6]">
        <Loader2 size={28} className="animate-spin text-[#C85A28]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-10 text-[#181715] sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-2xl">
        {!selectionRequired && (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-[#75726B] transition hover:text-[#181715]"
          >
            <ArrowLeft size={15} /> Kembali ke halaman sebelumnya
          </button>
        )}

        <header className={selectionRequired ? "" : "mt-8"}>
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
            <div
              key={account.id}
              className={`flex w-full items-center gap-2 px-3 py-3 transition hover:bg-white sm:px-4 ${index > 0 ? "border-t border-[#DCD8CF]" : ""}`}
            >
              <button
                type="button"
                disabled={account.current || switchingId !== null || removingId !== null}
                onClick={() => void switchAccount(account)}
                className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl px-2 py-2 text-left disabled:cursor-default disabled:opacity-100"
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

              <button
                type="button"
                disabled={switchingId !== null || removingId !== null}
                onClick={() => setRemoveTarget(account)}
                aria-label={`Keluarkan akun ${account.name} dari perangkat`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#96928A] transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {removingId === account.id ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )}
              </button>
            </div>
          ))}
        </section>

        {error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}

        {accountLimitReached ? (
          <div className="mt-5 rounded-2xl border border-[#D8D4CB] bg-[#EFECE4] px-5 py-4 text-center">
            <p className="text-sm font-bold">Batas Kelola Akun sudah penuh</p>
            <p className="mt-1 text-xs leading-5 text-[#75726B]">
              Perangkat ini hanya dapat menyimpan satu akun Pembeli dan satu
              akun Penjual. Keluarkan salah satu akun untuk menggantinya.
            </p>
          </div>
        ) : (
          <Link
            href="/login?add_account=1&redirect=/account/switch"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#181715] px-5 py-3.5 text-sm font-bold transition hover:bg-[#181715] hover:text-white"
          >
            <Plus size={17} /> Tambahkan akun {missingRole}
          </Link>
        )}

        <p className="mt-4 text-center text-[11px] leading-5 text-[#96928A]">
          Maksimal dua akun: satu Pembeli dan satu Penjual. Akun baru perlu
          diverifikasi satu kali dan dipercaya selama 30 hari pada browser ini.
        </p>
      </div>

      {removeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-account-title"
        >
          <div className="w-full max-w-md rounded-[1.75rem] bg-[#F5EFE6] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C85A28]">
                  Kelola akun di perangkat
                </p>
                <h2 id="remove-account-title" className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                  Keluarkan {removeTarget.name}?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                aria-label="Tutup konfirmasi"
                className="rounded-full p-2 text-[#75726B] transition hover:bg-[#E0DDD5]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#75726B]">
              {removeTarget.current
                ? "Akun ini akan logout dan dihapus dari daftar akun pada browser ini."
                : "Akun ini hanya dihapus dari daftar akun pada browser ini."}{" "}
              Akun dan data AlidPay tetap aman dan tidak dihapus.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                className="rounded-full border border-[#D8D4CB] px-5 py-3 text-sm font-bold transition hover:bg-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void removeAccount(removeTarget)}
                className="flex items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800"
              >
                <Trash2 size={16} /> Keluarkan dari perangkat
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AccountSwitcherPage() {
  return (
    <Suspense
      fallback={(
        <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6]">
          <Loader2 size={28} className="animate-spin text-[#C85A28]" />
        </main>
      )}
    >
      <AccountSwitcherContent />
    </Suspense>
  );
}
