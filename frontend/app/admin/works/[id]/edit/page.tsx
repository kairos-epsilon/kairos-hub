"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RequireAuth, useDemo } from "@/lib/demo-session";
import { getWork, updateWork } from "@/lib/demo-store";
import { WorkForm } from "@/components/WorkForm";
import { ReadmeFetchButton } from "@/components/ReadmeFetchButton";

function EditView({ id }: { id: string }) {
  const router = useRouter();
  const { rev, bump } = useDemo();
  // rev は、README取得などで内容が変わったあとに読み直すために依存へ入れている
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const work = useMemo(() => getWork(id, "admin"), [id, rev]);

  if (!work) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/admin" className="font-mono text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
          ← 管理画面に戻る
        </Link>
        <p className="mt-8 text-sm text-[var(--color-ink-soft)]">この実績は見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-brass)]">
        Admin
      </p>
      <h1 className="mt-2 font-display text-2xl text-[var(--color-ink)]">実績編集</h1>

      <div className="mt-8">
        <WorkForm
          initialWork={work}
          submitLabel="更新する"
          onSave={(input) => {
            if (!input.title.trim()) return "案件名を入力してください";
            if (!updateWork(id, input)) return "この実績は見つかりませんでした";
            bump();
            router.push("/admin");
            return null;
          }}
        />
      </div>

      {work.github_url && (
        <div className="mt-10 border-t border-[var(--color-line)] pt-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">
            GitHub README連携
          </h2>
          <ReadmeFetchButton workId={id} githubUrl={work.github_url} currentReadme={work.readme_content} />
        </div>
      )}
    </div>
  );
}

export default function EditWorkPage() {
  const { id } = useParams<{ id: string }>();
  return <RequireAuth workEditorOnly>{() => <EditView id={id} />}</RequireAuth>;
}
