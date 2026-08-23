"use client";

import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/axios";
import {
  apiErrorMessage,
  fetchTransaction,
  transactionStatuses,
  type AlidPayTransaction,
} from "@/app/lib/transactions";
import { redirectProtectedResourceError } from "@/app/lib/protected-navigation";
import {
  ArrowLeft,
  CheckCheck,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type ChatMessage = {
  id: string;
  transaction_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  message_type: "user" | "transaction_status";
  metadata?: {
    status?: AlidPayTransaction["status"];
    resolution?: "refund_buyer" | "release_seller";
  } | null;
  is_read: boolean;
  created_at: string;
};

function TransactionChatContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<AlidPayTransaction | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const response = await api.get(
          `/api/transaction/${params.id}/messages`,
          {
            params: { per_page: 100 },
          },
        );
        setMessages(response.data?.data ?? []);
        setError(null);
      } catch (caught) {
        if (
          redirectProtectedResourceError(
            caught,
            router,
            `/transaction/${params.id}/chat`,
          )
        ) {
          setRedirecting(true);
          return;
        }
        if (!silent) setError(apiErrorMessage(caught, "Gagal memuat chat."));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [params.id, router],
  );

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void Promise.all([
        fetchTransaction(params.id).then(setTransaction),
        loadMessages(),
      ]).catch((caught) => {
        if (
          redirectProtectedResourceError(
            caught,
            router,
            `/transaction/${params.id}/chat`,
          )
        ) {
          setRedirecting(true);
          return;
        }
        setError(apiErrorMessage(caught, "Chat tidak tersedia."));
      });
    }, 0);

    const interval = window.setInterval(() => void loadMessages(true), 5000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadMessages, params.id, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    try {
      setSending(true);
      setError(null);
      const response = await api.post(
        `/api/transaction/${params.id}/messages`,
        {
          message: cleanMessage,
        },
      );
      setMessages((current) => [...current, response.data.data]);
      setMessage("");
    } catch (caught) {
      setError(apiErrorMessage(caught, "Pesan gagal dikirim."));
    } finally {
      setSending(false);
    }
  }

  const counterpart =
    transaction && user
      ? transaction.buyer_id === user.id
        ? transaction.seller
        : transaction.buyer
      : null;

  if (redirecting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6]">
        <Loader2 size={28} className="animate-spin text-[#C85A28]" />
      </main>
    );
  }

  return (
    <main className="h-dvh w-full overflow-hidden bg-[#EFECE4]">
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#EFECE4]">
        <header
          className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#181715] px-4 pb-4 pt-4 text-white sm:px-6 lg:px-8"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.push(`/transaction/${params.id}`)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/15"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6B1E2C] font-bold">
              {counterpart?.name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <h1 className="truncate text-sm font-bold">
              {counterpart?.name ?? "Lawan transaksi"}
            </h1>
          </div>
          {transaction && (
            <span className="hidden rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white/60 sm:inline-flex">
              {transactionStatuses[transaction.status].short}
            </span>
          )}
        </header>

        {transaction && (
          <button
            type="button"
            onClick={() => router.push(`/transaction/${transaction.id}`)}
            className="flex shrink-0 items-center justify-between gap-4 border-b border-[#DCD8CF] bg-[#F5EFE6] px-4 py-3 text-left transition hover:bg-white sm:px-6 sm:py-4 lg:px-8"
          >
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#96928A]">
                Pesanan yang ditanyakan
              </p>
              <p className="mt-1 truncate text-sm font-bold text-[#181715]">
                {transaction.judul_barang}
              </p>
              <p className="mt-1 truncate text-[10px] text-[#75726B]">
                {transaction.share_code ?? transaction.id}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-black text-[#C85A28]">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(transaction.nominal)}
              </p>
              <p className="mt-1 text-[9px] font-bold text-[#75726B]">
                Lihat detail pesanan →
              </p>
            </div>
          </button>
        )}

        <section className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:px-8 lg:py-7">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[#C85A28]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5EFE6]">
                <MessageCircle size={24} className="text-[#96928A]" />
              </div>
              <p className="mt-4 text-sm font-bold">Belum ada percakapan</p>
              <p className="mt-1 text-xs text-[#96928A]">
                Mulai diskusi mengenai transaksi ini.
              </p>
            </div>
          ) : (
            messages.map((item) => {
              if (item.message_type === "transaction_status") {
                return (
                  <div key={item.id} className="flex justify-center py-1">
                    <div className="max-w-xl rounded-2xl border border-[#D8D4CB] bg-white/70 px-4 py-3 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.13em] text-[#C85A28]">
                        Pembaruan pesanan
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-5 text-[#4F4C46]">
                        {item.message}
                      </p>
                      <p className="mt-2 text-[9px] text-[#96928A]">
                        {new Date(item.created_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                );
              }

              const own = item.sender_id === user?.id;
              return (
                <div
                  key={item.id}
                  className={`flex ${own ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[72%] lg:max-w-2xl ${own ? "rounded-br-md bg-[#181715] text-white" : "rounded-bl-md border border-[#DCD8CF] bg-[#F5EFE6] text-[#181715]"}`}
                  >
                    {!own && (
                      <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-[#C85A28]">
                        {item.sender_name}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {item.message}
                    </p>
                    <div
                      className={`mt-2 flex items-center justify-end gap-1.5 text-[9px] ${own ? "text-white/35" : "text-[#96928A]"}`}
                    >
                      {new Date(item.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {own && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </section>

        {error && (
          <div className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 sm:px-6 lg:px-8">
            {error}
          </div>
        )}

        <form
          onSubmit={sendMessage}
          className="flex shrink-0 items-end gap-3 border-t border-[#DCD8CF] bg-[#F5EFE6] px-3 pb-3 pt-3 sm:px-6 sm:pb-5 sm:pt-4 lg:px-8"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            maxLength={2000}
            placeholder={`Tanyakan pesanan ${transaction?.judul_barang ?? "ini"}...`}
            className="max-h-36 min-h-12 min-w-0 flex-1 resize-none rounded-2xl border border-[#D8D4CB] bg-white px-4 py-3 text-base outline-none focus:border-[#181715] sm:text-sm"
          />
          <button
            disabled={sending || !message.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#181715] text-white disabled:opacity-40"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function TransactionChatPage() {
  return (
    <Suspense fallback={null}>
      <TransactionChatContent />
    </Suspense>
  );
}
