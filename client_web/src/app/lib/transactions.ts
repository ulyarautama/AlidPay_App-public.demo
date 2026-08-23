import { api } from "./axios";

export type TransactionStatus =
  | "draft_link"
  | "menunggu_konfirmasi"
  | "menunggu_pembayaran"
  | "dana_ditahan"
  | "barang_dikirim"
  | "dana_dicairkan"
  | "sengketa"
  | "dibatalkan";

export type TransactionUser = {
  id: string;
  name: string;
  public_id: string;
  role: "pembeli" | "penjual";
};

export type AlidPayTransaction = {
  id: string;
  buyer_id: string | null;
  seller_id: string | null;
  created_by: string;
  judul_barang: string;
  nominal: number;
  fee: number;
  kontak_penjual?: string | null;
  kontak_pembeli?: string | null;
  share_code: string | null;
  status: TransactionStatus;
  type: "normal" | "tautan";
  is_seen_by_buyer: boolean;
  is_seen_by_seller: boolean;
  created_at: string;
  updated_at: string;
  buyer?: TransactionUser | null;
  seller?: TransactionUser | null;
  creator?: TransactionUser | null;
  required_role?: "pembeli" | "penjual";
  dispute?: {
    id: number;
    status: string;
    resolution: "refund_buyer" | "release_seller" | null;
    resolution_notes: string | null;
    resolved_at: string | null;
  } | null;
};

export const transactionStatuses: Record<
  TransactionStatus,
  { label: string; short: string; tone: string; dot: string }
> = {
  draft_link: {
    label: "Menunggu pihak kedua bergabung",
    short: "Draft Tautan",
    tone: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  menunggu_konfirmasi: {
    label: "Menunggu konfirmasi transaksi",
    short: "Menunggu Konfirmasi",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  menunggu_pembayaran: {
    label: "Menunggu pembayaran pembeli",
    short: "Menunggu Pembayaran",
    tone: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  dana_ditahan: {
    label: "Dana aman di escrow AlidPay",
    short: "Dana Diamankan",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  barang_dikirim: {
    label: "Barang dikirim, menunggu pembeli",
    short: "Barang Dikirim",
    tone: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  dana_dicairkan: {
    label: "Transaksi selesai dan dana dicairkan",
    short: "Selesai",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  sengketa: {
    label: "Dispute sedang ditinjau pihak AlidPay",
    short: "Sedang Ditinjau",
    tone: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  dibatalkan: {
    label: "Transaksi dibatalkan",
    short: "Dibatalkan",
    tone: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

export const transactionTimeline = [
  "Konfirmasi transaksi",
  "Pembeli melakukan pembayaran",
  "Dana diamankan AlidPay",
  "Penjual mengirim barang/jasa",
  "Pembeli mengonfirmasi penerimaan",
  "Dana dicairkan ke penjual",
];

export function transactionStep(status: TransactionStatus) {
  return {
    draft_link: 0,
    menunggu_konfirmasi: 0,
    menunggu_pembayaran: 1,
    dana_ditahan: 2,
    barang_dikirim: 4,
    dana_dicairkan: 6,
    sengketa: 4,
    dibatalkan: 0,
  }[status];
}

export function canOpenChat(status: TransactionStatus) {
  return [
    "menunggu_konfirmasi",
    "menunggu_pembayaran",
    "dana_ditahan",
    "barang_dikirim",
    "dana_dicairkan",
    "sengketa",
    "dibatalkan",
  ].includes(status);
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function fetchTransactions(page = 1, perPage = 100) {
  const response = await api.get("/api/transaction", {
    params: { page, per_page: perPage },
  });

  return (response.data?.data ?? []) as AlidPayTransaction[];
}

export async function fetchTransaction(id: string) {
  const response = await api.get(`/api/transaction/${id}`);

  return (response.data?.transaction ??
    response.data?.data ??
    response.data) as AlidPayTransaction;
}

export async function confirmTransaction(id: string) {
  return api.post(`/api/transaction/${id}/konfirmasi`);
}

export async function rejectTransaction(id: string) {
  return api.post(`/api/transaction/${id}/tolak`);
}

export async function markTransactionPaid(id: string) {
  return api.patch(`/api/transaction/${id}/mark-paid-simple`);
}

export async function markTransactionShipped(id: string) {
  return api.patch(`/api/transaction/${id}/mark-shipped`);
}

export async function confirmTransactionReceived(id: string) {
  return api.patch(`/api/transaction/${id}/confirm-received`);
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      }
    ).response;
    const firstValidationError = response?.data?.errors
      ? Object.values(response.data.errors).flat()[0]
      : null;

    return firstValidationError ?? response?.data?.message ?? fallback;
  }

  return fallback;
}
