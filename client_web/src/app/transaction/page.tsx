"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";

interface TransactionUser {
  id: string;
  name: string;
  public_id: string;
  role: "pembeli" | "penjual";
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

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status: string) {
  const statuses: Record<string, string> = {
    draft_link: "Draft Tautan",
    menunggu_konfirmasi: "Menunggu Konfirmasi",
    menunggu_pembayaran: "Menunggu Pembayaran",
    dana_ditahan: "Dana Ditahan",
    barang_dikirim: "Barang Dikirim",
    dana_dicairkan: "Dana Dicairkan",
    sengketa: "Sedang Ditinjau",
    dibatalkan: "Dibatalkan",
  };

  return statuses[status] ?? status;
}

function getStatusStyle(status: string) {
  switch (status) {
    case "dana_dicairkan":
      return {
        dot: "bg-[#10B981]",
        text: "text-[#10B981]",
        bg: "bg-[#E7F7F0]",
      };

    case "dana_ditahan":
    case "barang_dikirim":
      return {
        dot: "bg-[#10B981]",
        text: "text-[#087A55]",
        bg: "bg-[#E7F7F0]",
      };

    case "dibatalkan":
    case "sengketa":
      return {
        dot: "bg-[#EF4444]",
        text: "text-[#DC2626]",
        bg: "bg-[#FDECEC]",
      };

    case "menunggu_konfirmasi":
    case "menunggu_pembayaran":
    default:
      return {
        dot: "bg-[#C85A28]",
        text: "text-[#C85A28]",
        bg: "bg-[#FBEDE6]",
      };
  }
}

function formatTime(date: string) {
  const transactionDate = new Date(date);
  const now = new Date();

  const diff = Math.floor((now.getTime() - transactionDate.getTime()) / 1000);

  if (diff < 60) {
    return `${Math.max(diff, 0)} detik lalu`;
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

  if (days < 7) {
    return `${days} hari lalu`;
  }

  return transactionDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  async function getTransactions() {
    try {
      setLoading(true);

      const res = await api.get("/api/transaction");

      console.log("ALL TRANSACTIONS:", res.data);

      /*
       * Laravel paginate() biasanya mengembalikan:
       *
       * {
       *   data: [...]
       *   current_page: 1,
       *   ...
       * }
       *
       * Jadi res.data.data adalah array transaksi.
       */
      setTransactions(res.data.data ?? []);
    } catch (error) {
      console.error("Gagal mengambil semua transaksi:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => void getTransactions(), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const totalValue = useMemo(() => {
    return transactions.reduce(
      (total, transaction) => total + Number(transaction.nominal),
      0,
    );
  }, [transactions]);

  const activeCount = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        !["dana_dicairkan", "dibatalkan"].includes(transaction.status),
    ).length;
  }, [transactions]);

  function getCounterpart(transaction: Transaction) {
    if (!user?.id) {
      return null;
    }

    if (transaction.buyer_id === user.id) {
      return transaction.seller;
    }

    if (transaction.seller_id === user.id) {
      return transaction.buyer;
    }

    return null;
  }

  function getRole(transaction: Transaction) {
    if (transaction.buyer_id === user?.id) {
      return "Pembeli";
    }

    if (transaction.seller_id === user?.id) {
      return "Penjual";
    }

    return "Transaksi";
  }

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-28 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
            Transaction history
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
            Semua Transaksi
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#75726B]">
            Pantau seluruh transaksi kamu, mulai dari pembayaran sampai dana
            berhasil dicairkan.
          </p>
        </div>

        {/* SUMMARY */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E0DDD5] bg-[#EFECE4] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5EFE6]">
                <Package size={17} />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-[#96928A]">
                Total transaksi
              </p>
            </div>

            <p className="mt-4 text-3xl font-bold">{transactions.length}</p>
          </div>

          <div className="rounded-2xl border border-[#E0DDD5] bg-[#EFECE4] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5EFE6]">
                <Clock3 size={17} />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-[#96928A]">
                Sedang berjalan
              </p>
            </div>

            <p className="mt-4 text-3xl font-bold">{activeCount}</p>
          </div>

          <div className="rounded-2xl border border-[#E0DDD5] bg-[#EFECE4] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5EFE6]">
                <Wallet size={17} />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-[#96928A]">
                Total nilai
              </p>
            </div>

            <p className="mt-4 text-2xl font-bold">
              {formatRupiah(totalValue)}
            </p>
          </div>
        </div>

        {/* LIST */}
        <section className="mt-8 space-y-4">
          {loading ? (
            <div className="rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-10 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#D8D4CB] border-t-[#181715]" />

              <p className="mt-4 text-sm font-semibold text-[#75726B]">
                Memuat transaksi...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-12 text-center">
              <CheckCircle2 size={40} className="mx-auto text-[#96928A]" />

              <p className="mt-4 text-lg font-bold">Belum ada transaksi</p>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75726B]">
                Transaksi yang kamu buat atau transaksi yang melibatkan akunmu
                akan muncul di sini.
              </p>
            </div>
          ) : (
            transactions.map((transaction) => {
              const counterpart = getCounterpart(transaction);
              const role = getRole(transaction);
              const statusStyle = getStatusStyle(transaction.status);

              return (
                <article
                  key={transaction.id}
                  className="overflow-hidden rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] transition hover:-translate-y-0.5"
                >
                  {/* TOP */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCD8CF] px-5 py-4 sm:px-6">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
                      />

                      {formatStatus(transaction.status)}
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-[#96928A]">
                      {transaction.share_code ?? transaction.id}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 sm:p-6">
                    {/* ROLE */}
                    <div className="mb-5 inline-flex items-center rounded-full border border-[#D8D4CB] bg-[#F5EFE6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#75726B]">
                      Kamu sebagai {role}
                    </div>

                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      {/* COUNTERPART */}
                      <div className="flex flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#181715] text-white">
                          <User size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#96928A]">
                            Lawan transaksi
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

                          <p className="mt-1 text-xs text-[#75726B]">
                            {transaction.type === "tautan"
                              ? "Transaksi melalui tautan"
                              : "Transaksi langsung"}
                          </p>
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

                        <p className="mt-1 text-[11px] text-[#96928A]">
                          + {formatRupiah(Number(transaction.fee))} fee
                        </p>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-6 flex flex-col gap-4 border-t border-[#DCD8CF] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#96928A]">
                        <Clock3 size={14} />

                        {formatTime(transaction.created_at)}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/transaction/${transaction.id}`)
                        }
                        className="group flex items-center justify-center gap-2 rounded-full bg-[#181715] px-5 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2A2926]"
                      >
                        Lihat Detail
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </button>
                    </div>
                  </div>

                  {/* PROTECTION */}
                  <div className="flex items-center gap-2 border-t border-[#DCD8CF] bg-[#F5EFE6] px-5 py-3 text-[11px] font-semibold text-[#75726B] sm:px-6">
                    <ShieldCheck size={14} className="text-[#10B981]" />
                    Transaksi dilindungi oleh sistem keamanan AlidPay.
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
