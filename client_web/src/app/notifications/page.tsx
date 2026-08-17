"use client";

import {
  Bell,
  Check,
  ChevronRight,
  Package,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import Link from "next/link";

const notifications = [
  {
    id: 1,
    type: "transaction_request",
    title: "Transaksi baru masuk",
    description: "Zuma mengirim request transaksi untuk MacBook Pro M3.",
    time: "2 menit lalu",
    unread: true,
  },
  {
    id: 2,
    type: "shipping",
    title: "Pesanan dikirim",
    description: "Andi Store mengirim nomor resi untuk transaksi TRX-8F92.",
    time: "1 jam lalu",
    unread: true,
  },
  {
    id: 3,
    type: "completed",
    title: "Transaksi selesai",
    description: "Transaksi iPhone 15 Pro telah selesai.",
    time: "Kemarin",
    unread: false,
  },
];

function NotificationIcon({ type }: { type: string }) {
  if (type === "transaction_request") {
    return <UserPlus size={18} />;
  }

  if (type === "shipping") {
    return <Package size={18} />;
  }

  return <Check size={18} />;
}

export default function NotificationsPage() {
  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 pb-20 pt-28 sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C85A28]">
              Activity
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
              Notifications
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#75726B]">
              Semua aktivitas penting yang berkaitan dengan akun dan transaksi
              kamu.
            </p>
          </div>

          <button className="hidden text-xs font-bold text-[#75726B] transition hover:text-[#C85A28] sm:block">
            Tandai semua dibaca
          </button>
        </div>

        {/* REQUEST BANNER */}
        <Link
          href="/requests"
          className="group mt-10 block rounded-[1.5rem] bg-[#181715] p-5 text-white transition hover:-translate-y-0.5 hover:shadow-xl sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C85A28]">
              <ShieldCheck size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold">Request transaksi masuk</p>

                <span className="rounded-full bg-[#C85A28] px-2 py-0.5 text-[10px] font-bold">
                  2
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

        {/* NOTIFICATIONS */}
        <section className="mt-8 overflow-hidden rounded-[1.5rem] border border-[#E0DDD5] bg-[#EFECE4]">
          <div className="border-b border-[#E0DDD5] px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Semua aktivitas</h2>

              <span className="text-xs font-semibold text-[#96928A]">
                {unreadCount} belum dibaca
              </span>
            </div>
          </div>

          <div>
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={
                  notification.type === "transaction_request"
                    ? "/requests"
                    : "#"
                }
                className={`group flex gap-4 border-b border-[#E0DDD5] px-5 py-5 transition last:border-b-0 hover:bg-[#F5EFE6] sm:px-6 ${
                  notification.unread ? "bg-[#F2EEE6]" : ""
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#181715] text-white">
                  <NotificationIcon type={notification.type} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold">{notification.title}</p>

                      <p className="mt-1 text-sm leading-6 text-[#75726B]">
                        {notification.description}
                      </p>
                    </div>

                    {notification.unread && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C85A28]" />
                    )}
                  </div>

                  <p className="mt-2 text-[11px] font-semibold text-[#96928A]">
                    {notification.time}
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="mt-2 shrink-0 text-[#B2AEA6] transition group-hover:translate-x-1"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
