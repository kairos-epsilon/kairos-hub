export type WorkCategory = "lp" | "corporate_site" | "system" | "app";

export const CATEGORY_LABELS: Record<WorkCategory, string> = {
  lp: "LP",
  corporate_site: "コーポレートサイト",
  system: "システム開発",
  app: "アプリ",
};

export interface Tag {
  id: string;
  name: string;
}

export interface Work {
  id: string;
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
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface WorkDetail extends Work {
  readme_content: string | null;
}

export type UserRole = "admin" | "sales" | "production" | "editor";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "管理者",
  sales: "営業",
  production: "制作",
  editor: "管理者",
};

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface BoardNote {
  id: string;
  work_id: string;
  body: string;
  author_id: string;
  author_role: UserRole;
  author_name: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}
