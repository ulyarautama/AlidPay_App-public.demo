"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { api } from "../lib/axios";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

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

type TabType = "keluar" | "masuk";

export default function RequestsPage() {
  const [requestsTransaction, setRequestsTransaction] = useState<Transaction[]>(
    [],
  );

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>("keluar");
  const { user } = useAuth();

  const userId = user?.id ?? null;

  async function getRequests() {
    try {
      setLoading(true);

      const res = await api.get("/api/transaction");

      console.log("TRANSACTIONS:", res.data);

      setRequestsTransaction(res.data.data ?? []);
    } catch (err) {
      console.error("Gagal mengambil transaction requests:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getRequests();
  }, []);

  /*
   * Semua transaksi yang masih menunggu konfirmasi.
   */
  const allPending = useMemo(() => {
    return requestsTransaction.filter(
      (transaction) => transaction.status === "menunggu_konfirmasi",
    );
  }, [requestsTransaction]);

  /*
   * Transaksi Keluar:
   *
   * User yang sedang login adalah pembuat transaksi.
   *
   * Sama seperti Flutter:
   *
   * createdBy == userId
   */
  const trxKeluar = useMemo(() => {
    if (!userId) return [];

    return allPending.filter(
      (transaction) => transaction.created_by === userId,
    );
  }, [allPending, userId]);

  /*
   * Transaksi Masuk:
   *
   * Lawan yang membuat transaksi.
   *
   * Sama seperti Flutter:
   *
   * createdBy != userId
   */
  const trxMasuk = useMemo(() => {
    if (!userId) return [];

    return allPending.filter(
      (transaction) => transaction.created_by !== userId,
    );
  }, [allPending, userId]);

  /*
   * List yang sedang aktif.
   */
  const activeTransactions = activeTab === "keluar" ? trxKeluar : trxMasuk;

  /*
   * Total nominal transaksi pada tab aktif.
   */
  const totalValue = useMemo(() => {
    return activeTransactions.reduce(
      (total, transaction) => total + Number(transaction.nominal),
      0,
    );
  }, [activeTransactions]);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  async function handleConfirm(transaction: Transaction) {
    try {
      await api.post(`/api/transaction/${transaction.id}/konfirmasi`);

      router.push(`/transaction/${transaction.id}`);
    } catch (error) {
      console.error("Gagal mengonfirmasi transaksi:", error);
    }
  }

  function formatTime(date: string) {
    const transactionDate = new Date(date);
    const now = new Date();

    const diff = Math.floor((now.getTime() - transactionDate.getTime()) / 1000);

    if (diff < 60) {
      return `${diff} detik lalu`;
    }

    const minutes = Math.floor(diff / 60);

    if (minutes < 60) {
      return `${minutes} menit lalu`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} jam lalu`;
    }

    const days = Math.floor(hours / 24);

    return `${days} hari lalu`;
  }

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-28 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
            Transaction inbox
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
            Menunggu Konfirmasi
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#75726B]">
            Kelola transaksi yang menunggu konfirmasi. Periksa detailnya sebelum
            menerima atau menolak transaksi.
          </p>
        </div>

        {/* TABS */}
        <div className="mt-8 border-b border-[#DCD8CF]">
          <div className="flex gap-7">
            <button
              type="button"
              onClick={() => setActiveTab("keluar")}
              className={`relative pb-3 text-sm font-bold transition ${
                activeTab === "keluar"
                  ? "text-[#C85A28]"
                  : "text-[#96928A] hover:text-[#181715]"
              }`}
            >
              Transaksi Keluar
              {trxKeluar.length > 0 && (
                <span className="ml-2 rounded-full bg-[#EFECE4] px-2 py-0.5 text-[10px] text-[#75726B]">
                  {trxKeluar.length}
                </span>
              )}
              {activeTab === "keluar" && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#C85A28]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("masuk")}
              className={`relative pb-3 text-sm font-bold transition ${
                activeTab === "masuk"
                  ? "text-[#C85A28]"
                  : "text-[#96928A] hover:text-[#181715]"
              }`}
            >
              Transaksi Masuk
              {trxMasuk.length > 0 && (
                <span className="ml-2 rounded-full bg-[#EFECE4] px-2 py-0.5 text-[10px] text-[#75726B]">
                  {trxMasuk.length}
                </span>
              )}
              {activeTab === "masuk" && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#C85A28]" />
              )}
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E0DDD5] bg-[#EFECE4] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#96928A]">
              Menunggu respons
            </p>

            <p className="mt-3 text-3xl font-bold">
              {activeTransactions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E0DDD5] bg-[#EFECE4] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#96928A]">
              Total nilai
            </p>

            <p className="mt-3 text-3xl font-bold">
              {formatRupiah(totalValue)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E0DDD5] bg-[#EFECE4] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#96928A]">
              Response time
            </p>

            <p className="mt-3 text-3xl font-bold">&lt; 1 jam</p>
          </div>
        </div>

        {/* REQUEST LIST */}
        <section className="mt-8 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-[#E0DDD5] bg-[#EFECE4] p-8 text-center">
              <p className="text-sm font-semibold text-[#75726B]">
                Memuat transaksi...
              </p>
            </div>
          ) : activeTransactions.length === 0 ? (
            <div className="rounded-2xl border border-[#E0DDD5] bg-[#EFECE4] p-10 text-center">
              <CheckCircle2 size={38} className="mx-auto text-[#96928A]" />

              <p className="mt-4 text-lg font-bold">
                {activeTab === "keluar"
                  ? "Tidak ada transaksi keluar"
                  : "Tidak ada transaksi masuk"}
              </p>

              <p className="mt-2 text-sm text-[#75726B]">
                {activeTab === "keluar"
                  ? "Transaksi yang kamu buat dan menunggu konfirmasi lawan akan muncul di sini."
                  : "Transaksi dari lawan yang membutuhkan konfirmasi kamu akan muncul di sini."}
              </p>
            </div>
          ) : (
            activeTransactions.map((transaction) => {
              /*
               * Apakah user saat ini adalah buyer?
               */
              const isBuyer = transaction.buyer_id === userId;

              /*
               * Lawan transaksi.
               */
              const counterpart = isBuyer
                ? transaction.seller
                : transaction.buyer;

              /*
               * Apakah transaksi masuk?
               *
               * Kalau transaksi masuk berarti lawan yang membuat.
               */
              const showActions = transaction.created_by !== userId;

              return (
                <article
                  key={transaction.id}
                  className="overflow-hidden rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4]"
                >
                  {/* TOP */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCD8CF] px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#C85A28]" />

                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#C85A28]">
                        {showActions
                          ? "Menunggu konfirmasi kamu"
                          : "Menunggu konfirmasi lawan"}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-[#96928A]">
                      {transaction.share_code ?? transaction.id}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 sm:p-6">
                    {/* ROLE */}
                    <div className="mb-5 inline-flex items-center rounded-full border border-[#D8D4CB] bg-[#F5EFE6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#75726B]">
                      Kamu sebagai {isBuyer ? "Pembeli" : "Penjual"}
                    </div>

                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      {/* COUNTERPART */}
                      <div className="flex flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#181715] text-white">
                          <User size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#96928A]">
                            {showActions ? "Dari" : "Lawan transaksi"}
                          </p>

                          <p className="mt-1 truncate font-bold">
                            {counterpart?.name ?? "Pengguna"}
                          </p>

                          {counterpart?.public_id && (
                            <p className="mt-0.5 truncate text-xs text-[#96928A]">
                              {counterpart.public_id}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* PRODUCT */}
                      <div className="flex flex-[1.5] items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#181715]">
                          <Package size={22} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold">
                            {transaction.judul_barang}
                          </p>

                          <p className="mt-1 text-xs text-[#75726B]">1 item</p>
                        </div>
                      </div>

                      {/* PRICE */}
                      <div className="md:text-right">
                        <p className="text-xs font-semibold text-[#96928A]">
                          Transaction value
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {formatRupiah(Number(transaction.nominal))}
                        </p>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-6 flex flex-col gap-4 border-t border-[#DCD8CF] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#96928A]">
                        <Clock3 size={14} />

                        {formatTime(transaction.created_at)}
                      </div>

                      {showActions ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="flex items-center justify-center gap-2 rounded-full border border-[#D8D4CB] px-4 py-2.5 text-xs font-bold text-[#75726B] transition hover:bg-[#F5EFE6] hover:text-[#181715]"
                          >
                            <X size={14} />
                            Tolak
                          </button>

                          <button
                            type="button"
                            onClick={() => handleConfirm(transaction)}
                            className="group flex items-center justify-center gap-2 rounded-full bg-[#181715] px-5 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2a2926]"
                          >
                            Konfirmasi
                            <ArrowRight
                              size={14}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-full bg-[#F5EFE6] px-4 py-2.5 text-xs font-semibold text-[#75726B]">
                          Menunggu {counterpart?.name ?? "lawan"} konfirmasi
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PROTECTION */}
                  <div className="flex items-center gap-2 border-t border-[#DCD8CF] bg-[#F5EFE6] px-5 py-3 text-[11px] font-semibold text-[#75726B] sm:px-6">
                    <ShieldCheck size={14} className="text-[#10B981]" />
                    Kamu tidak perlu membayar apa pun untuk menerima request.
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
