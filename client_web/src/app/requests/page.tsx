"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Package,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { api } from "../lib/axios";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { apiErrorMessage, rejectTransaction } from "../lib/transactions";

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
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>("keluar");
  const { user } = useAuth();

  const userId = user?.id ?? null;

  async function getRequests() {
    try {
      setLoading(true);

      const res = await api.get("/api/transaction", {
        params: { per_page: 100 },
      });

      setRequestsTransaction(res.data.data ?? []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => void getRequests(), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  /*
   * Transaksi yang sudah memiliki kedua pihak dan menunggu konfirmasi.
   */
  const pendingConfirmation = useMemo(() => {
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

    return requestsTransaction.filter(
      (transaction) =>
        transaction.created_by === userId &&
        (transaction.status === "menunggu_konfirmasi" ||
          (transaction.type === "tautan" &&
            transaction.status === "draft_link")),
    );
  }, [requestsTransaction, userId]);

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

    return pendingConfirmation.filter(
      (transaction) => transaction.created_by !== userId,
    );
  }, [pendingConfirmation, userId]);

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
      setProcessingId(transaction.id);
      setError(null);
      await api.post(`/api/transaction/${transaction.id}/konfirmasi`);

      router.push(`/transaction/${transaction.id}`);
    } catch (error) {
      setError(apiErrorMessage(error, "Gagal mengonfirmasi transaksi."));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(transaction: Transaction) {
    if (!window.confirm(`Yakin menolak transaksi “${transaction.judul_barang}”?`)) return;

    try {
      setProcessingId(transaction.id);
      setError(null);
      await rejectTransaction(transaction.id);
      await getRequests();
    } catch (caught) {
      setError(apiErrorMessage(caught, "Gagal menolak transaksi."));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleCopyLink(transaction: Transaction) {
    if (!transaction.share_code) {
      setError("Tautan transaksi belum tersedia.");
      return;
    }

    try {
      const shareUrl = `${window.location.origin}/alidtransaction/${encodeURIComponent(transaction.share_code)}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(transaction.id);
      setError(null);

      window.setTimeout(() => {
        setCopiedId((current) =>
          current === transaction.id ? null : current,
        );
      }, 2_000);
    } catch {
      setError("Tautan belum berhasil disalin. Silakan coba lagi.");
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
    <main className="min-h-screen bg-[#F5EFE6] text-[#181715]">
      {/* BACK HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#E0DDD5] bg-[#F5EFE6]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center px-5 sm:px-8">
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="group flex items-center gap-2 text-sm font-semibold transition hover:opacity-60"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />

            <span>Kembali</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8">
        {/* HEADER */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
            Permintaan transaksi
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
              Transaksi keluar
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
              Transaksi masuk
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
        </div>

        {/* REQUEST LIST */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
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
                  ? "Transaksi normal dan transaksi tautan yang kamu buat akan muncul di sini."
                  : "Transaksi dari lawan yang membutuhkan konfirmasi kamu akan muncul di sini."}
              </p>
            </div>
          ) : (
            activeTransactions.map((transaction) => {
              const isDraftLink =
                transaction.type === "tautan" &&
                transaction.status === "draft_link";

              /*
               * Apakah user saat ini adalah buyer?
               */
              const isBuyer = transaction.buyer_id === userId;
              const counterpartRole = isBuyer ? "Penjual" : "Pembeli";

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
              const showActions =
                !isDraftLink && transaction.created_by !== userId;

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
                        {isDraftLink
                          ? "Menunggu pihak kedua membuka tautan"
                          : showActions
                          ? "Menunggu konfirmasi kamu"
                          : `Menunggu konfirmasi ${counterpartRole}`}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-[#96928A]">
                      {transaction.share_code ?? transaction.id}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 sm:p-6">
                    {/* ROLE */}
                    <div className="mb-5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-[#D8D4CB] bg-[#F5EFE6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#75726B]">
                        Kamu sebagai {isBuyer ? "Pembeli" : "Penjual"}
                      </span>
                      {transaction.type === "tautan" && (
                        <span className="inline-flex items-center rounded-full bg-[#C85A28]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#C85A28]">
                          Transaksi tautan
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      {/* COUNTERPART */}
                      <div className="flex flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#181715] text-white">
                          <User size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#96928A]">
                            {isDraftLink
                              ? `Calon ${counterpartRole}`
                              : showActions
                                ? "Dari"
                                : counterpartRole}
                          </p>

                          <p className="mt-1 truncate font-bold">
                            {isDraftLink
                              ? "Belum bergabung"
                              : counterpart?.name ?? "Pengguna"}
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
                          Nilai transaksi
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

                      {isDraftLink ? (
                        <div className="flex flex-col gap-2 min-[420px]:flex-row">
                          <button
                            type="button"
                            onClick={() => void handleCopyLink(transaction)}
                            className="flex items-center justify-center gap-2 rounded-full border border-[#D8D4CB] px-4 py-2.5 text-xs font-bold text-[#75726B] transition hover:bg-[#F5EFE6] hover:text-[#181715]"
                          >
                            {copiedId === transaction.id ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                            {copiedId === transaction.id
                              ? "Tautan disalin"
                              : "Salin tautan"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/transaction/${transaction.id}`)
                            }
                            className="group flex items-center justify-center gap-2 rounded-full bg-[#181715] px-5 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2a2926]"
                          >
                            Lihat detail
                            <ArrowRight
                              size={14}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </button>
                        </div>
                      ) : showActions ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={processingId === transaction.id}
                            onClick={() => void handleReject(transaction)}
                            className="flex items-center justify-center gap-2 rounded-full border border-[#D8D4CB] px-4 py-2.5 text-xs font-bold text-[#75726B] transition hover:bg-[#F5EFE6] hover:text-[#181715]"
                          >
                            <X size={14} />
                            Tolak
                          </button>

                          <button
                            type="button"
                            disabled={processingId === transaction.id}
                            onClick={() => handleConfirm(transaction)}
                            className="group flex items-center justify-center gap-2 rounded-full bg-[#181715] px-5 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2a2926]"
                          >
                            {processingId === transaction.id
                              ? "Memproses..."
                              : "Konfirmasi"}
                            <ArrowRight
                              size={14}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-full bg-[#F5EFE6] px-4 py-2.5 text-xs font-semibold text-[#75726B]">
                          Menunggu {counterpartRole}{" "}
                          {counterpart?.name ?? "Pengguna"} konfirmasi
                        </div>
                      )}
                    </div>
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
