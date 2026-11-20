import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-brass)]">
        Kairos Hub
      </p>
      <h1 className="mt-2 font-display text-2xl text-[var(--color-ink)]">関係者ログイン</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        公開デモです。役割ごとに見える範囲が変わるので、3つの役割を切り替えてお試しください。
      </p>

      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
