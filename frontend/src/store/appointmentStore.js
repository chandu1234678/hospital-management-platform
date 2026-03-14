import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_APPOINTMENTS } from '../data/mockData.js'

export const useAppointmentStore = create(
  persist(
    (set, get) => ({
      appointments: MOCK_APPOINTMENTS,
      bookingDraft: null,

      setBookingDraft: (draft) => set({ bookingDraft: draft }),

      addAppointment: (appt) =>
        set((s) => ({ appointments: [appt, ...s.appointments] })),

      cancelAppointment: (id) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status: 'cancelled' } : a
          ),
        })),

      updateAppointment: (id, patch) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, ...patch } : a
          ),
        })),

      rescheduleAppointment: (id, date, time) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, date, time } : a
          ),
        })),
    }),
    { name: 'deepthi-appointments' }
  )
)
