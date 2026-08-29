"use client";

import { useAuth } from "@/app/context/AuthContext";
import {
  apiErrorMessage,
  fetchTransactionReceipts,
  formatRupiah,
  TransactionReceipt,
} from "@/app/lib/transactions";
import { ArrowLeft, Loader2, Printer, ReceiptText } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReceiptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selected, setSelected] = useState<TransactionReceipt | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(
        `/login?redirect=${encodeURIComponent(`/transaction/${params.id}/receipt`)}`,
      );
      return;
    }
    if (!user) return;

    const timeout = window.setTimeout(async () => {
      try {
        const data = await fetchTransactionReceipts(params.id);
        setSelected(data.latest_receipt);
      } catch (caught) {
        setError(apiErrorMessage(caught, "Struk belum dapat dimuat."));
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [authLoading, params.id, router, user]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#F5EFE6] px-5 pt-28 text-center">
        <Loader2 className="mx-auto animate-spin" />
        <p className="mt-4 text-sm font-semibold text-[#75726B]">Memuat struk...</p>
      </main>
    );
  }

  if (!selected) {
    return (
      <main className="min-h-screen bg-[#F5EFE6] px-5 pt-28 text-center">
        <ReceiptText className="mx-auto text-[#96928A]" size={42} />
        <h1 className="mt-5 text-2xl font-bold">Struk belum tersedia</h1>
        <p className="mt-2 text-sm text-[#75726B]">{error}</p>
        <button className="mt-6 rounded-full bg-[#181715] px-5 py-3 text-sm font-bold text-white" onClick={() => router.back()}>
          Kembali
        </button>
      </main>
    );
  }

  const data = selected.snapshot;
  const method = data.payment_method === "midtrans" ? "Midtrans" : "Saldo AlidPay";
  const sellerAmount = Number(
    data.seller_amount ?? Math.max(0, Number(data.amount) - Number(data.fee)),
  );
  const viewerRole =
    user?.public_id && user.public_id === data.seller.public_id
      ? "Penjual"
      : "Pembeli";

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-4 pb-20 pt-8 text-[#181715] sm:px-8 sm:pt-20 print:bg-white print:p-0">
      <div className="mx-auto max-w-2xl">
        <div className="mb-7 flex items-center justify-between gap-4 print:hidden">
          <button className="flex items-center gap-2 text-sm font-bold" onClick={() => router.push(`/transaction/${params.id}`)}>
            <ArrowLeft size={17} /> Kembali
          </button>
          <button className="flex items-center gap-2 rounded-full bg-[#181715] px-5 py-3 text-sm font-bold text-white" onClick={() => window.print()}>
            <Printer size={17} /> Cetak struk
          </button>
        </div>

        <article className="rounded-[1.75rem] border border-[#DCD8CF] bg-white p-7 shadow-sm sm:p-10 print:rounded-none print:border-0 print:shadow-none">
          <div className="flex items-start justify-between gap-5 border-b border-[#DCD8CF] pb-7">
            <div>
              <p className="text-sm font-black tracking-[0.18em]">ALIDPAY</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">
                Struk transaksi selesai
              </h1>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#087A55]">
                Salinan untuk {viewerRole}
              </p>
            </div>
            <ReceiptText size={32} />
          </div>

          <dl className="mt-7 space-y-4 text-sm">
            <ReceiptRow label="Nomor struk" value={selected.receipt_number} mono />
            <ReceiptRow label="Tanggal terbit" value={new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(selected.issued_at)) + " WIB"} />
            <ReceiptRow label="ID transaksi" value={data.transaction_id} mono />
            <ReceiptRow label="Produk / layanan" value={data.item} />
            <ReceiptRow label="Pembeli" value={`${data.buyer.name ?? "Pembeli"} (${data.buyer.public_id ?? "-"})`} />
            <ReceiptRow label="Penjual" value={`${data.seller.name ?? "Penjual"} (${data.seller.public_id ?? "-"})`} />
            <ReceiptRow label="Metode pembayaran" value={method} />
            <ReceiptRow label="Status transaksi" value="Selesai — dana dicairkan" />
          </dl>

          <div className="mt-8 border-t border-[#181715] pt-6">
            <ReceiptRow label="Dibayar pembeli" value={formatRupiah(data.amount)} />
            <div className="mt-3"><ReceiptRow label="Biaya layanan" value={formatRupiah(data.fee)} /></div>
            <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#DCD8CF] pt-5">
              <span className="font-bold">Diterima penjual</span>
              <span className="text-2xl font-black">{formatRupiah(sellerAmount)}</span>
            </div>
          </div>

          <p className="mt-8 border-t border-[#DCD8CF] pt-5 text-xs leading-5 text-[#75726B]">
            Struk ini diterbitkan setelah transaksi selesai dan dana dicairkan kepada penjual. Data kontak, email, alamat IP, dan informasi rahasia tidak dicantumkan.
          </p>
        </article>
      </div>
    </main>
  );
}

function ReceiptRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-6">
      <dt className="text-[#75726B]">{label}</dt>
      <dd className={`break-all font-semibold sm:text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
