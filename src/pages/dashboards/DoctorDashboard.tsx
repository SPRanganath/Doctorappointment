import { useEffect, useState } from "react";
import { CalendarClock, CalendarCheck, Users, CalendarDays, Stethoscope } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppointmentsStore } from "../../store/appointmentsStore";
import { useDoctorsStore } from "../../store/doctorsStore";
import { todayISO } from "../../utils/date";
import type { AppointmentStatus, Doctor } from "../../types";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import AppointmentCard from "../../components/appointments/AppointmentCard";
import EmptyState from "../../components/ui/EmptyState";
import { cn } from "../../utils/cn";

export default function DoctorDashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const appointments = useAppointmentsStore((s) => s.appointments);
  const fetchAppointments = useAppointmentsStore((s) => s.fetchAppointments);
  const setStatus = useAppointmentsStore((s) => s.setStatus);
  const fetchDoctorById = useDoctorsStore((s) => s.fetchDoctorById);
  const [tab, setTab] = useState<"today" | "upcoming" | "completed">("today");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (currentUser?.doctorId) fetchDoctorById(currentUser.doctorId).then(setDoctor);
  }, [currentUser, fetchDoctorById]);

  const today = todayISO();
  const todaysAppointments = appointments
    .filter((a) => a.date === today && a.status === "upcoming")
    .sort((a, b) => (a.time > b.time ? 1 : -1));
  const upcoming = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));
  const completed = appointments.filter((a) => a.status === "completed");
  const uniquePatients = new Set(appointments.map((a) => a.patientId)).size;

  const stats = [
    { label: "Today", value: todaysAppointments.length, icon: CalendarDays, tone: "text-primary-600 bg-primary-50" },
    { label: "Upcoming", value: upcoming.length, icon: CalendarClock, tone: "text-amber-600 bg-amber-50" },
    { label: "Completed", value: completed.length, icon: CalendarCheck, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Patients", value: uniquePatients, icon: Users, tone: "text-accent-600 bg-accent-50" },
  ];

  const listByTab = tab === "today" ? todaysAppointments : tab === "upcoming" ? upcoming : completed;

  const handleSetStatus = async (id: string, status: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      await setStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your schedule and patient appointments</p>
      </div>

      {doctor && (
        <Card className="mb-6 flex flex-wrap items-center gap-4 p-5">
          <Avatar name={doctor.name} colorClass={doctor.avatarColor} size="lg" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900">{doctor.name}</p>
            <p className="text-sm text-primary-700">{doctor.specialty}</p>
            <p className="text-xs text-slate-500">{doctor.hospital}</p>
          </div>
          <Badge tone="primary">
            <Stethoscope size={12} /> ${doctor.consultationFee} per visit
          </Badge>
        </Card>
      )}

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

      <div className="mt-8 flex gap-1 rounded-xl bg-slate-100 p-1 sm:w-fit">
        {(["today", "upcoming", "completed"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors sm:flex-none",
              tab === key ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {listByTab.length === 0 ? (
          <EmptyState icon={<CalendarClock size={22} />} title={`No ${tab} appointments`} />
        ) : (
          listByTab.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              perspective="doctor"
              actions={
                appt.status === "upcoming" ? (
                  <>
                    <Button
                      size="sm"
                      loading={updatingId === appt.id}
                      onClick={() => handleSetStatus(appt.id, "completed")}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={updatingId === appt.id}
                      onClick={() => handleSetStatus(appt.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  </>
                ) : undefined
              }
            />
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
