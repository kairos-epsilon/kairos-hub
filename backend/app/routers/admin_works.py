import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.github_client import fetch_readme
from app.models import ReadmeCache, Tag, User, Work
from app.schemas import WorkCreate, WorkDetailOut, WorkOut, WorkUpdate

router = APIRouter(prefix="/api/admin/works", tags=["admin-works"])


def _resolve_tags(db: Session, tag_names: list[str]) -> list[Tag]:
    tags = []
    for name in {t.strip() for t in tag_names if t.strip()}:
        tag = db.query(Tag).filter(Tag.name == name).first()
        if tag is None:
            tag = Tag(name=name)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags


@router.get("", response_model=list[WorkOut])
def list_all_works(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """非公開も含めた全実績一覧（管理ダッシュボード用）"""
    return db.query(Work).options(joinedload(Work.tags)).order_by(Work.created_at.desc()).all()


@router.get("/{work_id}", response_model=WorkDetailOut)
def get_work_admin(
    work_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """非公開実績も含めた1件取得（編集画面用）"""
    work = (
        db.query(Work)
        .options(joinedload(Work.tags), joinedload(Work.readme_cache))
        .filter(Work.id == work_id)
        .first()
    )
    if work is None:
        raise HTTPException(status_code=404, detail="実績が見つかりません")

    result = WorkDetailOut.model_validate(work)
    if work.readme_cache:
        result.readme_content = work.readme_cache.readme_content
    return result


@router.post("", response_model=WorkOut, status_code=201)
def create_work(
    payload: WorkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    work = Work(
        **payload.model_dump(exclude={"tag_names"}),
        created_by_id=current_user.id,
    )
    work.tags = _resolve_tags(db, payload.tag_names)
    db.add(work)
    db.commit()
    db.refresh(work)
    return work


@router.put("/{work_id}", response_model=WorkOut)
def update_work(
    work_id: str,
    payload: WorkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    work = db.query(Work).filter(Work.id == work_id).first()
    if work is None:
        raise HTTPException(status_code=404, detail="実績が見つかりません")

    data = payload.model_dump(exclude_unset=True, exclude={"tag_names"})
    for field, value in data.items():
        setattr(work, field, value)

    if payload.tag_names is not None:
        work.tags = _resolve_tags(db, payload.tag_names)

    db.commit()
    db.refresh(work)
    return work


@router.delete("/{work_id}", status_code=204)
def delete_work(
    work_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    work = db.query(Work).filter(Work.id == work_id).first()
    if work is None:
        raise HTTPException(status_code=404, detail="実績が見つかりません")
    db.delete(work)
    db.commit()


@router.post("/{work_id}/fetch-readme", response_model=WorkDetailOut)
async def fetch_work_readme(
    work_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    work = db.query(Work).options(joinedload(Work.tags)).filter(Work.id == work_id).first()
    if work is None:
        raise HTTPException(status_code=404, detail="実績が見つかりません")
    if not work.github_url:
        raise HTTPException(status_code=400, detail="GitHub URLが登録されていません")

    readme_content = await fetch_readme(work.github_url)
    if readme_content is None:
        raise HTTPException(status_code=502, detail="READMEの取得に失敗しました")

    cache = db.query(ReadmeCache).filter(ReadmeCache.work_id == work.id).first()
    if cache is None:
        cache = ReadmeCache(work_id=work.id, readme_content=readme_content)
        db.add(cache)
    else:
        cache.readme_content = readme_content

    db.commit()
    db.refresh(work)

    result = WorkDetailOut.model_validate(work)
    result.readme_content = readme_content
    return result


@router.post("/upload-thumbnail")
async def upload_thumbnail(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    allowed_ext = {".png", ".jpg", ".jpeg", ".webp"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail="対応していない画像形式です")

    os.makedirs(settings.upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.upload_dir, filename)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    return {"thumbnail_url": f"/uploads/{filename}"}
