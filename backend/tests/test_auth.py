def test_login_success(client, admin_user):
    r = client.post("/api/auth/login", json=admin_user)
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password(client, admin_user):
    r = client.post("/api/auth/login", json={"email": admin_user["email"], "password": "wrong"})
    assert r.status_code == 401


def test_login_unknown_user(client):
    r = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "x"})
    assert r.status_code == 401


def test_me_requires_auth(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401


def test_me_with_token(client, auth_headers):
    r = client.get("/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == "admin@example.com"
