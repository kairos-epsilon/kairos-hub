"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/actions";

const initialState: ActionState = undefined;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="font-mono text-xs text-[var(--color-ink-muted)]" htmlFor="email">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
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
          className="mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-sm bg-[var(--color-ink)] px-4 py-2 font-mono text-sm text-[var(--color-paper)] hover:bg-[var(--color-ink-soft)] disabled:opacity-60"
      >
        {isPending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
