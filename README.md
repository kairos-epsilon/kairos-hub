# Kairos Hub

Kairosが実際に運用する、制作実績（ポートフォリオ）管理システム。
LP・コーポレートサイト・システム開発などの実績をタイトル・URL・GitHubリンク・使用技術タグ・説明文で一元管理し、公開一覧・検索・タグ絞り込みで誰でも参照できる。登録・編集は認証されたKairos関係者のみが行える。

## 特徴

- **実績の一元管理**：これまでGitHub（kairos-epsilon / kairos-proposals）とkairos-portfolio静的サイトに分散していた実績データをDBで一元管理
- **検索・タグ絞り込み**：キーワード検索、カテゴリ別、使用技術タグ別に実績を横断的に確認できる
- **GitHub連携**：リポジトリURLを登録すると、GitHub APIからREADMEを自動取得し技術解説として表示
- **公開/非公開の制御**：クライアント都合で外部に出せない実績は非公開設定にして社内参照用に管理できる
- **本システム自体が実績**：Next.js + FastAPI + PostgreSQL + Docker + AWS ECSという技術構成そのものが、Kairosの技術実績の一つとして機能する

## アーキテクチャ

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│  Next.js (SSR)   │─────▶│   FastAPI (REST)  │─────▶│ PostgreSQL   │
│  App Router      │      │   JWT認証          │      │              │
│  Server Actions  │◀─────│                    │      │              │
└─────────────────┘      └──────────────────┘      └──────────────┘
        │                          │
        │                          ▼
        │                 GitHub API（README自動取得）
        ▼
   ブラウザ（管理者 / 一般閲覧者）
```

- **フロントエンド**：Next.js（App Router, TypeScript）。公開ページはServer Componentがバックエンドに直接fetchし、登録・編集はServer Actionsで完結。Cookie（httpOnly）でJWTを保持し、`proxy.ts`（Next.js 16のmiddleware）で `/admin` 配下を保護
- **バックエンド**：FastAPI（REST API）。SQLAlchemy + PostgreSQL。パスワードはbcryptでハッシュ化し、JWTで認証
- **インフラ**：開発はDocker Compose、本番はAWS ECS（Fargate想定）を想定した構成。CI/CDはGitHub Actions

## ディレクトリ構成

```
kairos-hub/
├── backend/                # FastAPI
│   ├── app/
│   │   ├── main.py         # エントリーポイント
│   │   ├── models.py       # SQLAlchemyモデル
│   │   ├── schemas.py      # Pydanticスキーマ
│   │   ├── auth.py         # JWT認証・パスワードハッシュ
│   │   ├── github_client.py# GitHub README取得
│   │   └── routers/        # APIエンドポイント
│   ├── scripts/seed.py     # 初期データ投入
│   ├── tests/               # pytest
│   └── Dockerfile
├── frontend/                # Next.js
│   ├── app/                 # ページ・Server Actions
│   ├── components/          # UIコンポーネント
│   ├── lib/                 # API呼び出し・セッション管理
│   ├── proxy.ts              # /admin配下のルート保護
│   └── Dockerfile
├── docker-compose.yml        # ローカル起動用
└── .github/workflows/ci.yml  # CI/CD
```

## セットアップ（ローカル開発）

### 前提

- Docker / Docker Compose
- （Dockerを使わない場合）Python 3.12+, Node.js 22+, PostgreSQL 16

### Docker Composeで起動

```bash
git clone https://github.com/kairos-epsilon/kairos-hub.git
cd kairos-hub

# 環境変数を必要に応じて編集（デフォルトのままでもローカル起動可能）
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up --build
```

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- APIドキュメント（Swagger UI）: http://localhost:8000/docs

### 初期データ投入（シード）

```bash
docker compose exec backend python -m scripts.seed
```

デフォルトでは `admin@example.com` / `please-change-me` で管理者アカウントが作成される。**本番投入時は必ず環境変数 `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` を指定し、ログイン後すぐにパスワードを変更すること。**

### Dockerを使わないローカル起動

**バックエンド:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
# .env を用意し、DATABASE_URLをローカルPostgreSQLに合わせる
uvicorn app.main:app --reload
```

**フロントエンド:**
```bash
cd frontend
npm install
npm run dev
```

## テスト・Lint

```bash
# バックエンド
cd backend
ruff check app/ scripts/ tests/
pytest tests/ -v

# フロントエンド
cd frontend
npm run lint
npm run build
```

## 環境変数

### backend/.env

| 変数名 | 説明 | デフォルト |
|---|---|---|
| `DATABASE_URL` | PostgreSQL接続文字列 | `postgresql://kairos:kairos@localhost:5432/kairos_hub` |
| `JWT_SECRET_KEY` | JWT署名用シークレット（本番では必ず変更） | `change-me-in-production` |
| `JWT_EXPIRE_MINUTES` | トークン有効期限（分） | `10080`（7日間） |
| `UPLOAD_DIR` | サムネイル画像の保存先 | `/app/uploads` |
| `CORS_ORIGINS` | 許可するオリジン（JSON配列） | `["http://localhost:3000"]` |
| `GITHUB_API_TOKEN` | GitHub API用トークン（任意。未設定だとレート制限が厳しい） | 空 |

### frontend/.env

| 変数名 | 説明 | デフォルト |
|---|---|---|
| `API_URL` | バックエンドAPIのURL（サーバーサイドから参照） | `http://localhost:8000` |

## 本番デプロイ（AWS ECS）

Docker化まではこのリポジトリで完結しているが、ECSへの実デプロイ（タスク定義・ALB・RDS構築など）は別途、AWSアカウントを保有するメンバーが実施する。基本方針:

- `backend` / `frontend` それぞれをECR（Elastic Container Registry）にpush
- ECS Fargateで各サービスを起動し、ALB経由で公開
- DBはRDS（PostgreSQL）を利用し、`DATABASE_URL` をECSタスク定義の環境変数/Secrets Managerで注入
- GitHub Actionsから `docker build` → ECRへpush → ECSサービス更新、までを追加でCI/CDに組み込む想定

## ライセンス

Kairos内部利用のためのプロプライエタリなツール。
