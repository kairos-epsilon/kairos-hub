# Kairos Hub 本番デプロイ手順書（無料構成）

Vercel（フロント）+ Render（API）+ Supabase（DB）の無料枠だけで、Kairos Hub を公開URLとして稼働させる手順。**月額$0**で運用できる。

## 全体像

```
  ブラウザ
    │
    ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Vercel       │  API   │  Render       │  SQL   │  Supabase     │
│  (Next.js)    │───────▶│  (FastAPI)    │───────▶│  (PostgreSQL) │
│  フロント公開URL│        │  API公開URL    │        │  マネージドDB  │
└──────────────┘        └──────────────┘        └──────────────┘
```

デプロイは **DB → API → フロント** の順で行う（後段が前段のURLを必要とするため）。

---

## 事前準備

- GitHubアカウント（kairos-hub リポジトリにアクセスできること）
- 以下3サービスのアカウント（すべてGitHubアカウントで無料登録可能）
  - [Supabase](https://supabase.com/)
  - [Render](https://render.com/)
  - [Vercel](https://vercel.com/)

---

## STEP 1：Supabase で PostgreSQL を用意する

1. Supabase にログインし「New project」を作成
   - Organization：任意（無料のものでよい）
   - Project name：`kairos-hub`
   - Database Password：**強力なパスワードを設定し、必ず控える**（後で接続文字列に使う）
   - Region：`Northeast Asia (Tokyo)` を推奨
2. プロジェクト作成完了後、左メニュー「Connect」（または Project Settings → Database）を開く
3. **Connection string** の項目で、`URI` 形式の接続文字列をコピーする。形式は次の通り：
   ```
   postgresql://postgres.xxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```
   - `[YOUR-PASSWORD]` の部分を、手順1で設定したパスワードに置き換える
   - **接続方式は「Session pooler」または「Transaction pooler」を推奨**（Renderの無料枠から安定して繋がる）
4. この接続文字列を、次のSTEP 2で `DATABASE_URL` として使う。控えておく。

> メモ：Supabase無料枠はプロジェクトが一定期間（約1週間）アクセスされないと一時停止する。再開はダッシュボードからワンクリックで可能。

---

## STEP 2：Render で FastAPI（バックエンド）をデプロイする

1. Render にログインし「New +」→「Web Service」を選択
2. 「Build and deploy from a Git repository」で `kairos-epsilon/kairos-hub` を接続
3. 設定を以下の通り入力：
   | 項目 | 値 |
   |---|---|
   | Name | `kairos-hub-api` |
   | Region | `Singapore`（東京に最も近い無料リージョン） |
   | Root Directory | `backend` |
   | Runtime | `Python 3` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | Instance Type | `Free` |
4. 「Environment Variables」で以下を設定：
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | STEP 1でコピーしたSupabaseの接続文字列 |
   | `JWT_SECRET_KEY` | 十分に長いランダム文字列（下記コマンドで生成可） |
   | `JWT_ALGORITHM` | `HS256` |
   | `JWT_EXPIRE_MINUTES` | `10080` |
   | `UPLOAD_DIR` | `/tmp/uploads` |
   | `CORS_ORIGINS` | STEP 3でフロントのURLが決まったら設定（一旦 `["http://localhost:3000"]` でOK） |
   | `GITHUB_API_TOKEN` | 空でよい（READMEのレート制限緩和が必要なら後で設定） |

   JWT_SECRET_KEY の生成例（ターミナル）：
   ```
   python -c "import secrets; print(secrets.token_urlsafe(48))"
   ```
5. 「Create Web Service」でデプロイ開始。数分でビルドが完了する
6. 完了後に表示される **API公開URL**（例：`https://kairos-hub-api.onrender.com`）を控える
7. 動作確認：ブラウザで `https://kairos-hub-api.onrender.com/health` を開き、`{"status":"ok"}` が表示されればOK。`.../docs` でSwagger UIも確認できる

> 注意：Render無料枠は15分アクセスがないとスリープする。次のアクセスで自動起動するが初回は30〜60秒かかる。デモ用途では許容範囲。

---

## STEP 3：Vercel で Next.js（フロントエンド）をデプロイする

1. Vercel にログインし「Add New...」→「Project」を選択
2. `kairos-epsilon/kairos-hub` をインポート
3. 設定を以下の通り：
   | 項目 | 値 |
   |---|---|
   | Framework Preset | `Next.js`（自動検出される） |
   | Root Directory | `frontend` を指定（「Edit」から選ぶ） |
4. 「Environment Variables」で以下を設定：
   | Key | Value |
   |---|---|
   | `API_URL` | STEP 2のRender API URL（例：`https://kairos-hub-api.onrender.com`） |
5. 「Deploy」を実行。完了すると **フロント公開URL**（例：`https://kairos-hub.vercel.app`）が発行される

---

## STEP 4：CORS を本番URLに合わせて更新する

フロントのURLが確定したので、Render側のCORS設定を更新する。

1. Render の `kairos-hub-api` → Environment
2. `CORS_ORIGINS` を、STEP 3で発行されたフロントURLに更新：
   ```
   ["https://kairos-hub.vercel.app"]
   ```
   （URLは実際に発行されたものに置き換える。末尾スラッシュは付けない）
3. 保存すると自動で再デプロイされる

---

## STEP 5：初期データ投入（管理者アカウント＋実績シード）

Render無料枠にはワンオフのシェルアクセスが無いため、初期データ投入は次のいずれかで行う。

### 方法A：Render Shell（有料プランの場合）
```
python -m scripts.seed
```

### 方法B：ローカルからSupabaseに対して投入（無料枠でも可・推奨）
手元のPC（Windows）で、Supabaseの `DATABASE_URL` を使ってseedスクリプトを実行する：
```
git clone https://github.com/kairos-epsilon/kairos-hub.git
cd kairos-hub/backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
set DATABASE_URL=（SupabaseのURL）  # Windowsの場合
set SEED_ADMIN_EMAIL=あなたのメール
set SEED_ADMIN_PASSWORD=強力なパスワード
python -m scripts.seed
```
これでSupabase上に管理者アカウントと初期実績データが作成される。

---

## STEP 6：動作確認

1. フロント公開URL（`https://kairos-hub.vercel.app`）を開く
2. 実績一覧が表示されることを確認（初期データが見える）
3. 「ログイン」からSTEP 5で作った管理者アカウントでログイン
4. 管理ダッシュボードで実績の登録・編集ができることを確認

---

## 既知の制約（無料構成ゆえの割り切り）

- **サムネイル画像はアップロードしても再起動で消える**：Render無料枠は永続ディスクが無く `/tmp` に保存するため。恒久運用するならSupabase Storageなど外部ストレージへの差し替えが必要（別途対応可）。デモ用途では初期データの画像URL直接指定で回避できる。
- **初回アクセスが遅い**：Render/Supabaseとも無料枠はスリープするため、しばらくアクセスがないと初回表示に数十秒かかる。面談前に一度アクセスして起こしておくとよい。
- **独自ドメインは未設定**：`*.vercel.app` / `*.onrender.com` のURLになる。独自ドメインを当てることも可能（Vercel/Render両方とも無料で対応）。

---

## ポートフォリオへの反映

公開URL稼働後、kairos-portfolio の `system.html` にある Kairos Hub 実績カードのリンクを更新できる：
- 現在：`View Code →`（GitHubリポジトリ）
- 追加：`View App →`（Vercelの公開URL）を併記すると、「実際に動くシステム」としての実績価値が上がる
