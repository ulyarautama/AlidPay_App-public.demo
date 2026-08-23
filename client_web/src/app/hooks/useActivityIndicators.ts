"use client";

import { api } from "@/app/lib/axios";
import { useEffect, useState } from "react";

const REFRESH_INTERVAL_MS = 5_000;

type IndicatorSnapshot = {
  ownerId: string | null;
  notificationCount: number;
  pendingRequestCount: number;
};

const emptySnapshot: IndicatorSnapshot = {
  ownerId: null,
  notificationCount: 0,
  pendingRequestCount: 0,
};

function safeCount(value: unknown) {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}

export function useActivityIndicators(userId?: string | null) {
  const [snapshot, setSnapshot] = useState<IndicatorSnapshot>(emptySnapshot);

  useEffect(() => {
    if (!userId) return;

    const ownerId = userId;
    let cancelled = false;
    let refreshing = false;

    async function refresh() {
      if (refreshing || document.visibilityState === "hidden") return;

      refreshing = true;

      try {
        const [transactionResponse, chatResponse, requestResponse] =
          await Promise.all([
            api.get("/api/transaction/unseen-count"),
            api.get("/api/chat/unread-count"),
            api.get("/api/transaction/incoming-request-count"),
          ]);

        if (cancelled) return;

        const unseenTransactions = safeCount(transactionResponse.data?.count);
        const unreadMessages = safeCount(chatResponse.data?.unread_count);

        setSnapshot({
          ownerId,
          notificationCount: unseenTransactions + unreadMessages,
          pendingRequestCount: safeCount(requestResponse.data?.count),
        });
      } catch {
        // Pertahankan snapshot terakhir agar gangguan jaringan singkat tidak
        // menampilkan jumlah palsu atau membuat badge berkedip.
      } finally {
        refreshing = false;
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") void refresh();
    }

    void refresh();
    const interval = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [userId]);

  if (!userId || snapshot.ownerId !== userId) {
    return emptySnapshot;
  }

  return snapshot;
}
