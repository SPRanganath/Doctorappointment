import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarX2, Search } from "lucide-react";
import { useAppointmentsStore } from "../store/appointmentsStore";
import AppointmentCard from "../components/appointments/AppointmentCard";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import { cn } from "../utils/cn";
import type { AppointmentStatus } from "../types";

const TABS: { key: AppointmentStatus; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MyAppointments() {
  const appointments = useAppointmentsStore((s) => s.appointments);
  const loading = useAppointmentsStore((s) => s.loading);
  const fetchAppointments = useAppointmentsStore((s) => s.fetchAppointments);
  const cancelAppointment = useAppointmentsStore((s) => s.cancelAppointment);
  const [tab, setTab] = useState<AppointmentStatus>("upcoming");
  const [toCancel, setToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => (a.date + a.time > b.date + b.time ? -1 : 1)),
    [appointments],
  );

  const filtered = sorted.filter((a) => a.status === tab);

  const handleCancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      await cancelAppointment(toCancel);
    } finally {
      setCancelling(false);
      setToCancel(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your upcoming and past visits</p>
        </div>
        <Link to="/find-doctors">
          <Button icon={<Search size={16} />}>Book New</Button>
        </Link>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {t.label} ({sorted.filter((a) => a.status === t.key).length})
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-center text-sm text-slate-500">Loading appointments…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarX2 size={22} />}
            title={`No ${tab} appointments`}
            description={
              tab === "upcoming"
                ? "You don't have any upcoming appointments. Book one with a doctor today."
                : `You don't have any ${tab} appointments yet.`
            }
            action={
              tab === "upcoming" && (
                <Link to="/find-doctors">
                  <Button>Find a Doctor</Button>
                </Link>
              )
            }
          />
        ) : (
          filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              perspective="patient"
              actions={
                appt.status === "upcoming" ? (
                  <Button variant="danger" size="sm" onClick={() => setToCancel(appt.id)}>
                    Cancel
                  </Button>
                ) : undefined
              }
            />
          ))
        )}
      </div>

      <Modal open={!!toCancel} onClose={() => setToCancel(null)} title="Cancel Appointment">
        <p className="text-sm text-slate-600">
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setToCancel(null)} disabled={cancelling}>
            Keep Appointment
          </Button>
          <Button variant="danger" fullWidth onClick={handleCancel} loading={cancelling}>
            Yes, Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
