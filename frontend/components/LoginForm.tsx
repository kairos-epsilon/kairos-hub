"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-session";
import { DEMO_USERS } from "@/lib/demo-data";
import { ROLE_LABELS, type UserRole } from "@/lib/types";

export function LoginForm() {
  const { login, loginAs } = useDemo();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function enterAs(role: UserRole) {
    loginAs(role);
    router.push(role === "production" ? "/" : "/admin");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-brass)]">
          デモ用ログイン（ワンクリック）
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {DEMO_USERS.map((u) => (
            <button
              key={u.role}
              type="button"
              onClick={() => enterAs(u.role)}
              className="rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-3 text-left hover:border-[var(--color-brass)]"
            >
              <span className="font-mono text-sm text-[var(--color-ink)]">
                {ROLE_LABELS[u.role]}として入る
              </span>
              <span className="mt-0.5 block text-xs text-[var(--color-ink-muted)]">{u.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const ok = login(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""));
          if (!ok) {
            setError("メールアドレスまたはパスワードが違います。");
            return;
          }
          setError(null);
          router.push("/admin");
        }}
        className="flex flex-col gap-4 border-t border-[var(--color-line)] pt-6"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">
          メールアドレスでログイン
        </p>
        <div>
          <label className="font-mono text-xs text-[var(--color-ink-muted)]" htmlFor="email">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={DEMO_USERS[0].email}
            className="mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-[var(--color-ink-muted)]" htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            defaultValue={DEMO_USERS[0].password}
            className="mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
          />
        </div>
        {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          className="rounded-sm bg-[var(--color-ink)] px-4 py-2 font-mono text-sm text-[var(--color-paper)] hover:bg-[var(--color-ink-soft)]"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}
