"use client";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Filter,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Wallet,
  X,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { useMemo, useState } from "react";

type TransactionStatus =
  | "paid"
  | "pending"
  | "processing"
  | "completed"
  | "disputed"
  | "refunded"
  | "cancelled";

type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

type Transaction = {
  id: string;
  product: string;
  buyer: {
    name: string;
    username: string;
  };
  seller: {
    name: string;
    username: string;
  };
  amount: number;
  platformFee: number;
  sellerAmount: number;
  status: TransactionStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
  disputeId?: string;
};

const transactions: Transaction[] = [
  {
    id: "01M06VP3WR",
    product: "Akun Game 2 Juta",
    buyer: {
      name: "Auridia",
      username: "@ALID-ZMY655P4",
    },
    seller: {
      name: "Ulyara",
      username: "@ALID-PBNJCWDD",
    },
    amount: 2400000,
    platformFee: 48000,
    sellerAmount: 2352000,
    status: "disputed",
    paymentStatus: "paid",
    paymentMethod: "QRIS",
    createdAt: "5 menit lalu",
    disputeId: "DSP-001",
  },
  {
    id: "01M06K9X2A",
    product: "iPhone 13 Pro 128GB",
    buyer: {
      name: "Rizky",
      username: "@ALID-RZK892KD",
    },
    seller: {
      name: "Fahmi Store",
      username: "@ALID-FHM332LA",
    },
    amount: 7800000,
    platformFee: 156000,
    sellerAmount: 7644000,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    createdAt: "32 menit lalu",
  },
  {
    id: "01M05Q8W1P",
    product: "Jasa Boost Rank",
    buyer: {
      name: "Kevin",
      username: "@ALID-KVN827HD",
    },
    seller: {
      name: "Raka",
      username: "@ALID-RKA228DD",
    },
    amount: 350000,
    platformFee: 7000,
    sellerAmount: 343000,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "QRIS",
    createdAt: "1 jam lalu",
  },
  {
    id: "01M04P2Q8X",
    product: "MacBook Air M1",
    buyer: {
      name: "Dimas",
      username: "@ALID-DMS821KA",
    },
    seller: {
      name: "TechHub",
      username: "@ALID-TCH981LP",
    },
    amount: 9200000,
    platformFee: 184000,
    sellerAmount: 9016000,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    createdAt: "Kemarin",
    completedAt: "Kemarin",
  },
  {
    id: "01M03X7A2B",
    product: "Steam Account",
    buyer: {
      name: "Bagas",
      username: "@ALID-BGS778QA",
    },
    seller: {
      name: "GameVault",
      username: "@ALID-GMV221PL",
    },
    amount: 1250000,
    platformFee: 25000,
    sellerAmount: 1225000,
    status: "refunded",
    paymentStatus: "refunded",
    paymentMethod: "E-Wallet",
    createdAt: "Kemarin",
  },
  {
    id: "01M03K2P9C",
    product: "PlayStation 5 Slim",
    buyer: {
      name: "Andi",
      username: "@ALID-AND291KD",
    },
    seller: {
      name: "ConsoleHub",
      username: "@ALID-CNH812LA",
    },
    amount: 8750000,
    platformFee: 175000,
    sellerAmount: 8575000,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "QRIS",
    createdAt: "2 hari lalu",
    completedAt: "2 hari lalu",
  },
  {
    id: "01M02XA91L",
    product: "Mechanical Keyboard",
    buyer: {
      name: "Fajar",
      username: "@ALID-FJR219KD",
    },
    seller: {
      name: "Keyboard Store",
      username: "@ALID-KBD882PL",
    },
    amount: 1450000,
    platformFee: 29000,
    sellerAmount: 1421000,
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "E-Wallet",
    createdAt: "2 hari lalu",
  },
  {
    id: "01M01PQ82M",
    product: "Laptop Lenovo ThinkPad",
    buyer: {
      name: "Rian",
      username: "@ALID-RAN812KA",
    },
    seller: {
      name: "Laptop Center",
      username: "@ALID-LPC721QA",
    },
    amount: 4300000,
    platformFee: 86000,
    sellerAmount: 4214000,
    status: "cancelled",
    paymentStatus: "failed",
    paymentMethod: "Bank Transfer",
    createdAt: "3 hari lalu",
  },
];

const statusConfig: Record<
  TransactionStatus,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  paid: {
    label: "Paid",
    className: "bg-blue-50 text-blue-700 ring-blue-100",
    dot: "bg-blue-500",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
    dot: "bg-amber-500",
  },
  processing: {
    label: "Processing",
    className: "bg-violet-50 text-violet-700 ring-violet-100",
    dot: "bg-violet-500",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    dot: "bg-emerald-500",
  },
  disputed: {
    label: "Disputed",
    className: "bg-red-50 text-red-700 ring-red-100",
    dot: "bg-red-500",
  },
  refunded: {
    label: "Refunded",
    className: "bg-orange-50 text-orange-700 ring-orange-100",
    dot: "bg-orange-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500 ring-slate-200",
    dot: "bg-slate-400",
  },
};

const paymentConfig: Record<
  PaymentStatus,
  {
    label: string;
    className: string;
  }
> = {
  paid: {
    label: "Paid",
    className: "text-emerald-600",
  },
  pending: {
    label: "Pending",
    className: "text-amber-600",
  },
  failed: {
    label: "Failed",
    className: "text-red-600",
  },
  refunded: {
    label: "Refunded",
    className: "text-orange-600",
  },
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold ring-1 ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function PaymentStatus({ status }: { status: PaymentStatus }) {
  const config = paymentConfig[status];

  return (
    <span className={`text-[10px] font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<"all" | TransactionStatus>("all");

  const [paymentStatus, setPaymentStatus] = useState<"all" | PaymentStatus>(
    "all",
  );

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    const keyword = search.toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.id.toLowerCase().includes(keyword) ||
        transaction.product.toLowerCase().includes(keyword) ||
        transaction.buyer.name.toLowerCase().includes(keyword) ||
        transaction.seller.name.toLowerCase().includes(keyword);

      const matchesStatus = status === "all" || transaction.status === status;

      const matchesPayment =
        paymentStatus === "all" || transaction.paymentStatus === paymentStatus;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [search, status, paymentStatus]);

  const totalVolume = transactions.reduce((sum, item) => sum + item.amount, 0);

  const escrowAmount = transactions
    .filter(
      (item) =>
        item.status === "paid" ||
        item.status === "processing" ||
        item.status === "disputed",
    )
    .reduce((sum, item) => sum + item.amount, 0);

  const successfulTransactions = transactions.filter(
    (item) => item.status === "completed",
  ).length;

  const disputedTransactions = transactions.filter(
    (item) => item.status === "disputed",
  ).length;

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#172033]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B1E2C] text-white shadow-sm">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h1 className="text-[15px] font-extrabold tracking-tight">
                AlidPay
              </h1>

              <p className="text-[11px] font-medium text-slate-400">
                Transaction Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">
              <AlertTriangle size={18} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2E7E9] text-sm font-bold text-[#6B1E2C]">
                A
              </div>

              <div className="leading-tight">
                <p className="text-xs font-bold">Administrator</p>
                <p className="text-[10px] text-slate-400">AlidPay Team</p>
              </div>

              <ChevronDown size={15} className="text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-8">
        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Dashboard</span>
              <ChevronRight size={13} />
              <span className="font-semibold text-[#6B1E2C]">Transactions</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight">
              Transaction Center
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Pantau seluruh transaksi AlidPay, status pembayaran, dana escrow,
              dan transaksi yang membutuhkan perhatian admin.
            </p>
          </div>

          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6B1E2C] px-5 text-sm font-bold text-white shadow-lg shadow-[#6B1E2C]/15 transition hover:-translate-y-0.5 hover:bg-[#581824]">
            <Filter size={16} />
            Export Transactions
          </button>
        </div>

        {/* STATS */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* TOTAL */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2E7E9] text-[#6B1E2C]">
                <CreditCard size={19} />
              </div>

              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <ArrowUp size={12} />
                18.4%
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Total Transactions
            </p>

            <h3 className="mt-1 text-2xl font-black">{transactions.length}</h3>

            <p className="mt-2 text-[11px] text-slate-400">
              Semua transaksi tercatat
            </p>
          </div>

          {/* VOLUME */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Wallet size={19} />
              </div>

              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <ArrowUp size={12} />
                11.2%
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Transaction Volume
            </p>

            <h3 className="mt-1 text-xl font-black">
              {formatRupiah(totalVolume)}
            </h3>

            <p className="mt-2 text-[11px] text-slate-400">
              Total nilai transaksi
            </p>
          </div>

          {/* SUCCESS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={19} />
              </div>

              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <ArrowUp size={12} />
                8.6%
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">Completed</p>

            <h3 className="mt-1 text-2xl font-black">
              {successfulTransactions}
            </h3>

            <p className="mt-2 text-[11px] text-slate-400">
              Transaksi berhasil diselesaikan
            </p>
          </div>

          {/* ESCROW */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ShieldCheck size={19} />
              </div>

              <span className="text-[11px] font-bold text-slate-400">
                Escrow
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Funds in Escrow
            </p>

            <h3 className="mt-1 text-xl font-black">
              {formatRupiah(escrowAmount)}
            </h3>

            <p className="mt-2 text-[11px] text-slate-400">
              Dana yang masih dilindungi
            </p>
          </div>
        </section>

        {/* QUICK ALERT */}
        {disputedTransactions > 0 && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={18} />
              </div>

              <div>
                <p className="text-xs font-extrabold text-red-800">
                  {disputedTransactions} transaksi membutuhkan perhatian
                </p>

                <p className="mt-1 text-[11px] leading-5 text-red-600">
                  Beberapa transaksi sedang dalam proses dispute. Pastikan
                  mediator segera melakukan investigasi.
                </p>
              </div>
            </div>

            <button className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-white px-4 text-[11px] font-bold text-red-700 shadow-sm ring-1 ring-red-100 transition hover:bg-red-50">
              View Disputes
              <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* TABLE CARD */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* FILTER HEADER */}
          <div className="border-b border-slate-100 p-5 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-base font-extrabold">All Transactions</h3>

                <p className="mt-1 text-xs text-slate-400">
                  Menampilkan {filteredTransactions.length} dari{" "}
                  {transactions.length} transaksi
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {/* SEARCH */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari transaksi..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs font-medium outline-none transition placeholder:text-slate-400 focus:border-[#6B1E2C] focus:bg-white sm:w-[220px]"
                  />

                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* STATUS */}
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "all" | TransactionStatus)
                    }
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-xs font-semibold outline-none focus:border-[#6B1E2C]"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="disputed">Disputed</option>
                    <option value="refunded">Refunded</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* PAYMENT */}
                <div className="relative">
                  <select
                    value={paymentStatus}
                    onChange={(e) =>
                      setPaymentStatus(e.target.value as "all" | PaymentStatus)
                    }
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-xs font-semibold outline-none focus:border-[#6B1E2C]"
                  >
                    <option value="all">Payment Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                  <SlidersHorizontal size={15} />
                  More
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Transaction
                  </th>

                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Parties
                  </th>

                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="group transition hover:bg-[#FCFAFA]"
                  >
                    {/* TRANSACTION */}
                    <td className="px-6 py-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs font-extrabold text-[#172033]">
                            {transaction.id}
                          </p>

                          {transaction.disputeId && (
                            <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[8px] font-bold text-red-600">
                              DISPUTE
                            </span>
                          )}
                        </div>

                        <p className="mt-1 max-w-[220px] truncate text-xs font-semibold text-slate-600">
                          {transaction.product}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {transaction.createdAt}
                        </p>
                      </div>
                    </td>

                    {/* PARTIES */}
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2E7E9] text-[9px] font-bold text-[#6B1E2C]">
                          {transaction.buyer.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-bold text-slate-600">
                          {transaction.seller.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="ml-2">
                          <p className="text-[11px] font-bold text-slate-700">
                            {transaction.buyer.name}
                          </p>

                          <p className="mt-0.5 text-[9px] text-slate-400">
                            → {transaction.seller.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* AMOUNT */}
                    <td className="px-6 py-5">
                      <p className="text-xs font-extrabold text-slate-700">
                        {formatRupiah(transaction.amount)}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Fee: {formatRupiah(transaction.platformFee)}
                      </p>
                    </td>

                    {/* PAYMENT */}
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-700">
                        {transaction.paymentMethod}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            transaction.paymentStatus === "paid"
                              ? "bg-emerald-500"
                              : transaction.paymentStatus === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                        />

                        <PaymentStatus status={transaction.paymentStatus} />
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      <StatusBadge status={transaction.status} />
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-slate-600 transition hover:border-[#6B1E2C]/20 hover:bg-[#FDF7F8] hover:text-[#6B1E2C]"
                      >
                        View
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Search size={20} />
                      </div>

                      <p className="mt-4 text-sm font-bold">
                        Transaksi tidak ditemukan
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Coba ubah kata pencarian atau filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row">
            <p className="text-[11px] text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-600">
                1–{filteredTransactions.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-600">
                {filteredTransactions.length}
              </span>{" "}
              transactions
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
              >
                ‹
              </button>

              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6B1E2C] text-xs font-bold text-white">
                1
              </button>

              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                2
              </button>

              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                3
              </button>

              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                ›
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* DETAIL DRAWER */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
            onClick={() => setSelectedTransaction(null)}
          />

          <aside className="relative h-full w-full max-w-[540px] overflow-y-auto bg-white shadow-2xl">
            {/* DRAWER HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="font-mono text-[10px] font-bold text-[#6B1E2C]">
                  {selectedTransaction.id}
                </p>

                <h3 className="mt-1 text-lg font-black">Transaction Details</h3>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* STATUS */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Transaction
                    </p>

                    <h4 className="mt-2 text-sm font-extrabold">
                      {selectedTransaction.product}
                    </h4>

                    <p className="mt-1 font-mono text-[10px] text-slate-400">
                      {selectedTransaction.id}
                    </p>
                  </div>

                  <StatusBadge status={selectedTransaction.status} />
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Transaction Amount
                  </p>

                  <p className="mt-1 text-2xl font-black text-[#6B1E2C]">
                    {formatRupiah(selectedTransaction.amount)}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Platform Fee</span>

                    <span className="font-bold text-slate-600">
                      {formatRupiah(selectedTransaction.platformFee)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Seller Receives</span>

                    <span className="font-bold text-emerald-600">
                      {formatRupiah(selectedTransaction.sellerAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PAYMENT */}
              <div>
                <p className="mb-3 text-xs font-extrabold">
                  Payment Information
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Method
                    </p>

                    <p className="mt-2 text-xs font-extrabold">
                      {selectedTransaction.paymentMethod}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Payment
                    </p>

                    <div className="mt-2">
                      <PaymentStatus
                        status={selectedTransaction.paymentStatus}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PARTIES */}
              <div>
                <p className="mb-3 text-xs font-extrabold">Parties</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2E7E9] text-sm font-bold text-[#6B1E2C]">
                      {selectedTransaction.buyer.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Buyer
                      </p>

                      <p className="mt-1 text-xs font-extrabold">
                        {selectedTransaction.buyer.name}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {selectedTransaction.buyer.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {selectedTransaction.seller.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Seller
                      </p>

                      <p className="mt-1 text-xs font-extrabold">
                        {selectedTransaction.seller.name}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {selectedTransaction.seller.username}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ESCROW */}
              <div>
                <p className="mb-3 text-xs font-extrabold">Escrow Status</p>

                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <ShieldCheck size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-amber-800">
                        {selectedTransaction.status === "completed"
                          ? "Funds Released"
                          : selectedTransaction.status === "disputed"
                            ? "Funds Frozen"
                            : "Funds Protected"}
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-amber-700">
                        Dana transaksi berada dalam sistem escrow AlidPay sampai
                        kondisi transaksi terpenuhi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              <div>
                <p className="mb-4 text-xs font-extrabold">
                  Transaction Timeline
                </p>

                <div className="space-y-5">
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={12} />
                    </div>

                    <div>
                      <p className="text-xs font-bold">Transaction Created</p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Transaksi dibuat oleh buyer.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={12} />
                    </div>

                    <div>
                      <p className="text-xs font-bold">Payment Confirmed</p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Pembayaran berhasil diverifikasi.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <Clock3 size={12} />
                    </div>

                    <div>
                      <p className="text-xs font-bold">Escrow Protection</p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Dana diamankan oleh AlidPay.
                      </p>
                    </div>
                  </div>

                  {selectedTransaction.status === "disputed" && (
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertTriangle size={12} />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-red-700">
                          Dispute Opened
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Sengketa telah dibuka oleh salah satu pihak.
                        </p>

                        {selectedTransaction.disputeId && (
                          <p className="mt-1 font-mono text-[10px] font-bold text-[#6B1E2C]">
                            {selectedTransaction.disputeId}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTransaction.status === "completed" && (
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 size={12} />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-emerald-700">
                          Transaction Completed
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Dana telah dilepas kepada seller.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="border-t border-slate-100 pt-6">
                <p className="mb-3 text-xs font-extrabold">Admin Actions</p>

                <div className="space-y-2">
                  {selectedTransaction.status === "disputed" && (
                    <button className="flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 transition hover:bg-red-100">
                      Open Dispute
                      <ChevronRight size={15} />
                    </button>
                  )}

                  <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <RefreshCcw size={14} />
                      View Payment Log
                    </span>

                    <ChevronRight size={15} />
                  </button>

                  <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <UserRound size={14} />
                      View Buyer & Seller
                    </span>

                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
