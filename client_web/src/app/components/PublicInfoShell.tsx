import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

type PublicInfoShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
};

export default function PublicInfoShell({
  eyebrow,
  title,
  description,
  children,
  actions,
}: PublicInfoShellProps) {
  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#181715]">
      <header className="sticky top-0 z-50 border-b border-[#E0DDD5]/80 bg-[#F5EFE6]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative h-11 w-11 shrink-0">
              <Image
                src="/alidpay-logo.png"
                alt="AlidPay"
                fill
                sizes="44px"
                priority
                className="object-contain transition-transform group-hover:-translate-y-0.5"
              />
            </div>
            <div className={`${playfair.className} flex items-baseline`}>
              <span className="text-2xl font-black tracking-[-0.065em]">Alid</span>
              <span className="text-2xl font-black tracking-[-0.065em] text-[#C85A28]">Pay</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#75726B] sm:flex" aria-label="Navigasi informasi">
            <Link href="/privasi" className="transition hover:text-[#C85A28]">Privasi</Link>
            <Link href="/ketentuan" className="transition hover:text-[#C85A28]">Ketentuan</Link>
            <Link href="/bantuan" className="transition hover:text-[#C85A28]">Bantuan</Link>
          </nav>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#D8D4CB] px-4 py-2.5 text-sm font-bold transition hover:bg-white"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-[#E0DDD5] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C85A28]">{eyebrow}</p>
            <div className="mt-5 grid items-end gap-8 lg:grid-cols-[1fr_0.7fr]">
              <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-[-0.065em] sm:text-7xl">{title}</h1>
              <div>
                <p className="max-w-xl text-base leading-7 text-[#75726B] sm:text-lg">{description}</p>
                {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
              </div>
            </div>
          </div>
        </section>

        {children}
      </main>

      <footer className="border-t border-[#E0DDD5] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`${playfair.className} text-2xl font-black tracking-[-0.06em]`}>
              Alid<span className="text-[#C85A28]">Pay</span>
            </p>
            <p className="mt-2 text-xs text-[#96928A]">Transaksi lebih aman, jelas, dan terlindungi.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-[#75726B]">
            <Link href="/privasi" className="hover:text-[#181715]">Privasi</Link>
            <Link href="/ketentuan" className="hover:text-[#181715]">Ketentuan</Link>
            <Link href="/bantuan" className="hover:text-[#181715]">Bantuan</Link>
            <Link href="/get-started" className="inline-flex items-center gap-1 text-[#C85A28]">
              Mulai transaksi <ArrowUpRight size={13} />
            </Link>
            <span>© 2026 AlidPay</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
