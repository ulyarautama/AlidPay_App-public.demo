"use client";

import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/axios";
import {
  apiErrorMessage,
  fetchTransaction,
  transactionStatuses,
  type AlidPayTransaction,
} from "@/app/lib/transactions";
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
        if (!silent) setError(apiErrorMessage(caught, "Gagal memuat chat."));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [params.id],
  );

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void Promise.all([
        fetchTransaction(params.id).then(setTransaction),
        loadMessages(),
      ]).catch((caught) =>
        setError(apiErrorMessage(caught, "Chat tidak tersedia.")),
      );
    }, 0);

    const interval = window.setInterval(() => void loadMessages(true), 5000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadMessages, params.id]);

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

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-4 pb-8 pt-20 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] shadow-xl shadow-black/5">
        <header className="flex items-center justify-between gap-4 border-b border-[#DCD8CF] bg-[#181715] px-5 py-4 text-white sm:px-6">
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

        <section className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-7">
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
              const own = item.sender_id === user?.id;
              return (
                <div
                  key={item.id}
                  className={`flex ${own ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 sm:max-w-[68%] ${own ? "rounded-br-md bg-[#181715] text-white" : "rounded-bl-md border border-[#DCD8CF] bg-[#F5EFE6] text-[#181715]"}`}
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
          <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={sendMessage}
          className="flex items-end gap-3 border-t border-[#DCD8CF] bg-[#F5EFE6] p-4 sm:p-5"
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
            placeholder="Tulis pesan..."
            className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl border border-[#D8D4CB] bg-white px-4 py-3 text-sm outline-none focus:border-[#181715]"
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
