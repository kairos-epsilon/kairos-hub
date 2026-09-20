import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/session";
import { deleteWorkAction } from "@/app/actions";
import { type Work } from "@/lib/types";

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
          <h1 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
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

      <div className="mt-8 overflow-x-auto rounded-sm border border-[var(--color-line)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper)] font-mono text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">
              <th className="px-4 py-3">案件名</th>
              <th className="px-4 py-3">クライアント</th>
              <th className="px-4 py-3">営業</th>
              <th className="px-4 py-3">技術</th>
              <th className="px-4 py-3 text-right">金額</th>
              <th className="px-4 py-3">納品</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {works.map((work) => (
              <tr key={work.id} className="border-b border-[var(--color-line)] last:border-b-0">
                <td className="px-4 py-3 text-[var(--color-ink)]">
                  {work.title}
                  {!work.is_published && (
                    <span className="ml-2 rounded-sm bg-[var(--color-paper)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-ink-muted)]">
                      非表示
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--color-ink-soft)]">{work.client_name ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink-soft)]">{work.sales_rep ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink-soft)]">{work.tech_rep ?? "—"}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-ink-soft)]">
                  {work.amount != null ? `¥${work.amount.toLocaleString("ja-JP")}` : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink-muted)]">{work.delivered_at ?? "—"}</td>
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
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-ink-muted)]">
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
