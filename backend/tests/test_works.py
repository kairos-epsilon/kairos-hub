WORK_PAYLOAD = {
    "title": "principal-booking",
    "category": "system",
    "client_industry": "美容",
    "description": "ネイルサロン予約管理アプリ",
    "public_url": "https://principal-booking-886q.vercel.app",
    "github_url": None,
    "is_published": True,
    "tag_names": ["Next.js", "Prisma"],
}


def create_work(client, auth_headers, **overrides):
    payload = {**WORK_PAYLOAD, **overrides}
    r = client.post("/api/admin/works", json=payload, headers=auth_headers)
    assert r.status_code == 201
    return r.json()


def test_create_work_requires_auth(client):
    r = client.post("/api/admin/works", json=WORK_PAYLOAD)
    assert r.status_code == 401


def test_create_and_list_public(client, auth_headers):
    work = create_work(client, auth_headers)
    assert work["title"] == "principal-booking"
    assert {t["name"] for t in work["tags"]} == {"Next.js", "Prisma"}

    r = client.get("/api/works", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_unpublished_work_hidden_from_public(client, auth_headers):
    create_work(client, auth_headers, is_published=False)

    r = client.get("/api/works", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) == 0


def test_unpublished_work_visible_in_admin_list(client, auth_headers):
    create_work(client, auth_headers, is_published=False)

    r = client.get("/api/admin/works", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_search_by_keyword(client, auth_headers):
    create_work(client, auth_headers, title="Re.funfun", description="コーポレートHP")
    create_work(client, auth_headers, title="shibue-shoten", description="企業サイト")

    r = client.get("/api/works", params={"q": "コーポレート"}, headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "Re.funfun"


def test_filter_by_category(client, auth_headers):
    create_work(client, auth_headers, title="LP案件", category="lp")
    create_work(client, auth_headers, title="システム案件", category="system")

    r = client.get("/api/works", params={"category": "lp"}, headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "LP案件"


def test_filter_by_tag(client, auth_headers):
    create_work(client, auth_headers, title="A", tag_names=["Docker"])
    create_work(client, auth_headers, title="B", tag_names=["Vercel"])

    r = client.get("/api/works", params={"tag": "Docker"}, headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "A"


def test_get_detail(client, auth_headers):
    work = create_work(client, auth_headers)
    r = client.get(f"/api/works/{work['id']}", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["title"] == "principal-booking"


def test_get_detail_404(client, auth_headers):
    r = client.get("/api/works/nonexistent-id", headers=auth_headers)
    assert r.status_code == 404


def test_update_work(client, auth_headers):
    work = create_work(client, auth_headers)
    r = client.put(
        f"/api/admin/works/{work['id']}",
        json={"is_published": False, "title": "更新後タイトル"},
        headers=auth_headers,
    )
    assert r.status_code == 200
    assert r.json()["is_published"] is False
    assert r.json()["title"] == "更新後タイトル"


def test_delete_work(client, auth_headers):
    work = create_work(client, auth_headers)
    r = client.delete(f"/api/admin/works/{work['id']}", headers=auth_headers)
    assert r.status_code == 204

    r = client.get(f"/api/works/{work['id']}", headers=auth_headers)
    assert r.status_code == 404


def test_admin_get_single_work(client, auth_headers):
    work = create_work(client, auth_headers, is_published=False)
    r = client.get(f"/api/admin/works/{work['id']}", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["title"] == "principal-booking"


def test_tags_list(client, auth_headers):
    create_work(client, auth_headers, tag_names=["Next.js", "FastAPI"])
    r = client.get("/api/tags")
    assert r.status_code == 200
    names = {t["name"] for t in r.json()}
    assert {"Next.js", "FastAPI"} <= names
