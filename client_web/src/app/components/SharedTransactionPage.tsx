"use client";

import {
  ArrowRight,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/axios";
import {
  apiErrorMessage,
  formatRupiah,
} from "../lib/transactions";

type SharedTransactionPreview = {
  judul_barang: string;
  nominal: number;
  fee: number;
  share_code: string;
  status: "draft_link";
  type: "tautan";
  expires_at: string;
  creator_name: string;
  required_role: "pembeli" | "penjual";
};

export default function SharedTransactionPage() {
  const params = useParams<{ shareCode: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [transaction, setTransaction] =
    useState<SharedTransactionPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareCode = params.shareCode.toUpperCase();
  const canonicalPath = `/alidtransaction/${encodeURIComponent(shareCode)}`;

  const loadTransaction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/shared-transactions/${shareCode}`);
      setTransaction(response.data.transaction);
    } catch (caught) {
      const status =
        typeof caught === "object" && caught !== null && "response" in caught
          ? (caught as { response?: { status?: number } }).response?.status
          : undefined;
      setError(
        status === 404
          ? "Kode transaksi tidak ditemukan atau tautannya sudah tidak berlaku."
          : apiErrorMessage(caught, "Tautan transaksi tidak dapat dimuat."),
      );
    } finally {
      setLoading(false);
    }
  }, [shareCode]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadTransaction(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadTransaction]);

  async function continueTransaction() {
    if (!transaction) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(canonicalPath)}`);
      return;
    }

    try {
      setClaiming(true);
      setError(null);
      const response = await api.post(
        `/api/shared-transactions/${shareCode}/claim`,
      );
      router.replace(`/transaction/${response.data.transaction.id}`);
    } catch (caught) {
      setError(apiErrorMessage(caught, "Transaksi gagal dihubungkan ke akunmu."));
    } finally {
      setClaiming(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5EFE6]">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-[#C85A28]" size={30} />
          <p className="mt-4 text-sm font-semibold text-[#75726B]">
            Memuat detail transaksi...
          </p>
        </div>
      </main>
    );
  }

  if (!transaction) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5EFE6] px-6">
        <div className="max-w-md text-center">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#C85A28]">
            AlidPay
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-.04em] text-[#211F1B]">
            Tautan tidak tersedia
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#706B62]">{error}</p>
          <Link
            href="/"
            className="mt-7 inline-flex rounded-full bg-[#181715] px-6 py-3 text-sm font-bold text-white"
          >
            Kembali ke AlidPay
          </Link>
        </div>
      </main>
    );
  }

  const isBuyerInvitation = transaction.required_role === "pembeli";

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 py-10 text-[#211F1B] sm:px-8 sm:py-16">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black tracking-[-.05em]">
            Alid<span className="text-[#C85A28]">Pay</span>
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#60735B]">
            <ShieldCheck size={16} /> Tautan resmi AlidPay
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-[#D8CFC1] bg-[#FFFDF8] shadow-[0_24px_80px_rgba(75,58,32,.12)]">
          <div className="border-b border-[#E2DACF] bg-[#28241E] px-7 py-9 text-[#FFF9EE] sm:px-10 sm:py-11">
            <p className="font-mono text-[11px] font-bold tracking-[.13em] text-[#D4A34E]">
              {transaction.share_code}
            </p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-white/45">
              Detail transaksi
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-.05em] sm:text-5xl">
              {transaction.judul_barang}
            </h1>
            <p className="mt-5 text-3xl font-black tracking-[-.04em] text-[#F2B85A] sm:text-4xl">
              {formatRupiah(Number(transaction.nominal))}
            </p>
          </div>

          <div className="space-y-7 px-7 py-8 sm:px-10 sm:py-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info
                label="Dibuat oleh"
                value={transaction.creator_name}
                icon={<UserRound size={17} />}
              />
              <Info
                label="Penerima tautan"
                value={isBuyerInvitation ? "Pembeli" : "Penjual"}
                subvalue="Akan terhubung setelah login"
                icon={<LockKeyhole size={17} />}
              />
            </div>

            <div className="rounded-2xl border border-[#E3DACE] bg-[#F8F2E8] p-5 sm:p-6">
              <PriceRow label="Nilai transaksi" value={formatRupiah(Number(transaction.nominal))} />
              <PriceRow
                label="Biaya layanan"
                value={`${formatRupiah(Number(transaction.fee))} dari bagian penjual`}
                muted
              />
              <div className="my-4 h-px bg-[#DCD2C5]" />
              <PriceRow
                label={isBuyerInvitation ? "Total dibayar pembeli" : "Nilai transaksi"}
                value={formatRupiah(Number(transaction.nominal))}
                strong
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Login ke akun AlidPay",
                "Konfirmasi detail transaksi",
                isBuyerInvitation ? "Lanjut ke pembayaran" : "Tunggu pembayaran pembeli",
              ].map((item, index) => (
                <div key={item} className="rounded-xl border border-[#E3DACE] px-4 py-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#181715] text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-3 text-xs font-bold leading-5">{item}</p>
                </div>
              ))}
            </div>

            {error && (
              <p className="rounded-xl border border-[#DFA89F] bg-[#FFF1EE] px-4 py-3 text-sm text-[#9B3427]">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void continueTransaction()}
              disabled={claiming || authLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C85A28] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#AD4820] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {claiming || authLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <ArrowRight size={18} />
              )}
              {authLoading
                ? "Memeriksa akun..."
                : user
                  ? isBuyerInvitation
                    ? "Terima & lanjutkan pembayaran"
                    : "Terima transaksi"
                  : isBuyerInvitation
                    ? "Masuk untuk lanjut pembayaran"
                    : "Masuk untuk menerima transaksi"}
            </button>

            {!user && !authLoading && (
              <p className="text-center text-xs leading-5 text-[#817B72]">
                Belum punya akun?{" "}
                <Link
                  href={`/register?redirect=${encodeURIComponent(canonicalPath)}`}
                  className="font-extrabold text-[#C85A28] hover:underline"
                >
                  Daftar lalu lanjutkan transaksi
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({
  label,
  value,
  subvalue,
  icon,
}: {
  label: string;
  value: string;
  subvalue?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E3DACE] bg-[#FFFDF8] p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#8A8277]">
        {label}
      </p>
      <p className="mt-3 flex items-center gap-2 text-sm font-bold">
        <span className="text-[#A06A1B]">{icon}</span>
        {value}
      </p>
      {subvalue && <p className="mt-1 pl-6 text-xs text-[#8A8277]">{subvalue}</p>}
    </div>
  );
}

function PriceRow({
  label,
  value,
  muted = false,
  strong = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-5 py-1 ${muted ? "text-[#817B72]" : ""}`}>
      <span className={strong ? "text-sm font-extrabold" : "text-sm"}>{label}</span>
      <span className={strong ? "text-lg font-black text-[#C85A28]" : "text-right text-sm font-bold"}>
        {value}
      </span>
    </div>
  );
}
