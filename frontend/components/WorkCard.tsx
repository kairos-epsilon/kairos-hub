import Link from "next/link";
import { CATEGORY_LABELS, type Work } from "@/lib/types";

export function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/works/${work.id}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] transition-colors hover:border-[var(--color-brass)]"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-[var(--color-brass-soft)]">
        {work.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.thumbnail_url}
            alt={work.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-4xl italic text-[var(--color-brass)]">K</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-brass)]">
            {CATEGORY_LABELS[work.category]}
          </span>
          {work.client_industry && (
            <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">
              {work.client_industry}
            </span>
          )}
        </div>

        <h3 className="font-display text-lg leading-snug text-[var(--color-ink)]">
          {work.title}
        </h3>

        {work.client_name && (
          <p className="font-mono text-xs text-[var(--color-ink-soft)]">{work.client_name}</p>
        )}

        {work.description && (
          <p className="line-clamp-2 text-sm text-[var(--color-ink-soft)]">{work.description}</p>
        )}

        {(work.sales_rep || work.tech_rep || work.amount != null) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-[var(--color-ink-muted)]">
            {work.sales_rep && <span>営業: {work.sales_rep}</span>}
            {work.tech_rep && <span>技術: {work.tech_rep}</span>}
            {work.amount != null && <span>¥{work.amount.toLocaleString("ja-JP")}</span>}
          </div>
        )}

        {work.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
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
      </div>
    </Link>
  );
}
