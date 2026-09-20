import { redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import { createWorkAction } from "@/app/actions";
import { WorkForm } from "@/components/WorkForm";

export default async function NewWorkPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-brass)]">
        Admin
      </p>
      <h1 className="mt-2 font-display text-2xl text-[var(--color-ink)]">新規実績登録</h1>

      <div className="mt-8">
        <WorkForm action={createWorkAction} submitLabel="登録する" />
      </div>
    </div>
  );
}
