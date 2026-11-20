import type { BoardNote, UserRole, WorkCategory } from "@/lib/types";

// ============================================================
// デモ用の初期データ
// すべて架空の案件・人物です（実在の取引先・金額ではありません）。
// ============================================================

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  label: string; // ログイン画面のボタンに出す説明
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "u-admin",
    email: "admin@kairos-hub.demo",
    password: "admin1234",
    name: "佐藤 管理者",
    role: "admin",
    label: "全権限（実績の登録・編集・削除、金額の閲覧、全付箋の管理）",
  },
  {
    id: "u-sales",
    email: "sales@kairos-hub.demo",
    password: "sales1234",
    name: "鈴木 営業",
    role: "sales",
    label: "実績の登録・編集と金額の閲覧ができる",
  },
  {
    id: "u-production",
    email: "production@kairos-hub.demo",
    password: "production1234",
    name: "高橋 制作",
    role: "production",
    label: "閲覧とボードのみ（受注金額は非表示、管理画面は入れない）",
  },
];

export interface StoredWork {
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
  tag_names: string[];
  readme_content: string | null;
}

function work(
  n: number,
  w: Omit<StoredWork, "id" | "created_at" | "updated_at" | "readme_content" | "thumbnail_url" | "data_url" | "github_url" | "public_url" | "memo" | "is_published"> &
    Partial<Pick<StoredWork, "public_url" | "github_url" | "data_url" | "thumbnail_url" | "readme_content" | "memo" | "is_published">>,
): StoredWork {
  const created = new Date(Date.UTC(2026, 0, 1) + n * 12 * 86400000).toISOString();
  return {
    id: `w-${String(n).padStart(2, "0")}`,
    public_url: null,
    github_url: null,
    data_url: null,
    thumbnail_url: null,
    readme_content: null,
    memo: null,
    is_published: true,
    created_at: created,
    updated_at: created,
    ...w,
  };
}

export const SEED_WORKS: StoredWork[] = [
  work(1, {
    title: "ネイルサロン予約管理アプリ（デモ版）",
    category: "system",
    client_name: "自社制作サンプル",
    client_industry: "美容・ネイルサロン",
    description:
      "予約・メニュー・スタッフ・売上を管理するネイルサロン向けのシステム。公開デモはバックエンドなしで動作し、お客様画面と管理画面の両方を試せる。",
    sales_rep: "鈴木 営業",
    tech_rep: "渋江",
    amount: null,
    ordered_at: "2026-04",
    delivered_at: "2026-06",
    public_url: "https://principal-booking-886q.vercel.app",
    github_url: "https://github.com/kairos-epsilon/principal-booking",
    memo: "営業用のデモとして常設。説明資料には公開URLを使う。",
    is_published: true,
    tag_names: ["Next.js", "TypeScript", "予約システム", "Tailwind CSS"],
  }),
  work(2, {
    title: "実績管理システム Kairos Hub（本システム）",
    category: "system",
    client_name: "自社ツール",
    client_industry: "自社ツール",
    description:
      "制作実績を案件単位で管理する台帳。検索・タグ絞り込み、役割別の権限、案件ごとの付箋ボードを備える。いま見ているデモ版は、ブラウザ内にデータを保存する構成。",
    sales_rep: null,
    tech_rep: "渋江",
    amount: null,
    ordered_at: "2026-07",
    delivered_at: "2026-09",
    github_url: "https://github.com/kairos-epsilon/kairos-hub",
    memo: "本番構成は FastAPI + PostgreSQL。公開デモはバックエンドなし。",
    is_published: true,
    tag_names: ["Next.js", "FastAPI", "PostgreSQL", "Docker", "GitHub Actions"],
  }),
  work(3, {
    title: "みどり歯科クリニック｜医院サイト＋予約導線",
    category: "corporate_site",
    client_name: "みどり歯科クリニック（架空）",
    client_industry: "医療・歯科",
    description: "診療案内・院長紹介・アクセス・初診予約フォームを備えた7ページの医院サイト。スマホ表示と読み込み速度を重視。",
    sales_rep: "鈴木 営業",
    tech_rep: "高橋 制作",
    amount: 280000,
    ordered_at: "2026-03",
    delivered_at: "2026-05",
    memo: "更新はお知らせのみ客先で行う運用。保守プラン（スタンダード）契約中。",
    is_published: true,
    tag_names: ["コーポレートサイト", "レスポンシブ", "SEO"],
  }),
  work(4, {
    title: "かもめ運送｜採用LP",
    category: "lp",
    client_name: "かもめ運送株式会社（架空）",
    client_industry: "運送・物流",
    description: "ドライバー採用に絞った1ページのLP。1日の流れ・給与モデル・先輩の声を載せ、応募フォームまでの導線を短くした。",
    sales_rep: "鈴木 営業",
    tech_rep: "高橋 制作",
    amount: 80000,
    ordered_at: "2026-05",
    delivered_at: "2026-06",
    tag_names: ["LP", "採用", "フォーム"],
  }),
  work(5, {
    title: "あおぞらベーカリー｜ネットショップ",
    category: "app",
    client_name: "あおぞらベーカリー（架空）",
    client_industry: "飲食・小売",
    description: "焼き菓子の通販サイト。商品管理・在庫・注文通知までを管理画面で完結できる構成。",
    sales_rep: "鈴木 営業",
    tech_rep: "渋江",
    amount: 420000,
    ordered_at: "2026-02",
    delivered_at: "2026-05",
    memo: "決済は外部の決済サービスを利用。繁忙期（12月）前に在庫連携の確認が必要。",
    is_published: true,
    tag_names: ["EC", "管理画面", "Next.js"],
  }),
  work(6, {
    title: "さくら会計事務所｜コーポレートサイト",
    category: "corporate_site",
    client_name: "さくら会計事務所（架空）",
    client_industry: "士業・会計",
    description: "料金表と相談の流れを分かりやすく見せることに集中した、落ち着いた配色のサイト。",
    sales_rep: "鈴木 営業",
    tech_rep: "高橋 制作",
    amount: 190000,
    ordered_at: "2026-06",
    delivered_at: "2026-07",
    tag_names: ["コーポレートサイト", "SEO"],
  }),
  work(7, {
    title: "ひなた整体院｜予約・会員管理システム",
    category: "system",
    client_name: "ひなた整体院（架空）",
    client_industry: "美容・健康",
    description: "LINEからの予約受付と、カルテ・回数券の管理を一本化。受付の電話対応と紙の台帳を減らすことが目的。",
    sales_rep: "鈴木 営業",
    tech_rep: "渋江",
    amount: 560000,
    ordered_at: "2026-07",
    delivered_at: null,
    memo: "進行中。LINE連携の審査待ち。カルテ項目は院長と最終確認が必要。",
    is_published: true,
    tag_names: ["予約システム", "LINE連携", "Next.js", "PostgreSQL"],
  }),
  work(8, {
    title: "つばき工務店｜施工管理の社内システム",
    category: "system",
    client_name: "つばき工務店（架空）",
    client_industry: "建設・工務店",
    description: "現場ごとの工程・写真・見積を共有する社内システム。事務所とスマホの両方から使える。",
    sales_rep: "鈴木 営業",
    tech_rep: "渋江",
    amount: 480000,
    ordered_at: "2026-04",
    delivered_at: "2026-08",
    tag_names: ["業務システム", "管理画面", "FastAPI"],
  }),
  work(9, {
    title: "コスモスヨガ｜体験申込LP",
    category: "lp",
    client_name: "コスモスヨガ（架空）",
    client_industry: "教室・スクール",
    description: "初回体験の申込に絞ったLP。レッスン風景の写真とよくある質問で不安を減らす構成。",
    sales_rep: "鈴木 営業",
    tech_rep: "高橋 制作",
    amount: 60000,
    ordered_at: "2026-08",
    delivered_at: "2026-08",
    tag_names: ["LP", "フォーム"],
  }),
  work(10, {
    title: "旧・飲食店メニューLP（掲載終了）",
    category: "lp",
    client_name: "（掲載終了）",
    client_industry: "飲食",
    description: "公開を終了した案件。台帳には記録として残している。",
    sales_rep: "鈴木 営業",
    tech_rep: "高橋 制作",
    amount: 50000,
    ordered_at: "2025-11",
    delivered_at: "2025-12",
    memo: "クライアントの希望で非公開。台帳でのみ確認できる。",
    is_published: false,
    tag_names: ["LP"],
  }),
];

function note(
  n: number,
  work_id: string,
  user: DemoUser,
  body: string,
  daysAgo: number,
  is_pinned = false,
): BoardNote {
  const t = new Date(Date.now() - daysAgo * 86400000).toISOString();
  return {
    id: `n-${String(n).padStart(2, "0")}`,
    work_id,
    body,
    author_id: user.id,
    author_role: user.role,
    author_name: user.name,
    is_pinned,
    created_at: t,
    updated_at: t,
  };
}

const [ADMIN, SALES, PROD] = DEMO_USERS;

// 付箋の日付は「いま」を基準にした相対日数で、閲覧時に作り直す（古く見えないようにする）
export function seedNotes(): BoardNote[] {
  return [
    note(1, "w-07", SALES, "LINE公式アカウントの審査が通った。来週から本番連携のテストに入れる。", 2),
    note(2, "w-07", PROD, "カルテの項目案を作成済み。院長の確認待ち（生年月日・既往歴・施術メモ）。", 4),
    note(3, "w-07", ADMIN, "納期は10月末のまま。LINE連携が遅れる場合は先に予約機能だけ納品する。", 6, true),
    note(4, "w-05", SALES, "12月の繁忙期前に、在庫の連携を一度確認してほしいとのご要望。", 9),
    note(5, "w-05", PROD, "確認用の在庫テスト項目を共有フォルダに置いた。", 8),
    note(6, "w-03", SALES, "お知らせの更新方法を動画でまとめてほしいとのこと。次の保守連絡で対応。", 15),
    note(7, "w-08", ADMIN, "追加の現場2件を登録済み。次回の請求は月末に確認。", 20, true),
    note(8, "w-01", ADMIN, "公開デモの説明文を現在の内容に更新した。", 30),
  ];
}
