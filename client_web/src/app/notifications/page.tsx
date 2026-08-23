"use client";

import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/axios";
import {
  fetchTransactions,
  type AlidPayTransaction,
  type TransactionStatus,
} from "@/app/lib/transactions";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleX,
  CreditCard,
  Loader2,
  MessageCircle,
  Package,
  Send,
  ShieldCheck,
  Truck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ChatSummary = {
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  last_message_sender_name: string | null;
  last_message_type?: "user" | "transaction_status" | null;
  unread_count: number;
};

type Activity = {
  id: string;
  transactionId: string;
  kind: "transaction" | "chat";
  icon: TransactionStatus | "chat";
  title: string;
  description: string;
  occurredAt: string;
  unread: boolean;
  href: string;
};

type ActivityFilter = "all" | "transaction" | "chat";

const transactionCopy: Record<
  TransactionStatus,
  { title: string; description: (item: AlidPayTransaction) => string }
> = {
  draft_link: {
    title: "Tautan transaksi dibuat",
    description: (item) =>
      `Undangan transaksi ${item.judul_barang} siap dibagikan.`,
  },
  menunggu_konfirmasi: {
    title: "Transaksi menunggu konfirmasi",
    description: (item) =>
      `${item.judul_barang} perlu diperiksa sebelum dilanjutkan.`,
  },
  menunggu_pembayaran: {
    title: "Transaksi siap dibayar",
    description: (item) =>
      `${item.judul_barang} sudah dikonfirmasi dan menunggu pembayaran.`,
  },
  dana_ditahan: {
    title: "Dana berhasil diamankan",
    description: (item) =>
      `Pembayaran ${item.judul_barang} sudah masuk ke escrow AlidPay.`,
  },
  barang_dikirim: {
    title: "Pesanan sudah dikirim",
    description: (item) =>
      `${item.judul_barang} sedang dalam proses pengiriman.`,
  },
  dana_dicairkan: {
    title: "Transaksi selesai",
    description: (item) =>
      `Dana transaksi ${item.judul_barang} sudah dicairkan ke penjual.`,
  },
  sengketa: {
    title: "Transaksi dalam sengketa",
    description: (item) =>
      `Sengketa ${item.judul_barang} sedang ditinjau pihak AlidPay.`,
  },
  dibatalkan: {
    title: "Transaksi dibatalkan",
    description: (item) => `Transaksi ${item.judul_barang} tidak dilanjutkan.`,
  },
};

function TransactionActivityIcon({ type }: { type: Activity["icon"] }) {
  if (type === "chat") return <MessageCircle size={18} />;
  if (type === "draft_link") return <Send size={18} />;
  if (type === "menunggu_konfirmasi") return <UserPlus size={18} />;
  if (type === "menunggu_pembayaran") return <CreditCard size={18} />;
  if (type === "dana_ditahan") return <ShieldCheck size={18} />;
  if (type === "barang_dikirim") return <Truck size={18} />;
  if (type === "dana_dicairkan") return <Check size={18} />;
  if (type === "sengketa") return <AlertTriangle size={18} />;
  if (type === "dibatalkan") return <CircleX size={18} />;

  return <Package size={18} />;
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "Baru saja";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<AlidPayTransaction[]>([]);
  const [chatSummaries, setChatSummaries] = useState<
    Record<string, ChatSummary>
  >({});
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>("all");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login?redirect=/notifications");
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const [transactionData, chatResponse] = await Promise.all([
          fetchTransactions(1, 100),
          api.get("/api/chat/summary"),
        ]);

        setTransactions(transactionData);
        setChatSummaries(chatResponse.data?.data ?? {});
        setError(null);
      } catch {
        setError("Aktivitas belum dapat dimuat. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [authLoading, router, user]);

  const activities = useMemo(() => {
    if (!user) return [];

    const items: Activity[] = [];

    for (const transaction of transactions) {
      const copy = transactionCopy[transaction.status];
      const transactionUnread =
        transaction.buyer_id === user.id
          ? !transaction.is_seen_by_buyer
          : transaction.seller_id === user.id
            ? !transaction.is_seen_by_seller
            : false;

      items.push({
        id: `transaction-${transaction.id}`,
        transactionId: transaction.id,
        kind: "transaction",
        icon: transaction.status,
        title:
          transaction.status === "menunggu_konfirmasi" &&
          transaction.created_by !== user.id
            ? "Transaksi baru masuk"
            : copy.title,
        description: copy.description(transaction),
        occurredAt: transaction.updated_at,
        unread: transactionUnread,
        href: `/transaction/${transaction.id}`,
      });

      const chat = chatSummaries[transaction.id];
      if (!chat?.last_message || !chat.last_message_at) continue;

      const isOwnMessage = chat.last_message_sender_id === user.id;
      items.push({
        id: `chat-${transaction.id}`,
        transactionId: transaction.id,
        kind: "chat",
        icon: "chat",
        title:
          chat.last_message_type === "transaction_status"
            ? `Pembaruan pesanan ${transaction.judul_barang}`
            : isOwnMessage
              ? `Pesan terkirim di ${transaction.judul_barang}`
              : `Pesan baru dari ${chat.last_message_sender_name ?? "lawan transaksi"}`,
        description: chat.last_message,
        occurredAt: chat.last_message_at,
        unread: Number(chat.unread_count) > 0,
        href: `/transaction/${transaction.id}/chat`,
      });
    }

    return items.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  }, [chatSummaries, transactions, user]);

  const visibleActivities = useMemo(
    () =>
      activeFilter === "all"
        ? activities
        : activities.filter((activity) => activity.kind === activeFilter),
    [activeFilter, activities],
  );
  const totalUnreadCount = activities.filter(
    (activity) => activity.unread,
  ).length;
  const unreadCount = visibleActivities.filter(
    (activity) => activity.unread,
  ).length;
  const incomingRequestCount = transactions.filter(
    (transaction) =>
      transaction.status === "menunggu_konfirmasi" &&
      transaction.created_by !== user?.id,
  ).length;

  async function openActivity(activity: Activity) {
    if (activity.kind === "transaction" && activity.unread) {
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === activity.transactionId
            ? {
                ...transaction,
                is_seen_by_buyer:
                  transaction.buyer_id === user?.id
                    ? true
                    : transaction.is_seen_by_buyer,
                is_seen_by_seller:
                  transaction.seller_id === user?.id
                    ? true
                    : transaction.is_seen_by_seller,
              }
            : transaction,
        ),
      );

      try {
        await api.patch(`/api/transaction/${activity.transactionId}/seen`);
      } catch {
        // Detail tetap dibuka; status baca dapat dicoba lagi nanti.
      }
    }

    if (activity.kind === "chat") {
      setChatSummaries((current) => ({
        ...current,
        [activity.transactionId]: {
          ...current[activity.transactionId],
          unread_count: 0,
        },
      }));
    }

    router.push(activity.href);
  }

  async function markAllAsRead() {
    try {
      setMarkingAll(true);
      await Promise.all([
        api.post("/api/transaction/mark-seen"),
        api.post("/api/chat/messages/read"),
      ]);

      setTransactions((current) =>
        current.map((transaction) => ({
          ...transaction,
          is_seen_by_buyer:
            transaction.buyer_id === user?.id
              ? true
              : transaction.is_seen_by_buyer,
          is_seen_by_seller:
            transaction.seller_id === user?.id
              ? true
              : transaction.is_seen_by_seller,
        })),
      );
      setChatSummaries((current) =>
        Object.fromEntries(
          Object.entries(current).map(([id, summary]) => [
            id,
            { ...summary, unread_count: 0 },
          ]),
        ),
      );
      setError(null);
    } catch {
      setError("Sebagian aktivitas belum berhasil ditandai dibaca.");
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5EFE6] text-[#181715]">
      {/* BACK HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#E0DDD5] bg-[#F5EFE6]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-4xl items-center px-5 sm:px-8">
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

      <div className="mx-auto max-w-4xl px-5 pb-20 pt-10 sm:px-8">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
              Aktivitas
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
              Notifikasi
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#75726B]">
              Pembaruan transaksi dan pesan terbaru kamu ada di satu tempat.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={markingAll || totalUnreadCount === 0}
            className="hidden items-center gap-2 text-xs font-bold text-[#75726B] transition hover:text-[#C85A28] disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
          >
            {markingAll && <Loader2 size={13} className="animate-spin" />}
            Tandai semua dibaca
          </button>
        </div>

        {incomingRequestCount > 0 && (
          <Link
            href="/requests"
            className="group mt-10 block rounded-[1.5rem] bg-[#181715] p-5 text-white transition hover:-translate-y-0.5 hover:shadow-xl sm:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold">Request transaksi masuk</p>
                  <span className="rounded-full bg-[#C85A28] px-2 py-0.5 text-[10px] font-bold">
                    {incomingRequestCount}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/45">
                  Ada transaksi yang membutuhkan respons kamu.
                </p>
              </div>
              <ChevronRight
                size={19}
                className="shrink-0 text-white/40 transition group-hover:translate-x-1 group-hover:text-white"
              />
            </div>
          </Link>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-[1.5rem] border border-[#E0DDD5] bg-[#EFECE4]">
          <div className="border-b border-[#E0DDD5] px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Bell size={16} />
                <h2 className="font-bold">Aktivitas</h2>
              </div>
              <span className="text-xs font-semibold text-[#96928A]">
                {unreadCount} belum dibaca
              </span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-[#E0DDD5] px-5 py-3 sm:px-6">
            {(
              [
                ["all", "Semua aktivitas", activities.length],
                [
                  "transaction",
                  "Transaksi",
                  activities.filter(
                    (activity) => activity.kind === "transaction",
                  ).length,
                ],
                [
                  "chat",
                  "Chat",
                  activities.filter((activity) => activity.kind === "chat")
                    .length,
                ],
              ] as const
            ).map(([filter, label, count]) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeFilter === filter
                    ? "bg-[#181715] text-white"
                    : "bg-[#F5EFE6] text-[#75726B] hover:text-[#181715]"
                }`}
              >
                {label}
                <span
                  className={`ml-2 ${
                    activeFilter === filter ? "text-white/50" : "text-[#96928A]"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {loading || authLoading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-14 text-sm font-semibold text-[#75726B]">
              <Loader2 size={18} className="animate-spin" />
              Memuat aktivitas...
            </div>
          ) : visibleActivities.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <CheckCircle2 size={38} className="mx-auto text-[#96928A]" />
              <p className="mt-4 font-bold">
                {activeFilter === "chat"
                  ? "Belum ada aktivitas chat"
                  : activeFilter === "transaction"
                    ? "Belum ada aktivitas transaksi"
                    : "Belum ada aktivitas"}
              </p>
              <p className="mt-2 text-sm text-[#75726B]">
                {activeFilter === "all"
                  ? "Pembaruan transaksi dan chat akan muncul di sini."
                  : `Pembaruan ${activeFilter === "chat" ? "chat" : "transaksi"} akan muncul di sini.`}
              </p>
            </div>
          ) : (
            <div>
              {visibleActivities.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => void openActivity(activity)}
                  className={`group flex w-full gap-4 border-b border-[#E0DDD5] px-5 py-5 text-left transition last:border-b-0 hover:bg-[#F5EFE6] sm:px-6 ${
                    activity.unread ? "bg-[#F2EEE6]" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${
                      activity.kind === "chat" ? "bg-[#6B1E2C]" : "bg-[#181715]"
                    }`}
                  >
                    <TransactionActivityIcon type={activity.icon} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold">
                            {activity.title}
                          </p>
                          <span className="shrink-0 rounded-full bg-[#E5E0D7] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#75726B]">
                            {activity.kind === "chat" ? "Chat" : "Transaksi"}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#75726B]">
                          {activity.description}
                        </p>
                      </div>
                      {activity.unread && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C85A28]" />
                      )}
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-[#96928A]">
                      {formatActivityTime(activity.occurredAt)}
                    </p>
                  </div>

                  <ChevronRight
                    size={17}
                    className="mt-2 shrink-0 text-[#B2AEA6] transition group-hover:translate-x-1"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {totalUnreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={markingAll}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#D8D4CB] px-5 py-3 text-xs font-bold text-[#75726B] transition hover:bg-[#EFECE4] disabled:opacity-50 sm:hidden"
          >
            {markingAll && <Loader2 size={13} className="animate-spin" />}
            Tandai semua dibaca
          </button>
        )}
      </div>
    </main>
  );
}
