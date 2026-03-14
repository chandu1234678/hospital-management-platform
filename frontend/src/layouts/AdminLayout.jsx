import HmsLayout from './HmsLayout.jsx'

const ADMIN_NAV = [
  { to: '/hms/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/hms/admin/patients', icon: 'group', label: 'Patients' },
  { to: '/hms/admin/appointments', icon: 'calendar_today', label: 'Appointments' },
  { to: '/hms/admin/doctors', icon: 'stethoscope', label: 'Doctors' },
  { to: '/hms/admin/staff', icon: 'badge', label: 'Staff' },
  { to: '/hms/admin/beds', icon: 'bed', label: 'Bed Management' },
  { to: '/hms/admin/billing', icon: 'payments', label: 'Billing' },
  { to: '/hms/admin/inventory', icon: 'inventory_2', label: 'Inventory' },
  { to: '/hms/admin/lab', icon: 'lab_panel', label: 'Lab' },
  { to: '/hms/admin/pharmacy', icon: 'local_pharmacy', label: 'Pharmacy' },
  { to: '/hms/admin/reports', icon: 'bar_chart', label: 'Reports' },
  { to: '/hms/admin/settings', icon: 'settings', label: 'Settings' },
]

export default function AdminLayout() {
  return <HmsLayout nav={ADMIN_NAV} role="Admin" loginPath="/hms/admin/login" />
}
