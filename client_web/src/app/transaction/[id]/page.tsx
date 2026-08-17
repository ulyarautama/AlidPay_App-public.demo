"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../lib/axios"

interface TransactionUser {
  id: string;
  name: string;
  public_id: string;
  role: "buyer" | "seller";
}

interface Transaction {
  id: string;
  buyer_id: string | null;
  seller_id: string | null;
  created_by: string;
  judul_barang: string;
  nominal: number;
  fee: number;
  kontak_penjual: string | null;
  kontak_pembeli: string | null;
  share_code: string | null;
  status: string;
  type: "normal" | "tautan";
  is_seen_by_buyer?: boolean;
  is_seen_by_seller?: boolean;
  created_at: string;
  updated_at: string;

  buyer?: TransactionUser | null;
  seller?: TransactionUser | null;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();

  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const [loading, setLoading] = useState(true);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  async function getTransaction() {
    try {
      setLoading(true);

      const res = await api.get(`/api/transaction/${transactionId}`);

      setTransaction(res.data.transaction);
    } catch (error) {
      console.error("Gagal mengambil detail transaksi:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (transactionId) {
      getTransaction();
    }
  }, [transactionId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-28 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-10 text-center">
            <p className="text-sm font-semibold text-[#75726B]">
              Memuat detail transaksi...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!transaction) {
    return (
      <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-28 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-10 text-center">
            <Package size={38} className="mx-auto text-[#96928A]" />

            <p className="mt-4 text-lg font-bold">Transaksi tidak ditemukan</p>

            <button
              type="button"
              onClick={() => router.back()}
              className="mt-6 rounded-full bg-[#181715] px-5 py-2.5 text-xs font-bold text-white"
            >
              Kembali
            </button>
          </div>
        </div>
      </main>
    );
  }

  const buyer = transaction.buyer;
  const seller = transaction.seller;

  const isConfirmed = transaction.status !== "menunggu_konfirmasi";

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-28 sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* BACK */}
        <button
          type="button"
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-xs font-bold text-[#75726B] transition hover:text-[#181715]"
        >
          <ArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Kembali
        </button>

        {/* HEADER */}
        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
            Transaction detail
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
                {transaction.judul_barang}
              </h1>

              <p className="mt-3 text-sm text-[#75726B]">
                ID transaksi{" "}
                <span className="font-mono font-semibold">
                  {transaction.share_code ?? transaction.id}
                </span>
              </p>
            </div>

            {/* STATUS */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D8D4CB] bg-[#EFECE4] px-3 py-2 text-xs font-bold text-[#75726B]">
              <span
                className={`h-2 w-2 rounded-full ${
                  isConfirmed ? "bg-[#10B981]" : "bg-[#C85A28]"
                }`}
              />

              {isConfirmed ? "Siap diproses" : "Menunggu konfirmasi"}
            </div>
          </div>
        </div>

        {/* SUCCESS / STATUS */}
        {isConfirmed && (
          <div className="mt-8 rounded-[1.5rem] border border-[#DCD8CF] bg-[#EFECE4] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5EFE6]">
                <CheckCircle2 size={22} className="text-[#10B981]" />
              </div>

              <div>
                <p className="font-bold text-[#181715]">
                  Kedua pihak sudah menyetujui transaksi
                </p>

                <p className="mt-1 text-sm leading-6 text-[#75726B]">
                  Transaksi sudah siap dilanjutkan ke proses berikutnya.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTION VALUE */}
        <section className="mt-6 rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5EFE6]">
              <Wallet size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#96928A]">
                Nilai transaksi
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight">
                {formatRupiah(Number(transaction.nominal))}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-[#DCD8CF] pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#75726B]">Nilai transaksi</span>

              <span className="font-semibold">
                {formatRupiah(Number(transaction.nominal))}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#75726B]">Fee</span>

              <span className="font-semibold">
                {formatRupiah(Number(transaction.fee))}
              </span>
            </div>

            <div className="mt-4 border-t border-[#DCD8CF] pt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold">Total</span>

                <span className="text-lg font-bold">
                  {formatRupiah(
                    Number(transaction.nominal) + Number(transaction.fee),
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PARTIES */}
        <section className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* BUYER */}
          <div className="rounded-[1.5rem] border border-[#DCD8CF] bg-[#EFECE4] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#96928A]">
              Pembeli
            </p>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#181715] text-white">
                <User size={20} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-bold">{buyer?.name ?? "Pembeli"}</p>

                {buyer?.public_id && (
                  <p className="mt-1 text-xs text-[#96928A]">
                    {buyer.public_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SELLER */}
          <div className="rounded-[1.5rem] border border-[#DCD8CF] bg-[#EFECE4] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#96928A]">
              Penjual
            </p>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#181715] text-white">
                <User size={20} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-bold">
                  {seller?.name ?? "Penjual"}
                </p>

                {seller?.public_id && (
                  <p className="mt-1 text-xs text-[#96928A]">
                    {seller.public_id}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="mt-4 rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <Clock3 size={18} />

            <h2 className="font-bold">Status transaksi</h2>
          </div>

          <div className="mt-6 space-y-5">
            {/* CREATED */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-[#10B981]" />

                <div className="mt-1 h-full w-px bg-[#D8D4CB]" />
              </div>

              <div className="pb-3">
                <p className="text-sm font-bold">Transaksi dibuat</p>

                <p className="mt-1 text-xs text-[#96928A]">
                  Transaksi berhasil dibuat dan menunggu konfirmasi.
                </p>
              </div>
            </div>

            {/* CONFIRMED */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isConfirmed ? "bg-[#10B981]" : "bg-[#D8D4CB]"
                  }`}
                />

                <div className="mt-1 h-full w-px bg-[#D8D4CB]" />
              </div>

              <div className="pb-3">
                <p className="text-sm font-bold">Kedua pihak menyetujui</p>

                <p className="mt-1 text-xs text-[#96928A]">
                  {isConfirmed
                    ? "Konfirmasi berhasil."
                    : "Menunggu kedua pihak menyetujui transaksi."}
                </p>
              </div>
            </div>

            {/* PAYMENT */}
            <div className="flex gap-4">
              <div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    transaction.status === "dibayar"
                      ? "bg-[#10B981]"
                      : "bg-[#D8D4CB]"
                  }`}
                />
              </div>

              <div>
                <p className="text-sm font-bold">Pembayaran</p>

                <p className="mt-1 text-xs text-[#96928A]">
                  Dana akan diproses melalui AlidPay.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ACTION */}
        {isConfirmed && transaction.status !== "dibayar" && (
          <section className="mt-4">
            <button
              type="button"
              onClick={() =>
                router.push(`/transaction/${transaction.id}/payment`)
              }
              className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#181715] px-6 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2a2926]"
            >
              Lanjut ke pembayaran
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <p className="mt-3 text-center text-xs text-[#96928A]">
              Dana akan diproses melalui sistem AlidPay.
            </p>
          </section>
        )}

        {/* PROTECTION */}
        <div className="mt-5 flex items-center gap-2 rounded-[1.25rem] border border-[#DCD8CF] bg-[#F5EFE6] px-5 py-4 text-xs font-semibold text-[#75726B]">
          <ShieldCheck size={16} className="shrink-0 text-[#10B981]" />
          Transaksi dilindungi oleh sistem keamanan AlidPay.
        </div>
      </div>
    </main>
  );
}
