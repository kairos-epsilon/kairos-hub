"""ボード（付箋）機能と役割別権限のテスト。"""


def _create_work(client, headers):
    r = client.post(
        "/api/admin/works",
        json={
            "title": "テスト案件",
            "category": "system",
            "client_name": "テスト社",
            "amount": 350000,
            "is_published": True,
            "tag_names": ["Next.js"],
        },
        headers=headers,
    )
    assert r.status_code == 201
    return r.json()["id"]


def test_works_list_requires_auth(client):
    assert client.get("/api/works").status_code == 401


def test_amount_hidden_from_production(client, auth_headers, sales_headers, prod_headers):
    wid = _create_work(client, auth_headers)
    assert client.get(f"/api/works/{wid}", headers=auth_headers).json()["amount"] == 350000
    assert client.get(f"/api/works/{wid}", headers=sales_headers).json()["amount"] == 350000
    assert client.get(f"/api/works/{wid}", headers=prod_headers).json()["amount"] is None


def test_production_cannot_edit_works(client, auth_headers, prod_headers):
    wid = _create_work(client, auth_headers)
    # 制作は案件登録・編集・削除ができない
    assert client.post("/api/admin/works", json={"title": "x", "category": "lp", "is_published": True}, headers=prod_headers).status_code == 403
    assert client.put(f"/api/admin/works/{wid}", json={"title": "y"}, headers=prod_headers).status_code == 403
    assert client.delete(f"/api/admin/works/{wid}", headers=prod_headers).status_code == 403


def test_sales_can_edit_works(client, auth_headers, sales_headers):
    # 営業は案件登録できる
    wid = _create_work(client, sales_headers)
    assert client.put(f"/api/admin/works/{wid}", json={"title": "更新"}, headers=sales_headers).status_code == 200


def test_board_create_and_list(client, auth_headers, sales_headers, prod_headers):
    wid = _create_work(client, auth_headers)
    # 営業・制作とも付箋を貼れる
    r1 = client.post(f"/api/works/{wid}/board", json={"body": "営業メモ", "is_pinned": True}, headers=sales_headers)
    assert r1.status_code == 201
    assert r1.json()["author_role"] == "sales"
    r2 = client.post(f"/api/works/{wid}/board", json={"body": "制作メモ"}, headers=prod_headers)
    assert r2.status_code == 201
    assert r2.json()["author_role"] == "production"

    notes = client.get(f"/api/works/{wid}/board", headers=prod_headers).json()
    assert len(notes) == 2
    assert notes[0]["is_pinned"] is True  # ピン留めが先頭


def test_board_empty_body_rejected(client, auth_headers):
    wid = _create_work(client, auth_headers)
    assert client.post(f"/api/works/{wid}/board", json={"body": "   "}, headers=auth_headers).status_code == 400


def test_board_edit_permission(client, auth_headers, sales_headers, prod_headers):
    wid = _create_work(client, auth_headers)
    sales_note = client.post(f"/api/works/{wid}/board", json={"body": "営業の付箋"}, headers=sales_headers).json()["id"]
    prod_note = client.post(f"/api/works/{wid}/board", json={"body": "制作の付箋"}, headers=prod_headers).json()["id"]

    # 制作は営業の付箋を編集・削除できない
    assert client.put(f"/api/works/{wid}/board/{sales_note}", json={"body": "改ざん"}, headers=prod_headers).status_code == 403
    assert client.delete(f"/api/works/{wid}/board/{sales_note}", headers=prod_headers).status_code == 403
    # 制作は自分の付箋を編集できる
    assert client.put(f"/api/works/{wid}/board/{prod_note}", json={"body": "修正"}, headers=prod_headers).status_code == 200
    # 管理者はどの付箋も削除できる
    assert client.delete(f"/api/works/{wid}/board/{sales_note}", headers=auth_headers).status_code == 204


def test_board_requires_auth(client, auth_headers):
    wid = _create_work(client, auth_headers)
    assert client.get(f"/api/works/{wid}/board").status_code == 401
    assert client.post(f"/api/works/{wid}/board", json={"body": "x"}).status_code == 401
