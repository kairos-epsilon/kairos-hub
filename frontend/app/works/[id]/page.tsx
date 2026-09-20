import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { CATEGORY_LABELS, type WorkDetail } from "@/lib/types";

type Params = Promise<{ id: string }>;

async function getWork(id: string): Promise<WorkDetail> {
  try {
    return await apiFetch<WorkDetail>(`/api/works/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }
}

export default async function WorkDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const work = await getWork(id);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/" className="font-mono text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
        ← 実績一覧に戻る
      </Link>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-brass)]">
            {CATEGORY_LABELS[work.category]}
          </span>
          {work.client_industry && (
            <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">
              {work.client_industry}
            </span>
          )}
        </div>

        <h1 className="mt-3 font-display text-2xl text-[var(--color-ink)]">{work.title}</h1>

        {work.client_name && (
          <p className="mt-2 font-mono text-sm text-[var(--color-ink-soft)]">
            {work.client_name}
          </p>
        )}

        {work.description && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-soft)]">
            {work.description}
          </p>
        )}

        {work.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {work.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-sm bg-[var(--color-paper)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-ink-soft)]"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* --- 案件管理情報 --- */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-3">
          {[
            { label: "営業担当", value: work.sales_rep },
            { label: "技術担当", value: work.tech_rep },
            { label: "受注金額", value: work.amount != null ? `¥${work.amount.toLocaleString("ja-JP")}` : null },
            { label: "受注時期", value: work.ordered_at },
            { label: "納品時期", value: work.delivered_at },
            { label: "業種", value: work.client_industry },
          ].map((item) => (
            <div key={item.label} className="bg-[var(--color-paper-raised)] px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-brass)]">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-[var(--color-ink)]">{item.value || "—"}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {work.public_url && (
            <a
              href={work.public_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm bg-[var(--color-ink)] px-4 py-2 font-mono text-sm text-[var(--color-paper)] hover:bg-[var(--color-ink-soft)]"
            >
              納品物を見る ↗
            </a>
          )}
          {work.data_url && (
            <a
              href={work.data_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-[var(--color-line)] px-4 py-2 font-mono text-sm text-[var(--color-ink-soft)] hover:border-[var(--color-brass)] hover:text-[var(--color-ink)]"
            >
              関連データ ↗
            </a>
          )}
          {work.github_url && (
            <a
              href={work.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-[var(--color-line)] px-4 py-2 font-mono text-sm text-[var(--color-ink-soft)] hover:border-[var(--color-brass)] hover:text-[var(--color-ink)]"
            >
              GitHub ↗
            </a>
          )}
        </div>

        {work.memo && (
          <div className="mt-8 rounded-sm border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">
              メモ・備考
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink-soft)]">
              {work.memo}
            </p>
          </div>
        )}

        {work.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.thumbnail_url}
            alt={work.title}
            className="mt-8 w-full rounded-sm border border-[var(--color-line)]"
          />
        )}

        {work.readme_content && (
          <div className="mt-10 border-t border-[var(--color-line)] pt-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">
              技術解説（GitHub README）
            </h2>
            <pre className="mt-3 max-h-96 overflow-auto rounded-sm bg-[var(--color-ink)] p-4 font-mono text-xs leading-relaxed text-[var(--color-paper)] whitespace-pre-wrap">
              {work.readme_content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
