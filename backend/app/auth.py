from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="認証情報が無効です",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token is None:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


# 役割の定義
# admin: 管理者（全権限）/ sales: 営業（案件編集可）/ production: 制作（閲覧＋ボードのみ）
# 旧データ互換: "editor" は管理者相当として扱う
ROLE_ADMIN = "admin"
ROLE_SALES = "sales"
ROLE_PRODUCTION = "production"

# 案件データの編集・受注金額の閲覧ができる役割
WORK_EDIT_ROLES = {ROLE_ADMIN, ROLE_SALES, "editor"}


def can_edit_works(user: User) -> bool:
    """案件データの編集・金額閲覧が許可された役割か。"""
    return user.role in WORK_EDIT_ROLES


def require_work_editor(current_user: User = Depends(get_current_user)) -> User:
    """案件データ編集権限を要求する依存。制作アカウントは弾く。"""
    if not can_edit_works(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を行う権限がありません",
        )
    return current_user
