"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { RequireAuth, useDemo } from "@/lib/demo-session";
import { listTags, listWorks } from "@/lib/demo-store";
import type { UserRole } from "@/lib/types";
import { WorkCard } from "@/components/WorkCard";
import { SearchFilters } from "@/components/SearchFilters";

function WorkList({ role }: { role: UserRole }) {
  const params = useSearchParams();
  const { rev } = useDemo();
  const q = params.get("q") ?? undefined;
  const category = params.get("category") ?? undefined;
  const tag = params.get("tag") ?? undefined;

  const { works, tags } = useMemo(
    () => ({ works: listWorks(role, { q, category, tag }), tags: listTags() }),
    // rev は、デモデータの初期化や編集のあとに一覧を読み直すために依存へ入れている
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, q, category, tag, rev],
  );

  return (
    <>
      <SearchFilters availableTags={tags.map((t) => t.name)} />

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
    </>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      {(user) => (
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-10 max-w-2xl">
            <h1 className="font-display text-2xl text-[var(--color-ink)]">実績管理</h1>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              受注・納品した案件の記録。案件名・クライアント・担当者で検索できます。
            </p>
          </div>
          <Suspense fallback={<div className="h-24" />}>
            <WorkList role={user.role} />
          </Suspense>
        </div>
      )}
    </RequireAuth>
  );
}
