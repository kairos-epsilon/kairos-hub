
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.auth import can_edit_works, get_current_user
from app.database import get_db
from app.models import User, Work, WorkCategory
from app.schemas import WorkDetailOut, WorkOut

router = APIRouter(prefix="/api/works", tags=["works"])


def _mask_amount(result: WorkOut, user: User) -> WorkOut:
    """制作アカウントには受注金額を見せない（金額をNoneにして返す）。"""
    if not can_edit_works(user):
        result.amount = None
    return result


@router.get("", response_model=list[WorkOut])
def list_works(
    q: str | None = Query(None, description="案件名・クライアント・担当者のキーワード検索"),
    category: WorkCategory | None = Query(None),
    tag: str | None = Query(None, description="タグ名で絞り込み"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Work).options(joinedload(Work.tags)).filter(Work.is_published.is_(True))

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Work.title.ilike(like),
                Work.description.ilike(like),
                Work.client_name.ilike(like),
                Work.sales_rep.ilike(like),
                Work.tech_rep.ilike(like),
            )
        )

    if category:
        query = query.filter(Work.category == category)

    if tag:
        query = query.join(Work.tags).filter_by(name=tag)

    works = query.order_by(Work.created_at.desc()).all()
    results = [WorkOut.model_validate(w) for w in works]
    if not can_edit_works(current_user):
        for r in results:
            r.amount = None
    return results


@router.get("/{work_id}", response_model=WorkDetailOut)
def get_work(
    work_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    work = (
        db.query(Work)
        .options(joinedload(Work.tags), joinedload(Work.readme_cache))
        .filter(Work.id == work_id, Work.is_published.is_(True))
        .first()
    )
    if work is None:
        raise HTTPException(status_code=404, detail="案件が見つかりません")

    result = WorkDetailOut.model_validate(work)
    if work.readme_cache:
        result.readme_content = work.readme_cache.readme_content
    _mask_amount(result, current_user)
    return result
