"use client";

import { useAuth } from "@/app/context/AuthContext";
import {
  AlidPayTransaction,
  apiErrorMessage,
  canOpenChat,
  confirmTransaction,
  confirmTransactionReceived,
  fetchTransaction,
  formatRupiah,
  markTransactionShipped,
  rejectTransaction,
  transactionStatuses,
  transactionStep,
  transactionTimeline,
} from "@/app/lib/transactions";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Headphones,
  Loader2,
  MessageCircle,
  Package,
  RefreshCcw,
  ShieldCheck,
  Store,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

function TransactionDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const transactionId = params.id;
  const [transaction, setTransaction] = useState<AlidPayTransaction | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadTransaction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setTransaction(await fetchTransaction(transactionId));
    } catch (caught) {
      setError(apiErrorMessage(caught, "Gagal mengambil detail transaksi."));
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/transaction/${transactionId}`);
      return;
    }
    if (user) {
      const timeout = window.setTimeout(() => void loadTransaction(), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [authLoading, loadTransaction, router, transactionId, user]);

  async function runAction(
    key: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    try {
      setProcessing(key);
      setError(null);
      setNotice(null);
      await action();
      setNotice(successMessage);
      await loadTransaction();
    } catch (caught) {
      setError(apiErrorMessage(caught, "Aksi transaksi gagal diproses."));
    } finally {
      setProcessing(null);
    }
  }

  const role = useMemo(() => {
    if (!transaction || !user) return null;
    if (transaction.buyer_id === user.id) return "buyer" as const;
    if (transaction.seller_id === user.id) return "seller" as const;
    return null;
  }, [transaction, user]);

  if (authLoading || loading) return <TransactionLoading />;
  if (!transaction || !user || !role) {
    return <TransactionError message={error ?? "Transaksi tidak ditemukan."} />;
  }

  const status = transactionStatuses[transaction.status];
  const isCreator = transaction.created_by === user.id;
  const counterpart = role === "buyer" ? transaction.seller : transaction.buyer;
  const sellerReceives = Math.max(
    0,
    Number(transaction.nominal) - Number(transaction.fee),
  );
  const currentStep = transactionStep(transaction.status);
  const hideActionPanel =
    transaction.status === "menunggu_konfirmasi" && isCreator;

    const openChat = canOpenChat(transaction.status)
      ? () => router.push(`/transaction/${transaction.id}/chat`)
      : undefined;

  const nextTitle = nextActionTitle(
    transaction,
    role,
    isCreator,
    counterpart?.name,
  );

  const nextDescription = nextActionDescription(
    transaction,
    role,
    isCreator,
    counterpart?.name,
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F5EFE6] px-4 pb-16 pt-8 text-[#181715] sm:px-8 sm:pb-24 sm:pt-12 lg:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => router.push("/transaction")}
            className="flex items-center gap-2 text-xs font-bold text-[#75726B] hover:text-[#181715]"
          >
            <ArrowLeft size={15} />
            Semua transaksi
          </button>
        </div>

        <header className="mt-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${status.tone}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{" "}
                {status.short}
              </span>
              <span className="rounded-full border border-[#D8D4CB] px-3 py-1.5 text-[10px] font-bold text-[#75726B]">
                Kamu sebagai {role === "buyer" ? "Pembeli" : "Penjual"}
              </span>
            </div>
            <h1 className="max-w-3xl break-words text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-5xl sm:tracking-[-0.055em]">
              {transaction.judul_barang}
            </h1>
            <p className="mt-3 text-sm text-[#75726B]">{status.label}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(
                transaction.share_code ?? transaction.id,
              );
              setNotice("ID transaksi berhasil disalin.");
            }}
            title={transaction.share_code ?? transaction.id}
            className="flex w-full max-w-full items-center gap-2 rounded-xl border border-[#D8D4CB] bg-[#EFECE4] px-4 py-3 font-mono text-[11px] font-bold text-[#75726B] sm:w-fit"
          >
            <span className="min-w-0 flex-1 truncate">
              {transaction.share_code ?? transaction.id}
            </span>

            <Copy size={13} className="shrink-0" />
          </button>
        </header>

        {(error || notice) && (
          <div
            className={`mt-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
          >
            {error ?? notice}
          </div>
        )}

        <div
          className={`mt-6 grid gap-5 sm:mt-8 ${
            hideActionPanel ? "lg:grid-cols-1" : "lg:grid-cols-[1.2fr_0.8fr]"
          }`}
        >
          <div className="space-y-5">
            <section className="rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EFE6]">
                  <Wallet size={19} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#96928A]">
                    Nilai transaksi
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatRupiah(Number(transaction.nominal))}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-3 border-t border-[#DCD8CF] pt-5 text-sm">
                <PriceRow
                  label="Nominal barang/jasa"
                  value={formatRupiah(Number(transaction.nominal))}
                />
                <PriceRow
                  label="Biaya layanan AlidPay"
                  value={formatRupiah(Number(transaction.fee))}
                />
                <PriceRow
                  label="Diterima penjual"
                  value={formatRupiah(sellerReceives)}
                  strong
                />
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <PartyCard
                title="Pembeli"
                user={transaction.buyer}
                icon={<UserRound size={19} />}
                active={role === "buyer"}
                onChat={role === "seller" ? openChat : undefined}
              />

              <PartyCard
                title="Penjual"
                user={transaction.seller}
                icon={<Store size={19} />}
                active={role === "seller"}
                onChat={role === "buyer" ? openChat : undefined}
              />
            </section>

            <section className="rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#96928A]">
                  Progress transaksi
                </p>
                <Clock3 size={19} className="text-[#96928A]" />
              </div>
              <div className="mt-7">
                {transactionTimeline.map((label, index) => {
                  const done =
                    currentStep > index ||
                    transaction.status === "dana_dicairkan";
                  const current = currentStep === index;
                  const failed =
                    current &&
                    ["sengketa", "dibatalkan"].includes(transaction.status);
                  return (
                    <div key={label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${failed ? "border-red-500 bg-red-50 text-red-600" : done ? "border-emerald-500 bg-emerald-500 text-white" : current ? "border-[#C85A28] bg-[#C85A28]/10 text-[#C85A28]" : "border-[#C8C4BC] text-transparent"}`}
                        >
                          {done ? (
                            <Check size={13} />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-current" />
                          )}
                        </div>
                        {index < transactionTimeline.length - 1 && (
                          <div
                            className={`h-10 w-px ${done ? "bg-emerald-400" : "bg-[#D8D4CB]"}`}
                          />
                        )}
                      </div>
                      <div className="pb-7 pt-0.5">
                        <p
                          className={`text-sm font-bold ${failed ? "text-red-600" : current || done ? "text-[#181715]" : "text-[#96928A]"}`}
                        >
                          {label}
                        </p>
                        {current && (
                          <p className="mt-1 text-xs text-[#75726B]">
                            Tahap transaksi saat ini.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {!hideActionPanel && (
            <aside className="order-first space-y-5 lg:order-none">
              <section className="rounded-[1.75rem] border border-[#DCD8CF] bg-[#181715] p-6 text-white shadow-xl shadow-black/10 sm:p-7">
                <h2 className="text-2xl font-bold tracking-tight">
                  {nextTitle}
                </h2>

                {nextDescription && (
                  <p className="mt-3 text-sm leading-6 text-white/50">
                    {nextDescription}
                  </p>
                )}

                <div className="mt-7 space-y-3">
                  {transaction.status === "menunggu_konfirmasi" &&
                    !isCreator && (
                      <>
                        <ActionButton
                          label="Konfirmasi transaksi"
                          icon={<CheckCircle2 size={17} />}
                          loading={processing === "confirm"}
                          onClick={() =>
                            void runAction(
                              "confirm",
                              () => confirmTransaction(transaction.id),
                              "Transaksi berhasil dikonfirmasi.",
                            )
                          }
                        />
                        <ActionButton
                          label="Tolak transaksi"
                          icon={<XCircle size={17} />}
                          secondary
                          danger
                          loading={processing === "reject"}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Tolak transaksi “${transaction.judul_barang}”?`,
                              )
                            )
                              void runAction(
                                "reject",
                                () => rejectTransaction(transaction.id),
                                "Transaksi berhasil ditolak.",
                              );
                          }}
                        />
                      </>
                    )}
                  {transaction.status === "menunggu_pembayaran" &&
                    role === "buyer" && (
                      <ActionButton
                        label="Bayar sekarang"
                        icon={<Wallet size={17} />}
                        onClick={() =>
                          router.push(`/transaction/${transaction.id}/payment`)
                        }
                      />
                    )}
                  {transaction.status === "dana_ditahan" &&
                    role === "seller" && (
                      <ActionButton
                        label="Tandai barang sudah dikirim"
                        icon={<Package size={17} />}
                        loading={processing === "ship"}
                        onClick={() =>
                          void runAction(
                            "ship",
                            () => markTransactionShipped(transaction.id),
                            "Barang berhasil ditandai sudah dikirim.",
                          )
                        }
                      />
                    )}
                  {transaction.status === "barang_dikirim" &&
                    role === "buyer" && (
                      <>
                        <ActionButton
                          label="Konfirmasi terima & cairkan dana"
                          icon={<CheckCircle2 size={17} />}
                          loading={processing === "receive"}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Pastikan pesanan sudah diterima dengan baik. Cairkan dana ke penjual?",
                              )
                            )
                              void runAction(
                                "receive",
                                () =>
                                  confirmTransactionReceived(transaction.id),
                                "Penerimaan dikonfirmasi. Dana dicairkan ke penjual.",
                              );
                          }}
                        />
                        <ActionButton
                          label="Ada masalah? Ajukan dispute"
                          icon={<AlertTriangle size={17} />}
                          secondary
                          danger
                          onClick={() =>
                            router.push(
                              `/transaction/${transaction.id}/dispute`,
                            )
                          }
                        />
                      </>
                    )}
                  {transaction.status === "sengketa" && (
                    <ActionButton
                      label="Lihat status dispute"
                      icon={<Headphones size={17} />}
                      secondary
                      onClick={() =>
                        setNotice("Dispute sedang ditinjau mediator AlidPay.")
                      }
                    />
                  )}
                  {transaction.status === "dana_dicairkan" && (
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-200">
                      Transaksi selesai. Dana sudah dicairkan ke penjual.
                    </div>
                  )}
                  {transaction.status === "dibatalkan" && (
                    <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
                      Transaksi ini telah dibatalkan dan tidak dapat
                      dilanjutkan.
                    </div>
                  )}
                </div>
              </section>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

function nextActionTitle(
  transaction: AlidPayTransaction,
  role: "buyer" | "seller",
  isCreator: boolean,
  counterpart?: string,
) {
  if (transaction.status === "menunggu_konfirmasi") {
    if (!isCreator) {
      return "Periksa dan konfirmasi";
    }

    const counterpartRole = role === "buyer" ? "Penjual" : "Pembeli";
    const counterpartName = counterpart ? ` ${counterpart}` : "";

    return `Menunggu konfirmasi ${counterpartRole}${counterpartName}`;
  }

  if (transaction.status === "menunggu_pembayaran") {
    return role === "buyer"
      ? "Selesaikan pembayaran"
      : "Menunggu pembayaran buyer";
  }

  if (transaction.status === "dana_ditahan") {
    return role === "seller"
      ? "Kirim barang atau jasa"
      : "Dana sudah diamankan";
  }

  if (transaction.status === "barang_dikirim") {
    return role === "buyer"
      ? "Periksa pesanan Anda"
      : "Menunggu konfirmasi buyer";
  }

  if (transaction.status === "dana_dicairkan") return "Transaksi selesai";
  if (transaction.status === "sengketa") return "Dalam penanganan mediator";
  if (transaction.status === "dibatalkan") return "Transaksi dibatalkan";

  return "Bagikan tautan transaksi";
}

function nextActionDescription(
  transaction: AlidPayTransaction,
  role: "buyer" | "seller",
  isCreator: boolean,
  counterpart?: string,
): string | null {
  if (transaction.status === "menunggu_konfirmasi") {
    return isCreator
      ? null
      : "Pastikan judul, pihak, dan nominal sudah benar sebelum menyetujui.";
  }

  if (transaction.status === "menunggu_pembayaran") {
    return role === "buyer"
      ? "Lakukan pembayaran agar dana masuk ke escrow AlidPay."
      : "Anda akan mendapat notifikasi setelah dana buyer diamankan.";
  }

  if (transaction.status === "dana_ditahan") {
    return role === "seller"
      ? "Dana sudah aman. Kirim pesanan lalu tandai sebagai dikirim."
      : "Tunggu penjual mengirim pesanan Anda.";
  }

  if (transaction.status === "barang_dikirim") {
    return role === "buyer"
      ? "Konfirmasi hanya jika pesanan sudah sesuai. Ajukan dispute bila bermasalah."
      : "Dana cair setelah buyer mengonfirmasi penerimaan.";
  }

  if (transaction.status === "sengketa") {
    return "Dana dibekukan sampai mediator mengambil keputusan.";
  }

  return transactionStatuses[transaction.status].label;
}

function ActionButton({
  label,
  icon,
  onClick,
  loading = false,
  secondary = false,
  danger = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  secondary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-xs font-bold transition disabled:cursor-wait disabled:opacity-60 ${
        secondary
          ? danger
            ? "border border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/15"
            : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
          : "bg-white text-[#181715] hover:bg-[#F5EFE6]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="shrink-0">
          {loading ? <Loader2 size={17} className="animate-spin" /> : icon}
        </span>

        <span className="min-w-0 leading-5">
          {loading ? "Memproses..." : label}
        </span>
      </span>

      {!loading && <ArrowRight size={15} className="shrink-0" />}
    </button>
  );
}

function PriceRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-[#75726B]">{label}</span>

      <span
        className={`break-words sm:text-right ${
          strong ? "font-bold text-emerald-700" : "font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PartyCard({
  title,
  user,
  icon,
  active,
  onChat,
}: {
  title: string;
  user?: AlidPayTransaction["buyer"];
  icon: React.ReactNode;
  active: boolean;
  onChat?: () => void;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border p-5 ${
        active
          ? "border-[#181715] bg-[#181715] text-white"
          : "border-[#DCD8CF] bg-[#EFECE4]"
      }`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
          active ? "text-white/40" : "text-[#96928A]"
        }`}
      >
        {title}
        {active && " · Kamu"}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            active ? "bg-white/10" : "bg-[#F5EFE6]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold">
            {user?.name ?? `Menunggu ${title}`}
          </p>

          <p
            className={`mt-1 truncate text-[10px] ${
              active ? "text-white/40" : "text-[#96928A]"
            }`}
          >
            {user?.public_id ?? "Belum bergabung"}
          </p>
        </div>
      </div>

      {onChat && user && (
        <button
          type="button"
          onClick={onChat}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#181715] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#2A2926]"
        >
          <MessageCircle size={15} />
          Chat dengan {user.name}
        </button>
      )}
    </div>
  );
}

function TransactionLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6]">
      <div className="text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-[#C85A28]" />
        <p className="mt-4 text-sm font-semibold text-[#75726B]">
          Memuat detail transaksi...
        </p>
      </div>
    </main>
  );
}

function TransactionError({ message }: { message: string }) {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6] p-6">
      <div className="max-w-md rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-10 text-center">
        <Package size={38} className="mx-auto text-[#96928A]" />
        <h1 className="mt-4 text-xl font-bold">Transaksi tidak tersedia</h1>
        <p className="mt-2 text-sm leading-6 text-[#75726B]">{message}</p>
        <button
          onClick={() => router.push("/transaction")}
          className="mt-6 rounded-full bg-[#181715] px-6 py-3 text-xs font-bold text-white"
        >
          Kembali ke transaksi
        </button>
      </div>
    </main>
  );
}

export default function TransactionDetailPage() {
  return (
    <Suspense fallback={<TransactionLoading />}>
      <TransactionDetailContent />
    </Suspense>
  );
}
