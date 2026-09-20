"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/app/actions";
import { uploadThumbnailAction } from "@/app/actions";
import { CATEGORY_LABELS, type WorkCategory, type WorkDetail } from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as WorkCategory[];

const initialState: ActionState = undefined;

const inputClass =
  "mt-1 w-full rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none";
const labelClass = "font-mono text-xs text-[var(--color-ink-muted)]";
const sectionTitleClass =
  "font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-brass)] border-b border-[var(--color-line)] pb-2";

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
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

      {/* --- 基本情報 --- */}
      <div className="flex flex-col gap-4">
        <p className={sectionTitleClass}>基本情報</p>

        <div>
          <label className={labelClass} htmlFor="title">案件名 *</label>
          <input id="title" name="title" type="text" required defaultValue={initialWork?.title} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="client_name">クライアント名</label>
            <input id="client_name" name="client_name" type="text" defaultValue={initialWork?.client_name ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="client_industry">クライアント業種</label>
            <input id="client_industry" name="client_industry" type="text" defaultValue={initialWork?.client_industry ?? ""} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="category">カテゴリ *</label>
          <select id="category" name="category" required defaultValue={initialWork?.category ?? "lp"} className={inputClass}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="description">案件概要</label>
          <textarea id="description" name="description" rows={3} defaultValue={initialWork?.description ?? ""} className={inputClass} />
        </div>
      </div>

      {/* --- 担当・金額・時期 --- */}
      <div className="flex flex-col gap-4">
        <p className={sectionTitleClass}>担当・金額・時期</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="sales_rep">営業担当</label>
            <input id="sales_rep" name="sales_rep" type="text" defaultValue={initialWork?.sales_rep ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="tech_rep">技術担当</label>
            <input id="tech_rep" name="tech_rep" type="text" defaultValue={initialWork?.tech_rep ?? ""} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass} htmlFor="amount">受注金額（円）</label>
            <input id="amount" name="amount" type="text" inputMode="numeric" placeholder="350000" defaultValue={initialWork?.amount ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ordered_at">受注時期</label>
            <input id="ordered_at" name="ordered_at" type="text" placeholder="2026-06" defaultValue={initialWork?.ordered_at ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="delivered_at">納品時期</label>
            <input id="delivered_at" name="delivered_at" type="text" placeholder="2026-08" defaultValue={initialWork?.delivered_at ?? ""} className={inputClass} />
          </div>
        </div>
      </div>

      {/* --- URL・データ --- */}
      <div className="flex flex-col gap-4">
        <p className={sectionTitleClass}>URL・データ</p>

        <div>
          <label className={labelClass} htmlFor="public_url">納品URL（公開先）</label>
          <input id="public_url" name="public_url" type="url" defaultValue={initialWork?.public_url ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="data_url">関連データURL（ドライブ等の場所）</label>
          <input id="data_url" name="data_url" type="url" placeholder="https://drive.google.com/..." defaultValue={initialWork?.data_url ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="github_url">GitHub URL（任意）</label>
          <input id="github_url" name="github_url" type="url" defaultValue={initialWork?.github_url ?? ""} className={inputClass} />
        </div>
      </div>

      {/* --- その他 --- */}
      <div className="flex flex-col gap-4">
        <p className={sectionTitleClass}>その他</p>

        <div>
          <label className={labelClass} htmlFor="tags">技術タグ（カンマ区切り）</label>
          <input id="tags" name="tags" type="text" placeholder="Next.js, FastAPI, Docker" defaultValue={initialWork?.tags.map((t) => t.name).join(", ")} className={inputClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="memo">メモ・備考</label>
          <textarea id="memo" name="memo" rows={4} placeholder="進行中の連絡事項や引き継ぎメモなど" defaultValue={initialWork?.memo ?? ""} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>サムネイル画像（任意）</label>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleThumbnailChange} className="mt-1 block text-sm text-[var(--color-ink-soft)]" />
          {uploading && <p className="mt-1 font-mono text-[11px] text-[var(--color-ink-muted)]">アップロード中…</p>}
          {thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailUrl} alt="thumbnail preview" className="mt-2 h-24 rounded-sm border border-[var(--color-line)]" />
          )}
        </div>

        <label className="flex items-center gap-2 font-mono text-sm text-[var(--color-ink-soft)]">
          <input type="checkbox" name="is_published" defaultChecked={initialWork?.is_published ?? true} className="h-4 w-4" />
          一覧に表示する
        </label>
      </div>

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
