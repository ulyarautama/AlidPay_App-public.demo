"use client";

import { api } from "@/app/lib/axios";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Clock3,
  Filter,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type DisputeStatus = "open" | "investigating" | "waiting" | "resolved";

type ApiDispute = {
  id: number;
  transaction_id: string;
  opened_by: string;
  category: string;
  issue_type: string;
  description: string;
  requested_resolution: string;
  evidence_files: EvidenceFile[];
  difficulty: "easy" | "moderate" | "hard" | "critical";
  difficulty_score: number;
  difficulty_reasons: DifficultyReason[];
  status: string;
  created_at: string;
  updated_at: string;

  transaction?: {
    id: string;
    judul_barang?: string;
    nominal?: number;
    transaction_date?: string;
    buyer?: ApiUser | null;
    seller?: ApiUser | null;
  };

  opened_by_user?: ApiUser;
};

type ApiUser = {
  id: string;
  name: string;
  public_id?: string;
};

type EvidenceFile = {
  file_id: string;
  name: string;
  url: string;
  thumbnail_url?: string | null;
  size: number;
  mime_type?: string | null;
};

type DifficultyReason =
  | string
  | {
      factor: string;
      label: string;
      points: number;
    };

type Dispute = {
  rawId: number;
  id: string;
  transactionId: string;

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

  category: string;
  issueType: string;
  description: string;
  requestedResolution: string;
  evidenceFiles: EvidenceFile[];

  status: DisputeStatus;

  difficulty: "easy" | "moderate" | "hard" | "critical";
  difficultyScore: number;
  difficultyReasons: DifficultyReason[];

  createdAt: string;
};

const statusConfig: Record<
  DisputeStatus,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  open: {
    label: "Open",
    className: "bg-red-50 text-red-700 ring-red-100",
    dot: "bg-red-500",
  },
  investigating: {
    label: "Investigating",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
    dot: "bg-amber-500",
  },
  waiting: {
    label: "Waiting",
    className: "bg-blue-50 text-blue-700 ring-blue-100",
    dot: "bg-blue-500",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    dot: "bg-emerald-500",
  },
};

const difficultyConfig = {
  easy: {
    label: "Easy",
    className: "text-emerald-700 bg-emerald-50",
  },
  moderate: {
    label: "Moderate",
    className: "text-blue-700 bg-blue-50",
  },
  hard: {
    label: "Hard",
    className: "text-amber-700 bg-amber-50",
  },
  critical: {
    label: "Critical",
    className: "text-red-700 bg-red-50",
  },
};

const categoryLabels: Record<string, string> = {
  barang_jasa: "Barang / Jasa",
  pihak_transaksi: "Pihak Transaksi",
  aktivitas_mencurigakan: "Aktivitas Mencurigakan",
  lainnya: "Lainnya",
};

const resolutionLabels: Record<string, string> = {
  refund: "Refund dana kepada pembeli",
  release_seller: "Lepaskan dana kepada penjual",
  resolve_transaction: "Selesaikan transaksi",
  mediator_decision: "Keputusan mediator",
};

function humanize(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ status }: { status: DisputeStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty: Dispute["difficulty"];
}) {
  const config = difficultyConfig[difficulty];

  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function DisputesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | DisputeStatus>("all");
  const [difficulty, setDifficulty] = useState<"all" | Dispute["difficulty"]>(
    "all",
  );
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputes, setDisputes] = useState<ApiDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolving, setResolving] = useState<
    "refund_buyer" | "release_seller" | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function getDisputes(): Promise<ApiDispute[]> {
    const res = await api.get(`/api/admin/disputes`);

    return res.data?.data ?? res.data ?? [];
  }

  const mappedDisputes: Dispute[] = disputes.map((dispute) => ({
    rawId: dispute.id,
    id: `DSP-${String(dispute.id).padStart(3, "0")}`,

    transactionId: dispute.transaction_id,

    product: dispute.transaction?.judul_barang ?? "Transaksi",

    buyer: {
      name: dispute.transaction?.buyer?.name ?? "Buyer tidak tersedia",
      username: dispute.transaction?.buyer?.public_id ?? "-",
    },

    seller: {
      name: dispute.transaction?.seller?.name ?? "Seller tidak tersedia",
      username: dispute.transaction?.seller?.public_id ?? "-",
    },

    amount: Number(dispute.transaction?.nominal ?? 0),

    category: categoryLabels[dispute.category] ?? humanize(dispute.category),
    issueType: humanize(dispute.issue_type),
    description: dispute.description,
    requestedResolution:
      resolutionLabels[dispute.requested_resolution] ??
      humanize(dispute.requested_resolution),
    evidenceFiles: dispute.evidence_files ?? [],

    status: (["open", "investigating", "waiting", "resolved"].includes(
      dispute.status,
    )
      ? dispute.status
      : "open") as DisputeStatus,

    difficulty: (["easy", "moderate", "hard", "critical"].includes(
      dispute.difficulty,
    )
      ? dispute.difficulty
      : "moderate") as Dispute["difficulty"],
    difficultyScore: Number(dispute.difficulty_score ?? 0),
    difficultyReasons: dispute.difficulty_reasons ?? [],

    createdAt: new Date(dispute.created_at).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  }));

  async function resolveDispute(
    resolution: "refund_buyer" | "release_seller",
  ) {
    if (!selectedDispute || resolutionNotes.trim().length < 10) {
      setActionError("Catatan keputusan minimal 10 karakter.");
      return;
    }

    const destination =
      resolution === "refund_buyer" ? "buyer" : "seller";
    if (
      !window.confirm(
        `Konfirmasi perpindahan ${formatRupiah(selectedDispute.amount)} ke ${destination}? Tindakan ini tidak dapat diulang.`,
      )
    ) {
      return;
    }

    try {
      setResolving(resolution);
      setActionError(null);
      const response = await api.post(
        `/api/admin/disputes/${selectedDispute.rawId}/resolve`,
        { resolution, notes: resolutionNotes.trim() },
      );
      const updated = response.data?.data ?? response.data;
      setDisputes((current) =>
        current.map((item) =>
          item.id === selectedDispute.rawId ? updated : item,
        ),
      );
      setSelectedDispute(null);
      setResolutionNotes("");
    } catch (caught) {
      const message =
        typeof caught === "object" &&
        caught !== null &&
        "response" in caught
          ? (caught as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setActionError(message ?? "Keputusan gagal diproses.");
    } finally {
      setResolving(null);
    }
  }

  const filteredDisputes = useMemo(() => {
    const keyword = search.toLowerCase();

    return mappedDisputes.filter((dispute) => {
      const matchesSearch =
        dispute.id.toLowerCase().includes(keyword) ||
        dispute.transactionId.toLowerCase().includes(keyword) ||
        dispute.product.toLowerCase().includes(keyword) ||
        dispute.category.toLowerCase().includes(keyword) ||
        dispute.issueType.toLowerCase().includes(keyword) ||
        dispute.description.toLowerCase().includes(keyword) ||
        dispute.buyer.name.toLowerCase().includes(keyword) ||
        dispute.seller.name.toLowerCase().includes(keyword);

      const matchesStatus = status === "all" || dispute.status === status;

      const matchesDifficulty =
        difficulty === "all" || dispute.difficulty === difficulty;

      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  }, [mappedDisputes, search, status, difficulty]);

  const totalAmount = mappedDisputes
    .filter((item) => item.status !== "resolved")
    .reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    let mounted = true;

    async function loadDisputes() {
      try {
        setLoading(true);
        setError(null);

        const data = await getDisputes();

        if (mounted) {
          setDisputes(data);
        }
      } catch (error) {
        console.error(error);

        if (mounted) {
          setError("Gagal memuat data dispute.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDisputes();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#172033]">
      {/* TOP HEADER */}
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
                Dispute Center
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
                M
              </div>

              <div className="leading-tight">
                <p className="text-xs font-bold">Mediator</p>
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
              <span className="font-semibold text-[#6B1E2C]">Disputes</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-[#172033]">
              Dispute Center
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Pantau, investigasi, dan selesaikan sengketa transaksi yang sedang
              ditangani mediator AlidPay.
            </p>
          </div>

          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6B1E2C] px-5 text-sm font-bold text-white shadow-lg shadow-[#6B1E2C]/15 transition hover:-translate-y-0.5 hover:bg-[#581824]">
            <Filter size={16} />
            Export Report
          </button>
        </div>

        {/* STAT CARDS */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={19} />
              </div>

              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <ArrowUp size={12} />
                12%
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Active Disputes
            </p>

            <h3 className="mt-1 text-2xl font-black">12</h3>

            <p className="mt-2 text-[11px] text-slate-400">
              Sengketa yang membutuhkan perhatian
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 size={19} />
              </div>

              <span className="flex items-center gap-1 text-[11px] font-bold text-red-600">
                <ArrowUp size={12} />
                4%
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Under Investigation
            </p>

            <h3 className="mt-1 text-2xl font-black">7</h3>

            <p className="mt-2 text-[11px] text-slate-400">
              Sedang diperiksa mediator
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserRound size={19} />
              </div>

              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <ArrowDown size={12} />
                8%
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Waiting Response
            </p>

            <h3 className="mt-1 text-2xl font-black">3</h3>

            <p className="mt-2 text-[11px] text-slate-400">
              Menunggu bukti dari pihak terkait
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet size={19} />
              </div>

              <span className="text-[11px] font-bold text-slate-400">
                Escrow
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Funds at Risk
            </p>

            <h3 className="mt-1 text-xl font-black">
              {formatRupiah(totalAmount)}
            </h3>

            <p className="mt-2 text-[11px] text-slate-400">
              Dana transaksi sengketa aktif
            </p>
          </div>
        </section>

        {/* MAIN CARD */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* FILTER HEADER */}
          <div className="border-b border-slate-100 p-5 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-base font-extrabold">Active Disputes</h3>

                <p className="mt-1 text-xs text-slate-400">
                  Menampilkan {filteredDisputes.length} dari {disputes.length}{" "}
                  dispute
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
                    placeholder="Cari dispute..."
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
                      setStatus(e.target.value as "all" | DisputeStatus)
                    }
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-xs font-semibold outline-none focus:border-[#6B1E2C]"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="waiting">Waiting</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* DIFFICULTY */}
                <div className="relative">
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value as "all" | Dispute["difficulty"],
                      )
                    }
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-xs font-semibold outline-none focus:border-[#6B1E2C]"
                  >
                    <option value="all">All Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                    <option value="critical">Critical</option>
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

          {loading && (
            <div className="flex items-center justify-center px-6 py-20">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#6B1E2C]" />

                <p className="text-sm font-semibold text-slate-500">
                  Memuat dispute...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-6 my-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Dispute
                  </th>

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
                    Difficulty
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
                {filteredDisputes.map((dispute) => (
                  <tr
                    key={dispute.id}
                    className="group transition hover:bg-[#FCFAFA]"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-extrabold text-[#172033]">
                            {dispute.id}
                          </p>

                          {dispute.difficulty === "critical" && (
                            <span
                              title="Critical dispute"
                              className="h-1.5 w-1.5 rounded-full bg-red-500"
                            />
                          )}
                        </div>

                        <p className="mt-1 max-w-[190px] truncate text-xs font-semibold text-slate-500">
                          {dispute.issueType}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {dispute.category} · {dispute.createdAt}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {dispute.product}
                        </p>

                        <p className="mt-1 font-mono text-[10px] text-slate-400">
                          {dispute.transactionId}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2E7E9] text-[9px] font-bold text-[#6B1E2C]">
                          {dispute.buyer.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-bold text-slate-600">
                          {dispute.seller.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="ml-2">
                          <p className="text-[11px] font-bold text-slate-700">
                            {dispute.buyer.name}
                            <span className="mx-1 font-normal text-slate-300">
                              ↔
                            </span>
                            {dispute.seller.name}
                          </p>

                          <p className="mt-0.5 text-[9px] text-slate-400">
                            Buyer vs Seller
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-xs font-extrabold text-slate-700">
                        {formatRupiah(dispute.amount)}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Escrow protected
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <DifficultyBadge difficulty={dispute.difficulty} />
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge status={dispute.status} />
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setResolutionNotes("");
                          setActionError(null);
                        }}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-slate-600 transition hover:border-[#6B1E2C]/20 hover:bg-[#FDF7F8] hover:text-[#6B1E2C]"
                      >
                        Review
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredDisputes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Search size={20} />
                      </div>

                      <p className="mt-4 text-sm font-bold">
                        Tidak ada dispute ditemukan
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
                1–{filteredDisputes.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-600">
                {filteredDisputes.length}
              </span>{" "}
              disputes
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

      {/* REVIEW DRAWER */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
            onClick={() => setSelectedDispute(null)}
          />

          <aside className="relative h-full w-full max-w-[520px] overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="font-mono text-[10px] font-bold text-[#6B1E2C]">
                  {selectedDispute.id}
                </p>

                <h3 className="mt-1 text-lg font-black">Review Dispute</h3>
              </div>

              <button
                onClick={() => setSelectedDispute(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* TRANSACTION */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Transaction
                    </p>

                    <h4 className="mt-2 text-sm font-extrabold">
                      {selectedDispute.product}
                    </h4>

                    <p className="mt-1 font-mono text-[10px] text-slate-400">
                      {selectedDispute.transactionId}
                    </p>
                  </div>

                  <StatusBadge status={selectedDispute.status} />
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Escrow Amount
                  </p>

                  <p className="mt-1 text-xl font-black text-[#6B1E2C]">
                    {formatRupiah(selectedDispute.amount)}
                  </p>
                </div>
              </div>

              {/* PARTIES */}
              <div>
                <p className="mb-3 text-xs font-extrabold">Parties Involved</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Buyer
                    </p>

                    <p className="mt-2 text-xs font-extrabold">
                      {selectedDispute.buyer.name}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {selectedDispute.buyer.username}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Seller
                    </p>

                    <p className="mt-2 text-xs font-extrabold">
                      {selectedDispute.seller.name}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {selectedDispute.seller.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* DISPUTE DETAILS */}
              <div>
                <p className="mb-3 text-xs font-extrabold">Detail Pengajuan</p>

                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Kategori
                    </p>
                    <p className="mt-2 text-xs font-extrabold">
                      {selectedDispute.category}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Jenis Masalah
                    </p>
                    <p className="mt-2 text-xs font-extrabold">
                      {selectedDispute.issueType}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-400">
                    Kronologi
                  </p>
                  <p className="text-xs leading-6 text-slate-600">
                    {selectedDispute.description}
                  </p>
                </div>

                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Penyelesaian yang diminta
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-700">
                    {selectedDispute.requestedResolution}
                  </p>
                </div>
              </div>

              {/* EVIDENCE */}
              <div>
                <p className="mb-3 text-xs font-extrabold">
                  Bukti Pendukung ({selectedDispute.evidenceFiles.length})
                </p>

                {selectedDispute.evidenceFiles.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedDispute.evidenceFiles.map((file) => (
                      <a
                        key={file.file_id}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <Image
                          src={file.thumbnail_url ?? file.url}
                          alt={file.name}
                          width={240}
                          height={160}
                          className="h-28 w-full object-cover transition group-hover:scale-[1.02]"
                        />
                        <div className="p-3">
                          <p className="truncate text-[11px] font-bold text-slate-600">
                            {file.name}
                          </p>
                          <p className="mt-1 text-[9px] text-slate-400">
                            {(file.size / 1024).toFixed(0)} KB · Buka gambar
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400">
                    Tidak ada bukti yang dilampirkan.
                  </div>
                )}
              </div>

              {/* DIFFICULTY BREAKDOWN */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-extrabold">Difficulty calculation</p>
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={selectedDispute.difficulty} />
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">
                      {selectedDispute.difficultyScore} pts
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  {selectedDispute.difficultyReasons.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedDispute.difficultyReasons.map((reason, index) => (
                        <li
                          key={typeof reason === "string" ? reason : `${reason.factor}-${index}`}
                          className="flex items-center justify-between text-[10px]"
                        >
                          <span className="text-slate-500">
                            {typeof reason === "string" ? reason : reason.label}
                          </span>
                          <span className="font-bold text-[#6B1E2C]">
                            {typeof reason === "string" ? "included" : `+${reason.points}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[10px] text-slate-400">
                      Tidak ada faktor tambahan pada dispute ini.
                    </p>
                  )}
                  <div className="mt-3 border-t border-slate-200 pt-3 text-[9px] leading-4 text-slate-400">
                    Easy 0–3 · Moderate 4–6 · Hard 7–9 · Critical 10+
                  </div>
                </div>
              </div>

              {/* ACTION */}
              <div className="border-t border-slate-100">
                <p className="mb-3 text-xs font-extrabold">Mediator Action</p>

                <div className="space-y-2">
                  <textarea
                    value={resolutionNotes}
                    onChange={(event) => setResolutionNotes(event.target.value)}
                    placeholder="Catatan keputusan mediator (wajib, minimal 10 karakter)..."
                    className="min-h-24 w-full resize-none rounded-xl border border-slate-200 p-3 text-xs leading-5 outline-none placeholder:text-slate-300 focus:border-[#6B1E2C]"
                  />

                  {actionError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600">
                      {actionError}
                    </p>
                  )}

                  <button
                    disabled={selectedDispute.status === "resolved" || resolving !== null}
                    onClick={() => resolveDispute("refund_buyer")}
                    className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resolving === "refund_buyer"
                      ? "Processing refund..."
                      : "Refund to Buyer"}
                    <ChevronRight size={15} />
                  </button>

                  <button
                    disabled={selectedDispute.status === "resolved" || resolving !== null}
                    onClick={() => resolveDispute("release_seller")}
                    className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resolving === "release_seller"
                      ? "Releasing funds..."
                      : "Release to Seller"}
                    <ChevronRight size={15} />
                  </button>

                  <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                    Request More Evidence
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
