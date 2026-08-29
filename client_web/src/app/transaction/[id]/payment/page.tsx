"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  Smartphone,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MidtransSnap,
  type MidtransCheckout,
} from "../../../components/MidtransSnap";
import { api } from "../../../lib/axios";
import {
  apiErrorMessage,
  markTransactionPaid,
  startMidtransTransactionPayment,
} from "../../../lib/transactions";
import { redirectProtectedResourceError } from "../../../lib/protected-navigation";
import { useAuth } from "../../../context/AuthContext";

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
  created_at: string;
  updated_at: string;
  buyer?: TransactionUser | null;
  seller?: TransactionUser | null;
}

type PaymentMethod = "alidpay_balance" | "qris" | "bank" | "ewallet";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("alidpay_balance");
  const [snapCheckout, setSnapCheckout] = useState<MidtransCheckout | null>(null);
  const paymentRequestInFlight = useRef(false);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  const getTransaction = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/api/transaction/${transactionId}`);

      setTransaction(res.data.transaction ?? res.data.data ?? null);
    } catch (err) {
      if (
        redirectProtectedResourceError(
          err,
          router,
          `/transaction/${transactionId}/payment`,
        )
      ) {
        setRedirecting(true);
        return;
      }
      console.error("Gagal mengambil transaksi:", err);
      setError("Gagal mengambil detail transaksi.");
    } finally {
      setLoading(false);
    }
  }, [router, transactionId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(
        `/login?redirect=${encodeURIComponent(`/transaction/${transactionId}/payment`)}`,
      );
      return;
    }

    if (!authLoading && user && transactionId) {
      const timeout = window.setTimeout(() => void getTransaction(), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [authLoading, getTransaction, router, transactionId, user]);

  async function handlePayment() {
    if (!transaction || paymentRequestInFlight.current) return;

    // State updates are rendered asynchronously. This ref closes the small
    // window where rapid taps could otherwise start more than one request.
    paymentRequestInFlight.current = true;
    setPaying(true);
    setError("");
    setNotice("");

    try {
      const storageKey = `alidpay:payment-key:${transaction.id}:${paymentMethod}`;
      const idempotencyKey =
        window.sessionStorage.getItem(storageKey) ?? crypto.randomUUID();
      window.sessionStorage.setItem(storageKey, idempotencyKey);

      if (paymentMethod === "alidpay_balance") {
        await markTransactionPaid(transaction.id, idempotencyKey);
        window.sessionStorage.removeItem(storageKey);
        router.replace(`/transaction/${transaction.id}/receipt`);
        return;
      }

      const checkout = await startMidtransTransactionPayment(
        transaction.id,
        paymentMethod,
        idempotencyKey,
      );
      setSnapCheckout(checkout);
    } catch (err: unknown) {
      console.error("Gagal melakukan pembayaran:", err);

      setError(apiErrorMessage(err, "Pembayaran gagal diproses."));
      paymentRequestInFlight.current = false;
      setPaying(false);
    }
  }

  if (authLoading || !user || loading || redirecting) {
    return (
      <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-28 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-10 text-center">
            <Loader2
              size={24}
              className="mx-auto animate-spin text-[#75726B]"
            />

            <p className="mt-4 text-sm font-semibold text-[#75726B]">
              Memuat halaman pembayaran...
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
            <Wallet size={38} className="mx-auto text-[#96928A]" />

            <p className="mt-4 text-lg font-bold">Transaksi tidak ditemukan</p>

            <p className="mt-2 text-sm text-[#75726B]">
              {error || "Data transaksi tidak tersedia."}
            </p>

            <button
              type="button"
              onClick={() => router.replace("/transaction")}
              className="mt-6 rounded-full bg-[#181715] px-5 py-2.5 text-xs font-bold text-white"
            >
              Kembali
            </button>
          </div>
        </div>
      </main>
    );
  }

  const total = Number(transaction.nominal);
  const currentBalance = Number(user.balance);
  const remainingBalance = currentBalance - total;
  const isBalancePayment = paymentMethod === "alidpay_balance";
  const hasInsufficientBalance = isBalancePayment && currentBalance < total;

  const isPaymentReady = transaction.status === "menunggu_pembayaran";

  if (!isPaymentReady) {
    return (
      <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-28 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => router.replace(`/transaction/${transaction.id}`)}
            className="group flex items-center gap-2 text-xs font-bold text-[#75726B] hover:text-[#181715]"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Kembali
          </button>

          <div className="mt-8 rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-8 text-center sm:p-12">
            <CheckCircle2 size={46} className="mx-auto text-[#10B981]" />

            <h1 className="mt-5 text-2xl font-bold">
              Pembayaran tidak tersedia
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#75726B]">
              Transaksi ini sudah tidak berada pada tahap menunggu pembayaran.
            </p>

            <button
              type="button"
              onClick={() => router.replace(`/transaction/${transaction.id}`)}
              className="mt-7 rounded-full bg-[#181715] px-6 py-3 text-sm font-bold text-white"
            >
              Lihat transaksi
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-28 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <MidtransSnap
          checkout={snapCheckout}
          onSuccess={() => {
            setPaying(false);
            setNotice("Pembayaran diterima Midtrans dan sedang diverifikasi oleh AlidPay.");
            router.replace(`/transaction/${transaction.id}`);
          }}
          onPending={() => {
            paymentRequestInFlight.current = false;
            setPaying(false);
            setNotice("Instruksi pembayaran sudah dibuat. Selesaikan sebelum kedaluwarsa.");
          }}
          onError={() => {
            paymentRequestInFlight.current = false;
            setPaying(false);
            setError("Pembayaran Midtrans gagal. Kamu dapat mencoba kembali.");
          }}
          onClose={() => {
            paymentRequestInFlight.current = false;
            setPaying(false);
            setNotice("Jendela pembayaran ditutup. Pembayaran belum dinyatakan lunas.");
          }}
        />

        {/* BACK */}
        <button
          type="button"
          onClick={() => router.push(`/transaction/${transaction.id}`)}
          className="group flex items-center gap-2 text-xs font-bold text-[#75726B] transition hover:text-[#181715]"
        >
          <ArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Kembali ke transaksi
        </button>

        {/* HEADER */}
        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
            Bayar dengan aman
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
            Pembayaran
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#75726B]">
            Selesaikan pembayaran agar dana dapat diamankan oleh AlidPay.
          </p>
        </div>

        {/* TEST MODE */}
        <div className="mt-7 rounded-[1.5rem] border border-[#C89A56]/40 bg-[#C89A56]/10 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C89A56]/15">
              <CreditCard size={17} className="text-[#9A7038]" />
            </div>

            <div>
              <p className="text-sm font-bold">Midtrans Sandbox</p>

              <p className="mt-1 text-xs leading-5 text-[#75726B]">
                QRIS, transfer bank, dan e-wallet memakai uang uji Midtrans.
                Saldo AlidPay tetap diproses oleh ledger internal AlidPay.
              </p>
            </div>
          </div>
        </div>

        {/* ORDER */}
        <section className="mt-5 rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5EFE6]">
              <PackageIcon />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#96928A]">Pesanan</p>

              <p className="mt-1 text-lg font-bold">
                {transaction.judul_barang}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-[#DCD8CF] pt-5 sm:grid-cols-2">
            {/* BUYER */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#96928A]">
                Pembeli
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181715] text-white">
                  <User size={17} />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    {transaction.buyer?.name ?? "Pembeli"}
                  </p>

                  <p className="text-xs text-[#96928A]">
                    {transaction.buyer?.public_id ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* SELLER */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#96928A]">
                Penjual
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181715] text-white">
                  <User size={17} />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    {transaction.seller?.name ?? "Penjual"}
                  </p>

                  <p className="text-xs text-[#96928A]">
                    {transaction.seller?.public_id ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PAYMENT METHOD */}
        <section className="mt-5 rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5EFE6]">
              <CreditCard size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#96928A]">Metode</p>

              <h2 className="mt-1 font-bold">Pilih metode pembayaran</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <PaymentOption
              active={paymentMethod === "alidpay_balance"}
              onClick={() => setPaymentMethod("alidpay_balance")}
              icon={<Wallet size={20} />}
              title="Saldo AlidPay"
              description={`Saldo tersedia ${formatRupiah(currentBalance)}`}
            />

            <PaymentOption
              active={paymentMethod === "qris"}
              onClick={() => setPaymentMethod("qris")}
              icon={<Smartphone size={20} />}
              title="QRIS"
              description="Scan menggunakan aplikasi pembayaran"
              badge="Sandbox"
            />

            <PaymentOption
              active={paymentMethod === "bank"}
              onClick={() => setPaymentMethod("bank")}
              icon={<Landmark size={20} />}
              title="Transfer Bank"
              description="Virtual account / transfer bank"
              badge="Sandbox"
            />

            <PaymentOption
              active={paymentMethod === "ewallet"}
              onClick={() => setPaymentMethod("ewallet")}
              icon={<Wallet size={20} />}
              title="E-Wallet"
              description="GoPay, DANA, OVO, dan ShopeePay"
              badge="Sandbox"
            />
          </div>

          {isBalancePayment && (
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#DCD8CF] pt-4 text-sm">
              <span className="text-[#75726B]">Sisa setelah pembayaran</span>
              <span
                className={`font-bold ${
                  hasInsufficientBalance ? "text-red-600" : "text-[#181715]"
                }`}
              >
                {formatRupiah(Math.max(remainingBalance, 0))}
              </span>
            </div>
          )}

          {hasInsufficientBalance && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold text-red-600">
                Saldo AlidPay tidak mencukupi untuk transaksi ini.
              </p>
              <Link
                href={`/account/top-up?return=${encodeURIComponent(`/transaction/${transaction.id}/payment`)}`}
                className="text-xs font-bold text-[#181715] underline underline-offset-4"
              >
                Top up saldo
              </Link>
            </div>
          )}
        </section>

        {/* PRICE */}
        <section className="mt-5 rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5EFE6]">
              <Wallet size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#96928A]">
                Rincian pembayaran
              </p>

              <p className="mt-1 font-bold">Total yang harus dibayar</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-[#DCD8CF] pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-[#75726B]">Nilai transaksi</span>

              <span className="font-semibold">
                {formatRupiah(Number(transaction.nominal))}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[#75726B]">
                Biaya layanan
              </span>

              <span className="font-semibold">
                - {formatRupiah(Number(transaction.fee))}
              </span>
            </div>

            <div className="mt-4 border-t border-[#DCD8CF] pt-5">
              <div className="flex items-end justify-between gap-4">
                <span className="font-bold">Total pembayaran</span>

                <span className="text-2xl font-bold tracking-tight">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PAY BUTTON */}
        <section className="mt-5">
          {error && (
            <div className="mb-4 rounded-[1.25rem] border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
          {notice && !error && (
            <div className="mb-4 rounded-[1.25rem] border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-semibold text-blue-700">
              {notice}
            </div>
          )}

          <button
            type="button"
            disabled={paying || hasInsufficientBalance}
            aria-busy={paying}
            onClick={handlePayment}
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#181715] px-6 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2A2926] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paying ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Memproses pembayaran...
              </>
            ) : (
              <>
                {isBalancePayment
                  ? "Bayar dengan saldo AlidPay"
                  : `Lanjutkan ke ${paymentMethod === "qris" ? "QRIS" : paymentMethod === "bank" ? "Transfer Bank" : "E-Wallet"}`}
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-[#96928A]">
            Sandbox hanya memakai uang uji. Status lunas berasal dari webhook
            Midtrans yang diverifikasi server, bukan dari popup.
          </p>
        </section>
      </div>
    </main>
  );
}

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  description,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-[#181715] bg-[#F5EFE6]"
          : "border-[#DCD8CF] bg-transparent hover:bg-[#F5EFE6]"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          active ? "bg-[#181715] text-white" : "bg-[#F5EFE6] text-[#75726B]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold">{title}</p>
          {badge && (
            <span className="rounded-full bg-[#C89A56]/15 px-2 py-0.5 text-[10px] font-bold text-[#7A572E]">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-[#96928A]">{description}</p>
      </div>

      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
          active ? "border-[#181715]" : "border-[#C8C4BC]"
        }`}
      >
        {active && <div className="h-2.5 w-2.5 rounded-full bg-[#181715]" />}
      </div>
    </button>
  );
}

function PackageIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16.5 9.4-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}
