import HmsLayout from './HmsLayout.jsx'

const RECEPTION_NAV = [
  { to: '/hms/reception/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/hms/reception/queue', icon: 'list_alt', label: 'Queue Management' },
  { to: '/hms/reception/registration', icon: 'person_add', label: 'New Registration' },
  { to: '/hms/reception/appointments', icon: 'calendar_month', label: 'Appointments' },
  { to: '/hms/reception/billing', icon: 'payments', label: 'Billing & Payments' },
  { to: '/hms/reception/records', icon: 'clinical_notes', label: 'Medical Records' },
  { to: '/hms/reception/discharge', icon: 'exit_to_app', label: 'Discharge' },
]

export default function ReceptionLayout() {
  return <HmsLayout nav={RECEPTION_NAV} role="Reception" loginPath="/hms/reception/login" />
}
