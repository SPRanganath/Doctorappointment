import { useEffect, useMemo, useState } from "react";
import { Users, Stethoscope, CalendarDays, DollarSign } from "lucide-react";
import { useAppointmentsStore } from "../../store/appointmentsStore";
import { useDoctorsStore } from "../../store/doctorsStore";
import { api } from "../../lib/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import RatingStars from "../../components/ui/RatingStars";
import Button from "../../components/ui/Button";
import AppointmentCard from "../../components/appointments/AppointmentCard";
import EmptyState from "../../components/ui/EmptyState";
import { cn } from "../../utils/cn";
import type { AppointmentStatus, User } from "../../types";

const FILTERS: { key: AppointmentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function AdminDashboard() {
  const appointments = useAppointmentsStore((s) => s.appointments);
  const fetchAppointments = useAppointmentsStore((s) => s.fetchAppointments);
  const cancelAppointment = useAppointmentsStore((s) => s.cancelAppointment);
  const doctors = useDoctorsStore((s) => s.doctors);
  const fetchDoctors = useDoctorsStore((s) => s.fetchDoctors);
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");
  const [patientCount, setPatientCount] = useState(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    api.get<User[]>("/users?role=patient").then((rows) => setPatientCount(rows.length));
  }, [fetchAppointments, fetchDoctors]);

  const revenue = appointments.filter((a) => a.status === "completed").reduce((sum, a) => sum + a.fee, 0);

  const appointmentCountByDoctor = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach((a) => map.set(a.doctorId, (map.get(a.doctorId) ?? 0) + 1));
    return map;
  }, [appointments]);

  const stats = [
    { label: "Total Doctors", value: doctors.length, icon: Stethoscope, tone: "text-primary-600 bg-primary-50" },
    { label: "Total Patients", value: patientCount, icon: Users, tone: "text-accent-600 bg-accent-50" },
    { label: "Total Appointments", value: appointments.length, icon: CalendarDays, tone: "text-amber-600 bg-amber-50" },
    { label: "Revenue Collected", value: `$${revenue}`, icon: DollarSign, tone: "text-emerald-600 bg-emerald-50" },
  ];

  const filtered = appointments
    .filter((a) => filter === "all" || a.status === filter)
    .sort((a, b) => (a.date + a.time > b.date + b.time ? -1 : 1));

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelAppointment(id);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform-wide overview of doctors, patients and appointments</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-3 p-4">
            <div className={`flex size-10 items-center justify-center rounded-xl ${stat.tone}`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-slate-900">Registered Doctors</h2>
        <Card className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Doctor</th>
                <th className="px-5 py-3 font-medium">Specialty</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Fee</th>
                <th className="px-5 py-3 font-medium">Appointments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={doc.name} colorClass={doc.avatarColor} size="sm" />
                      <span className="font-medium text-slate-800">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{doc.specialty}</td>
                  <td className="px-5 py-3">
                    <RatingStars rating={doc.rating} size={12} />
                  </td>
                  <td className="px-5 py-3 text-slate-600">${doc.consultationFee}</td>
                  <td className="px-5 py-3 text-slate-600">{appointmentCountByDoctor.get(doc.id) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">All Appointments</h2>
      </div>
      <div className="mt-3 flex gap-1 rounded-xl bg-slate-100 p-1 sm:w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
              filter === f.key ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <EmptyState icon={<CalendarDays size={22} />} title="No appointments found" />
        ) : (
          filtered.slice(0, 20).map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              perspective="admin"
              actions={
                appt.status === "upcoming" ? (
                  <Button
                    size="sm"
                    variant="danger"
                    loading={cancellingId === appt.id}
                    onClick={() => handleCancel(appt.id)}
                  >
                    Cancel
                  </Button>
                ) : undefined
              }
            />
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
