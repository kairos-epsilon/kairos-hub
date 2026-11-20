"use client";

import { useDemo } from "@/lib/demo-session";

export function DemoBanner() {
  const { reset } = useDemo();
  return (
    <div className="border-b border-[var(--color-brass)] bg-[var(--color-brass-soft)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-2 font-mono text-[11px] text-[var(--color-ink)]">
        <p>
          <span className="mr-2 rounded-sm bg-[var(--color-ink)] px-1.5 py-0.5 text-[10px] text-[var(--color-paper)]">DEMO</span>
          公開デモ版です。案件はすべて架空で、入力したデータはこのブラウザ内にだけ保存されます。
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("デモのデータを初期状態に戻しますか？（このブラウザ内の変更が消えます）")) reset();
          }}
          className="rounded-sm border border-[var(--color-ink)] px-2 py-0.5 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
        >
          データを初期化
        </button>
      </div>
    </div>
  );
}
