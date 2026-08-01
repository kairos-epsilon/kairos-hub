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

        <h1 className="mt-3 font-display text-3xl italic text-[var(--color-ink)]">{work.title}</h1>

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

        <div className="mt-6 flex flex-wrap gap-3">
          {work.public_url && (
            <a
              href={work.public_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm bg-[var(--color-ink)] px-4 py-2 font-mono text-sm text-[var(--color-paper)] hover:bg-[var(--color-ink-soft)]"
            >
              サイトを見る ↗
            </a>
          )}
          {work.github_url && (
            <a
              href={work.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-[var(--color-line)] px-4 py-2 font-mono text-sm text-[var(--color-ink-soft)] hover:border-[var(--color-brass)] hover:text-[var(--color-ink)]"
            >
              GitHubを見る ↗
            </a>
          )}
        </div>

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
