import Link from "next/link";
import { getToken } from "@/lib/session";
import { logoutAction } from "@/app/actions";

export async function Header() {
  const token = await getToken();

  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-paper-raised)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl italic tracking-tight text-[var(--color-ink)]">
            Kairos Hub
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
            実績管理
          </span>
        </Link>

        <nav className="flex items-center gap-6 font-mono text-sm">
          <Link href="/" className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
            実績一覧
          </Link>
          {token ? (
            <>
              <Link href="/admin" className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
                管理画面
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-sm border border-[var(--color-line)] px-3 py-1.5 text-[var(--color-ink-soft)] hover:border-[var(--color-brass)] hover:text-[var(--color-ink)]"
                >
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-sm border border-[var(--color-line)] px-3 py-1.5 text-[var(--color-ink-soft)] hover:border-[var(--color-brass)] hover:text-[var(--color-ink)]"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
