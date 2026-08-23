import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument, { type LegalSection } from "../components/LegalDocument";
import PublicInfoShell from "../components/PublicInfoShell";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Cara AlidPay mengumpulkan, menggunakan, menjaga, dan mengelola data pribadi pengguna.",
};

const sections: LegalSection[] = [
  {
    id: "cakupan",
    title: "Cakupan kebijakan",
    content: <p>Kebijakan ini berlaku ketika kamu menggunakan situs, aplikasi, akun, transaksi, dukungan, dan fitur AlidPay. Dengan menggunakan layanan, kamu memahami praktik data yang dijelaskan di sini. Jika kamu bertindak untuk organisasi, pastikan kamu berwenang memberikan data terkait.</p>,
  },
  {
    id: "data-yang-dikumpulkan",
    title: "Data yang kami kumpulkan",
    content: <><p>Kami mengumpulkan data yang diperlukan untuk menyediakan dan mengamankan layanan, termasuk:</p><ul className="list-disc"><li><strong>Identitas dan akun:</strong> nama, email, nomor telepon, peran, kredensial terenkripsi, serta status verifikasi.</li><li><strong>Transaksi:</strong> barang/jasa, nilai, pihak terkait, alamat atau detail pemenuhan, status, percakapan, bukti, pengaduan, dan penyelesaian.</li><li><strong>Pembayaran:</strong> referensi pembayaran, status, nominal, waktu, dan informasi dari mitra pembayaran. Kami tidak menyimpan PIN atau kata sandi rekeningmu.</li><li><strong>Teknis:</strong> alamat IP, perangkat, browser, log aktivitas, pengenal sesi, cookie, dan data diagnostik.</li><li><strong>Dukungan:</strong> isi pertanyaan, lampiran, rekaman korespondensi, serta informasi yang kamu berikan saat meminta bantuan.</li></ul></>,
  },
  {
    id: "penggunaan-data",
    title: "Cara kami menggunakan data",
    content: <><p>Data digunakan untuk membuat dan memverifikasi akun; menjalankan transaksi dan pembayaran; menghubungkan pembeli dengan penjual; menjaga dana sesuai status transaksi; mencegah penipuan; menangani sengketa; memberi notifikasi; menyediakan bantuan; memperbaiki layanan; memenuhi kewajiban hukum; dan menegakkan <Link href="/ketentuan">Ketentuan Layanan</Link>.</p><p>Kami hanya memproses data sejauh diperlukan berdasarkan pelaksanaan layanan, persetujuan, kepentingan yang sah untuk keamanan, atau kewajiban hukum yang berlaku.</p></>,
  },
  {
    id: "pembagian-data",
    title: "Kapan data dibagikan",
    content: <><p>Kami dapat membagikan data secara terbatas kepada pihak lawan transaksi, penyedia pembayaran dan infrastruktur, penyedia verifikasi dan pencegahan fraud, penasihat profesional, atau otoritas yang berwenang. Informasi yang ditampilkan kepada pihak lawan transaksi dibatasi pada kebutuhan menjalankan kesepakatan.</p><p>Kami tidak menjual data pribadimu. Mitra pemroses hanya boleh menggunakan data untuk layanan yang ditugaskan dan wajib menerapkan perlindungan yang sesuai.</p></>,
  },
  {
    id: "penyimpanan-keamanan",
    title: "Penyimpanan dan keamanan",
    content: <><p>Data disimpan selama akun aktif, transaksi atau sengketa masih berjalan, dan sesudahnya selama diperlukan untuk audit, pencegahan fraud, kewajiban pajak/keuangan, serta kepatuhan hukum. Masa simpan berbeda menurut jenis data dan kewajiban yang berlaku.</p><p>Kami menerapkan kontrol akses, enkripsi saat sesuai, pencatatan aktivitas, pemantauan, serta prosedur respons insiden. Tidak ada sistem yang bebas risiko; jagalah kata sandi dan segera laporkan aktivitas mencurigakan.</p></>,
  },
  {
    id: "hak-pengguna",
    title: "Hak dan pilihanmu",
    content: <><p>Sesuai hukum yang berlaku, kamu dapat meminta akses, salinan, koreksi, pembaruan, pembatasan, penarikan persetujuan, keberatan, atau penghapusan data. Beberapa data mungkin tetap kami simpan jika diwajibkan hukum atau diperlukan untuk transaksi, sengketa, keamanan, dan pencegahan fraud.</p><p>Kamu dapat mengubah data dasar melalui pengaturan akun atau menghubungi kami melalui <Link href="/bantuan#hubungi-kami">Pusat Bantuan</Link>. Kami dapat meminta verifikasi identitas sebelum memproses permintaan.</p></>,
  },
  {
    id: "cookie-anak-transfer",
    title: "Cookie, pengguna anak, dan transfer data",
    content: <><p>Cookie dan teknologi serupa digunakan untuk sesi masuk, keamanan, preferensi, dan pengukuran kinerja. Memblokir cookie penting dapat membuat sebagian fungsi tidak bekerja.</p><p>Layanan tidak ditujukan bagi orang yang belum memenuhi usia atau kecakapan hukum untuk membuat perjanjian. Jika data diproses lintas wilayah, kami menggunakan perlindungan kontraktual dan teknis yang sesuai.</p></>,
  },
  {
    id: "perubahan-kontak",
    title: "Perubahan dan kontak",
    content: <><p>Kami dapat memperbarui kebijakan ini untuk menyesuaikan layanan, risiko, atau hukum. Perubahan material akan diberitahukan melalui layanan atau kanal kontak akun sebelum berlaku jika diwajibkan.</p><p>Pertanyaan privasi dan permintaan hak data dapat diajukan melalui <Link href="/bantuan#hubungi-kami">halaman Bantuan</Link>. Jelaskan permintaan dan email akun agar kami dapat melakukan verifikasi.</p></>,
  },
];

export default function PrivacyPage() {
  return (
    <PublicInfoShell eyebrow="Legal · Privasi" title="Datamu tetap milikmu." description="Penjelasan yang lugas tentang data apa yang dipakai AlidPay, untuk apa, dan kendali yang kamu miliki.">
      <LegalDocument updatedAt="22 Agustus 2026" summary="AlidPay menggunakan data seperlunya untuk menjalankan transaksi, menjaga keamanan, menyelesaikan sengketa, dan memenuhi kewajiban hukum. Kami tidak menjual data pribadi pengguna." sections={sections} />
    </PublicInfoShell>
  );
}
