import { create } from "zustand";
import type { Doctor, Specialty } from "../types";
import { api } from "../lib/api";

export interface DaySlots {
  date: string;
  dayOfWeek: string;
  slots: { time: string; available: boolean }[];
}

interface DoctorsState {
  doctors: Doctor[];
  specialties: Specialty[];
  loading: boolean;
  specialtiesLoaded: boolean;
  fetchSpecialties: () => Promise<void>;
  fetchDoctors: (params?: { search?: string; specialty?: string; sort?: string }) => Promise<void>;
  fetchDoctorById: (id: string) => Promise<Doctor>;
  fetchSlots: (doctorId: string, date: string) => Promise<DaySlots>;
}

export const useDoctorsStore = create<DoctorsState>((set, get) => ({
  doctors: [],
  specialties: [],
  loading: false,
  specialtiesLoaded: false,

  fetchSpecialties: async () => {
    if (get().specialtiesLoaded) return;
    const specialties = await api.get<Specialty[]>("/specialties");
    set({ specialties, specialtiesLoaded: true });
  },

  fetchDoctors: async (params = {}) => {
    set({ loading: true });
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.specialty && params.specialty !== "all") query.set("specialty", params.specialty);
    if (params.sort) query.set("sort", params.sort);
    const qs = query.toString();
    try {
      const doctors = await api.get<Doctor[]>(`/doctors${qs ? `?${qs}` : ""}`);
      set({ doctors, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  fetchDoctorById: async (id) => {
    return api.get<Doctor>(`/doctors/${id}`);
  },

  fetchSlots: async (doctorId, date) => {
    return api.get<DaySlots>(`/doctors/${doctorId}/slots?date=${date}`);
  },
}));
