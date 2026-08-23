"use client";

import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useState } from "react";
import { firebaseAuth } from "../lib/firebase";

type GoogleSignInButtonProps = {
  disabled: boolean;
  onIdToken: (idToken: string) => Promise<void>;
  onError: (message: string) => void;
};

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function firebaseErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Login Google gagal. Silakan coba lagi.";
  }

  switch (error.code) {
    case "auth/popup-closed-by-user":
      return "Login Google dibatalkan.";
    case "auth/popup-blocked":
      return "Popup Google diblokir browser. Izinkan popup lalu coba lagi.";
    case "auth/unauthorized-domain":
      return "Domain web ini belum diizinkan di Firebase Authentication.";
    case "auth/operation-not-allowed":
      return "Metode login Google belum diaktifkan di Firebase Authentication.";
    default:
      return "Login Google gagal. Silakan coba lagi.";
  }
}

export default function GoogleSignInButton({
  disabled,
  onIdToken,
  onError,
}: GoogleSignInButtonProps) {
  const [popupPending, setPopupPending] = useState(false);
  const isDisabled = disabled || popupPending;

  async function handleGoogleSignIn() {
    if (isDisabled) return;

    setPopupPending(true);
    onError("");

    try {
      await setPersistence(firebaseAuth, inMemoryPersistence);
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken(true);
      await onIdToken(idToken);
    } catch (error) {
      onError(firebaseErrorMessage(error));
    } finally {
      await signOut(firebaseAuth).catch(() => undefined);
      setPopupPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => void handleGoogleSignIn()}
      className="flex min-h-11 w-full items-center justify-center gap-3 rounded-full border border-[#D8D4CB] bg-white px-5 text-sm font-semibold text-[#3C4043] transition hover:bg-[#FAFAFA] disabled:cursor-wait disabled:opacity-60"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.39 13.87A6 6 0 0 1 6.07 12c0-.65.11-1.28.32-1.87V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.62Z" />
        <path fill="#EA4335" d="M12 6c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.62C7.18 7.76 9.39 6 12 6Z" />
      </svg>
      {popupPending ? "Menghubungkan ke Google..." : "Masuk dengan Google"}
    </button>
  );
}
