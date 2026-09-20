import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/session";
import { updateWorkAction } from "@/app/actions";
import { WorkForm } from "@/components/WorkForm";
import { ReadmeFetchButton } from "@/components/ReadmeFetchButton";
import type { WorkDetail } from "@/lib/types";

type Params = Promise<{ id: string }>;

export default async function EditWorkPage({ params }: { params: Params }) {
  const { id } = await params;
  const token = await getToken();
  if (!token) redirect("/login");

  const work = await apiFetch<WorkDetail>(`/api/admin/works/${id}`, { token });
  const updateAction = updateWorkAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-brass)]">
        Admin
      </p>
      <h1 className="mt-2 font-display text-2xl text-[var(--color-ink)]">実績編集</h1>

      <div className="mt-8">
        <WorkForm action={updateAction} initialWork={work} submitLabel="更新する" />
      </div>

      {work.github_url && (
        <div className="mt-10 border-t border-[var(--color-line)] pt-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">
            GitHub README連携
          </h2>
          <ReadmeFetchButton workId={id} currentReadme={work.readme_content} />
        </div>
      )}
    </div>
  );
}
