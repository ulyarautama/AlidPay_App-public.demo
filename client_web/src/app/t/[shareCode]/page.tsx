"use client";

import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/axios";
import {
  AlidPayTransaction,
  apiErrorMessage,
  formatRupiah,
} from "../../lib/transactions";

export default function SharedTransactionPage() {
  const params = useParams<{ shareCode: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [transaction, setTransaction] = useState<AlidPayTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransaction = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/shared-transactions/${params.shareCode}`);
      setTransaction(response.data.transaction);
    } catch (caught) {
      setError(apiErrorMessage(caught, "Tautan transaksi tidak ditemukan."));
    } finally {
      setLoading(false);
    }
  }, [params.shareCode]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadTransaction(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadTransaction]);

  async function claimTransaction() {
    if (!user) {
      router.push(`/login?redirect=/t/${params.shareCode}`);
      return;
    }

    try {
      setClaiming(true);
      setError(null);
      const response = await api.post(
        `/api/shared-transactions/${params.shareCode}/claim`,
      );
      router.replace(`/transaction/${response.data.transaction.id}`);
    } catch (caught) {
      setError(apiErrorMessage(caught, "Transaksi gagal dihubungkan ke akunmu."));
    } finally {
      setClaiming(false);
    }
  }

  if (loading || authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5EFE6]">
        <Loader2 className="animate-spin text-[#A06A1B]" size={32} />
      </main>
    );
  }

  if (!transaction) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5EFE6] px-6">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-3xl text-[#211F1B]">Tautan tidak tersedia</h1>
          <p className="mt-3 text-sm text-[#706B62]">{error}</p>
        </div>
      </main>
    );
  }

  const creator = transaction.buyer ?? transaction.seller;
  const alreadyClaimed = transaction.status !== "draft_link";

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 py-20 text-[#211F1B] sm:px-8">
      <section className="mx-auto max-w-xl overflow-hidden rounded-[28px] border border-[#D8CFC1] bg-[#FFFDF8] shadow-[0_24px_80px_rgba(75,58,32,.12)]">
        <div className="border-b border-[#E2DACF] bg-[#28241E] px-7 py-8 text-[#FFF9EE] sm:px-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#D4A34E]">
            <ShieldCheck size={17} /> Undangan transaksi aman
          </div>
          <h1 className="mt-5 font-serif text-3xl sm:text-4xl">Periksa sebelum menerima</h1>
          <p className="mt-3 text-sm leading-6 text-[#D7D0C6]">
            Dana ditahan AlidPay sampai pembeli mengonfirmasi barang diterima.
          </p>
        </div>

        <div className="space-y-7 px-7 py-8 sm:px-10">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#8A8277]">Barang atau jasa</p>
            <h2 className="mt-2 text-xl font-bold">{transaction.judul_barang}</h2>
          </div>

          <div className="grid gap-4 rounded-2xl border border-[#E3DACE] bg-[#F8F2E8] p-5 sm:grid-cols-2">
            <Info label="Nilai transaksi" value={formatRupiah(transaction.nominal)} />
            <Info label="Dibuat oleh" value={creator?.name ?? "Pengguna AlidPay"} icon />
          </div>

          {error && (
            <p className="rounded-xl border border-[#DFA89F] bg-[#FFF1EE] px-4 py-3 text-sm text-[#9B3427]">{error}</p>
          )}

          {alreadyClaimed ? (
            <div className="flex gap-3 rounded-xl bg-[#EDF6EA] p-4 text-sm text-[#356337]">
              <CheckCircle2 className="shrink-0" size={20} />
              Tautan ini sudah digunakan. Buka daftar transaksi jika transaksi terhubung ke akunmu.
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void claimTransaction()}
              disabled={claiming}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#A06A1B] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#865715] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {claiming ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
              {user ? "Hubungkan ke akun saya" : "Login untuk menerima transaksi"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value, icon = false }: { label: string; value: string; icon?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#8A8277]">{label}</p>
      <p className="mt-2 flex items-center gap-2 text-sm font-bold">
        {icon && <UserRound size={15} className="text-[#A06A1B]" />}
        {value}
      </p>
    </div>
  );
}
