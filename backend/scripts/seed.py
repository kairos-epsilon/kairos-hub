"""
初期データ投入スクリプト。

管理者ユーザーと、Kairosが実際に保有する実績データを登録する。
実行方法:
    docker compose exec backend python -m scripts.seed

環境変数 SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD で管理者アカウントを指定できる
（未設定時はデフォルト値を使用するが、初回ログイン後に必ずパスワードを変更すること）。
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Tag, User, Work, WorkCategory

SEED_ADMIN_EMAIL = os.environ.get("SEED_ADMIN_EMAIL", "admin@example.com")
SEED_ADMIN_PASSWORD = os.environ.get("SEED_ADMIN_PASSWORD", "please-change-me")

SEED_WORKS = [
    {
        "title": "principal-booking｜ネイルサロン予約管理アプリ",
        "category": WorkCategory.system,
        "client_industry": "美容・ネイルサロン",
        "description": "Next.js + Prisma + Supabase + Vercelで構築した予約管理システム。今後の開発サンプルのベースとして使用。",
        "public_url": "https://principal-booking-886q.vercel.app",
        "github_url": "https://github.com/kairos-epsilon/principal-booking",
        "tags": ["Next.js", "Prisma", "Supabase", "Vercel", "予約システム"],
        "is_published": True,
    },
    {
        "title": "Re.funfun｜コーポレートHP＋LP3本",
        "category": WorkCategory.corporate_site,
        "client_industry": "コーポレートサイト",
        "description": "コーポレートHPとLP3本の制作・公開実績。",
        "public_url": "https://www.re-funfun.com/",
        "github_url": None,
        "tags": ["コーポレートサイト", "LP"],
        "is_published": True,
    },
    {
        "title": "shibue-shoten｜7ページ企業サイト",
        "category": WorkCategory.corporate_site,
        "client_industry": "企業サイト",
        "description": "7ページ構成の企業サイト制作実績。",
        "public_url": "https://shibue-shoten.github.io/shibue320/",
        "github_url": None,
        "tags": ["コーポレートサイト"],
        "is_published": True,
    },
    {
        "title": "Kairos Hub｜実績管理システム（本システム）",
        "category": WorkCategory.system,
        "client_industry": "自社ツール",
        "description": "Next.js + FastAPI + PostgreSQL + Docker + AWS ECSで構築した実績管理システム。本ツール自体がKairosの技術実績のひとつ。",
        "public_url": None,
        "github_url": "https://github.com/kairos-epsilon/kairos-hub",
        "tags": ["Next.js", "FastAPI", "Docker", "AWS ECS", "PostgreSQL"],
        "is_published": True,
    },
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == SEED_ADMIN_EMAIL).first()
        if admin is None:
            admin = User(
                email=SEED_ADMIN_EMAIL,
                password_hash=hash_password(SEED_ADMIN_PASSWORD),
                name="Kairos管理者",
                role="admin",
            )
            db.add(admin)
            db.flush()
            print(f"管理者ユーザーを作成しました: {SEED_ADMIN_EMAIL}")
        else:
            print(f"管理者ユーザーは既に存在します: {SEED_ADMIN_EMAIL}")

        for item in SEED_WORKS:
            exists = db.query(Work).filter(Work.title == item["title"]).first()
            if exists:
                print(f"スキップ（既存）: {item['title']}")
                continue

            tags = []
            for tag_name in item["tags"]:
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if tag is None:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    db.flush()
                tags.append(tag)

            work = Work(
                title=item["title"],
                category=item["category"],
                client_industry=item["client_industry"],
                description=item["description"],
                public_url=item["public_url"],
                github_url=item["github_url"],
                is_published=item["is_published"],
                created_by_id=admin.id,
                tags=tags,
            )
            db.add(work)
            print(f"登録しました: {item['title']}")

        db.commit()
        print("シードデータ投入が完了しました。")
        if SEED_ADMIN_PASSWORD == "please-change-me":
            print("【注意】デフォルトパスワードのままです。ログイン後すぐに変更してください。")
    finally:
        db.close()


if __name__ == "__main__":
    run()
