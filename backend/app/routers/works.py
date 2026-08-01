
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Work, WorkCategory
from app.schemas import WorkDetailOut, WorkOut

router = APIRouter(prefix="/api/works", tags=["works"])


@router.get("", response_model=list[WorkOut])
def list_works(
    q: str | None = Query(None, description="タイトル・説明文のキーワード検索"),
    category: WorkCategory | None = Query(None),
    tag: str | None = Query(None, description="タグ名で絞り込み"),
    db: Session = Depends(get_db),
):
    query = db.query(Work).options(joinedload(Work.tags)).filter(Work.is_published.is_(True))

    if q:
        like = f"%{q}%"
        query = query.filter(or_(Work.title.ilike(like), Work.description.ilike(like)))

    if category:
        query = query.filter(Work.category == category)

    if tag:
        query = query.join(Work.tags).filter_by(name=tag)

    return query.order_by(Work.created_at.desc()).all()


@router.get("/{work_id}", response_model=WorkDetailOut)
def get_work(work_id: str, db: Session = Depends(get_db)):
    work = (
        db.query(Work)
        .options(joinedload(Work.tags), joinedload(Work.readme_cache))
        .filter(Work.id == work_id, Work.is_published.is_(True))
        .first()
    )
    if work is None:
        raise HTTPException(status_code=404, detail="実績が見つかりません")

    result = WorkDetailOut.model_validate(work)
    if work.readme_cache:
        result.readme_content = work.readme_cache.readme_content
    return result
