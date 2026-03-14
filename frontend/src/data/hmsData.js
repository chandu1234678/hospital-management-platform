// HMS Mock Data — replace with real API calls when backend is ready

export const HMS_ADMIN_CREDENTIALS = { email: 'admin@deepthihospitals.com', password: 'admin123' }
export const HMS_STAFF_CREDENTIALS = { email: 'staff@deepthihospitals.com', password: 'staff123' }
export const HMS_DOCTOR_CREDENTIALS = { email: 'doctor@deepthihospitals.com', password: 'doctor123' }
export const HMS_RECEPTION_CREDENTIALS = { email: 'reception@deepthihospitals.com', password: 'reception123' }

export const HMS_STATS = {
  totalPatients: 1240,
  appointmentsToday: 84,
  doctorsAvailable: '12/15',
  revenueToday: '₹12,450',
  bedOccupancy: '82%',
  walkInQueue: 14,
  admissionsToday: 28,
  pendingDischarge: 6,
}

export const HMS_RECENT_ADMISSIONS = [
  { id: 'P-001', initials: 'JD', name: 'Jane Doe', room: 'ICU-04', status: 'Critical', doctor: 'Dr. S. Kumar', time: '08:45 AM' },
  { id: 'P-002', initials: 'RS', name: 'Robert Smith', room: 'B-201', status: 'Stable', doctor: 'Dr. A. Gupta', time: '10:12 AM' },
  { id: 'P-003', initials: 'MK', name: 'Maria Khan', room: 'C-105', status: 'Recovering', doctor: 'Dr. S. Verma', time: '11:30 AM' },
  { id: 'P-004', initials: 'AT', name: 'Arjun Tiwari', room: 'D-302', status: 'Stable', doctor: 'Dr. R. Kumar', time: '01:15 PM' },
  { id: 'P-005', initials: 'PL', name: 'Priya Lal', room: 'B-108', status: 'Recovering', doctor: 'Dr. P. Sharma', time: '02:40 PM' },
]

export const HMS_ALERTS = [
  { type: 'red', icon: 'emergency', title: 'Emergency Code Red', desc: 'Cardiac arrest reported in Floor 3, Room 302.', time: '2 mins ago' },
  { type: 'amber', icon: 'medical_services', title: 'Oxygen Supply Warning', desc: 'Main tank level below 15% threshold.', time: '15 mins ago' },
  { type: 'blue', icon: 'notification_important', title: 'Inventory Alert', desc: 'Adrenaline supply reaching low levels in pharmacy.', time: '1 hour ago' },
]

export const HMS_APPOINTMENTS = [
  { id: 'A-001', patient: 'Ananya Rao', age: 34, doctor: 'Dr. Deepthi K.', dept: 'Neurology', time: '10:30 AM', status: 'In Progress', type: 'OPD' },
  { id: 'A-002', patient: 'Ravi Shankar', age: 52, doctor: 'Dr. R. Kumar', dept: 'Cardiology', time: '11:00 AM', status: 'Waiting', type: 'OPD' },
  { id: 'A-003', patient: 'Meena Pillai', age: 28, doctor: 'Dr. S. Williams', dept: 'Pediatrics', time: '11:30 AM', status: 'Scheduled', type: 'OPD' },
  { id: 'A-004', patient: 'Suresh Nair', age: 45, doctor: 'Dr. A. Deshmukh', dept: 'Orthopedics', time: '12:00 PM', status: 'Scheduled', type: 'OPD' },
  { id: 'A-005', patient: 'Kavitha Reddy', age: 38, doctor: 'Dr. M. Iyer', dept: 'Dermatology', time: '02:00 PM', status: 'Scheduled', type: 'OPD' },
  { id: 'A-006', patient: 'Deepak Joshi', age: 61, doctor: 'Dr. V. Nair', dept: 'Gastroenterology', time: '03:00 PM', status: 'Cancelled', type: 'OPD' },
]

export const HMS_PATIENTS = [
  { id: 'HMS-9921', name: 'Ananya Rao', age: 34, gender: 'Female', blood: 'B+', phone: '+91 98765 11111', doctor: 'Dr. Deepthi K.', status: 'Active', admitted: '2026-03-10' },
  { id: 'HMS-9922', name: 'Ravi Shankar', age: 52, gender: 'Male', blood: 'O+', phone: '+91 98765 22222', doctor: 'Dr. R. Kumar', status: 'Active', admitted: '2026-03-12' },
  { id: 'HMS-9923', name: 'Meena Pillai', age: 28, gender: 'Female', blood: 'A+', phone: '+91 98765 33333', doctor: 'Dr. S. Williams', status: 'Discharged', admitted: '2026-03-05' },
  { id: 'HMS-9924', name: 'Suresh Nair', age: 45, gender: 'Male', blood: 'AB-', phone: '+91 98765 44444', doctor: 'Dr. A. Deshmukh', status: 'Active', admitted: '2026-03-14' },
  { id: 'HMS-9925', name: 'Kavitha Reddy', age: 38, gender: 'Female', blood: 'O-', phone: '+91 98765 55555', doctor: 'Dr. M. Iyer', status: 'Active', admitted: '2026-03-13' },
]

export const HMS_BILLING = [
  { id: 'INV-2001', patient: 'Ananya Rao', date: '2026-03-14', amount: '₹4,500', type: 'OPD Consultation', status: 'Paid', method: 'UPI' },
  { id: 'INV-2002', patient: 'Ravi Shankar', date: '2026-03-14', amount: '₹12,000', type: 'Lab Tests + OPD', status: 'Pending', method: '-' },
  { id: 'INV-2003', patient: 'Suresh Nair', date: '2026-03-13', amount: '₹85,000', type: 'Surgery', status: 'Partial', method: 'Insurance' },
  { id: 'INV-2004', patient: 'Kavitha Reddy', date: '2026-03-13', amount: '₹2,200', type: 'Dermatology OPD', status: 'Paid', method: 'Card' },
  { id: 'INV-2005', patient: 'Meena Pillai', date: '2026-03-12', amount: '₹6,800', type: 'Inpatient Stay', status: 'Paid', method: 'Cash' },
]

export const HMS_INVENTORY = [
  { id: 'INV-001', name: 'Paracetamol 500mg', category: 'Medicine', stock: 2400, unit: 'Tablets', reorder: 500, status: 'In Stock' },
  { id: 'INV-002', name: 'Adrenaline 1mg/ml', category: 'Emergency', stock: 12, unit: 'Vials', reorder: 50, status: 'Low Stock' },
  { id: 'INV-003', name: 'Surgical Gloves (M)', category: 'Supplies', stock: 800, unit: 'Pairs', reorder: 200, status: 'In Stock' },
  { id: 'INV-004', name: 'IV Saline 500ml', category: 'Fluids', stock: 45, unit: 'Bags', reorder: 100, status: 'Low Stock' },
  { id: 'INV-005', name: 'Oxygen Cylinder', category: 'Equipment', stock: 8, unit: 'Cylinders', reorder: 20, status: 'Critical' },
  { id: 'INV-006', name: 'Syringes 5ml', category: 'Supplies', stock: 3200, unit: 'Units', reorder: 500, status: 'In Stock' },
]

export const HMS_LAB_QUEUE = [
  { id: 'LAB-501', patient: 'Ananya Rao', test: 'CBC + Lipid Profile', doctor: 'Dr. Deepthi K.', priority: 'Urgent', status: 'Processing', time: '09:30 AM' },
  { id: 'LAB-502', patient: 'Ravi Shankar', test: 'ECG + Troponin', doctor: 'Dr. R. Kumar', priority: 'Stat', status: 'Pending', time: '10:00 AM' },
  { id: 'LAB-503', patient: 'Suresh Nair', test: 'X-Ray Knee (AP/Lat)', doctor: 'Dr. A. Deshmukh', priority: 'Routine', status: 'Ready', time: '08:15 AM' },
  { id: 'LAB-504', patient: 'Kavitha Reddy', test: 'Skin Biopsy', doctor: 'Dr. M. Iyer', priority: 'Routine', status: 'Processing', time: '11:00 AM' },
]

export const HMS_PHARMACY = [
  { id: 'RX-801', patient: 'Ananya Rao', medicine: 'Sumatriptan 50mg', qty: 10, doctor: 'Dr. Deepthi K.', status: 'Dispensed', time: '10:45 AM' },
  { id: 'RX-802', patient: 'Ravi Shankar', medicine: 'Aspirin 75mg + Atorvastatin 20mg', qty: 30, doctor: 'Dr. R. Kumar', status: 'Pending', time: '11:15 AM' },
  { id: 'RX-803', patient: 'Suresh Nair', medicine: 'Diclofenac 50mg', qty: 15, doctor: 'Dr. A. Deshmukh', status: 'Pending', time: '12:00 PM' },
  { id: 'RX-804', patient: 'Kavitha Reddy', medicine: 'Clindamycin Gel 1%', qty: 1, doctor: 'Dr. M. Iyer', status: 'Dispensed', time: '02:10 PM' },
]

export const HMS_DOCTOR_PATIENTS = [
  { id: 'HMS-9921', name: 'Ananya Rao', age: 34, gender: 'F', reason: 'Chronic Migraine', allergy: 'Penicillin', time: '10:30 AM', status: 'Active' },
  { id: 'HMS-9922', name: 'Ravi Shankar', age: 52, gender: 'M', reason: 'Chest Pain', allergy: 'None', time: '11:00 AM', status: 'Waiting' },
  { id: 'HMS-9924', name: 'Suresh Nair', age: 45, gender: 'M', reason: 'Knee Pain', allergy: 'Sulfa', time: '12:00 PM', status: 'Scheduled' },
]
