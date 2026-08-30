"use client";

import {
  ArrowLeft,
  ArrowRight,
  Landmark,
  Loader2,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  MidtransSnap,
  type MidtransCheckout,
} from "../../components/MidtransSnap";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/axios";
import { apiErrorMessage, formatRupiah } from "../../lib/transactions";

type GatewayMethod = "qris" | "bank" | "ewallet";
type TopUpStatus = "creating" | "pending" | "succeeded" | "failed" | "expired";

const presets = [50_000, 100_000, 250_000, 500_000, 1_000_000];

export default function TopUpPage() {
  const testBalanceEnabled =
    process.env.NEXT_PUBLIC_TEST_BALANCE_ENABLED === "true" ||
    (process.env.NEXT_PUBLIC_TEST_BALANCE_ENABLED !== "false" &&
      process.env.NODE_ENV === "development");
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [amount, setAmount] = useState(100_000);
  const [method, setMethod] = useState<GatewayMethod>("qris");
  const [checkout, setCheckout] = useState<MidtransCheckout | null>(null);
  const [topUpId, setTopUpId] = useState<string | null>(null);
  const [status, setStatus] = useState<TopUpStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const requestInFlight = useRef(false);

  function getReturnPath() {
    const requested = new URLSearchParams(window.location.search).get("return");
    if (requested?.startsWith("/") && !requested.startsWith("//")) {
      return requested;
    }

    return "/transaction";
  }

  async function startTopUp() {
    if (!user || requestInFlight.current) return;
    requestInFlight.current = true;
    setSubmitting(true);
    setError("");
    setMessage("");

    const storageKey = `alidpay:topup-key:${amount}:${method}`;
    const idempotencyKey = sessionStorage.getItem(storageKey) ?? crypto.randomUUID();
    sessionStorage.setItem(storageKey, idempotencyKey);

    try {
      const response = await api.post(
        "/api/balance/top-ups",
        { amount, payment_method: method },
        {
          timeout: 20_000,
          headers: {
            "Idempotency-Key": idempotencyKey,
            "X-Request-ID": crypto.randomUUID(),
          },
        },
      );
      setTopUpId(response.data.top_up.id);
      setStatus(response.data.top_up.status);
      setCheckout(response.data as MidtransCheckout);
    } catch (err) {
      sessionStorage.removeItem(storageKey);
      requestInFlight.current = false;
      setSubmitting(false);
      setError(apiErrorMessage(err, "Top up gagal dimulai."));
    }
  }

  async function waitForVerification() {
    if (!topUpId) return;
    setMessage("Pembayaran diterima Midtrans. Menunggu verifikasi saldo...");

    for (let attempt = 0; attempt < 10; attempt += 1) {
      try {
        const response = await api.get(`/api/balance/top-ups/${topUpId}`);
        const nextStatus = response.data.top_up.status as TopUpStatus;
        setStatus(nextStatus);
        if (nextStatus === "succeeded") {
          await refreshUser();
          setMessage("Top up berhasil. Saldo AlidPay sudah bertambah.");
          requestInFlight.current = false;
          setSubmitting(false);
          return;
        }
        if (nextStatus === "failed" || nextStatus === "expired") break;
      } catch {
        // Gangguan polling tidak mengubah status finansial di server.
      }
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }

    requestInFlight.current = false;
    setSubmitting(false);
    setMessage("Pembayaran masih diproses. Saldo akan bertambah setelah webhook Midtrans terverifikasi.");
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6]">
        <Loader2 className="animate-spin text-[#75726B]" />
      </main>
    );
  }

  if (!testBalanceEnabled) {
    return (
      <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-28 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-8 text-center">
          <h1 className="text-2xl font-bold">Saldo uji tidak tersedia</h1>
          <p className="mt-3 text-sm text-[#75726B]">Gunakan pembayaran gateway yang tersedia untuk transaksi.</p>
          <button type="button" onClick={() => router.push(getReturnPath())} className="mt-6 rounded-full bg-[#181715] px-6 py-3 text-sm font-bold text-white">Kembali</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-24 sm:px-8">
      <MidtransSnap
        checkout={checkout}
        onSuccess={() => void waitForVerification()}
        onPending={() => {
          requestInFlight.current = false;
          setSubmitting(false);
          setMessage("Instruksi pembayaran aktif. Selesaikan sebelum kedaluwarsa.");
        }}
        onError={() => {
          requestInFlight.current = false;
          setSubmitting(false);
          setError("Pembayaran ditolak atau mengalami gangguan di Midtrans.");
        }}
        onClose={() => {
          requestInFlight.current = false;
          setSubmitting(false);
          setMessage("Jendela pembayaran ditutup. Saldo belum ditambahkan.");
        }}
      />

      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push(getReturnPath())}
          className="flex items-center gap-2 text-xs font-bold text-[#75726B]"
        >
          <ArrowLeft size={15} /> Kembali
        </button>

        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
            Midtrans Sandbox
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
            Isi saldo uji
          </h1>
          <p className="mt-3 text-sm text-[#75726B]">
            Saldo uji saat ini {formatRupiah(Number(user.balance))}. Fitur ini hanya untuk dev/test dan tidak memakai uang sungguhan.
          </p>
        </div>

        <section className="mt-7 rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-7">
          <h2 className="font-bold">Pilih nominal</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {presets.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                  amount === value
                    ? "border-[#181715] bg-[#181715] text-white"
                    : "border-[#DCD8CF] bg-[#F5EFE6]"
                }`}
              >
                {formatRupiah(value)}
              </button>
            ))}
          </div>

          <label className="mt-5 block text-xs font-bold text-[#75726B]">
            Nominal lain (Rp10.000–Rp10.000.000)
            <input
              type="number"
              min={10_000}
              max={10_000_000}
              step={1_000}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-[#DCD8CF] bg-[#F5EFE6] px-4 py-3 text-base text-[#181715] outline-none focus:border-[#181715]"
            />
          </label>
        </section>

        <section className="mt-5 rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-7">
          <h2 className="font-bold">Metode pembayaran</h2>
          <div className="mt-4 space-y-3">
            <Method active={method === "qris"} onClick={() => setMethod("qris")} icon={<Smartphone size={19} />} title="QRIS" detail="Scan dari aplikasi pembayaran" />
            <Method active={method === "bank"} onClick={() => setMethod("bank")} icon={<Landmark size={19} />} title="Transfer Bank" detail="Virtual account bank" />
            <Method active={method === "ewallet"} onClick={() => setMethod("ewallet")} icon={<Wallet size={19} />} title="E-Wallet" detail="GoPay, DANA, OVO, ShopeePay" />
          </div>
        </section>

        {(error || message) && (
          <div className={`mt-5 rounded-2xl border px-5 py-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
            {error || message}
          </div>
        )}

        <button
          type="button"
          disabled={submitting || amount < 10_000 || amount > 10_000_000 || status === "succeeded"}
          onClick={() => void startTopUp()}
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#181715] px-6 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <><Loader2 size={17} className="animate-spin" /> Memproses...</> : <>{status === "succeeded" ? "Saldo uji sudah ditambahkan" : `Isi saldo uji ${formatRupiah(amount)}`} <ArrowRight size={17} /></>}
        </button>
      </div>
    </main>
  );
}

function Method({ active, onClick, icon, title, detail }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; detail: string }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left ${active ? "border-[#181715] bg-[#F5EFE6]" : "border-[#DCD8CF]"}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-[#181715] text-white" : "bg-[#F5EFE6] text-[#75726B]"}`}>{icon}</span>
      <span className="flex-1"><span className="block text-sm font-bold">{title}</span><span className="mt-1 block text-xs text-[#96928A]">{detail}</span></span>
      <span className={`h-5 w-5 rounded-full border-4 ${active ? "border-[#181715] bg-white" : "border-[#C8C4BC]"}`} />
    </button>
  );
}
