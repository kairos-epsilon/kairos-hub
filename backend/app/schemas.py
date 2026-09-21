from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models import WorkCategory

# ---------- Auth ----------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    name: str
    role: str


# ---------- Tag ----------

class TagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str


# ---------- Work ----------

class WorkBase(BaseModel):
    title: str
    category: WorkCategory
    client_name: str | None = None
    client_industry: str | None = None
    description: str | None = None
    sales_rep: str | None = None
    tech_rep: str | None = None
    amount: int | None = None
    ordered_at: str | None = None
    delivered_at: str | None = None
    public_url: str | None = None
    data_url: str | None = None
    github_url: str | None = None
    thumbnail_url: str | None = None
    memo: str | None = None
    is_published: bool = True


class WorkCreate(WorkBase):
    tag_names: list[str] = []


class WorkUpdate(BaseModel):
    title: str | None = None
    category: WorkCategory | None = None
    client_name: str | None = None
    client_industry: str | None = None
    description: str | None = None
    sales_rep: str | None = None
    tech_rep: str | None = None
    amount: int | None = None
    ordered_at: str | None = None
    delivered_at: str | None = None
    public_url: str | None = None
    data_url: str | None = None
    github_url: str | None = None
    thumbnail_url: str | None = None
    memo: str | None = None
    is_published: bool | None = None
    tag_names: list[str] | None = None


class WorkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    category: WorkCategory
    client_name: str | None
    client_industry: str | None
    description: str | None
    sales_rep: str | None
    tech_rep: str | None
    amount: int | None
    ordered_at: str | None
    delivered_at: str | None
    public_url: str | None
    data_url: str | None
    github_url: str | None
    thumbnail_url: str | None
    memo: str | None
    is_published: bool
    created_at: datetime
    updated_at: datetime
    tags: list[TagOut] = []


class WorkDetailOut(WorkOut):
    readme_content: str | None = None


# ---------- Board ----------

class BoardNoteCreate(BaseModel):
    body: str
    is_pinned: bool = False


class BoardNoteUpdate(BaseModel):
    body: str | None = None
    is_pinned: bool | None = None


class BoardNoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    work_id: str
    body: str
    author_id: str
    author_role: str
    author_name: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
