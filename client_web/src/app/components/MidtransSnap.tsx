"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export type MidtransCheckout = {
  token: string;
  redirect_url: string;
  client_key: string;
  snap_js_url: string;
};

type SnapCallbacks = {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks: SnapCallbacks) => void;
    };
  }
}

export function MidtransSnap({
  checkout,
  onSuccess,
  onPending,
  onError,
  onClose,
}: {
  checkout: MidtransCheckout | null;
  onSuccess: () => void;
  onPending: () => void;
  onError: () => void;
  onClose: () => void;
}) {
  const [ready, setReady] = useState(false);
  const openedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!checkout || !ready || !window.snap || openedToken.current === checkout.token) {
      return;
    }

    openedToken.current = checkout.token;
    window.snap.pay(checkout.token, {
      onSuccess: () => onSuccess(),
      onPending: () => onPending(),
      onError: () => onError(),
      onClose,
    });
  }, [checkout, onClose, onError, onPending, onSuccess, ready]);

  if (!checkout) return null;

  return (
    <Script
      id="midtrans-snap-js"
      src={checkout.snap_js_url}
      data-client-key={checkout.client_key}
      strategy="afterInteractive"
      onReady={() => setReady(true)}
      onError={onError}
    />
  );
}
