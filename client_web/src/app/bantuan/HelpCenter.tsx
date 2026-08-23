"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileWarning,
  Mail,
  Search,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import PublicInfoShell from "../components/PublicInfoShell";

type Faq = {
  category: string;
  question: string;
  answer: string;
};

const faqs: Faq[] = [
  { category: "Akun", question: "Kenapa saya belum bisa masuk?", answer: "Pastikan email dan kata sandi benar, lalu periksa apakah email akun sudah diverifikasi. Jika masih gagal, gunakan alur pemulihan akun atau kirim detail kendala melalui formulir bantuan di bawah. Jangan pernah mengirimkan kata sandi atau kode OTP." },
  { category: "Akun", question: "Bagaimana jika ada aktivitas akun yang tidak saya kenal?", answer: "Amankan email yang terhubung, ganti kata sandi AlidPay, keluar dari perangkat yang tidak dikenal bila opsi tersedia, dan segera hubungi bantuan. Sertakan waktu kejadian serta aktivitas yang mencurigakan tanpa membagikan kata sandi, PIN, atau OTP." },
  { category: "Transaksi", question: "Bagaimana cara membuat transaksi?", answer: "Masuk ke akun, pilih Buat Transaksi, lengkapi detail barang atau jasa, harga, peran pihak penerima, dan ketentuan pemenuhan. Periksa lagi sebelum membagikan tautan undangan ALIDTRX kepada pihak terkait." },
  { category: "Transaksi", question: "Tautan transaksi tidak bisa dibuka atau diklaim", answer: "Pastikan seluruh kode ALIDTRX tersalin, tautan belum kedaluwarsa atau dicabut, dan kamu masuk memakai akun dengan peran yang sesuai. Tautan yang sudah diklaim akun lain tidak dapat diklaim ulang." },
  { category: "Transaksi", question: "Mengapa status transaksi belum berubah?", answer: "Setiap status menunggu tindakan tertentu dari pembeli, penjual, atau proses pembayaran. Buka detail transaksi untuk melihat tindakan berikutnya. Muat ulang halaman setelah pembayaran atau konfirmasi; jika tetap sama, sertakan ID transaksi saat menghubungi bantuan." },
  { category: "Pembayaran", question: "Pembayaran berhasil tetapi dana belum terlihat", answer: "Pemrosesan penyedia pembayaran dapat memerlukan waktu. Jangan membayar ulang. Simpan referensi pembayaran, periksa status pada detail transaksi, lalu hubungi bantuan jika status tidak berubah setelah estimasi yang ditampilkan." },
  { category: "Pembayaran", question: "Kapan dana diteruskan kepada penjual?", answer: "Dana diteruskan setelah transaksi memenuhi tahap penyelesaian yang disepakati dan tidak sedang disengketakan. Jika ada sengketa, dana tetap ditahan sampai ada hasil penyelesaian yang sah." },
  { category: "Pembayaran", question: "Apakah saya bisa membatalkan transaksi?", answer: "Kemungkinan pembatalan bergantung pada status transaksi. Transaksi yang belum dibayar umumnya dapat dihentikan lebih mudah. Setelah pembayaran atau pemenuhan dimulai, pembatalan dan pengembalian mengikuti persetujuan pihak terkait atau proses sengketa." },
  { category: "Sengketa", question: "Bagaimana cara mengajukan sengketa?", answer: "Buka detail transaksi terkait, pilih opsi sengketa saat tersedia, jelaskan masalah dengan kronologi yang ringkas, dan unggah bukti yang relevan. Ajukan sebelum batas waktu yang ditampilkan agar dapat ditinjau." },
  { category: "Sengketa", question: "Bukti apa yang sebaiknya disertakan?", answer: "Sertakan foto atau video kondisi barang, bukti pengiriman/penerimaan, invoice, tangkapan percakapan, serta dokumen lain yang langsung mendukung kronologi. Jangan mengubah bukti dan tutupi data sensitif yang tidak diperlukan." },
  { category: "Sengketa", question: "Apa kemungkinan hasil sengketa?", answer: "Berdasarkan bukti dan status pemenuhan, dana dapat dilepas kepada penjual, dikembalikan penuh atau sebagian kepada pembeli, atau diselesaikan dengan tindakan lain yang sesuai. Kedua pihak wajib menanggapi permintaan informasi tepat waktu." },
  { category: "Privasi", question: "Bagaimana cara meminta salinan atau penghapusan data?", answer: "Kirim permintaan melalui formulir bantuan dengan kategori Privasi. Gunakan email yang terdaftar dan jelaskan hak data yang ingin digunakan. Kami dapat meminta verifikasi identitas, dan sebagian data dapat tetap disimpan untuk kewajiban hukum, keamanan, atau transaksi terbuka." },
];

const categories = ["Semua", "Akun", "Transaksi", "Pembayaran", "Sengketa", "Privasi"];

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sent, setSent] = useState(false);

  const filteredFaqs = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id-ID");
    return faqs.filter((faq) => {
      const matchesCategory = category === "Semua" || faq.category === category;
      const matchesQuery = !normalized || `${faq.question} ${faq.answer}`.toLocaleLowerCase("id-ID").includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  function handleSupportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const topic = String(data.get("topic") ?? "Bantuan umum");
    const transactionId = String(data.get("transactionId") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = `[Bantuan AlidPay] ${topic}${transactionId ? ` · ${transactionId}` : ""}`;
    const body = [`Topik: ${topic}`, `ID transaksi: ${transactionId || "Tidak ada"}`, "", "Kronologi:", message, "", "Catatan: jangan lampirkan kata sandi, PIN, atau OTP."].join("\n");

    setSent(true);
    window.location.href = `mailto:support@alidpay.id?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <PublicInfoShell
      eyebrow="Pusat Bantuan"
      title="Ada kendala? Mulai dari sini."
      description="Cari jawaban, pelajari langkah penyelesaian, atau siapkan laporan yang lengkap untuk tim bantuan."
      actions={
        <>
          <a href="#faq" className="inline-flex items-center gap-2 rounded-full bg-[#181715] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"><CircleHelp size={17} /> Cari jawaban</a>
          <a href="#hubungi-kami" className="inline-flex items-center gap-2 rounded-full border border-[#D8D4CB] px-5 py-3 text-sm font-bold transition hover:bg-white"><Mail size={17} /> Hubungi bantuan</a>
        </>
      }
    >
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-px overflow-hidden rounded-3xl border border-[#E0DDD5] bg-[#E0DDD5] md:grid-cols-3">
            <Link href="/transaction" className="group bg-[#F5EFE6] p-7 transition hover:bg-[#EFECE4]">
              <WalletCards className="text-[#C85A28]" size={24} />
              <h2 className="mt-8 text-xl font-bold tracking-[-0.03em]">Periksa transaksi</h2>
              <p className="mt-2 text-sm leading-6 text-[#75726B]">Lihat status dan tindakan berikutnya pada detail transaksi.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">Buka transaksi <ArrowRight className="transition group-hover:translate-x-1" size={15} /></span>
            </Link>
            <Link href="/requests" className="group bg-[#F5EFE6] p-7 transition hover:bg-[#EFECE4]">
              <ShieldCheck className="text-[#C85A28]" size={24} />
              <h2 className="mt-8 text-xl font-bold tracking-[-0.03em]">Cek undangan</h2>
              <p className="mt-2 text-sm leading-6 text-[#75726B]">Terima atau tolak permintaan transaksi yang masuk.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">Buka permintaan <ArrowRight className="transition group-hover:translate-x-1" size={15} /></span>
            </Link>
            <a href="#sengketa" className="group bg-[#F5EFE6] p-7 transition hover:bg-[#EFECE4]">
              <FileWarning className="text-[#C85A28]" size={24} />
              <h2 className="mt-8 text-xl font-bold tracking-[-0.03em]">Ada masalah transaksi</h2>
              <p className="mt-2 text-sm leading-6 text-[#75726B]">Siapkan kronologi dan bukti sebelum mengajukan sengketa.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">Lihat panduan <ArrowRight className="transition group-hover:translate-x-1" size={15} /></span>
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-y border-[#E0DDD5] bg-[#EFECE4] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C85A28]">Pertanyaan umum</p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Temukan jawaban lebih cepat.</h2>

          <div className="relative mt-9">
            <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#96928A]" size={20} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Cari: pembayaran, sengketa, akun..." aria-label="Cari pertanyaan bantuan" className="w-full rounded-2xl border border-[#D8D4CB] bg-[#F5EFE6] py-4 pl-13 pr-12 text-sm outline-none transition focus:border-[#C85A28] focus:ring-4 focus:ring-[#C85A28]/10" />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 hover:bg-[#E0DDD5]"><X size={16} /></button> : null}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Filter kategori bantuan">
            {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${category === item ? "bg-[#181715] text-white" : "border border-[#D8D4CB] bg-[#F5EFE6] text-[#75726B] hover:text-[#181715]"}`}>{item}</button>)}
          </div>

          <div className="mt-7 space-y-3">
            {filteredFaqs.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-[#D8D4CB] bg-[#F5EFE6] open:bg-white">
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 text-sm font-bold sm:px-6">
                  <span className="rounded-full bg-[#C85A28]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-[#C85A28]">{faq.category}</span>
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown className="shrink-0 transition group-open:rotate-180" size={18} />
                </summary>
                <p className="border-t border-[#E0DDD5] px-5 py-5 text-sm leading-7 text-[#75726B] sm:px-6">{faq.answer}</p>
              </details>
            ))}
            {filteredFaqs.length === 0 ? <div className="rounded-2xl border border-dashed border-[#C8C3B9] p-9 text-center"><CircleHelp className="mx-auto text-[#B2AEA6]" /><p className="mt-3 font-bold">Jawaban belum ditemukan</p><p className="mt-2 text-sm text-[#75726B]">Coba kata yang lebih singkat atau kirim pertanyaan melalui formulir bantuan.</p><button type="button" onClick={() => { setQuery(""); setCategory("Semua"); }} className="mt-4 text-sm font-bold text-[#C85A28]">Tampilkan semua FAQ</button></div> : null}
          </div>
        </div>
      </section>

      <section id="sengketa" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C85A28]">Panduan sengketa</p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Buat laporan yang bisa ditinjau.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#75726B]">Jangan selesaikan transaksi jika barang atau jasa belum sesuai. Gunakan kanal transaksi agar kronologi tercatat.</p>
          </div>
          <ol className="space-y-3">
            {["Buka detail transaksi yang bermasalah dan periksa tenggat pengajuan.", "Tuliskan kronologi berdasarkan waktu, kesepakatan, dan bagian yang tidak terpenuhi.", "Lampirkan bukti asli yang relevan: foto, video, resi, invoice, atau percakapan.", "Pantau permintaan informasi dan jawab sebelum batas waktu. Dana tetap ditahan selama peninjauan."].map((step, index) => <li key={step} className="flex gap-5 rounded-2xl border border-[#D8D4CB] p-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#181715] text-xs font-bold text-white">{index + 1}</span><p className="pt-1 text-sm leading-7 text-[#75726B]">{step}</p></li>)}
          </ol>
        </div>
      </section>

      <section id="hubungi-kami" className="scroll-mt-24 bg-[#181715] px-5 py-16 text-white sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D49A2B]">Hubungi kami</p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Masih perlu bantuan?</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/55">Formulir ini menyiapkan email dengan informasi penting agar laporanmu lebih cepat dipahami. Aplikasi email di perangkatmu akan terbuka untuk mengirimkannya.</p>
            <div className="mt-7 flex gap-3 rounded-2xl border border-[#D49A2B]/30 bg-[#D49A2B]/10 p-4 text-sm leading-6 text-[#F4DDAF]"><AlertTriangle className="mt-0.5 shrink-0" size={18} /><p>Jangan pernah mengirim kata sandi, PIN, OTP, nomor kartu lengkap, atau kode pemulihan.</p></div>
          </div>

          <form onSubmit={handleSupportSubmit} className="rounded-3xl bg-[#F5EFE6] p-6 text-[#181715] sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-[0.1em]">Topik
                <select name="topic" required className="mt-2 w-full rounded-xl border border-[#D8D4CB] bg-white px-4 py-3.5 text-sm font-medium normal-case tracking-normal outline-none focus:border-[#C85A28]"><option>Masalah akun</option><option>Transaksi</option><option>Pembayaran</option><option>Sengketa</option><option>Privasi dan data</option><option>Keamanan akun</option></select>
              </label>
              <label className="text-xs font-bold uppercase tracking-[0.1em]">ID transaksi <span className="font-medium normal-case text-[#96928A]">(opsional)</span>
                <input name="transactionId" placeholder="Contoh: ALIDTRX-..." className="mt-2 w-full rounded-xl border border-[#D8D4CB] bg-white px-4 py-3.5 text-sm font-medium normal-case tracking-normal outline-none placeholder:text-[#B2AEA6] focus:border-[#C85A28]" />
              </label>
            </div>
            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.1em]">Kronologi
              <textarea name="message" required minLength={20} rows={6} placeholder="Jelaskan apa yang terjadi, kapan, status terakhir, dan hasil yang kamu harapkan..." className="mt-2 w-full resize-y rounded-xl border border-[#D8D4CB] bg-white px-4 py-3.5 text-sm font-medium leading-6 normal-case tracking-normal outline-none placeholder:text-[#B2AEA6] focus:border-[#C85A28]" />
            </label>
            <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C85A28] px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5"><Mail size={17} /> Siapkan email bantuan</button>
            {sent ? <p role="status" className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#397253]"><CheckCircle2 size={15} /> Email bantuan sudah disiapkan di aplikasi emailmu.</p> : null}
          </form>
        </div>
      </section>
    </PublicInfoShell>
  );
}
