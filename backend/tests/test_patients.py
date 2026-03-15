"""
Tests for /patients endpoints
"""
import pytest


@pytest.mark.asyncio
class TestPatientProfile:
    async def test_get_my_profile(self, client, patient_user):
        resp = await client.get("/patients/me",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert "user_id" in data

    async def test_get_my_profile_requires_auth(self, client):
        resp = await client.get("/patients/me")
        assert resp.status_code in (401, 403)

    async def test_update_my_profile_blood_group(self, client, patient_user):
        resp = await client.patch("/patients/me", json={"blood_group": "A+"},
                                  headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 200
        assert resp.json()["blood_group"] == "A+"

    async def test_update_my_profile_multiple_fields(self, client, patient_user):
        resp = await client.patch("/patients/me", json={
            "blood_group": "O+",
            "gender": "Male",
            "address": "123 Test Street",
            "allergies": "None",
        }, headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["blood_group"] == "O+"
        assert data["gender"] == "Male"
        assert data["address"] == "123 Test Street"

    async def test_update_profile_preserves_unpatched_fields(self, client, patient_user):
        """PATCH only updates provided fields; others stay unchanged."""
        # Set blood_group first
        await client.patch("/patients/me", json={"blood_group": "B+"},
                           headers={"Authorization": f"Bearer {patient_user['token']}"})
        # Now patch only gender — blood_group should still be B+
        resp = await client.patch("/patients/me", json={"gender": "Female"},
                                  headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 200
        assert resp.json()["blood_group"] == "B+"
        assert resp.json()["gender"] == "Female"

    async def test_update_profile_requires_auth(self, client):
        resp = await client.patch("/patients/me", json={"blood_group": "AB+"})
        assert resp.status_code in (401, 403)

    async def test_list_patients_requires_admin_or_doctor(self, client, patient_user):
        """Regular patients cannot list all patients."""
        resp = await client.get("/patients",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 403

    async def test_list_patients_accessible_by_admin(self, client, admin_user):
        resp = await client.get("/patients",
                                headers={"Authorization": f"Bearer {admin_user['token']}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_get_patient_by_id_requires_staff(self, client, patient_user, admin_user):
        # Get the patient's own ID first
        me = await client.get("/patients/me",
                              headers={"Authorization": f"Bearer {patient_user['token']}"})
        pat_id = me.json()["id"]

        # Admin can access it
        resp = await client.get(f"/patients/{pat_id}",
                                headers={"Authorization": f"Bearer {admin_user['token']}"})
        assert resp.status_code == 200

        # Patient cannot access /patients/{id} directly
        resp2 = await client.get(f"/patients/{pat_id}",
                                 headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp2.status_code == 403
