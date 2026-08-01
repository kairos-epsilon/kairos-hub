"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/app/actions";
import { uploadThumbnailAction } from "@/app/actions";
import { CATEGORY_LABELS, type WorkCategory, type WorkDetail } from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as WorkCategory[];

const initialState: ActionState = undefined;

interface WorkFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  initialWork?: WorkDetail;
  submitLabel: string;
}

export function WorkForm({ action, initialWork, submitLabel }: WorkFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialWork?.thumbnail_url ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadThumbnailAction(formData);
    setUploading(false);

    if (result.url) {
      setThumbnailUrl(result.url);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

      <div>
        <label className="font-mono text-xs text-[var(--color-ink-muted)]" htmlFor="title">
          タイトル *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialWork?.title}
          className="mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-[var(--color-ink-muted)]" htmlFor="category">
            カテゴリ *
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={initialWork?.category ?? "lp"}
            className="mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-xs text-[var(--color-ink-muted)]" htmlFor="client_industry">
            クライアント業種
          </label>
          <input
            id="client_industry"
            name="client_industry"
            type="text"
            defaultValue={initialWork?.client_industry ?? ""}
            className="mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="font-mono text-xs text-[var(--color-ink-muted)]" htmlFor="description">
          説明文
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialWork?.description ?? ""}
          className="mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-[var(--color-ink-muted)]" htmlFor="public_url">
            公開URL
          </label>
          <input
            id="public_url"
            name="public_url"
            type="url"
            defaultValue={initialWork?.public_url ?? ""}
            className="mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
          />
        </div>

        <div>
          <label className="font-mono text-xs text-[var(--color-ink-muted)]" htmlFor="github_url">
            GitHubリポジトリURL
          </label>
          <input
            id="github_url"
            name="github_url"
            type="url"
            defaultValue={initialWork?.github_url ?? ""}
            className="mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="font-mono text-xs text-[var(--color-ink-muted)]" htmlFor="tags">
          技術タグ（カンマ区切り）
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          placeholder="Next.js, FastAPI, Docker"
          defaultValue={initialWork?.tags.map((t) => t.name).join(", ")}
          className="mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
        />
      </div>

      <div>
        <label className="font-mono text-xs text-[var(--color-ink-muted)]">サムネイル画像</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleThumbnailChange}
          className="mt-1 block text-sm text-[var(--color-ink-soft)]"
        />
        {uploading && <p className="mt-1 font-mono text-[11px] text-[var(--color-ink-muted)]">アップロード中…</p>}
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="thumbnail preview" className="mt-2 h-24 rounded-sm border border-[var(--color-line)]" />
        )}
      </div>

      <label className="flex items-center gap-2 font-mono text-sm text-[var(--color-ink-soft)]">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={initialWork?.is_published ?? false}
          className="h-4 w-4"
        />
        公開する
      </label>

      {state?.error && (
        <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || uploading}
        className="w-fit rounded-sm bg-[var(--color-ink)] px-5 py-2.5 font-mono text-sm text-[var(--color-paper)] hover:bg-[var(--color-ink-soft)] disabled:opacity-60"
      >
        {isPending ? "保存中…" : submitLabel}
      </button>
    </form>
  );
}
