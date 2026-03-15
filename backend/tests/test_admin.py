"""
Tests for /admin endpoints — stats, appointments, patients, billing, lab
"""
import pytest


@pytest.mark.asyncio
class TestAdminStats:
    async def test_stats_returns_expected_keys(self, client, admin_user):
        resp = await client.get("/admin/stats",
                                headers={"Authorization": f"Bearer {admin_user['token']}"})
        assert resp.status_code == 200
        data = resp.json()
        for key in ("total_patients", "total_doctors", "total_appointments",
                    "today_appointments", "available_beds", "total_beds",
                    "pending_bills", "total_revenue"):
            assert key in data, f"Missing key: {key}"

    async def test_stats_values_are_numeric(self, client, admin_user):
        resp = await client.get("/admin/stats",
                                headers={"Authorization": f"Bearer {admin_user['token']}"})
        data = resp.json()
        assert isinstance(data["total_patients"], int)
        assert isinstance(data["total_revenue"], (int, float))

    async def test_stats_patient_token_returns_403(self, client, patient_user):
        """A valid patient token must be rejected with 403 (not 401)."""
        resp = await client.get("/admin/stats",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 403

    async def test_stats_no_token_returns_403(self, client):
        resp = await client.get("/admin/stats")
        assert resp.status_code in (401, 403)


@pytest.mark.asyncio
class TestAdminAppointments:
    async def test_get_all_appointments_returns_list(self, client, admin_user):
        resp = await client.get("/admin/appointments",
                                headers={"Authorization": f"Bearer {admin_user['token']}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_appointments_include_patient_and_doctor_names(self, client, admin_user):
        resp = await client.get("/admin/appointments",
                                headers={"Authorization": f"Bearer {admin_user['token']}"})
        assert resp.status_code == 200
        for appt in resp.json():
            assert "patient" in appt
            assert "doctor" in appt

    async def test_appointments_patient_token_returns_403(self, client, patient_user):
        resp = await client.get("/admin/appointments",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 403


@pytest.mark.asyncio
class TestAdminPatients:
    async def test_get_all_patients_returns_list(self, client, admin_user):
        resp = await client.get("/admin/patients",
                                headers={"Authorization": f"Bearer {admin_user['token']}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_patients_include_name_and_email(self, client, admin_user):
        resp = await client.get("/admin/patients",
                                headers={"Authorization": f"Bearer {admin_user['token']}"})
        for p in resp.json():
            assert "name" in p
            assert "email" in p

    async def test_patients_patient_token_returns_403(self, client, patient_user):
        resp = await client.get("/admin/patients",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 403


@pytest.mark.asyncio
class TestAdminBilling:
    async def test_get_all_billing_returns_list(self, client, admin_user):
        resp = await client.get("/admin/billing",
                                headers={"Authorization": f"Bearer {admin_user['token']}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_billing_patient_token_returns_403(self, client, patient_user):
        resp = await client.get("/admin/billing",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 403


@pytest.mark.asyncio
class TestAdminLab:
    async def test_get_all_lab_returns_list(self, client, admin_user):
        resp = await client.get("/admin/lab",
                                headers={"Authorization": f"Bearer {admin_user['token']}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_lab_patient_token_returns_403(self, client, patient_user):
        resp = await client.get("/admin/lab",
                                headers={"Authorization": f"Bearer {patient_user['token']}"})
        assert resp.status_code == 403
