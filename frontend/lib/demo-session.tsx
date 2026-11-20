"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser, UserRole } from "@/lib/types";
import { getSessionUser, loginAsRole, loginWith, logout as storeLogout, resetDemo } from "@/lib/demo-store";

type Status = "loading" | "ready";

interface Ctx {
  user: CurrentUser | null;
  status: Status;
  /** ストアを書き換えたあとに呼ぶと、画面が再読み込みされる */
  rev: number;
  bump: () => void;
  login: (email: string, password: string) => boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  reset: () => void;
}

const DemoCtx = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [rev, setRev] = useState(0);

  useEffect(() => {
    // 保存済みのログイン状態は、マウント後にブラウザ側でしか読めないため、ここで一度だけ反映する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getSessionUser());
    setStatus("ready");
  }, []);

  const bump = useCallback(() => setRev((r) => r + 1), []);

  const value = useMemo<Ctx>(
    () => ({
      user,
      status,
      rev,
      bump,
      login: (email, password) => {
        const u = loginWith(email, password);
        if (!u) return false;
        setUser(u);
        return true;
      },
      loginAs: (role) => setUser(loginAsRole(role)),
      logout: () => {
        storeLogout();
        setUser(null);
      },
      reset: () => {
        resetDemo();
        setRev((r) => r + 1);
      },
    }),
    [user, status, rev, bump],
  );

  return <DemoCtx.Provider value={value}>{children}</DemoCtx.Provider>;
}

export function useDemo(): Ctx {
  const ctx = useContext(DemoCtx);
  if (!ctx) throw new Error("DemoProvider の外では使えません");
  return ctx;
}

/** ログイン必須の画面を包む。未ログインなら /login へ、権限が足りなければ / へ戻す。 */
export function RequireAuth({
  children,
  workEditorOnly = false,
}: {
  children: (user: CurrentUser) => React.ReactNode;
  workEditorOnly?: boolean;
}) {
  const { user, status } = useDemo();
  const router = useRouter();
  const allowed = user && (!workEditorOnly || ["admin", "sales", "editor"].includes(user.role));

  useEffect(() => {
    if (status !== "ready") return;
    if (!user) router.replace("/login");
    else if (!allowed) router.replace("/");
  }, [status, user, allowed, router]);

  if (status !== "ready" || !user || !allowed) {
    return <div className="mx-auto max-w-5xl px-6 py-24 font-mono text-xs text-[var(--color-ink-muted)]">読み込み中…</div>;
  }
  return <>{children(user)}</>;
}
