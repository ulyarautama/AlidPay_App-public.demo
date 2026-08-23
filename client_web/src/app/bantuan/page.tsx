import type { Metadata } from "next";
import HelpCenter from "./HelpCenter";

export const metadata: Metadata = {
  title: "Pusat Bantuan",
  description: "Temukan jawaban dan panduan untuk akun, transaksi, pembayaran, serta sengketa AlidPay.",
};

export default function HelpPage() {
  return <HelpCenter />;
}
