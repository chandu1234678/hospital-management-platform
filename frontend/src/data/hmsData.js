// HMS static reference data — used by AdminDashboard and ReceptionDashboard

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
