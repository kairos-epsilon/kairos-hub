import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Table,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class WorkCategory(enum.StrEnum):
    lp = "lp"
    corporate_site = "corporate_site"
    system = "system"
    app = "app"


# 実績とタグの多対多中間テーブル
work_tags = Table(
    "work_tags",
    Base.metadata,
    Column("work_id", UUID(as_uuid=False), ForeignKey("works.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=False), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="editor")  # editor / admin
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    works = relationship("Work", back_populates="created_by")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(50), unique=True, nullable=False, index=True)

    works = relationship("Work", secondary=work_tags, back_populates="tags")


class Work(Base):
    __tablename__ = "works"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    title = Column(String(200), nullable=False)
    category = Column(Enum(WorkCategory), nullable=False)
    client_industry = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    public_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)

    created_by_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    created_by = relationship("User", back_populates="works")
    tags = relationship("Tag", secondary=work_tags, back_populates="works")
    readme_cache = relationship(
        "ReadmeCache", back_populates="work", uselist=False, cascade="all, delete-orphan"
    )


class ReadmeCache(Base):
    __tablename__ = "readme_cache"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    work_id = Column(UUID(as_uuid=False), ForeignKey("works.id", ondelete="CASCADE"), unique=True, nullable=False)
    readme_content = Column(Text, nullable=True)
    fetched_at = Column(DateTime, default=lambda: datetime.now(UTC))

    work = relationship("Work", back_populates="readme_cache")
