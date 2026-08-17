"use client";

import React, { ChangeEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  Link2,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";

type Step = "form" | "review" | "success";
type TransactionType = "normal" | "tautan";

interface CreateTransaction {
  judul_barang: string;
  nominal: string;
  lawan_transaksi_id: string;
  kontak: string;
  type: TransactionType;
}

const theme = {
  bg: "#F5EFE6",
  surface: "#EFECE4",
  ink: "#181715",
  secondary: "#75726B",
  border: "#E0DDD5",
  orange: "#C85A28",
  gold: "#D49A2B",
  goldSoft: "#C89A56",
  green: "#10B981",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseRupiah(value: string) {
  return Number(value.replace(/\D/g, "")) || 0;
}

function formatInputRupiah(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

function calculateServiceFee(amount: number) {
  if (amount < 100_000) {
    return 2_000;
  }

  if (amount < 1_000_000) {
    return 10_000;
  }

  if (amount < 10_000_000) {
    return 25_000;
  }

  return 60_000;
}

export default function CreateTransactionPage() {
  const [step, setStep] = useState<Step>("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [transactionCode, setTransactionCode] = useState("");
  const [transactionLink, setTransactionLink] = useState("");
  const [createTransaction, setCreateTransaction] = useState<CreateTransaction>(
    {
      judul_barang: "",
      nominal: "",
      lawan_transaksi_id: "",
      kontak: "",
      type: "normal",
    },
  );

  const { user } = useAuth();

  const isBuyer = user?.role === "pembeli";
  const userRole = user?.role === "penjual";

  const numericAmount = useMemo(
    () => parseRupiah(createTransaction.nominal),
    [createTransaction.nominal],
  );

  function handleChangeCreateTransaction(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCreateTransaction((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!createTransaction.judul_barang.trim()) {
      nextErrors.title = "Nama barang atau jasa wajib diisi.";
    }

    if (
      createTransaction.type === "normal" &&
      !createTransaction.lawan_transaksi_id.trim()
    ) {
      nextErrors.counterpartyId = isBuyer
        ? "ID penjual wajib diisi."
        : "ID pembeli wajib diisi.";
    }

    if (!createTransaction.nominal || numericAmount <= 0) {
      nextErrors.amount = "Nominal harus lebih dari Rp 0.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleConfirm() {
    try {
      setLoading(true);

      const payload = {
        ...createTransaction,
        nominal: numericAmount,
      };

      const { data } = await api.post("/api/transaction", payload);

      const transaction = data.transaction;

      setTransactionCode(transaction.share_code ?? transaction.id);

      setTransactionLink(
        data.webUrl
          ? `${window.location.origin}/t/${transaction.share_code}`
          : "",
      );

      setStep("success");
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setStep("form");

    setCreateTransaction({
      judul_barang: "",
      nominal: "",
      lawan_transaksi_id: "",
      kontak: "",
      type: "normal",
    });

    setTransactionCode("");
    setTransactionLink("");
    setErrors({});
  }

  async function copyText(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert(message);
    } catch {
      // fallback could be added later
    }
  }

  async function shareTransaction() {
    const text = `Halo! Saya membuat transaksi melalui AlidPay.

Produk: ${createTransaction.judul_barang}
Total: ${formatRupiah(numericAmount)}

Bayar dan lihat detail transaksi:
${transactionLink}`;

    if (navigator.share) {
      await navigator.share({
        title: "Transaksi AlidPay",
        text,
        url: transactionLink,
      });
    } else {
      await copyText(text, "Pesan transaksi berhasil disalin.");
    }
  }

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    setCreateTransaction((prev) => ({
      ...prev,
      nominal: formatInputRupiah(e.target.value),
    }));
  }

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: theme.bg,
        color: theme.ink,
      }}
    >
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{
          backgroundColor: "rgba(245,239,230,.88)",
          borderColor: theme.border,
        }}
      >
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <button
            onClick={() => {
              if (step === "review") {
                setStep("form");
              } else {
                window.history.back();
              }
            }}
            className="group flex items-center gap-2 text-sm font-semibold transition hover:opacity-60"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black"
                style={{
                  backgroundColor: theme.ink,
                  color: theme.bg,
                }}
              >
                A
              </div>

              <span className="hidden text-sm font-extrabold tracking-[-.03em] sm:block">
                AlidPay
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#75726B] sm:gap-2 sm:text-xs">
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">Protected</span>
          </div>
        </div>
      </header>

      {step === "form" && (
        <CreateForm
          createTransaction={createTransaction}
          onChange={handleChangeCreateTransaction}
          onAmountChange={handleAmountChange}
          userRole={user?.role}
          onTypeChange={(type) =>
            setCreateTransaction((prev) => ({
              ...prev,
              type,
            }))
          }
          errors={errors}
          handleContinue={handleContinue}
        />
      )}

      {step === "review" && (
        <ReviewTransaction
          title={createTransaction.judul_barang}
          buyerId={createTransaction.lawan_transaksi_id}
          contact={createTransaction.kontak}
          amount={numericAmount}
          type={createTransaction.type}
          loading={loading}
          onBack={() => setStep("form")}
          onConfirm={handleConfirm}
        />
      )}

      {step === "success" && (
        <SuccessTransaction
          title={createTransaction.judul_barang}
          contact={createTransaction.kontak}
          amount={numericAmount}
          type={createTransaction.type}
          code={transactionCode}
          link={transactionLink}
          onCopy={() =>
            copyText(transactionLink, "Tautan transaksi berhasil disalin.")
          }
          onShare={shareTransaction}
          onReset={reset}
        />
      )}
    </main>
  );
}

/* =========================================================
   CREATE FORM
========================================================= */

function CreateForm({
  createTransaction,
  onChange,
  userRole,
  errors,
  handleContinue,
  onAmountChange,
  onTypeChange,
}: {
  createTransaction: CreateTransaction;
  userRole?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAmountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
  handleContinue: (event: React.FormEvent<HTMLFormElement>) => void;
  onTypeChange: (type: TransactionType) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 xl:gap-20">
        <section className="min-w-0">
          {/* HEADER */}
          <div className="mb-8 max-w-[720px] sm:mb-10">
            <div
              className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] sm:text-xs"
              style={{ color: theme.gold }}
            >
              <Sparkles size={13} />
              New transaction
            </div>

            <h1 className="max-w-[700px] text-[38px] font-extrabold leading-[.98] tracking-[-.055em] sm:text-[52px] lg:text-[60px]">
              Buat transaksi
              <br />
              <span style={{ color: theme.orange }}>dengan aman.</span>
            </h1>

            <p
              className="mt-5 max-w-[580px] text-[13px] leading-6 sm:mt-6 sm:text-[15px] sm:leading-7"
              style={{ color: theme.secondary }}
            >
              Buat transaksi AlidPay, tentukan pembeli, lalu review semuanya
              sebelum transaksi benar-benar dibuat.
            </p>
          </div>

          {/* MODE SELECTOR */}
          <div
            className="mb-8 grid grid-cols-1 overflow-hidden rounded-xl border sm:mb-10 sm:grid-cols-2"
            style={{
              borderColor: theme.border,
              backgroundColor: "rgba(255,255,255,.24)",
            }}
          >
            <ModeButton
              active={createTransaction.type === "normal"}
              icon={<UserRound size={18} />}
              title="Pembeli terdaftar"
              description="Sudah punya ID AlidPay"
              onClick={() => onTypeChange("normal")}
            />

            <ModeButton
              active={createTransaction.type === "tautan"}
              icon={<Link2 size={18} />}
              title="Belum punya akun"
              description="Kirim tautan pembayaran"
              onClick={() => onTypeChange("tautan")}
            />
          </div>

          <form onSubmit={handleContinue} className="w-full max-w-[760px]">
            {/* GUEST INFO */}
            {createTransaction.type === "tautan" && (
              <div
                className="mb-8 flex gap-3 border-l-[3px] px-4 py-3.5 sm:mb-10 sm:gap-4 sm:px-5 sm:py-4"
                style={{
                  borderColor: theme.gold,
                  backgroundColor: "rgba(212,154,43,.055)",
                }}
              >
                <Link2
                  className="mt-0.5 shrink-0"
                  size={17}
                  style={{ color: theme.gold }}
                />

                <div className="min-w-0">
                  <p className="text-[13px] font-bold sm:text-sm">
                    Pembeli tidak perlu punya akun.
                  </p>

                  <p
                    className="mt-1 text-[12px] leading-5 sm:text-[13px] sm:leading-6"
                    style={{ color: theme.secondary }}
                  >
                    Setelah transaksi dibuat, AlidPay memberikan tautan yang
                    bisa kamu kirim melalui WhatsApp, SMS, atau platform lain.
                  </p>
                </div>
              </div>
            )}

            {/* TITLE */}
            <Field
              label="BARANG / JASA"
              name="judul_barang"
              placeholder="Contoh: MacBook Pro M3 — 16GB"
              value={createTransaction.judul_barang}
              onChange={onChange}
              error={errors.title}
            />

            {/* Lawan Transaksi ID */}
            <Field
              label={userRole ? "ID PEMBELI" : "ID PENJUAL"}
              name="lawan_transaksi_id"
              placeholder="@ALID-8K4M2P9X"
              value={createTransaction.lawan_transaksi_id}
              onChange={onChange}
              error={errors.counterpartyId}
              icon={<Search size={16} />}
              helper={
                userRole === "penjual"
                  ? "Minta pembeli membagikan ID AlidPay dari halaman profilnya."
                  : "Masukkan ID AlidPay penjual."
              }
            />

            {/* CONTACT */}
            <Field
              name="kontak"
              label="KONTAK PEMBELI"
              optional
              placeholder="Nomor HP atau nama panggilan"
              value={createTransaction.kontak}
              onChange={onChange}
            />

            {/* AMOUNT */}
            <div className="mb-8 sm:mb-10">
              <label
                className="mb-2.5 block text-[10px] font-extrabold tracking-[.14em] sm:mb-3 sm:text-[11px]"
                style={{ color: theme.secondary }}
              >
                NOMINAL TRANSAKSI
              </label>

              <div className="flex min-w-0 items-end border-b-2 pb-1.5 sm:pb-2">
                <span
                  className="mr-2 shrink-0 text-lg font-extrabold sm:mr-3 sm:text-xl"
                  style={{ color: theme.gold }}
                >
                  Rp
                </span>

                <input
                  name="nominal"
                  inputMode="numeric"
                  value={createTransaction.nominal}
                  onChange={onAmountChange}
                  placeholder="0"
                  className="min-w-0 w-full bg-transparent text-[30px] font-extrabold tracking-[-.04em] outline-none placeholder:text-black/15 sm:text-[34px]"
                />
              </div>

              {errors.amount && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  {errors.amount}
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-3 rounded-lg px-5 py-4 text-[13px] font-extrabold text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:min-w-[260px] sm:text-sm"
              style={{ backgroundColor: theme.ink }}
            >
              Lanjut ke ringkasan
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </form>
        </section>

        {/* DESKTOP ONLY */}
        <aside className="hidden lg:block">
          <TransactionAside />
        </aside>
      </div>
    </div>
  );
}

/* =========================================================
   MODE BUTTON
========================================================= */

function ModeButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex min-w-0 items-center gap-3 p-4 text-left transition sm:block sm:p-5"
      style={{
        backgroundColor: active ? "rgba(255,255,255,.58)" : "transparent",
      }}
    >
      {active && (
        <>
          {/* Mobile indicator */}
          <div
            className="absolute bottom-0 left-0 top-0 w-[3px] sm:hidden"
            style={{ backgroundColor: theme.gold }}
          />

          {/* Desktop indicator */}
          <div
            className="absolute inset-x-0 bottom-0 hidden h-[3px] sm:block"
            style={{ backgroundColor: theme.gold }}
          />
        </>
      )}

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: active ? theme.ink : "rgba(24,23,21,.06)",
          color: active ? theme.bg : theme.secondary,
        }}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className="truncate text-[13px] font-extrabold sm:text-sm"
          style={{
            color: active ? theme.ink : "rgba(24,23,21,.55)",
          }}
        >
          {title}
        </p>

        <p
          className="mt-0.5 truncate text-[11px] sm:mt-1 sm:text-xs"
          style={{ color: theme.secondary }}
        >
          {description}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  helper,
  optional,
  icon,
  name,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
  helper?: string;
  optional?: boolean;
  icon?: React.ReactNode;
  name: string;
}) {
  return (
    <div className="mb-7 sm:mb-9">
      <label
        className="mb-2.5 flex items-center gap-2 text-[10px] font-extrabold tracking-[.14em] sm:mb-3 sm:text-[11px]"
        style={{ color: theme.secondary }}
      >
        {label}

        {optional && (
          <span className="normal-case tracking-normal opacity-60">
            (opsional)
          </span>
        )}
      </label>

      <div className="relative min-w-0 border-b">
        {icon && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2"
            style={{ color: theme.secondary }}
          >
            {icon}
          </span>
        )}

        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full min-w-0 bg-transparent py-2 text-[15px] font-semibold outline-none placeholder:text-black/20 sm:text-[17px] ${
            icon ? "pl-7" : ""
          }`}
        />
      </div>

      {error && (
        <p className="mt-2 text-[11px] font-semibold text-red-600 sm:text-xs">
          {error}
        </p>
      )}

      {helper && !error && (
        <p
          className="mt-2 max-w-[600px] text-[10px] leading-5 sm:text-[11px]"
          style={{ color: theme.secondary }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   ASIDE
========================================================= */

function TransactionAside() {
  return (
    <div className="sticky top-28">
      <div
        className="overflow-hidden rounded-xl border sm:rounded-2xl"
        style={{
          borderColor: theme.border,
          backgroundColor: "rgba(255,255,255,.3)",
        }}
      >
        <div
          className="p-7"
          style={{
            backgroundColor: theme.ink,
            color: theme.bg,
          }}
        >
          <div className="mb-16 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[.18em] opacity-50">
              ALIDPAY / ESCROW
            </span>

            <ShieldCheck size={18} />
          </div>

          <p className="text-xs font-semibold opacity-50">TRANSACTION FLOW</p>

          <h3 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.04em]">
            Dari pembayaran
            <br />
            sampai selesai.
          </h3>
        </div>

        <div className="p-7">
          {[
            ["01", "Create", "Buat detail transaksi"],
            ["02", "Review", "Pastikan semuanya benar"],
            ["03", "Pay", "Pembeli melakukan pembayaran"],
            ["04", "Complete", "Transaksi diselesaikan"],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="flex gap-4 border-b py-5 last:border-b-0"
              style={{ borderColor: theme.border }}
            >
              <span
                className="font-mono text-[11px] font-bold"
                style={{ color: theme.gold }}
              >
                {number}
              </span>

              <div>
                <p className="text-sm font-extrabold">{title}</p>

                <p className="mt-1 text-xs" style={{ color: theme.secondary }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 px-2 text-xs">
        <ShieldCheck size={14} style={{ color: theme.green }} />
        <span style={{ color: theme.secondary }}>
          Transaksi dilindungi oleh AlidPay
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW
========================================================= */

function ReviewTransaction({
  title,
  buyerId,
  contact,
  amount,
  type,
  loading,
  onBack,
  onConfirm,
}: {
  title: string;
  buyerId: string;
  contact: string;
  amount: number;
  type: TransactionType;
  loading: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const fee = calculateServiceFee(amount);
  const isGuest = type === "tautan";

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-20">
      {/* HEADER */}
      <div className="mb-9 sm:mb-12">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p
            className="text-[11px] font-extrabold uppercase tracking-[.16em]"
            style={{ color: theme.gold }}
          >
            Step 02 / Review
          </p>

          <span
            className="rounded-full border px-2 py-1 text-[9px] font-extrabold tracking-[.1em]"
            style={{
              borderColor: isGuest
                ? "rgba(200,90,40,.35)"
                : "rgba(16,185,129,.35)",
              color: isGuest ? theme.orange : theme.green,
            }}
          >
            {isGuest ? "PAYMENT LINK" : "REGISTERED PEMBELI"}
          </span>
        </div>

        <h1 className="text-[36px] font-extrabold leading-[1] tracking-[-.05em] sm:text-5xl lg:text-6xl">
          Pastikan semuanya
          <br />
          <span style={{ color: theme.orange }}>sudah benar.</span>
        </h1>

        <p
          className="mt-5 max-w-[600px] text-[13px] leading-6 sm:text-sm"
          style={{ color: theme.secondary }}
        >
          Transaksi belum dibuat. Periksa detail berikut sebelum melanjutkan.
        </p>
      </div>

      {/* RECEIPT */}
      <div
        className="overflow-hidden rounded-xl border sm:rounded-2xl"
        style={{
          borderColor: theme.border,
          backgroundColor: "rgba(255,255,255,.3)",
        }}
      >
        <div className="p-5 sm:p-9">
          {/* RECEIPT HEADER */}
          <div className="mb-7 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <span
              className="text-[10px] font-extrabold uppercase tracking-[.16em]"
              style={{ color: theme.secondary }}
            >
              TRANSACTION SUMMARY
            </span>

            <span
              className="w-fit rounded-full px-3 py-1.5 text-[9px] font-extrabold tracking-[.05em]"
              style={{
                backgroundColor: isGuest
                  ? "rgba(200,90,40,.1)"
                  : "rgba(16,185,129,.1)",
                color: isGuest ? theme.orange : theme.green,
              }}
            >
              {isGuest ? "PAYMENT LINK" : "REGISTERED PEMBELI"}
            </span>
          </div>

          {/* PRODUCT */}
          <div className="border-b pb-7" style={{ borderColor: theme.border }}>
            <p
              className="text-[10px] font-extrabold tracking-[.14em]"
              style={{ color: theme.secondary }}
            >
              BARANG / JASA
            </p>

            <h2 className="mt-2 break-words text-xl font-extrabold leading-snug tracking-[-.03em] sm:text-3xl">
              {title}
            </h2>
          </div>

          {/* META */}
          <div className="grid sm:grid-cols-2">
            <SummaryItem
              label={isGuest ? "LAWAN TRANSAKSI" : "PEMBELI"}
              value={isGuest ? "Ditentukan setelah tautan dibuka" : buyerId}
              italic={isGuest}
            />

            <SummaryItem label="KONTAK" value={contact || "Tidak diberikan"} />

            <SummaryItem
              label="METODE"
              value={isGuest ? "Tautan pembayaran" : "AlidPay account"}
            />

            <SummaryItem label="STATUS" value="Menunggu pembayaran" />
          </div>

          {/* PRICE */}
          <div
            className="mt-2 border-t pt-6 sm:mt-3"
            style={{ borderColor: theme.border }}
          >
            <PriceRow label="Harga Barang" value={formatRupiah(amount)} />

            <div className="mt-3">
              <PriceRow
                label="Biaya Layanan AlidPay"
                value={`+ ${formatRupiah(fee)}`}
                muted
              />
            </div>

            <div
              className="my-5 h-px"
              style={{ backgroundColor: theme.border }}
            />

            <div className="flex items-end justify-between gap-4">
              <p
                className="max-w-[45%] text-[12px] font-bold leading-5 sm:text-sm"
                style={{ color: theme.ink }}
              >
                Total yang harus dibayar
              </p>

              <p
                className="text-right text-xl font-extrabold tracking-[-.03em] sm:text-2xl"
                style={{ color: theme.orange }}
              >
                {formatRupiah(amount + fee)}
              </p>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div
          className="border-t px-5 py-5 sm:px-9"
          style={{
            borderColor: theme.border,
            backgroundColor: "rgba(239,236,228,.45)",
          }}
        >
          <div className="flex gap-3">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0"
              style={{ color: theme.gold }}
            />

            <p
              className="text-[11px] leading-5 sm:text-xs"
              style={{ color: theme.secondary }}
            >
              {isGuest
                ? "Setelah dibuat, kamu akan mendapatkan tautan pembayaran yang bisa dikirim melalui WhatsApp, SMS, atau platform lainnya."
                : "Dana kamu disimpan aman terlebih dahulu dan transaksi dapat diselesaikan setelah kedua pihak mengonfirmasi."}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div
          className="flex flex-col gap-2.5 border-t p-4 sm:flex-row sm:justify-end sm:gap-3 sm:p-5"
          style={{
            borderColor: theme.border,
            backgroundColor: "rgba(239,236,228,.6)",
          }}
        >
          <button
            onClick={onBack}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-bold transition hover:bg-white disabled:opacity-50 sm:w-auto"
            style={{ borderColor: theme.border }}
          >
            <ArrowLeft size={16} />
            Edit
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto sm:min-w-[190px]"
            style={{ backgroundColor: theme.ink }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Membuat...
              </>
            ) : (
              <>
                {isGuest ? "Buat Tautan Pembayaran" : "Buat Transaksi"}
                <Check size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  italic = false,
}: {
  label: string;
  value: string;
  italic?: boolean;
}) {
  return (
    <div
      className="min-w-0 border-b px-0 py-5 sm:px-6 sm:py-6"
      style={{ borderColor: theme.border }}
    >
      <p
        className="text-[10px] font-extrabold tracking-[.14em]"
        style={{ color: theme.secondary }}
      >
        {label}
      </p>

      <p
        className={`mt-2 break-words text-[13px] font-bold sm:text-sm ${
          italic ? "italic opacity-70" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PriceRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p
        className="min-w-0 text-[12px] font-medium sm:text-[13px]"
        style={{
          color: muted ? theme.secondary : "rgba(24,23,21,.75)",
        }}
      >
        {label}
      </p>

      <p
        className="shrink-0 text-[13px] font-semibold sm:text-sm"
        style={{
          color: muted ? theme.secondary : theme.ink,
        }}
      >
        {value}
      </p>
    </div>
  );
}
/* =========================================================
   SUCCESS
========================================================= */

function SuccessTransaction({
  title,
  contact,
  amount,
  type,
  code,
  link,
  onCopy,
  onShare,
  onReset,
}: {
  title: string;
  contact: string;
  amount: number;
  type: TransactionType;
  code: string;
  link: string;
  onCopy: () => void;
  onShare: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-20">
      <div className="mb-10 text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor: "rgba(16,185,129,.1)",
            color: theme.green,
          }}
        >
          <CheckCircle2 size={32} />
        </div>

        <p
          className="text-xs font-extrabold uppercase tracking-[.16em]"
          style={{ color: theme.green }}
        >
          Transaction created
        </p>

        <h1 className="mt-4 text-[34px] font-extrabold leading-tight tracking-[-.05em] sm:text-5xl">
          Transaksi berhasil dibuat.
        </h1>

        <p
          className="mx-auto mt-4 max-w-[550px] text-sm leading-6"
          style={{ color: theme.secondary }}
        >
          {type === "tautan"
            ? "Tautan pembayaran sudah siap. Kirim kepada pembeli untuk melanjutkan transaksi."
            : "Transaksi berhasil dibuat dan sudah terhubung dengan pembeli."}
        </p>
      </div>

      <div
        className="overflow-hidden rounded-xl border sm:rounded-2xl"
        style={{
          borderColor: theme.border,
          backgroundColor: "rgba(255,255,255,.38)",
        }}
      >
        <div className="p-5 sm:p-9">
          <div className="mb-8 flex items-start justify-between gap-5">
            <div>
              <p
                className="text-[10px] font-extrabold tracking-[.15em]"
                style={{ color: theme.secondary }}
              >
                KODE TRANSAKSI
              </p>

              <p
                className="mt-2 break-all font-mono text-xl font-extrabold tracking-[.06em] sm:text-2xl sm:tracking-[.08em]"
                style={{ color: theme.gold }}
              >
                {code}
              </p>
            </div>

            <div
              className="rounded-full px-3 py-1.5 text-[10px] font-extrabold"
              style={{
                backgroundColor: "rgba(16,185,129,.1)",
                color: theme.green,
              }}
            >
              CREATED
            </div>
          </div>

          <div
            className="mb-6 rounded-xl border p-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.bg,
            }}
          >
            <p
              className="text-[10px] font-extrabold tracking-[.14em]"
              style={{ color: theme.secondary }}
            >
              TRANSACTION
            </p>

            <p className="mt-2 text-lg font-extrabold">{title}</p>

            <p className="mt-1 text-sm" style={{ color: theme.secondary }}>
              {contact || "Pembeli AlidPay"}
            </p>

            <p
              className="mt-5 text-2xl font-extrabold"
              style={{ color: theme.orange }}
            >
              {formatRupiah(amount)}
            </p>
          </div>

          <p
            className="mb-2 text-[10px] font-extrabold tracking-[.14em]"
            style={{ color: theme.secondary }}
          >
            PAYMENT LINK
          </p>

          <div
            className="flex min-w-0 items-center gap-2 rounded-lg border p-2.5 sm:gap-3 sm:p-3"
            style={{
              borderColor: theme.border,
              backgroundColor: "rgba(245,239,230,.65)",
            }}
          >
            <Link2
              size={17}
              className="shrink-0"
              style={{ color: theme.gold }}
            />

            <p className="min-w-0 flex-1 break-all text-[11px] font-semibold sm:truncate sm:text-sm">
              {link}
            </p>

            <button
              onClick={onCopy}
              className="shrink-0 rounded-md p-2 transition hover:bg-black/5"
              title="Copy link"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div
          className="grid border-t sm:grid-cols-2"
          style={{
            borderColor: theme.border,
          }}
        >
          <button
            onClick={onCopy}
            className="flex items-center justify-center gap-2 border-b px-5 py-4 text-sm font-extrabold transition hover:bg-white sm:border-b-0 sm:border-r"
            style={{ borderColor: theme.border }}
          >
            <Clipboard size={16} />
            Salin tautan
          </button>

          <button
            onClick={onShare}
            className="flex items-center justify-center gap-2 px-5 py-4 text-sm font-extrabold text-white transition hover:opacity-90"
            style={{ backgroundColor: theme.orange }}
          >
            <Send size={16} />
            Bagikan transaksi
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm font-bold transition hover:opacity-60"
        >
          <RefreshCw size={15} />
          Buat transaksi lain
        </button>

        {type === "tautan" && (
          <p
            className="flex items-center gap-2 text-xs"
            style={{ color: theme.secondary }}
          >
            <ShieldCheck size={14} style={{ color: theme.green }} />
            Pembeli akan diarahkan ke halaman pembayaran AlidPay.
          </p>
        )}
      </div>
    </div>
  );
}
