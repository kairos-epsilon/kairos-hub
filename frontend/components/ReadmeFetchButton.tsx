"use client";

import { useState } from "react";
import { useDemo } from "@/lib/demo-session";
import { saveReadme } from "@/lib/demo-store";

// GitHub の公開API（認証なし・1時間あたり60回まで）から README を取得する
async function fetchReadme(githubUrl: string): Promise<string> {
  const m = githubUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/);
  if (!m) throw new Error("GitHub URLの形式が正しくありません");
  const repo = m[2].replace(/\.git$/, "");
  const res = await fetch(`https://api.github.com/repos/${m[1]}/${repo}/readme`, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  if (res.status === 404) throw new Error("READMEが見つかりませんでした（非公開リポジトリの可能性があります）");
  if (!res.ok) throw new Error("READMEの取得に失敗しました。時間をおいてお試しください");
  const data = await res.json();
  const bin = atob(String(data.content ?? "").replace(/\n/g, ""));
  return new TextDecoder("utf-8").decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function ReadmeFetchButton({
  workId,
  githubUrl,
  currentReadme,
}: {
  workId: string;
  githubUrl: string;
  currentReadme: string | null;
}) {
  const { bump } = useDemo();
  const [readme, setReadme] = useState(currentReadme);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setPending] = useState(false);

  async function handleFetch() {
    setError(null);
    setPending(true);
    try {
      const content = await fetchReadme(githubUrl);
      saveReadme(workId, content);
      setReadme(content);
      bump();
    } catch (err) {
      setError(err instanceof Error ? err.message : "READMEの取得に失敗しました");
    } finally {
      setPending(false);
    }
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
