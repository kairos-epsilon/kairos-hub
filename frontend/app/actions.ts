"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch, API_URL, ApiError } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/session";
import type { Work, WorkDetail } from "@/lib/types";

export type ActionState = { error?: string } | undefined;

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const result = await apiFetch<{ access_token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await setToken(result.access_token);
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.message };
    }
    return { error: "ログインに失敗しました。時間をおいて再度お試しください。" };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await clearToken();
  redirect("/login");
}

function buildWorkPayload(formData: FormData) {
  const tagNames = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const amountRaw = String(formData.get("amount") ?? "").replace(/[,\s]/g, "");
  const amount = amountRaw ? Number(amountRaw) : null;

  return {
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? "lp"),
    client_name: String(formData.get("client_name") ?? "") || null,
    client_industry: String(formData.get("client_industry") ?? "") || null,
    description: String(formData.get("description") ?? "") || null,
    sales_rep: String(formData.get("sales_rep") ?? "") || null,
    tech_rep: String(formData.get("tech_rep") ?? "") || null,
    amount: Number.isFinite(amount) ? amount : null,
    ordered_at: String(formData.get("ordered_at") ?? "") || null,
    delivered_at: String(formData.get("delivered_at") ?? "") || null,
    public_url: String(formData.get("public_url") ?? "") || null,
    data_url: String(formData.get("data_url") ?? "") || null,
    github_url: String(formData.get("github_url") ?? "") || null,
    thumbnail_url: String(formData.get("thumbnail_url") ?? "") || null,
    memo: String(formData.get("memo") ?? "") || null,
    is_published: formData.get("is_published") === "on",
    tag_names: tagNames,
  };
}

export async function createWorkAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = await getToken();
  if (!token) redirect("/login");

  try {
    await apiFetch<Work>("/api/admin/works", {
      method: "POST",
      token,
      body: JSON.stringify(buildWorkPayload(formData)),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "登録に失敗しました" };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function updateWorkAction(
  workId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = await getToken();
  if (!token) redirect("/login");

  try {
    await apiFetch<Work>(`/api/admin/works/${workId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(buildWorkPayload(formData)),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "更新に失敗しました" };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/works/${workId}`);
  redirect("/admin");
}

export async function deleteWorkAction(workId: string) {
  const token = await getToken();
  if (!token) redirect("/login");

  await apiFetch(`/api/admin/works/${workId}`, {
    method: "DELETE",
    token,
  });

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function fetchReadmeAction(workId: string): Promise<WorkDetail | { error: string }> {
  const token = await getToken();
  if (!token) redirect("/login");

  try {
    const result = await apiFetch<WorkDetail>(`/api/admin/works/${workId}/fetch-readme`, {
      method: "POST",
      token,
    });
    revalidatePath(`/admin/works/${workId}/edit`);
    return result;
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "README取得に失敗しました" };
  }
}

export async function uploadThumbnailAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  const token = await getToken();
  if (!token) redirect("/login");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "画像ファイルを選択してください" };
  }

  const uploadForm = new FormData();
  uploadForm.set("file", file);

  const response = await fetch(`${API_URL}/api/admin/works/upload-thumbnail`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: uploadForm,
  });

  if (!response.ok) {
    return { error: "画像アップロードに失敗しました" };
  }

  const data = await response.json();
  return { url: data.thumbnail_url };
}
