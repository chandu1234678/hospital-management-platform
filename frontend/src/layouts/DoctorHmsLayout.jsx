import HmsLayout from './HmsLayout.jsx'

const DOCTOR_NAV = [
  { to: '/hms/doctor/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/hms/doctor/appointments', icon: 'calendar_today', label: 'Appointments' },
  { to: '/hms/doctor/schedule', icon: 'calendar_month', label: 'My Schedule' },
  { to: '/hms/doctor/patients', icon: 'group', label: 'Patients' },
  { to: '/hms/doctor/lab-reports', icon: 'lab_profile', label: 'Lab Reports' },
  { to: '/hms/doctor/prescriptions', icon: 'history_edu', label: 'Prescriptions' },
]

export default function DoctorHmsLayout() {
  return <HmsLayout nav={DOCTOR_NAV} role="Doctor" loginPath="/hms/staff/login" />
}
