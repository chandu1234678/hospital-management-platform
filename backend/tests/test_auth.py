"""
Tests for /auth endpoints: register, login, refresh, /me
"""
import pytest
from tests.conftest import unique_email


@pytest.mark.asyncio
class TestRegister:
    async def test_register_patient_success(self, client):
        email = unique_email("alice")
        resp = await client.post("/auth/register", json={
            "name": "Alice", "email": email,
            "phone": "9111111111", "password": "pass1234", "role": "PATIENT",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == email
        assert data["role"] == "PATIENT"
        assert "password" not in data  # never expose hash

    async def test_register_duplicate_email_returns_400(self, client):
        email = unique_email("bob")
        payload = {"name": "Bob", "email": email, "phone": "9222222222",
                   "password": "pass1234", "role": "PATIENT"}
        r1 = await client.post("/auth/register", json=payload)
        assert r1.status_code == 201
        r2 = await client.post("/auth/register", json=payload)
        assert r2.status_code == 400
        assert "already registered" in r2.json()["detail"].lower()

    async def test_register_admin_role(self, client):
        email = unique_email("admin_reg")
        resp = await client.post("/auth/register", json={
            "name": "Admin2", "email": email,
            "phone": "9333333333", "password": "adminpass", "role": "ADMIN",
        })
        assert resp.status_code == 201
        assert resp.json()["role"] == "ADMIN"

    async def test_register_missing_name_returns_422(self, client):
        resp = await client.post("/auth/register", json={
            "email": unique_email("noname"), "password": "pass123", "role": "PATIENT",
        })
        assert resp.status_code == 422

    async def test_register_invalid_email_returns_422(self, client):
        resp = await client.post("/auth/register", json={
            "name": "Bad Email", "email": "not-an-email",
            "password": "pass123", "role": "PATIENT",
        })
        assert resp.status_code == 422

    async def test_register_creates_patient_profile(self, client, admin_user):
        """Registering as PATIENT should auto-create a patient profile."""
        email = unique_email("newpat")
        await client.post("/auth/register", json={
            "name": "New Pat", "email": email,
            "phone": "9444444444", "password": "pass123", "role": "PATIENT",
        })
        login = await client.post("/auth/login", json={"email": email, "password": "pass123"})
        token = login.json()["access_token"]
        resp = await client.get("/patients/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200


@pytest.mark.asyncio
class TestLogin:
    async def test_login_success_returns_tokens(self, client, patient_user):
        resp = await client.post("/auth/login", json={
            "email": patient_user["email"], "password": "testpass123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password_returns_401(self, client, patient_user):
        resp = await client.post("/auth/login", json={
            "email": patient_user["email"], "password": "wrongpass",
        })
        assert resp.status_code == 401

    async def test_login_unknown_email_returns_401(self, client):
        resp = await client.post("/auth/login", json={
            "email": "nobody_xyz@test.com", "password": "pass",
        })
        assert resp.status_code == 401

    async def test_login_missing_password_returns_422(self, client, patient_user):
        resp = await client.post("/auth/login", json={"email": patient_user["email"]})
        assert resp.status_code == 422

    async def test_login_returns_bearer_token_type(self, client, patient_user):
        resp = await client.post("/auth/login", json={
            "email": patient_user["email"], "password": "testpass123",
        })
        assert resp.json()["token_type"] == "bearer"


@pytest.mark.asyncio
class TestMe:
    async def test_me_returns_current_user(self, client, patient_user):
        resp = await client.get("/auth/me",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 200
        assert resp.json()["email"] == patient_user["email"]

    async def test_me_without_token_returns_403(self, client):
        resp = await client.get("/auth/me")
        assert resp.status_code in (401, 403)

    async def test_me_with_invalid_token_returns_401(self, client):
        resp = await client.get("/auth/me",
                                headers={"Authorization": "Bearer invalid.token.here"})
        assert resp.status_code == 401

    async def test_me_response_excludes_password(self, client, patient_user):
        resp = await client.get("/auth/me",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert "password" not in resp.json()

    async def test_me_includes_role(self, client, patient_user):
        resp = await client.get("/auth/me",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.json()["role"] == "PATIENT"


@pytest.mark.asyncio
class TestRefresh:
    async def test_refresh_returns_new_tokens(self, client, patient_user):
        login = await client.post("/auth/login", json={
            "email": patient_user["email"], "password": "testpass123",
        })
        refresh_token = login.json()["refresh_token"]
        resp = await client.post("/auth/refresh", json={"refresh_token": refresh_token})
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    async def test_refresh_with_invalid_token_returns_401(self, client):
        resp = await client.post("/auth/refresh", json={"refresh_token": "bad.token"})
        assert resp.status_code == 401

    async def test_new_access_token_works_for_me(self, client, patient_user):
        login = await client.post("/auth/login", json={
            "email": patient_user["email"], "password": "testpass123",
        })
        new_token = (await client.post("/auth/refresh",
                                       json={"refresh_token": login.json()["refresh_token"]}
                                       )).json()["access_token"]
        resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {new_token}"})
        assert resp.status_code == 200
