import { create } from "zustand";
import type { Appointment, AppointmentStatus } from "../types";
import { api } from "../lib/api";

interface BookInput {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
}

interface AppointmentsState {
  appointments: Appointment[];
  loading: boolean;
  fetchAppointments: () => Promise<void>;
  bookAppointment: (input: BookInput) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  setStatus: (id: string, status: AppointmentStatus) => Promise<void>;
}

export const useAppointmentsStore = create<AppointmentsState>((set, get) => ({
  appointments: [],
  loading: false,

  fetchAppointments: async () => {
    set({ loading: true });
    try {
      const appointments = await api.get<Appointment[]>("/appointments");
      set({ appointments, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  bookAppointment: async (input) => {
    const appointment = await api.post<Appointment>("/appointments", input);
    set({ appointments: [appointment, ...get().appointments] });
    return appointment;
  },

  cancelAppointment: async (id) => {
    const updated = await api.patch<Appointment>(`/appointments/${id}/cancel`);
    set({ appointments: get().appointments.map((a) => (a.id === id ? updated : a)) });
  },

  setStatus: async (id, status) => {
    const updated = await api.patch<Appointment>(`/appointments/${id}/status`, { status });
    set({ appointments: get().appointments.map((a) => (a.id === id ? updated : a)) });
  },
}));
