"""
Tests for /appointments endpoints
"""
import pytest
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.core.security import hash_password
from tests.conftest import unique_email


async def _seed_doctor_and_patient(db):
    """Seed a fresh doctor + patient pair, return (doctor_id, patient_id)."""
    # Doctor
    du = User(name="Dr. Appt", email=unique_email("dr_appt"),
              phone="96000" + str(id(db))[-5:],
              password=hash_password("doc123"), role="DOCTOR")
    db.add(du)
    await db.flush()
    doc = Doctor(
        user_id=du.id, specialty="General", department="Internal Medicine",
        qualification="MD", experience_years=5, consultation_fee=900,
        bio="", rating=4.0, available_slots='["10:00 AM"]', is_available=True,
    )
    db.add(doc)
    await db.flush()

    # Patient
    pu = User(name="Pat Appt", email=unique_email("pat_appt"),
              phone="97000" + str(id(db))[-5:],
              password=hash_password("pat123"), role="PATIENT")
    db.add(pu)
    await db.flush()
    pat = Patient(user_id=pu.id, gender="Male", blood_group="B+")
    db.add(pat)
    await db.commit()
    await db.refresh(doc)
    await db.refresh(pat)
    return doc.id, pat.id


@pytest.mark.asyncio
class TestCreateAppointment:
    async def test_create_appointment_success(self, client, db, patient_user):
        doc_id, pat_id = await _seed_doctor_and_patient(db)
        resp = await client.post("/appointments", json={
            "patient_id": pat_id, "doctor_id": doc_id,
            "appointment_date": "2026-04-10", "appointment_time": "10:00 AM",
            "department": "Internal Medicine", "reason": "Checkup",
        }, headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["patient_id"] == pat_id
        assert data["doctor_id"] == doc_id
        assert data["status"] == "SCHEDULED"
        assert data["token_number"] == 1

    async def test_create_appointment_requires_auth(self, client):
        resp = await client.post("/appointments", json={
            "patient_id": 1, "doctor_id": 1,
            "appointment_date": "2026-04-10", "appointment_time": "10:00 AM",
        })
        assert resp.status_code in (401, 403)

    async def test_token_number_increments_per_doctor_per_day(self, client, db, patient_user):
        doc_id, pat_id = await _seed_doctor_and_patient(db)
        headers = {"Authorization": f"Bearer {patient_user['token']}"}
        payload = {
            "patient_id": pat_id, "doctor_id": doc_id,
            "appointment_date": "2026-05-01", "appointment_time": "10:00 AM",
        }
        r1 = await client.post("/appointments", json=payload, headers=headers)
        r2 = await client.post("/appointments", json=payload, headers=headers)
        assert r1.status_code == 201
        assert r2.status_code == 201
        assert r1.json()["token_number"] == 1
        assert r2.json()["token_number"] == 2

    async def test_create_appointment_missing_required_fields_returns_422(self, client, patient_user):
        resp = await client.post("/appointments", json={"patient_id": 1},
                                 headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 422

    async def test_appointment_response_has_expected_fields(self, client, db, patient_user):
        doc_id, pat_id = await _seed_doctor_and_patient(db)
        resp = await client.post("/appointments", json={
            "patient_id": pat_id, "doctor_id": doc_id,
            "appointment_date": "2026-08-15", "appointment_time": "09:00 AM",
            "department": "Internal Medicine", "reason": "Follow-up",
        }, headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 201
        data = resp.json()
        for field in ("id", "patient_id", "doctor_id", "appointment_date",
                      "appointment_time", "status", "token_number", "created_at"):
            assert field in data, f"Missing field: {field}"


@pytest.mark.asyncio
class TestListAppointments:
    async def test_list_appointments_filtered_by_patient(self, client, db, patient_user):
        doc_id, pat_id = await _seed_doctor_and_patient(db)
        headers = {"Authorization": f"Bearer {patient_user['token']}"}
        await client.post("/appointments", json={
            "patient_id": pat_id, "doctor_id": doc_id,
            "appointment_date": "2026-06-01", "appointment_time": "09:00 AM",
        }, headers=headers)
        resp = await client.get(f"/appointments?patient_id={pat_id}", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert all(a["patient_id"] == pat_id for a in data)

    async def test_list_appointments_requires_auth(self, client):
        resp = await client.get("/appointments")
        assert resp.status_code in (401, 403)

    async def test_list_appointments_filter_by_status(self, client, db, patient_user):
        doc_id, pat_id = await _seed_doctor_and_patient(db)
        headers = {"Authorization": f"Bearer {patient_user['token']}"}
        await client.post("/appointments", json={
            "patient_id": pat_id, "doctor_id": doc_id,
            "appointment_date": "2026-09-01", "appointment_time": "11:00 AM",
        }, headers=headers)
        resp = await client.get("/appointments?status=SCHEDULED", headers=headers)
        assert resp.status_code == 200
        assert all(a["status"] == "SCHEDULED" for a in resp.json())


@pytest.mark.asyncio
class TestGetAppointment:
    async def test_get_appointment_by_id(self, client, db, patient_user):
        doc_id, pat_id = await _seed_doctor_and_patient(db)
        create = await client.post("/appointments", json={
            "patient_id": pat_id, "doctor_id": doc_id,
            "appointment_date": "2026-10-01", "appointment_time": "02:00 PM",
        }, headers={"Authorization": f"Bearer {patient_user['token']}"})
        appt_id = create.json()["id"]
        resp = await client.get(f"/appointments/{appt_id}",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 200
        assert resp.json()["id"] == appt_id

    async def test_get_nonexistent_appointment_returns_404(self, client, patient_user):
        resp = await client.get("/appointments/99999",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 404


@pytest.mark.asyncio
class TestCancelAppointment:
    async def test_cancel_sets_status_cancelled(self, client, db, patient_user):
        doc_id, pat_id = await _seed_doctor_and_patient(db)
        headers = {"Authorization": f"Bearer {patient_user['token']}"}
        create = await client.post("/appointments", json={
            "patient_id": pat_id, "doctor_id": doc_id,
            "appointment_date": "2026-07-01", "appointment_time": "11:00 AM",
        }, headers=headers)
        appt_id = create.json()["id"]
        resp = await client.delete(f"/appointments/{appt_id}", headers=headers)
        assert resp.status_code == 204

    async def test_cancel_nonexistent_returns_404(self, client, patient_user):
        resp = await client.delete("/appointments/99999",
                                   headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 404
