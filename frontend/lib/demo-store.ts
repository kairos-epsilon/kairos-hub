import { DEMO_USERS, SEED_WORKS, seedNotes, type StoredWork } from "@/lib/demo-data";
import type { BoardNote, CurrentUser, Tag, UserRole, Work, WorkCategory, WorkDetail } from "@/lib/types";

// ============================================================
// ブラウザ内ストア（localStorage）
// 元のバックエンド（FastAPI + PostgreSQL）の役割を、ブラウザ内で代替する。
// 権限の規則（金額の非表示、付箋の編集権限）は元の実装と同じ。
// ============================================================

const DB_KEY = "kairos-hub-demo-db-v1";
const SESSION_KEY = "kairos-hub-demo-session";

interface Db {
  works: StoredWork[];
  notes: BoardNote[];
}

function seed(): Db {
  return { works: SEED_WORKS.map((w) => ({ ...w })), notes: seedNotes() };
}

function load(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Db;
      if (Array.isArray(parsed.works) && Array.isArray(parsed.notes)) return parsed;
    }
  } catch {
    // 破損・利用不可のときは初期データで続行する
  }
  const db = seed();
  save(db);
  return db;
}

function save(db: Db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // 容量超過などは無視（画面上は直前の状態のまま）
  }
}

export function resetDemo() {
  try {
    localStorage.removeItem(DB_KEY);
  } catch {
    // 何もしない
  }
}

// ---------- 権限（元の auth.py と同じ規則） ----------

export function canEditWorks(role: UserRole): boolean {
  return role === "admin" || role === "sales" || role === "editor";
}

export function canModifyNote(note: BoardNote, user: CurrentUser): boolean {
  if (user.role === "admin" || user.role === "editor") return true;
  return note.author_role === user.role;
}

// ---------- セッション ----------

function toCurrent(id: string): CurrentUser | null {
  const u = DEMO_USERS.find((x) => x.id === id);
  return u ? { id: u.id, email: u.email, name: u.name, role: u.role } : null;
}

export function getSessionUser(): CurrentUser | null {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    return id ? toCurrent(id) : null;
  } catch {
    return null;
  }
}

export function loginWith(email: string, password: string): CurrentUser | null {
  const u = DEMO_USERS.find((x) => x.email === email.trim() && x.password === password);
  if (!u) return null;
  try {
    localStorage.setItem(SESSION_KEY, u.id);
  } catch {
    // 保存できなくてもこの画面の間は動くよう、呼び出し側で state を持つ
  }
  return toCurrent(u.id);
}

export function loginAsRole(role: UserRole): CurrentUser | null {
  const u = DEMO_USERS.find((x) => x.role === role);
  return u ? loginWith(u.email, u.password) : null;
}

export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // 何もしない
  }
}

// ---------- 実績 ----------

function tagObjects(names: string[]): Tag[] {
  return names.map((name) => ({ id: `t-${name}`, name }));
}

function toWork(w: StoredWork, role: UserRole): Work {
  const { tag_names, readme_content, ...rest } = w;
  void readme_content;
  return {
    ...rest,
    // 制作アカウントには受注金額を見せない
    amount: canEditWorks(role) ? w.amount : null,
    tags: tagObjects(tag_names),
  };
}

export function listWorks(
  role: UserRole,
  filter: { q?: string; category?: string; tag?: string } = {},
): Work[] {
  const q = (filter.q ?? "").trim().toLowerCase();
  return load()
    .works.filter((w) => w.is_published)
    .filter((w) => !filter.category || w.category === filter.category)
    .filter((w) => !filter.tag || w.tag_names.includes(filter.tag))
    .filter((w) => {
      if (!q) return true;
      return [w.title, w.description, w.client_name, w.sales_rep, w.tech_rep]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q));
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((w) => toWork(w, role));
}

/** 管理画面用：非公開も含めた全件（金額あり）。 */
export function listAllWorks(): Work[] {
  return load()
    .works.slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((w) => toWork(w, "admin"));
}

export function listTags(): Tag[] {
  const names = new Set<string>();
  for (const w of load().works) if (w.is_published) w.tag_names.forEach((n) => names.add(n));
  return tagObjects([...names].sort((a, b) => a.localeCompare(b, "ja")));
}

export function getWork(id: string, role: UserRole): WorkDetail | null {
  const w = load().works.find((x) => x.id === id);
  if (!w) return null;
  return { ...toWork(w, role), readme_content: w.readme_content };
}

export interface WorkInput {
  title: string;
  category: WorkCategory;
  client_name: string | null;
  client_industry: string | null;
  description: string | null;
  sales_rep: string | null;
  tech_rep: string | null;
  amount: number | null;
  ordered_at: string | null;
  delivered_at: string | null;
  public_url: string | null;
  data_url: string | null;
  github_url: string | null;
  thumbnail_url: string | null;
  memo: string | null;
  is_published: boolean;
  tag_names: string[];
}

export function createWork(input: WorkInput): StoredWork {
  const db = load();
  const now = new Date().toISOString();
  const w: StoredWork = {
    ...input,
    id: `w-${crypto.randomUUID().slice(0, 8)}`,
    readme_content: null,
    created_at: now,
    updated_at: now,
  };
  db.works.push(w);
  save(db);
  return w;
}

export function updateWork(id: string, input: WorkInput): boolean {
  const db = load();
  const i = db.works.findIndex((x) => x.id === id);
  if (i < 0) return false;
  db.works[i] = { ...db.works[i], ...input, updated_at: new Date().toISOString() };
  save(db);
  return true;
}

export function deleteWork(id: string) {
  const db = load();
  db.works = db.works.filter((x) => x.id !== id);
  db.notes = db.notes.filter((n) => n.work_id !== id);
  save(db);
}

export function saveReadme(id: string, content: string) {
  const db = load();
  const w = db.works.find((x) => x.id === id);
  if (!w) return;
  w.readme_content = content;
  save(db);
}

// ---------- 付箋ボード ----------

export function listNotes(workId: string): BoardNote[] {
  return load()
    .notes.filter((n) => n.work_id === workId)
    .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at));
}

export function addNote(workId: string, user: CurrentUser, body: string, isPinned: boolean): string | null {
  if (!body.trim()) return "本文を入力してください";
  const db = load();
  const now = new Date().toISOString();
  db.notes.push({
    id: `n-${crypto.randomUUID().slice(0, 8)}`,
    work_id: workId,
    body,
    author_id: user.id,
    author_role: user.role,
    author_name: user.name,
    is_pinned: isPinned,
    created_at: now,
    updated_at: now,
  });
  save(db);
  return null;
}

export function updateNote(
  workId: string,
  noteId: string,
  user: CurrentUser,
  body: string,
  isPinned: boolean,
): string | null {
  const db = load();
  const n = db.notes.find((x) => x.id === noteId && x.work_id === workId);
  if (!n) return "付箋が見つかりません";
  if (!canModifyNote(n, user)) return "この付箋を編集する権限がありません";
  if (!body.trim()) return "本文を入力してください";
  n.body = body;
  n.is_pinned = isPinned;
  n.updated_at = new Date().toISOString();
  save(db);
  return null;
}

export function deleteNote(workId: string, noteId: string, user: CurrentUser): string | null {
  const db = load();
  const n = db.notes.find((x) => x.id === noteId && x.work_id === workId);
  if (!n) return "付箋が見つかりません";
  if (!canModifyNote(n, user)) return "この付箋を削除する権限がありません";
  db.notes = db.notes.filter((x) => x.id !== noteId);
  save(db);
  return null;
}
