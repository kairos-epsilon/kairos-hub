import "server-only";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/constants";

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value;
}

export async function setToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日間
  });
}

export async function clearToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export async function getCurrentUser(): Promise<import("@/lib/types").CurrentUser | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const { apiFetch } = await import("@/lib/api");
    return await apiFetch<import("@/lib/types").CurrentUser>("/api/auth/me", { token });
  } catch {
    return null;
  }
}
