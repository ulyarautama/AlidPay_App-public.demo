"use client";

import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/axios";
import {
  apiErrorMessage,
  fetchTransaction,
  formatRupiah,
  type AlidPayTransaction,
} from "@/app/lib/transactions";
import { redirectProtectedResourceError } from "@/app/lib/protected-navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  FileImage,
  Loader2,
  ShieldAlert,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

const categories = [
  ["barang_jasa", "Barang / jasa"],
  ["pihak_transaksi", "Pihak transaksi"],
  ["indikasi_penipuan", "Indikasi penipuan"],
  ["lainnya", "Lainnya"],
] as const;

const issueTypes = [
  ["barang_tidak_sesuai", "Barang tidak sesuai"],
  ["barang_tidak_diterima", "Barang tidak diterima"],
  ["fraud_scam", "Fraud / scam"],
  ["pihak_tidak_kooperatif", "Pihak tidak kooperatif"],
  ["lainnya", "Masalah lainnya"],
] as const;

const resolutions = [
  ["refund", "Refund dana kepada pembeli"],
  ["release_seller", "Lepaskan dana kepada penjual"],
  ["resolve_transaction", "Selesaikan transaksi"],
  ["mediator_decision", "Serahkan keputusan kepada pihak AlidPay"],
] as const;

function CreateDisputeContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<AlidPayTransaction | null>(
    null,
  );
  const [category, setCategory] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransaction(params.id)
      .then(setTransaction)
      .catch((caught) => {
        if (
          redirectProtectedResourceError(
            caught,
            router,
            `/transaction/${params.id}/dispute`,
          )
        ) {
          setRedirecting(true);
          return;
        }
        setError(apiErrorMessage(caught, "Transaksi tidak tersedia."));
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  function addFiles(selected: FileList | null) {
    if (!selected) return;
    const next = Array.from(selected);
    const invalid = next.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 2 * 1024 * 1024,
    );
    if (invalid) {
      setError("Bukti hanya boleh JPG, PNG, atau WebP maksimal 2 MB per file.");
      return;
    }
    if (files.length + next.length > 5) {
      setError("Maksimal 5 file bukti.");
      return;
    }
    setError(null);
    setFiles((current) => [...current, ...next]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!category || !issueType || !description.trim() || !resolution) {
      setError("Semua kolom wajib diisi sebelum laporan dikirim.");
      return;
    }

    if (description.trim().length < 50) {
      setError("Kronologi minimal 50 karakter.");
      return;
    }

    if (files.length === 0) {
      setError("Minimal satu gambar bukti wajib diunggah.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const data = new FormData();
      data.append("category", category);
      data.append("issue_type", issueType);
      data.append("description", description.trim());
      data.append("requested_resolution", resolution);
      files.forEach((file) => data.append("evidence_files[]", file));

      await api.post(`/api/transaction/${params.id}/disputes`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.replace(`/transaction/${params.id}`);
      router.refresh();
    } catch (caught) {
      setError(apiErrorMessage(caught, "Dispute gagal diajukan."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || redirecting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6]">
        <Loader2 size={28} className="animate-spin text-[#C85A28]" />
      </main>
    );
  }

  const allowed =
    transaction?.status === "barang_dikirim" &&
    transaction.buyer_id === user?.id;

  if (!transaction || !allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5EFE6] p-6">
        <div className="max-w-md rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-10 text-center">
          <ShieldAlert size={42} className="mx-auto text-red-500" />
          <h1 className="mt-5 text-xl font-bold">Dispute tidak tersedia</h1>
          <p className="mt-2 text-sm leading-6 text-[#75726B]">
            Dispute hanya dapat diajukan buyer ketika transaksi berstatus barang
            dikirim.
          </p>
          <button
            onClick={() => router.replace(`/transaction/${params.id}`)}
            className="mt-6 rounded-full bg-[#181715] px-6 py-3 text-xs font-bold text-white"
          >
            Kembali ke transaksi
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5EFE6] px-5 pb-24 pt-24 text-[#181715] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push(`/transaction/${params.id}`)}
          className="flex items-center gap-2 text-xs font-bold text-[#75726B] hover:text-[#181715]"
        >
          <ArrowLeft size={15} /> Kembali ke transaksi
        </button>

        <header className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-red-600">
            <AlertTriangle size={13} /> Pusat komplain
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
            Laporkan masalah transaksi
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75726B]">
            Berikan kronologi dan bukti yang jelas. Setelah dikirim, dana
            transaksi dibekukan sampai pihak AlidPay mengambil keputusan.
          </p>
        </header>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="space-y-4">
            <div className="rounded-[1.5rem] border border-[#DCD8CF] bg-[#181715] p-6 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                Transaksi
              </p>
              <h2 className="mt-3 text-lg font-bold">
                {transaction.judul_barang}
              </h2>
              <p className="mt-2 font-mono text-[10px] text-white/35">
                {transaction.id}
              </p>
              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-[10px] text-white/35">Dana yang diamankan</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatRupiah(Number(transaction.nominal))}
                </p>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-xs leading-6 text-amber-800">
              Jangan mengunggah password, OTP, PIN, atau data kartu. Bukti akan
              ditinjau oleh pihak AlidPay.
            </div>
          </aside>

          <form
            onSubmit={submit}
            className="space-y-5 rounded-[1.75rem] border border-[#DCD8CF] bg-[#EFECE4] p-6 sm:p-8"
          >
            <SelectField
              label="Kategori *"
              value={category}
              onChange={setCategory}
              options={categories}
              placeholder="Pilih kategori"
            />
            <SelectField
              label="Jenis masalah *"
              value={issueType}
              onChange={setIssueType}
              options={issueTypes}
              placeholder="Pilih jenis masalah"
            />

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#75726B]">
                Kronologi lengkap *
              </span>
              <textarea
                required
                minLength={50}
                maxLength={5000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Jelaskan urutan kejadian, apa yang dijanjikan, dan masalah yang terjadi..."
                className="mt-2 min-h-40 w-full resize-y rounded-2xl border border-[#D8D4CB] bg-[#F5EFE6] p-4 text-sm leading-6 outline-none focus:border-[#181715]"
              />
              <div className="mt-2 flex justify-between text-[10px] text-[#96928A]">
                <span>Minimal 50 karakter</span>
                <span>{description.length}/5000</span>
              </div>
            </label>

            <SelectField
              label="Penyelesaian yang diminta *"
              value={resolution}
              onChange={setResolution}
              options={resolutions}
              placeholder="Pilih penyelesaian"
            />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#75726B]">
                Bukti pendukung *
              </p>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#C8C4BC] bg-[#F5EFE6] px-5 py-8 text-center hover:border-[#181715]">
                <UploadCloud size={24} className="text-[#96928A]" />
                <span className="mt-3 text-sm font-bold">
                  Pilih gambar bukti
                </span>
                <span className="mt-1 text-[10px] text-[#96928A]">
                  Wajib minimal 1 gambar · JPG, PNG, WebP · maksimal 2 MB per
                  file · maksimal 5 file
                </span>
                <input
                  type="file"
                  required={files.length === 0}
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => addFiles(event.target.files)}
                  className="sr-only"
                />
              </label>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-[#D8D4CB] bg-[#F5EFE6] p-3"
                    >
                      <FileImage size={17} className="text-[#C85A28]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold">
                          {file.name}
                        </p>
                        <p className="mt-0.5 text-[9px] text-[#96928A]">
                          {Math.ceil(file.size / 1024)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((current) =>
                            current.filter(
                              (_, fileIndex) => fileIndex !== index,
                            ),
                          )
                        }
                        className="text-[#96928A] hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#181715] px-6 py-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" /> Mengirim
                  dispute...
                </>
              ) : (
                <>
                  Kirim laporan dispute <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function SelectField<T extends readonly (readonly [string, string])[]>({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: T;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#75726B]">
        {label}
      </span>
      <select
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-[#D8D4CB] bg-[#F5EFE6] px-4 text-sm font-semibold outline-none focus:border-[#181715]"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function CreateDisputePage() {
  return (
    <Suspense fallback={null}>
      <CreateDisputeContent />
    </Suspense>
  );
}
