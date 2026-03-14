export const MOCK_USER = {
  id: 'DP-9821',
  name: 'Arjun Mehta',
  email: 'arjun@deepthi.com',
  phone: '+91 98765 43210',
  address: '123 Medical Way, Health City, HC 90210',
  bloodGroup: 'O+',
  allergies: 'Penicillin, Peanuts',
  emergencyContact: 'Priya Mehta (Spouse) - +91 98765 00000',
  medications: 'Vitamin D3 Supplement',
  dob: '1985-06-15',
}

export const MOCK_CREDENTIALS = [
  { email: 'arjun@deepthi.com', phone: '9876543210', password: 'password123' },
  { email: 'test@test.com', phone: '1234567890', password: 'test123' },
]

export const DEPARTMENTS = [
  { id: 1, name: 'Cardiology', icon: 'cardiology', desc: 'Expert care for heart health and cardiovascular systems.' },
  { id: 2, name: 'Neurology', icon: 'neurology', desc: 'Comprehensive diagnosis and treatment of brain disorders.' },
  { id: 3, name: 'Orthopedics', icon: 'orthopedics', desc: 'Specialized care for bones, joints, and ligaments.' },
  { id: 4, name: 'Pediatrics', icon: 'pediatrics', desc: 'Dedicated medical care for infants, children, and adolescents.' },
  { id: 5, name: 'Dermatology', icon: 'dermatology', desc: 'Expert treatment for skin, hair, and nail conditions.' },
  { id: 6, name: 'Ophthalmology', icon: 'ophthalmology', desc: 'Advanced eye care and surgical vision correction.' },
  { id: 7, name: 'Oncology', icon: 'oncology', desc: 'Comprehensive cancer care and treatment.' },
  { id: 8, name: 'Gastroenterology', icon: 'gastroenterology', desc: 'Digestive system health and treatment.' },
  { id: 9, name: 'Psychiatry', icon: 'psychiatry', desc: 'Mental health care and counseling services.' },
  { id: 10, name: 'Internal Medicine', icon: 'stethoscope', desc: 'General adult medicine and preventive care.' },
  { id: 11, name: 'ENT', icon: 'hearing', desc: 'Ear, nose and throat specialist care.' },
  { id: 12, name: 'Urology', icon: 'water_drop', desc: 'Urinary tract and reproductive health.' },
]

export const DOCTORS = [
  {
    id: 1, name: 'Dr. Rajesh Kumar', specialty: 'Senior Cardiologist', department: 'Cardiology',
    experience: '15+ Years', rating: 4.9, reviews: 120, fee: 1500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeSntqcAIlZ-Abr2lTid8uZE38mwRK0kAKdNOJBzCNABbLHRWaWAxcOdC657_rG6lQ0aH8P9TG2gytBsfd3TaArn5vVbxJgfmdAiC8Ggk22RSdvGbUANCYiVtP_iMXNnsYcmRlYFKgYF4HP3dQrx7--bpbiQQazzLGy48z4o6suE0YkMUvLaBWvjxCxrp3ZeinKMzTCEWPJW4UAnZMKUYw3ipCD-UhAE4rZ3MX9lo5KIXPh6VlIwworS7U9LCpT4QcQXmFlsLdS4uZ',
    about: 'Dr. Rajesh Kumar is a board-certified cardiologist with 15+ years of experience in interventional cardiology and heart failure management.',
    education: [{ degree: 'MD in Cardiology', institution: 'AIIMS Delhi', year: '2005–2009' }],
    slots: ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'],
    location: 'Main Building, 2nd Floor, Room 204',
  },
  {
    id: 2, name: 'Dr. Priya Sharma', specialty: 'Chief Neurologist', department: 'Neurology',
    experience: '12+ Years', rating: 4.8, reviews: 95, fee: 1800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW3qS93lRJCF4fo7fMWZmq7UwUHE2rNwNnrpKqL5tY1pdhnlxUQFFGK-Mg48ZYSDyclLhUR6O6jG4XIrQ8R1TFW-paYiz8PG1jLSZT_9QcErisN1l6JUDX65-htnGLjgctc0-tRufpuqOo2WTJL0Q7eO9xF41ypgIu48DVzNYW3VL3jbTkjn4izZoCHUkPLsb22yfeWRLdRxO4nzBXz9RRXQbY_bZt1AKrdeWETwvNVGAcPW0LZcmYYLHbIWoc7SABhgfqrOycBoJS',
    about: 'Dr. Priya Sharma specializes in neurological disorders with expertise in stroke management and epilepsy.',
    education: [{ degree: 'MD in Neurology', institution: 'CMC Vellore', year: '2008–2012' }],
    slots: ['10:00 AM', '11:30 AM', '01:00 PM', '03:00 PM'],
    location: 'Neuro Block, 3rd Floor, Room 312',
  },
  {
    id: 3, name: 'Dr. Anil Deshmukh', specialty: 'Orthopedic Surgeon', department: 'Orthopedics',
    experience: '20+ Years', rating: 4.9, reviews: 200, fee: 2000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7a9z1gZbe5_QTNMoaiATWkcEv-eq4ksBTPZtyBJbYpAdhW8_oGtCKcM7VYO-rcw_BLrSOajSRUFIx_wi6_LkOfI0JoEpOw7XlmBwe6UZzrZivcEkctJlyJuWYHThX3mwKTzyBVrkBDE-SoIJcWcCZKQfcFX5CDsYuqhWliAT09-b_aFtIIFyzaLPoDcFgAv7XOhbNsbJ62v0HW4-2KEwiJLd_bpS-QnzCRGv9NnGNcg5h33xaaYSemGNpmz66iNNW9B4jw0VNwy-Y',
    about: 'Dr. Anil Deshmukh is a senior orthopedic surgeon specializing in joint replacement and sports injuries.',
    education: [{ degree: 'MS in Orthopedics', institution: 'KEM Hospital Mumbai', year: '2000–2004' }],
    slots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'],
    location: 'Ortho Wing, 1st Floor, Room 108',
  },
  {
    id: 4, name: 'Dr. Sarah Williams', specialty: 'Pediatric Specialist', department: 'Pediatrics',
    experience: '10+ Years', rating: 4.7, reviews: 150, fee: 1200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdjBXvmVGVTwZ3qnXtuCEbbYdHt7kNQpGZn0YISJRNodb5y8R2urc3CugsDKX_bSwnCplglb2XRgm41V158H8MGFK4TbRyICflMrnxJmU_TMwdta9l88z-iIU4ZR8JNc4CrcpRkapYgsdtFLK03GF4NoaQTFab1AOKEU4YD4GFKOHiKvO7n2PXIIbzVh2LOiDHPOHTWrAAW69aJo3TM0ygGafye_sM8mS3ndAKjpZANJqfWOX42xzfOgOb9ZhwHhwcizVuRJG3U312',
    about: 'Dr. Sarah Williams is a compassionate pediatrician dedicated to child health and development.',
    education: [{ degree: 'MD in Pediatrics', institution: 'Manipal University', year: '2010–2014' }],
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
    location: 'Pediatric Block, Ground Floor, Room 05',
  },
  {
    id: 5, name: 'Dr. Meena Iyer', specialty: 'Dermatologist', department: 'Dermatology',
    experience: '8+ Years', rating: 4.6, reviews: 88, fee: 1000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW3qS93lRJCF4fo7fMWZmq7UwUHE2rNwNnrpKqL5tY1pdhnlxUQFFGK-Mg48ZYSDyclLhUR6O6jG4XIrQ8R1TFW-paYiz8PG1jLSZT_9QcErisN1l6JUDX65-htnGLjgctc0-tRufpuqOo2WTJL0Q7eO9xF41ypgIu48DVzNYW3VL3jbTkjn4izZoCHUkPLsb22yfeWRLdRxO4nzBXz9RRXQbY_bZt1AKrdeWETwvNVGAcPW0LZcmYYLHbIWoc7SABhgfqrOycBoJS',
    about: 'Dr. Meena Iyer specializes in cosmetic and medical dermatology with a focus on skin health.',
    education: [{ degree: 'MD in Dermatology', institution: 'JIPMER Puducherry', year: '2012–2016' }],
    slots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'],
    location: 'OPD Block, 2nd Floor, Room 215',
  },
  {
    id: 6, name: 'Dr. Vikram Nair', specialty: 'Gastroenterologist', department: 'Gastroenterology',
    experience: '14+ Years', rating: 4.8, reviews: 110, fee: 1600,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeSntqcAIlZ-Abr2lTid8uZE38mwRK0kAKdNOJBzCNABbLHRWaWAxcOdC657_rG6lQ0aH8P9TG2gytBsfd3TaArn5vVbxJgfmdAiC8Ggk22RSdvGbUANCYiVtP_iMXNnsYcmRlYFKgYF4HP3dQrx7--bpbiQQazzLGy48z4o6suE0YkMUvLaBWvjxCxrp3ZeinKMzTCEWPJW4UAnZMKUYw3ipCD-UhAE4rZ3MX9lo5KIXPh6VlIwworS7U9LCpT4QcQXmFlsLdS4uZ',
    about: 'Dr. Vikram Nair is an expert in digestive disorders and advanced endoscopic procedures.',
    education: [{ degree: 'DM in Gastroenterology', institution: 'PGIMER Chandigarh', year: '2006–2010' }],
    slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
    location: 'GI Block, 4th Floor, Room 401',
  },
]

export const MOCK_APPOINTMENTS = [
  {
    id: 'APT-001', doctorId: 1, doctorName: 'Dr. Rajesh Kumar', department: 'Cardiology',
    date: '2026-03-24', time: '10:00 AM', status: 'upcoming',
    location: 'Main Building, 2nd Floor, Room 204',
  },
  {
    id: 'APT-002', doctorId: 2, doctorName: 'Dr. Priya Sharma', department: 'Neurology',
    date: '2026-02-10', time: '11:30 AM', status: 'completed',
    location: 'Neuro Block, 3rd Floor, Room 312',
  },
  {
    id: 'APT-003', doctorId: 4, doctorName: 'Dr. Sarah Williams', department: 'Pediatrics',
    date: '2026-01-15', time: '09:00 AM', status: 'cancelled',
    location: 'Pediatric Block, Ground Floor, Room 05',
  },
]

export const MOCK_PRESCRIPTIONS = [
  { id: 'RX-001', medicine: 'Lisinopril', dosage: '10mg', form: 'Tablet', instructions: 'Take once daily for hypertension', doctor: 'Dr. Rajesh Kumar', date: '2026-03-01', status: 'active', refills: 2 },
  { id: 'RX-002', medicine: 'Metformin', dosage: '500mg', form: 'Tablet', instructions: 'Take twice daily after meals', doctor: 'Dr. Rajesh Kumar', date: '2026-03-01', status: 'active', refills: 5 },
  { id: 'RX-003', medicine: 'Atorvastatin', dosage: '20mg', form: 'Oral', instructions: 'Once daily, evening', doctor: 'Dr. Priya Sharma', date: '2026-02-10', status: 'active', refills: 0 },
  { id: 'RX-004', medicine: 'Ibuprofen', dosage: '400mg', form: 'Tablet', instructions: 'As needed for pain', doctor: 'Dr. Priya Sharma', date: '2026-01-12', status: 'expired', refills: 0 },
]

export const MOCK_LAB_REPORTS = [
  { id: 'LAB-001', name: 'Blood Work - CBC', date: '2026-03-12', status: 'ready', doctor: 'Dr. Rajesh Kumar', type: 'Hematology' },
  { id: 'LAB-002', name: 'Lipid Profile', date: '2026-03-12', status: 'ready', doctor: 'Dr. Rajesh Kumar', type: 'Biochemistry' },
  { id: 'LAB-003', name: 'Chest X-Ray', date: '2026-03-18', status: 'processing', doctor: 'Dr. Priya Sharma', type: 'Radiology' },
  { id: 'LAB-004', name: 'HbA1c Test', date: '2026-02-20', status: 'ready', doctor: 'Dr. Rajesh Kumar', type: 'Biochemistry' },
]

export const MOCK_MESSAGES = [
  { id: 'MSG-001', from: 'Dr. Rajesh Kumar', subject: 'Regarding your lab results...', time: '2h ago', read: false },
  { id: 'MSG-002', from: 'Billing Support', subject: 'Insurance claim updated for visit #82...', time: 'Yesterday', read: false },
  { id: 'MSG-003', from: 'Dr. Sarah Williams', subject: 'Follow-up appointment reminder', time: '3 days ago', read: true },
]

export const FAQS = [
  { q: 'How do I book an appointment?', category: 'Appointments', a: 'You can book online through our website, call +91 80 4567 8900, or visit the hospital directly.' },
  { q: 'Can I reschedule or cancel my appointment?', category: 'Appointments', a: 'Yes, through your patient dashboard up to 2 hours before the appointment.' },
  { q: 'What documents do I need to bring?', category: 'Appointments', a: 'A valid photo ID, insurance card, previous medical records, and list of current medications.' },
  { q: 'How do I access my lab reports?', category: 'Lab Reports', a: 'Lab reports are available in your patient dashboard under "Lab Reports" once ready.' },
  { q: 'What insurance plans do you accept?', category: 'Billing', a: 'We accept Aetna, Blue Cross, Cigna, and government schemes like Ayushman Bharat.' },
  { q: 'Is there a 24/7 emergency service?', category: 'Emergency', a: 'Yes, our emergency department operates 24/7. Call 1066 for immediate assistance.' },
  { q: 'How do I get a prescription refill?', category: 'Prescriptions', a: 'Request a refill through your patient dashboard under "Prescriptions" or contact your doctor.' },
  { q: 'Do you offer telemedicine consultations?', category: 'Services', a: 'Yes, select "Online Consultation" when booking an appointment.' },
]
