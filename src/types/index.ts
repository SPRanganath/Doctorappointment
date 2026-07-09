export type Role = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  doctorId?: string;
  createdAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface DoctorAvailability {
  day: string;
  slots: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialtyId: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  location: string;
  hospital: string;
  bio: string;
  consultationFee: number;
  avatarColor: string;
  gender: "male" | "female";
  languages: string[];
  availability?: DoctorAvailability[];
}

export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  fee: number;
  createdAt: string;
}
