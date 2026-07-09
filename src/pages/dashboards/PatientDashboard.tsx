import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CalendarClock, CalendarX2, Search, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppointmentsStore } from "../../store/appointmentsStore";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import AppointmentCard from "../../components/appointments/AppointmentCard";
import EmptyState from "../../components/ui/EmptyState";

export default function PatientDashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const appointments = useAppointmentsStore((s) => s.appointments);
  const fetchAppointments = useAppointmentsStore((s) => s.fetchAppointments);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const upcoming = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  const stats = [
    { label: "Upcoming", value: upcoming.length, icon: CalendarClock, tone: "text-primary-600 bg-primary-50" },
    { label: "Completed", value: completed.length, icon: CalendarCheck, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Cancelled", value: cancelled.length, icon: CalendarX2, tone: "text-red-600 bg-red-50" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser?.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-slate-500">Here's an overview of your healthcare activity</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4 p-5">
            <div className={`flex size-11 items-center justify-center rounded-xl ${stat.tone}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Upcoming Appointments</h2>
        <div className="flex gap-2">
          <Link to="/find-doctors">
            <Button size="sm" icon={<Search size={14} />}>
              Book New
            </Button>
          </Link>
          <Link to="/my-appointments">
            <Button size="sm" variant="ghost" icon={<ArrowRight size={14} />}>
              View all
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<CalendarClock size={22} />}
            title="No upcoming appointments"
            description="Book an appointment with a specialist to get started."
            action={
              <Link to="/find-doctors">
                <Button>Find a Doctor</Button>
              </Link>
            }
          />
        ) : (
          upcoming.slice(0, 3).map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} perspective="patient" />
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
