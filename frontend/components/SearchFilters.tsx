"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CATEGORY_LABELS, type WorkCategory } from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as WorkCategory[];

export function SearchFilters({ availableTags }: { availableTags: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const activeCategory = searchParams.get("category") ?? "";
  const activeTag = searchParams.get("tag") ?? "";

  function applyParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyParams({ q: query || null });
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="案件名・クライアント・担当者で検索"
          className="w-full max-w-md rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-brass)] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-sm bg-[var(--color-ink)] px-4 py-2 font-mono text-sm text-[var(--color-paper)] hover:bg-[var(--color-ink-soft)]"
        >
          検索
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => applyParams({ category: null })}
          className={`rounded-sm border px-3 py-1 font-mono text-xs ${
            activeCategory === ""
              ? "border-[var(--color-brass)] bg-[var(--color-brass-soft)] text-[var(--color-ink)]"
              : "border-[var(--color-line)] text-[var(--color-ink-soft)]"
          }`}
        >
          すべて
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => applyParams({ category: activeCategory === cat ? null : cat })}
            className={`rounded-sm border px-3 py-1 font-mono text-xs ${
              activeCategory === cat
                ? "border-[var(--color-brass)] bg-[var(--color-brass-soft)] text-[var(--color-ink)]"
                : "border-[var(--color-line)] text-[var(--color-ink-soft)]"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] pt-3">
          <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">技術タグ:</span>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => applyParams({ tag: activeTag === tag ? null : tag })}
              className={`rounded-sm px-2 py-0.5 font-mono text-[11px] ${
                activeTag === tag
                  ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                  : "bg-[var(--color-paper)] text-[var(--color-ink-soft)] hover:bg-[var(--color-brass-soft)]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {isPending && (
        <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">検索中…</span>
      )}
    </div>
  );
}
