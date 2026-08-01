import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import admin_works, auth, tags, works


@asynccontextmanager
async def lifespan(app: FastAPI):
    # MVP: 起動時にテーブルを自動作成。本番運用ではAlembicマイグレーションに置き換える。
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Kairos Hub API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(auth.router)
app.include_router(works.router)
app.include_router(admin_works.router)
app.include_router(tags.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
