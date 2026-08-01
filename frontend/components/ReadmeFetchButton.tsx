"use client";

import { useState, useTransition } from "react";
import { fetchReadmeAction } from "@/app/actions";

export function ReadmeFetchButton({
  workId,
  currentReadme,
}: {
  workId: string;
  currentReadme: string | null;
}) {
  const [readme, setReadme] = useState(currentReadme);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFetch() {
    setError(null);
    startTransition(async () => {
      const result = await fetchReadmeAction(workId);
      if ("error" in result) {
        setError(result.error);
      } else {
        setReadme(result.readme_content);
      }
    });
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleFetch}
        disabled={isPending}
        className="rounded-sm border border-[var(--color-line)] px-4 py-2 font-mono text-sm text-[var(--color-ink-soft)] hover:border-[var(--color-brass)] hover:text-[var(--color-ink)] disabled:opacity-60"
      >
        {isPending ? "取得中…" : "READMEを取得・更新"}
      </button>

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      {readme && (
        <pre className="mt-3 max-h-64 overflow-auto rounded-sm bg-[var(--color-ink)] p-4 font-mono text-xs leading-relaxed text-[var(--color-paper)] whitespace-pre-wrap">
          {readme}
        </pre>
      )}
    </div>
  );
}
