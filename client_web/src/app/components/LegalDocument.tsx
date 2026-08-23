import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalDocumentProps = {
  updatedAt: string;
  summary: string;
  sections: LegalSection[];
};

export default function LegalDocument({ updatedAt, summary, sections }: LegalDocumentProps) {
  return (
    <section className="px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="self-start lg:sticky lg:top-28">
          <div className="rounded-3xl border border-[#DDD8CE] bg-[#EFECE4] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#96928A]">Terakhir diperbarui</p>
            <p className="mt-2 text-sm font-bold">{updatedAt}</p>
            <div className="my-5 h-px bg-[#D8D4CB]" />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#96928A]">Isi dokumen</p>
            <ol className="mt-4 space-y-2.5 text-sm text-[#75726B]">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex gap-2 transition hover:text-[#C85A28]">
                    <span className="text-[#B2AEA6]">{String(index + 1).padStart(2, "0")}</span>
                    <span>{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <article className="min-w-0">
          <div className="rounded-3xl border border-[#D8D4CB] bg-white/55 p-6 sm:p-9">
            <p className="text-lg font-semibold leading-8 tracking-[-0.02em]">{summary}</p>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-[#E0DDD5] bg-[#E0DDD5]">
            {sections.map((section, index) => (
              <section
                id={section.id}
                key={section.id}
                className="scroll-mt-28 bg-[#F5EFE6] p-6 sm:p-9 [&_a]:font-semibold [&_a]:text-[#C85A28] [&_li]:pl-1 [&_ol]:mt-4 [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:text-[#75726B] [&_p]:mt-4 [&_p]:leading-7 [&_p]:text-[#75726B] [&_strong]:text-[#181715] [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-[#75726B]"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-1 text-xs font-bold text-[#C85A28]">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">{section.title}</h2>
                    <div>{section.content}</div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
