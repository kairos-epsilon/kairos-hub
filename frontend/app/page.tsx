import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import type { Tag, Work } from "@/lib/types";
import { WorkCard } from "@/components/WorkCard";
import { SearchFilters } from "@/components/SearchFilters";

type SearchParams = Promise<{ q?: string; category?: string; tag?: string }>;

async function getWorks(params: { q?: string; category?: string; tag?: string }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.category) query.set("category", params.category);
  if (params.tag) query.set("tag", params.tag);

  return apiFetch<Work[]>(`/api/works?${query.toString()}`);
}

async function getTags() {
  return apiFetch<Tag[]>("/api/tags");
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [works, tags] = await Promise.all([getWorks(params), getTags()]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-brass)]">
          Kairos Works Archive
        </p>
        <h1 className="mt-2 font-display text-3xl italic text-[var(--color-ink)]">
          Kairosの仕事の軌跡を、ひとつの台帳に。
        </h1>
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
          これまでに受注・納品した案件を、クライアント・担当者・技術タグで横断的に検索・参照できます。
        </p>
      </div>

      <Suspense fallback={<div className="h-24" />}>
        <SearchFilters availableTags={tags.map((t) => t.name)} />
      </Suspense>

      <div className="mt-10">
        {works.length === 0 ? (
          <p className="rounded-sm border border-dashed border-[var(--color-line)] p-8 text-center text-sm text-[var(--color-ink-muted)]">
            条件に一致する実績が見つかりませんでした。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
