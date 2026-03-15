"""
Tests for /doctors endpoints
"""
import pytest
from app.models.doctor import Doctor
from app.models.user import User
from app.core.security import hash_password
from tests.conftest import unique_email


async def _seed_doctor(db, department="Cardiology"):
    """Create a doctor user + doctor profile, return doctor id."""
    email = unique_email("dr")
    user = User(name="Dr. Seed", email=email, phone=unique_email("ph").replace("@test.com", ""),
                password=hash_password("doc123"), role="DOCTOR")
    db.add(user)
    await db.flush()
    doc = Doctor(
        user_id=user.id, specialty="Cardiologist", department=department,
        qualification="MD", experience_years=10, consultation_fee=1500,
        bio="Test bio", rating=4.5, available_slots='["09:00 AM"]', is_available=True,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc.id


@pytest.mark.asyncio
class TestDoctorList:
    async def test_list_doctors_returns_array(self, client, db):
        await _seed_doctor(db, "Cardiology")
        resp = await client.get("/doctors")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_list_doctors_includes_required_fields(self, client, db):
        await _seed_doctor(db, "Neurology")
        resp = await client.get("/doctors")
        assert resp.status_code == 200
        doctors = resp.json()
        assert len(doctors) > 0
        doc = doctors[0]
        for field in ("id", "name", "specialty", "department", "rating", "image", "reviews", "experience"):
            assert field in doc, f"Missing field: {field}"

    async def test_filter_by_department(self, client, db):
        # Seed one of each so we know both exist
        await _seed_doctor(db, "Cardiology")
        await _seed_doctor(db, "Neurology")
        resp = await client.get("/doctors?department=Cardiology")
        assert resp.status_code == 200
        results = resp.json()
        assert len(results) > 0
        assert all(d["department"] == "Cardiology" for d in results)

    async def test_filter_nonexistent_department_returns_empty(self, client):
        resp = await client.get("/doctors?department=FakeDept999")
        assert resp.status_code == 200
        assert resp.json() == []


@pytest.mark.asyncio
class TestDoctorDetail:
    async def test_get_doctor_by_id(self, client, db):
        doc_id = await _seed_doctor(db, "Orthopedics")
        resp = await client.get(f"/doctors/{doc_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == doc_id
        assert "available_slots" in data

    async def test_get_nonexistent_doctor_returns_404(self, client):
        resp = await client.get("/doctors/99999")
        assert resp.status_code == 404

    async def test_doctor_image_field_is_url(self, client, db):
        doc_id = await _seed_doctor(db, "Pediatrics")
        resp = await client.get(f"/doctors/{doc_id}")
        image = resp.json()["image"]
        assert isinstance(image, str)
        assert image.startswith("http")

    async def test_doctor_experience_field_formatted(self, client, db):
        doc_id = await _seed_doctor(db, "Dermatology")
        resp = await client.get(f"/doctors/{doc_id}")
        assert "Years" in resp.json()["experience"]

    async def test_doctor_reviews_is_integer(self, client, db):
        doc_id = await _seed_doctor(db, "Oncology")
        resp = await client.get(f"/doctors/{doc_id}")
        assert isinstance(resp.json()["reviews"], int)
