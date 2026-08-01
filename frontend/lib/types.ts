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
  client_industry: string | null;
  description: string | null;
  public_url: string | null;
  github_url: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface WorkDetail extends Work {
  readme_content: string | null;
}
