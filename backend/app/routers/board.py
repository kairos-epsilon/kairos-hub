from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import ROLE_ADMIN, get_current_user
from app.database import get_db
from app.models import BoardNote, User, Work
from app.schemas import BoardNoteCreate, BoardNoteOut, BoardNoteUpdate

router = APIRouter(prefix="/api/works/{work_id}/board", tags=["board"])


def _get_work_or_404(db: Session, work_id: str) -> Work:
    work = db.query(Work).filter(Work.id == work_id).first()
    if work is None:
        raise HTTPException(status_code=404, detail="案件が見つかりません")
    return work


@router.get("", response_model=list[BoardNoteOut])
def list_notes(
    work_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """案件のボード付箋一覧。ピン留めを上に、その中で新しい順。"""
    _get_work_or_404(db, work_id)
    return (
        db.query(BoardNote)
        .filter(BoardNote.work_id == work_id)
        .order_by(BoardNote.is_pinned.desc(), BoardNote.created_at.desc())
        .all()
    )


@router.post("", response_model=BoardNoteOut, status_code=201)
def create_note(
    work_id: str,
    payload: BoardNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """付箋を貼る。認証済みユーザー（管理者・営業・制作）なら誰でも可。"""
    _get_work_or_404(db, work_id)
    if not payload.body.strip():
        raise HTTPException(status_code=400, detail="本文を入力してください")

    note = BoardNote(
        work_id=work_id,
        body=payload.body,
        author_id=current_user.id,
        author_role=current_user.role,
        author_name=current_user.name,
        is_pinned=payload.is_pinned,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def _get_note_or_404(db: Session, work_id: str, note_id: str) -> BoardNote:
    note = (
        db.query(BoardNote)
        .filter(BoardNote.id == note_id, BoardNote.work_id == work_id)
        .first()
    )
    if note is None:
        raise HTTPException(status_code=404, detail="付箋が見つかりません")
    return note


def _can_modify(note: BoardNote, user: User) -> bool:
    """管理者は全付箋、それ以外は自分の役割が書いた付箋のみ編集・削除可。"""
    if user.role == ROLE_ADMIN or user.role == "editor":
        return True
    return note.author_role == user.role


@router.put("/{note_id}", response_model=BoardNoteOut)
def update_note(
    work_id: str,
    note_id: str,
    payload: BoardNoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = _get_note_or_404(db, work_id, note_id)
    if not _can_modify(note, current_user):
        raise HTTPException(status_code=403, detail="この付箋を編集する権限がありません")

    if payload.body is not None:
        if not payload.body.strip():
            raise HTTPException(status_code=400, detail="本文を入力してください")
        note.body = payload.body
    if payload.is_pinned is not None:
        note.is_pinned = payload.is_pinned

    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(
    work_id: str,
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = _get_note_or_404(db, work_id, note_id)
    if not _can_modify(note, current_user):
        raise HTTPException(status_code=403, detail="この付箋を削除する権限がありません")
    db.delete(note)
    db.commit()
