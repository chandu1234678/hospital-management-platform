"""
Seed script — populates deepthi_db with all demo data.
Run: venv\Scripts\python seed.py
"""
import asyncio, json, sys, os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.models.base import Base
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.billing import Bill
from app.models.prescription import Prescription
from app.models.lab_report import LabReport
from app.models.inventory import InventoryItem
from app.models.bed import Bed

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

DOCTORS_DATA = [
    dict(name="Dr. Rajesh Kumar",   email="rajesh@deepthi.com",  specialty="Senior Cardiologist",    department="Cardiology",       qualification="MD Cardiology, AIIMS Delhi",          experience_years=15, consultation_fee=1500, rating=4.9, bio="Board-certified cardiologist with 15+ years in interventional cardiology.", available_slots='["09:00 AM","10:30 AM","12:00 PM","02:00 PM","03:30 PM"]'),
    dict(name="Dr. Priya Sharma",   email="priya@deepthi.com",   specialty="Chief Neurologist",       department="Neurology",        qualification="MD Neurology, CMC Vellore",           experience_years=12, consultation_fee=1800, rating=4.8, bio="Specializes in stroke management and epilepsy.", available_slots='["10:00 AM","11:30 AM","01:00 PM","03:00 PM"]'),
    dict(name="Dr. Anil Deshmukh",  email="anil@deepthi.com",    specialty="Orthopedic Surgeon",      department="Orthopedics",      qualification="MS Orthopedics, KEM Hospital Mumbai",  experience_years=20, consultation_fee=2000, rating=4.9, bio="Senior orthopedic surgeon specializing in joint replacement.", available_slots='["09:30 AM","11:00 AM","02:30 PM","04:00 PM"]'),
    dict(name="Dr. Sarah Williams", email="sarah@deepthi.com",   specialty="Pediatric Specialist",    department="Pediatrics",       qualification="MD Pediatrics, Manipal University",   experience_years=10, consultation_fee=1200, rating=4.7, bio="Compassionate pediatrician dedicated to child health.", available_slots='["09:00 AM","10:00 AM","11:00 AM","02:00 PM","03:00 PM"]'),
    dict(name="Dr. Meena Iyer",     email="meena@deepthi.com",   specialty="Dermatologist",           department="Dermatology",      qualification="MD Dermatology, JIPMER Puducherry",   experience_years=8,  consultation_fee=1000, rating=4.6, bio="Specializes in cosmetic and medical dermatology.", available_slots='["10:00 AM","11:30 AM","03:00 PM","04:30 PM"]'),
    dict(name="Dr. Vikram Nair",    email="vikram@deepthi.com",  specialty="Ophthalmologist",         department="Ophthalmology",    qualification="MS Ophthalmology, AIIMS",             experience_years=14, consultation_fee=1300, rating=4.8, bio="Expert in cataract surgery and retinal disorders.", available_slots='["09:00 AM","10:30 AM","02:00 PM","03:30 PM"]'),
    dict(name="Dr. Ananya Reddy",   email="ananya@deepthi.com",  specialty="Oncologist",              department="Oncology",         qualification="MD Oncology, Tata Memorial",          experience_years=11, consultation_fee=2500, rating=4.9, bio="Comprehensive cancer care specialist.", available_slots='["10:00 AM","12:00 PM","02:00 PM"]'),
    dict(name="Dr. Suresh Babu",    email="suresh@deepthi.com",  specialty="Gastroenterologist",      department="Gastroenterology", qualification="DM Gastroenterology, PGIMER",         experience_years=9,  consultation_fee=1600, rating=4.7, bio="Digestive system health and endoscopy specialist.", available_slots='["09:30 AM","11:00 AM","01:30 PM","03:00 PM"]'),
    dict(name="Dr. Kavitha Menon",  email="kavitha@deepthi.com", specialty="Psychiatrist",            department="Psychiatry",       qualification="MD Psychiatry, NIMHANS",              experience_years=13, consultation_fee=1400, rating=4.8, bio="Mental health care and cognitive behavioral therapy.", available_slots='["10:00 AM","11:00 AM","02:00 PM","04:00 PM"]'),
    dict(name="Dr. Ramesh Gupta",   email="ramesh@deepthi.com",  specialty="Internal Medicine",       department="Internal Medicine",qualification="MD Internal Medicine, AIIMS",         experience_years=18, consultation_fee=900,  rating=4.6, bio="General adult medicine and preventive care.", available_slots='["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM"]'),
]

INVENTORY_DATA = [
    dict(name="Paracetamol 500mg",    category="MEDICINE",    sku="MED-001", quantity=2400, unit="Tablets",   unit_price=0.5,   reorder_level=500,  expiry_date="2027-06-30", supplier="Sun Pharma",      status="IN_STOCK"),
    dict(name="Adrenaline 1mg/ml",    category="MEDICINE",    sku="MED-002", quantity=12,   unit="Vials",     unit_price=85.0,  reorder_level=50,   expiry_date="2026-12-31", supplier="Cipla",           status="LOW_STOCK"),
    dict(name="Surgical Gloves (M)",  category="CONSUMABLE",  sku="CON-001", quantity=800,  unit="Pairs",     unit_price=12.0,  reorder_level=200,  expiry_date="2028-01-01", supplier="Ansell",          status="IN_STOCK"),
    dict(name="IV Saline 500ml",      category="MEDICINE",    sku="MED-003", quantity=45,   unit="Bags",      unit_price=35.0,  reorder_level=100,  expiry_date="2026-09-30", supplier="Baxter",          status="LOW_STOCK"),
    dict(name="Oxygen Cylinder",      category="EQUIPMENT",   sku="EQP-001", quantity=8,    unit="Cylinders", unit_price=1200.0,reorder_level=20,   expiry_date=None,         supplier="Linde India",     status="LOW_STOCK"),
    dict(name="Syringes 5ml",         category="CONSUMABLE",  sku="CON-002", quantity=3200, unit="Units",     unit_price=2.5,   reorder_level=500,  expiry_date="2028-06-30", supplier="BD Medical",      status="IN_STOCK"),
    dict(name="Amoxicillin 500mg",    category="MEDICINE",    sku="MED-004", quantity=1800, unit="Capsules",  unit_price=3.5,   reorder_level=300,  expiry_date="2027-03-31", supplier="GSK",             status="IN_STOCK"),
    dict(name="Bandage Roll 4\"",     category="CONSUMABLE",  sku="CON-003", quantity=450,  unit="Rolls",     unit_price=18.0,  reorder_level=100,  expiry_date="2029-01-01", supplier="3M India",        status="IN_STOCK"),
    dict(name="Metformin 500mg",      category="MEDICINE",    sku="MED-005", quantity=3600, unit="Tablets",   unit_price=1.2,   reorder_level=600,  expiry_date="2027-08-31", supplier="USV Pharma",      status="IN_STOCK"),
    dict(name="Pulse Oximeter",       category="EQUIPMENT",   sku="EQP-002", quantity=25,   unit="Units",     unit_price=2500.0,reorder_level=5,    expiry_date=None,         supplier="Nellcor",         status="IN_STOCK"),
]

BEDS_DATA = [
    # ICU
    *[dict(bed_number=f"ICU-{i:02d}", ward="ICU", bed_type="ICU",
           status="OCCUPIED" if i <= 4 else "AVAILABLE") for i in range(1, 9)],
    # General Ward A
    *[dict(bed_number=f"GWA-{i:02d}", ward="General Ward A", bed_type="GENERAL",
           status="OCCUPIED" if i <= 8 else ("MAINTENANCE" if i == 10 else "AVAILABLE")) for i in range(1, 13)],
    # General Ward B
    *[dict(bed_number=f"GWB-{i:02d}", ward="General Ward B", bed_type="GENERAL",
           status="OCCUPIED" if i <= 6 else "AVAILABLE") for i in range(1, 13)],
    # Pediatrics
    *[dict(bed_number=f"PED-{i:02d}", ward="Pediatrics", bed_type="GENERAL",
           status="OCCUPIED" if i <= 3 else "AVAILABLE") for i in range(1, 7)],
    # Maternity
    *[dict(bed_number=f"MAT-{i:02d}", ward="Maternity", bed_type="SEMI_PRIVATE",
           status="OCCUPIED" if i <= 4 else "AVAILABLE") for i in range(1, 7)],
    # Private
    *[dict(bed_number=f"PVT-{i:02d}", ward="Private Wing", bed_type="PRIVATE",
           status="AVAILABLE") for i in range(1, 7)],
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # ── Admin users ─────────────────────────────────────────────────────────
        for email, name, role in [
            ("admin@deepthi.com",           "Admin",      "ADMIN"),
            ("admin@deepthihospitals.com",  "HMS Admin",  "ADMIN"),
            ("reception@deepthihospitals.com", "Reception Staff", "RECEPTION"),
        ]:
            res = await db.execute(select(User).where(User.email == email))
            if not res.scalar_one_or_none():
                db.add(User(name=name, email=email, phone="9000000000",
                            password=hash_password("admin123"), role=role))
                print(f"✓ {name} ({email})")

        # ── Demo patient ────────────────────────────────────────────────────────
        res = await db.execute(select(User).where(User.email == "arjun@deepthi.com"))
        patient_user = res.scalar_one_or_none()
        if not patient_user:
            patient_user = User(name="Arjun Mehta", email="arjun@deepthi.com", phone="9876543210",
                                password=hash_password("password123"), role="PATIENT")
            db.add(patient_user)
            await db.flush()
            db.add(Patient(user_id=patient_user.id, date_of_birth="1985-06-15", gender="Male",
                           blood_group="O+", address="123 Medical Way, Health City",
                           emergency_contact="9876500000", allergies="Penicillin, Peanuts",
                           medical_history="Hypertension (controlled)"))
            print("✓ Demo patient arjun@deepthi.com")
        await db.flush()

        # ── Doctors ─────────────────────────────────────────────────────────────
        doctor_ids = {}
        for d in DOCTORS_DATA:
            res = await db.execute(select(User).where(User.email == d["email"]))
            doc_user = res.scalar_one_or_none()
            if not doc_user:
                doc_user = User(name=d["name"], email=d["email"], phone="9000000099",
                                password=hash_password("doctor123"), role="DOCTOR")
                db.add(doc_user)
                await db.flush()
                doc = Doctor(user_id=doc_user.id, specialty=d["specialty"], department=d["department"],
                             qualification=d["qualification"], experience_years=d["experience_years"],
                             consultation_fee=d["consultation_fee"], bio=d["bio"], rating=d["rating"],
                             available_slots=d["available_slots"], is_available=True)
                db.add(doc)
                await db.flush()
                doctor_ids[d["email"]] = doc.id
                print(f"✓ Doctor {d['name']}")
            else:
                res2 = await db.execute(select(Doctor).where(Doctor.user_id == doc_user.id))
                doc = res2.scalar_one_or_none()
                if doc:
                    doctor_ids[d["email"]] = doc.id

        await db.commit()

        # ── Inventory ───────────────────────────────────────────────────────────
        res = await db.execute(select(InventoryItem))
        if not res.scalars().all():
            for item in INVENTORY_DATA:
                db.add(InventoryItem(**item))
            await db.commit()
            print(f"✓ {len(INVENTORY_DATA)} inventory items")

        # ── Beds ────────────────────────────────────────────────────────────────
        res = await db.execute(select(Bed))
        if not res.scalars().all():
            for b in BEDS_DATA:
                db.add(Bed(**b))
            await db.commit()
            print(f"✓ {len(BEDS_DATA)} beds")

        # ── Patient appointments, prescriptions, lab reports, bills ─────────────
        res = await db.execute(select(Patient).join(User).where(User.email == "arjun@deepthi.com"))
        patient = res.scalar_one_or_none()

        # Get doctor IDs from DB
        raj_id = doctor_ids.get("rajesh@deepthi.com")
        priya_id = doctor_ids.get("priya@deepthi.com")
        anil_id = doctor_ids.get("anil@deepthi.com")

        if patient and raj_id:
            res3 = await db.execute(select(Appointment).where(Appointment.patient_id == patient.id))
            if not res3.scalars().all():
                # Appointment 1 — upcoming, paid
                appt1 = Appointment(patient_id=patient.id, doctor_id=raj_id,
                                    appointment_date="2026-03-20", appointment_time="10:30 AM",
                                    department="Cardiology", reason="Routine cardiac checkup",
                                    status="SCHEDULED", token_number=1, notes=f"fee:1500")
                db.add(appt1)
                await db.flush()
                db.add(Bill(patient_id=patient.id, appointment_id=appt1.id,
                            bill_number="BILL-20260320-001",
                            items=json.dumps([{"name": "Consultation - Dr. Rajesh Kumar", "qty": 1, "price": 1500}]),
                            subtotal=1500, tax=0, discount=0, total=1500, status="PAID",
                            payment_method="RAZORPAY", paid_at="2026-03-14T10:00:00"))

                # Appointment 2 — upcoming, unpaid
                if priya_id:
                    appt2 = Appointment(patient_id=patient.id, doctor_id=priya_id,
                                        appointment_date="2026-03-25", appointment_time="11:00 AM",
                                        department="Neurology", reason="Headache and dizziness",
                                        status="SCHEDULED", token_number=2, notes="fee:1800")
                    db.add(appt2)
                    await db.flush()
                    db.add(Bill(patient_id=patient.id, appointment_id=appt2.id,
                                bill_number="BILL-20260325-001",
                                items=json.dumps([{"name": "Consultation - Dr. Priya Sharma", "qty": 1, "price": 1800}]),
                                subtotal=1800, tax=0, discount=0, total=1800, status="PENDING"))

                # Appointment 3 — completed
                if anil_id:
                    appt3 = Appointment(patient_id=patient.id, doctor_id=anil_id,
                                        appointment_date="2026-03-10", appointment_time="09:30 AM",
                                        department="Orthopedics", reason="Knee pain follow-up",
                                        status="COMPLETED", token_number=1, notes="fee:2000")
                    db.add(appt3)
                    await db.flush()
                    db.add(Bill(patient_id=patient.id, appointment_id=appt3.id,
                                bill_number="BILL-20260310-001",
                                items=json.dumps([{"name": "Consultation - Dr. Anil Deshmukh", "qty": 1, "price": 2000}]),
                                subtotal=2000, tax=0, discount=0, total=2000, status="PAID",
                                payment_method="RAZORPAY", paid_at="2026-03-10T09:45:00"))

                # Lab bill (no appointment)
                db.add(Bill(patient_id=patient.id, bill_number="BILL-LAB-001",
                            items=json.dumps([{"name": "CBC Blood Test", "qty": 1, "price": 500},
                                              {"name": "Lipid Profile", "qty": 1, "price": 350}]),
                            subtotal=850, tax=0, discount=0, total=850, status="PENDING"))

                await db.commit()
                print("✓ Appointments and bills")

            # ── Prescriptions ────────────────────────────────────────────────────
            res4 = await db.execute(select(Prescription).where(Prescription.patient_id == patient.id))
            if not res4.scalars().all() and raj_id:
                db.add(Prescription(
                    patient_id=patient.id, doctor_id=raj_id,
                    diagnosis="Hypertension Stage 1",
                    medications=json.dumps([
                        {"name": "Amlodipine", "dosage": "5mg", "form": "Tablet", "instructions": "Once daily after breakfast", "refills": 3},
                        {"name": "Aspirin", "dosage": "75mg", "form": "Tablet", "instructions": "Once daily after dinner", "refills": 3},
                    ]),
                    instructions="Avoid salty food. Monitor BP daily. Follow up in 4 weeks.",
                    valid_until="2026-06-14", status="ACTIVE"
                ))
                if priya_id:
                    db.add(Prescription(
                        patient_id=patient.id, doctor_id=priya_id,
                        diagnosis="Tension Headache",
                        medications=json.dumps([
                            {"name": "Sumatriptan", "dosage": "50mg", "form": "Tablet", "instructions": "As needed for migraine, max 2/day", "refills": 1},
                        ]),
                        instructions="Rest in dark room during episodes. Avoid screen time.",
                        valid_until="2026-04-14", status="ACTIVE"
                    ))
                if anil_id:
                    db.add(Prescription(
                        patient_id=patient.id, doctor_id=anil_id,
                        diagnosis="Knee Osteoarthritis",
                        medications=json.dumps([
                            {"name": "Diclofenac", "dosage": "50mg", "form": "Tablet", "instructions": "Twice daily after meals", "refills": 0},
                        ]),
                        instructions="Physiotherapy 3x/week. Avoid stairs.",
                        valid_until="2026-02-10", status="EXPIRED"
                    ))
                await db.commit()
                print("✓ Prescriptions")

            # ── Lab Reports ──────────────────────────────────────────────────────
            res5 = await db.execute(select(LabReport).where(LabReport.patient_id == patient.id))
            if not res5.scalars().all() and raj_id:
                db.add(LabReport(patient_id=patient.id, doctor_id=raj_id,
                                 test_name="CBC + Lipid Profile", test_type="Blood Test",
                                 results=json.dumps({"Hemoglobin": "14.2 g/dL", "Total Cholesterol": "195 mg/dL", "LDL": "120 mg/dL"}),
                                 report_date="2026-03-12", status="COMPLETED",
                                 remarks="All values within normal range. Continue medication."))
                db.add(LabReport(patient_id=patient.id, doctor_id=raj_id,
                                 test_name="ECG", test_type="Cardiac",
                                 results=json.dumps({"Rhythm": "Normal Sinus", "Rate": "72 bpm", "Axis": "Normal"}),
                                 report_date="2026-03-12", status="COMPLETED",
                                 remarks="Normal ECG. No ischemic changes."))
                if priya_id:
                    db.add(LabReport(patient_id=patient.id, doctor_id=priya_id,
                                     test_name="MRI Brain", test_type="Radiology",
                                     results=None, report_date="2026-03-22", status="PENDING",
                                     remarks="Scheduled — awaiting scan"))
                await db.commit()
                print("✓ Lab reports")

    print("\n✅ Seed complete!")
    print("   Patient  : arjun@deepthi.com / password123")
    print("   Admin    : admin@deepthi.com / admin123")
    print("   HMS Admin: admin@deepthihospitals.com / admin123")
    print("   Doctor   : rajesh@deepthi.com / doctor123")
    print("   Reception: reception@deepthihospitals.com / admin123")


if __name__ == "__main__":
    asyncio.run(seed())
