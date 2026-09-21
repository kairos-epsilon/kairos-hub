"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createBoardNoteAction,
  deleteBoardNoteAction,
  updateBoardNoteAction,
} from "@/app/actions";
import { ROLE_LABELS, type BoardNote, type CurrentUser } from "@/lib/types";

const roleColor: Record<string, string> = {
  admin: "var(--color-ink)",
  sales: "var(--color-brass)",
  production: "#5a7d7c",
  editor: "var(--color-ink)",
};

function canModify(note: BoardNote, user: CurrentUser): boolean {
  if (user.role === "admin" || user.role === "editor") return true;
  return note.author_role === user.role;
}

export function Board({
  workId,
  initialNotes,
  currentUser,
}: {
  workId: string;
  initialNotes: BoardNote[];
  currentUser: CurrentUser;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 擬似リアルタイム: 30秒ごとにサーバーコンポーネントを再取得
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 30000);
    return () => clearInterval(timer);
  }, [router]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!body.trim()) return;
    const fd = new FormData();
    fd.set("body", body);
    if (isPinned) fd.set("is_pinned", "on");
    startTransition(async () => {
      const res = await createBoardNoteAction(workId, fd);
      if (res.error) {
        setError(res.error);
      } else {
        setBody("");
        setIsPinned(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-10 border-t border-[var(--color-line)] pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">
          ボード（連絡・貼り出し）
        </h2>
        <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
          {ROLE_LABELS[currentUser.role]}として表示中・30秒ごと自動更新
        </span>
      </div>

      {/* 追加フォーム */}
      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="連絡事項や決定事項を貼り出す…"
          className="w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-3 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 font-mono text-xs text-[var(--color-ink-soft)]">
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="h-3.5 w-3.5" />
            重要（上部に固定）
          </label>
          <button
            type="submit"
            disabled={isPending || !body.trim()}
            className="rounded-sm bg-[var(--color-ink)] px-4 py-1.5 font-mono text-xs text-[var(--color-paper)] hover:bg-[var(--color-ink-soft)] disabled:opacity-50"
          >
            {isPending ? "追加中…" : "貼り出す"}
          </button>
        </div>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </form>

      {/* 付箋一覧 */}
      <div className="mt-6 flex flex-col gap-3">
        {initialNotes.length === 0 && (
          <p className="rounded-sm border border-dashed border-[var(--color-line)] p-6 text-center font-mono text-xs text-[var(--color-ink-muted)]">
            まだ付箋はありません。
          </p>
        )}
        {initialNotes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            workId={workId}
            editable={canModify(note, currentUser)}
          />
        ))}
      </div>
    </div>
  );
}

function NoteItem({
  note,
  workId,
  editable,
}: {
  note: BoardNote;
  workId: string;
  editable: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);
  const [isPending, startTransition] = useTransition();

  const accent = roleColor[note.author_role] ?? "var(--color-ink)";

  function save() {
    startTransition(async () => {
      await updateBoardNoteAction(workId, note.id, draft, note.is_pinned);
      setEditing(false);
      router.refresh();
    });
  }

  function togglePin() {
    startTransition(async () => {
      await updateBoardNoteAction(workId, note.id, note.body, !note.is_pinned);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("この付箋を削除しますか？")) return;
    startTransition(async () => {
      await deleteBoardNoteAction(workId, note.id);
      router.refresh();
    });
  }

  return (
    <div
      className="rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-4"
      style={{ borderLeftWidth: "3px", borderLeftColor: accent }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium" style={{ color: accent }}>
            {ROLE_LABELS[note.author_role]}・{note.author_name}
          </span>
          {note.is_pinned && (
            <span className="rounded-sm bg-[var(--color-brass-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-ink)]">
              重要
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
          {new Date(note.created_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {editing ? (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
          />
          <div className="flex gap-2">
            <button onClick={save} disabled={isPending} className="rounded-sm bg-[var(--color-ink)] px-3 py-1 font-mono text-xs text-[var(--color-paper)] disabled:opacity-50">保存</button>
            <button onClick={() => { setEditing(false); setDraft(note.body); }} className="rounded-sm border border-[var(--color-line)] px-3 py-1 font-mono text-xs text-[var(--color-ink-soft)]">取消</button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink)]">{note.body}</p>
      )}

      {editable && !editing && (
        <div className="mt-3 flex gap-3">
          <button onClick={togglePin} disabled={isPending} className="font-mono text-[11px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            {note.is_pinned ? "固定解除" : "上部に固定"}
          </button>
          <button onClick={() => setEditing(true)} className="font-mono text-[11px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">編集</button>
          <button onClick={remove} disabled={isPending} className="font-mono text-[11px] text-red-600 hover:text-red-800">削除</button>
        </div>
      )}
    </div>
  );
}
