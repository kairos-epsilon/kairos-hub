import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/session";
import { deleteWorkAction } from "@/app/actions";
import { CATEGORY_LABELS, type Work } from "@/lib/types";

export default async function AdminDashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const works = await apiFetch<Work[]>("/api/admin/works", { token });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-brass)]">
            Admin
          </p>
          <h1 className="mt-2 font-display text-2xl italic text-[var(--color-ink)]">
            実績管理ダッシュボード
          </h1>
        </div>
        <Link
          href="/admin/works/new"
          className="rounded-sm bg-[var(--color-ink)] px-4 py-2 font-mono text-sm text-[var(--color-paper)] hover:bg-[var(--color-ink-soft)]"
        >
          ＋ 新規実績登録
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-sm border border-[var(--color-line)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper)] font-mono text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">カテゴリ</th>
              <th className="px-4 py-3">公開状態</th>
              <th className="px-4 py-3">更新日</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {works.map((work) => (
              <tr key={work.id} className="border-b border-[var(--color-line)] last:border-b-0">
                <td className="px-4 py-3 text-[var(--color-ink)]">{work.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink-soft)]">
                  {CATEGORY_LABELS[work.category]}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-sm px-2 py-0.5 font-mono text-[11px] ${
                      work.is_published
                        ? "bg-[var(--color-brass-soft)] text-[var(--color-ink)]"
                        : "bg-[var(--color-paper)] text-[var(--color-ink-muted)]"
                    }`}
                  >
                    {work.is_published ? "公開中" : "非公開"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink-muted)]">
                  {new Date(work.updated_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/works/${work.id}/edit`}
                      className="font-mono text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                    >
                      編集
                    </Link>
                    <form action={deleteWorkAction.bind(null, work.id)}>
                      <button
                        type="submit"
                        className="font-mono text-xs text-red-600 hover:text-red-800"
                      >
                        削除
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {works.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-ink-muted)]">
                  まだ実績が登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
