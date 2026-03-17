import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Public pages
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import DoctorsPage from './pages/DoctorsPage.jsx'
import DoctorProfilePage from './pages/DoctorProfilePage.jsx'
import DepartmentsPage from './pages/DepartmentsPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import FAQPage from './pages/FAQPage.jsx'
import EmergencyPage from './pages/EmergencyPage.jsx'
import MaintenancePage from './pages/MaintenancePage.jsx'

// Auth pages
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import VerifyOtpPage from './pages/VerifyOtpPage.jsx'

// Booking
import BookAppointmentPage from './pages/BookAppointmentPage.jsx'
import AppointmentConfirmationPage from './pages/AppointmentConfirmationPage.jsx'

// Dashboard
import DashboardLayout from './layouts/DashboardLayout.jsx'
import DashboardHome from './pages/dashboard/DashboardHome.jsx'
import AppointmentsPage from './pages/dashboard/AppointmentsPage.jsx'
import PrescriptionsPage from './pages/dashboard/PrescriptionsPage.jsx'
import LabReportsPage from './pages/dashboard/LabReportsPage.jsx'
import ProfilePage from './pages/dashboard/ProfilePage.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'

// HMS
import HmsPortalPage from './pages/hms/HmsPortalPage.jsx'
import HmsLoginPage from './pages/hms/HmsLoginPage.jsx'
import HmsForgotPassword from './pages/hms/HmsForgotPassword.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import DoctorHmsLayout from './layouts/DoctorHmsLayout.jsx'
import ReceptionLayout from './layouts/ReceptionLayout.jsx'

// HMS Admin
import AdminDashboard from './pages/hms/admin/AdminDashboard.jsx'
import AdminPatients from './pages/hms/admin/AdminPatients.jsx'
import AdminAppointments from './pages/hms/admin/AdminAppointments.jsx'
import AdminDoctors from './pages/hms/admin/AdminDoctors.jsx'
import AdminBilling from './pages/hms/admin/AdminBilling.jsx'
import AdminInventory from './pages/hms/admin/AdminInventory.jsx'
import AdminLab from './pages/hms/admin/AdminLab.jsx'
import AdminPharmacy from './pages/hms/admin/AdminPharmacy.jsx'
import AdminReports from './pages/hms/admin/AdminReports.jsx'
import AdminSettings from './pages/hms/admin/AdminSettings.jsx'

// HMS Doctor
import DoctorDashboard from './pages/hms/doctor/DoctorDashboard.jsx'
import DoctorAppointments from './pages/hms/doctor/DoctorAppointments.jsx'
import DoctorPatients from './pages/hms/doctor/DoctorPatients.jsx'
import DoctorLabReports from './pages/hms/doctor/DoctorLabReports.jsx'
import DoctorPrescriptions from './pages/hms/doctor/DoctorPrescriptions.jsx'

// HMS Reception
import ReceptionDashboard from './pages/hms/reception/ReceptionDashboard.jsx'
import ReceptionRegistration from './pages/hms/reception/ReceptionRegistration.jsx'
import ReceptionAppointments from './pages/hms/reception/ReceptionAppointments.jsx'
import ReceptionBilling from './pages/hms/reception/ReceptionBilling.jsx'
import ReceptionRecords from './pages/hms/reception/ReceptionRecords.jsx'
import ReceptionDischarge from './pages/hms/reception/ReceptionDischarge.jsx'
import ReceptionQueue from './pages/hms/reception/ReceptionQueue.jsx'

// Extra pages
import NotFoundPage from './pages/NotFoundPage.jsx'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx'
import TermsPage from './pages/TermsPage.jsx'
import BillingPage from './pages/dashboard/BillingPage.jsx'
import NotificationsPage from './pages/dashboard/NotificationsPage.jsx'
import AdminStaff from './pages/hms/admin/AdminStaff.jsx'
import AdminBeds from './pages/hms/admin/AdminBeds.jsx'
import DoctorSchedule from './pages/hms/doctor/DoctorSchedule.jsx'

// Guard: redirects public visitors to /maintenance when maintenance mode is on
function MaintenanceGuard({ children }) {
  const location = useLocation()
  const isMaintenance = localStorage.getItem('deepthi-maintenance') === '1'
  if (isMaintenance) return <Navigate to="/maintenance" replace state={{ from: location }} />
  return children
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Maintenance page — always accessible */}
        <Route path="/maintenance" element={<MaintenancePage />} />

        {/* Public — blocked during maintenance */}
        <Route path="/" element={<MaintenanceGuard><HomePage /></MaintenanceGuard>} />
        <Route path="/about" element={<MaintenanceGuard><AboutPage /></MaintenanceGuard>} />
        <Route path="/doctors" element={<MaintenanceGuard><DoctorsPage /></MaintenanceGuard>} />
        <Route path="/doctors/:id" element={<MaintenanceGuard><DoctorProfilePage /></MaintenanceGuard>} />
        <Route path="/departments" element={<MaintenanceGuard><DepartmentsPage /></MaintenanceGuard>} />
        <Route path="/services" element={<MaintenanceGuard><ServicesPage /></MaintenanceGuard>} />
        <Route path="/contact" element={<MaintenanceGuard><ContactPage /></MaintenanceGuard>} />
        <Route path="/faq" element={<MaintenanceGuard><FAQPage /></MaintenanceGuard>} />
        <Route path="/emergency" element={<MaintenanceGuard><EmergencyPage /></MaintenanceGuard>} />

        {/* Auth — also blocked during maintenance */}
        <Route path="/login" element={<MaintenanceGuard><LoginPage /></MaintenanceGuard>} />
        <Route path="/register" element={<MaintenanceGuard><RegisterPage /></MaintenanceGuard>} />
        <Route path="/forgot-password" element={<MaintenanceGuard><ForgotPasswordPage /></MaintenanceGuard>} />
        <Route path="/verify-otp" element={<MaintenanceGuard><VerifyOtpPage /></MaintenanceGuard>} />

        {/* Booking — blocked during maintenance */}
        <Route path="/book-appointment" element={<MaintenanceGuard><BookAppointmentPage /></MaintenanceGuard>} />
        <Route path="/appointment-confirmation" element={<MaintenanceGuard><AppointmentConfirmationPage /></MaintenanceGuard>} />

        {/* Dashboard (protected) — blocked during maintenance */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<MaintenanceGuard><DashboardHome /></MaintenanceGuard>} />
            <Route path="/dashboard/appointments" element={<MaintenanceGuard><AppointmentsPage /></MaintenanceGuard>} />
            <Route path="/dashboard/prescriptions" element={<MaintenanceGuard><PrescriptionsPage /></MaintenanceGuard>} />
            <Route path="/dashboard/lab-reports" element={<MaintenanceGuard><LabReportsPage /></MaintenanceGuard>} />
            <Route path="/dashboard/profile" element={<MaintenanceGuard><ProfilePage /></MaintenanceGuard>} />
            <Route path="/dashboard/billing" element={<MaintenanceGuard><BillingPage /></MaintenanceGuard>} />
            <Route path="/dashboard/notifications" element={<MaintenanceGuard><NotificationsPage /></MaintenanceGuard>} />
          </Route>
        </Route>

        {/* HMS Portal */}
        <Route path="/hms" element={<HmsPortalPage />} />

        {/* HMS Login */}
        <Route path="/hms/admin/login" element={<HmsLoginPage role="admin" />} />
        <Route path="/hms/staff/login" element={<HmsLoginPage role="staff" />} />
        <Route path="/hms/reception/login" element={<HmsLoginPage role="reception" />} />

        {/* HMS Forgot Password */}
        <Route path="/hms/:role/forgot-password" element={<HmsForgotPassword />} />

        {/* HMS Admin Portal */}
        <Route element={<AdminLayout />}>
          <Route path="/hms/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/hms/admin/patients" element={<AdminPatients />} />
          <Route path="/hms/admin/appointments" element={<AdminAppointments />} />
          <Route path="/hms/admin/doctors" element={<AdminDoctors />} />
          <Route path="/hms/admin/billing" element={<AdminBilling />} />
          <Route path="/hms/admin/inventory" element={<AdminInventory />} />
          <Route path="/hms/admin/lab" element={<AdminLab />} />
          <Route path="/hms/admin/pharmacy" element={<AdminPharmacy />} />
          <Route path="/hms/admin/reports" element={<AdminReports />} />
          <Route path="/hms/admin/settings" element={<AdminSettings />} />
          <Route path="/hms/admin/staff" element={<AdminStaff />} />
          <Route path="/hms/admin/beds" element={<AdminBeds />} />
        </Route>

        {/* HMS Doctor Portal */}
        <Route element={<DoctorHmsLayout />}>
          <Route path="/hms/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/hms/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/hms/doctor/patients" element={<DoctorPatients />} />
          <Route path="/hms/doctor/lab-reports" element={<DoctorLabReports />} />
          <Route path="/hms/doctor/prescriptions" element={<DoctorPrescriptions />} />
          <Route path="/hms/doctor/schedule" element={<DoctorSchedule />} />
        </Route>

        {/* HMS Reception Portal */}
        <Route element={<ReceptionLayout />}>
          <Route path="/hms/reception/dashboard" element={<ReceptionDashboard />} />
          <Route path="/hms/reception/registration" element={<ReceptionRegistration />} />
          <Route path="/hms/reception/appointments" element={<ReceptionAppointments />} />
          <Route path="/hms/reception/billing" element={<ReceptionBilling />} />
          <Route path="/hms/reception/records" element={<ReceptionRecords />} />
          <Route path="/hms/reception/discharge" element={<ReceptionDischarge />} />
          <Route path="/hms/reception/queue" element={<ReceptionQueue />} />
        </Route>

        {/* Public legal pages */}
        <Route path="/privacy" element={<MaintenanceGuard><PrivacyPolicyPage /></MaintenanceGuard>} />
        <Route path="/terms" element={<MaintenanceGuard><TermsPage /></MaintenanceGuard>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
