"use client";

import { useRouter } from "next/navigation";
import { RequireAuth, useDemo } from "@/lib/demo-session";
import { createWork } from "@/lib/demo-store";
import { WorkForm } from "@/components/WorkForm";

export default function NewWorkPage() {
  const router = useRouter();
  const { bump } = useDemo();

  return (
    <RequireAuth workEditorOnly>
      {() => (
        <div className="mx-auto max-w-2xl px-6 py-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-brass)]">
            Admin
          </p>
          <h1 className="mt-2 font-display text-2xl text-[var(--color-ink)]">新規実績登録</h1>

          <div className="mt-8">
            <WorkForm
              submitLabel="登録する"
              onSave={(input) => {
                if (!input.title.trim()) return "案件名を入力してください";
                createWork(input);
                bump();
                router.push("/admin");
                return null;
              }}
            />
          </div>
        </div>
      )}
    </RequireAuth>
  );
}
