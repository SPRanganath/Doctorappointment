import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { useDoctorsStore, type DaySlots } from "../store/doctorsStore";
import { useAppointmentsStore } from "../store/appointmentsStore";
import { getUpcomingDays } from "../utils/date";
import { ApiError } from "../lib/api";
import type { Doctor } from "../types";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { cn } from "../utils/cn";

export default function BookAppointment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fetchDoctorById = useDoctorsStore((s) => s.fetchDoctorById);
  const fetchSlots = useDoctorsStore((s) => s.fetchSlots);
  const bookAppointment = useAppointmentsStore((s) => s.bookAppointment);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [daySlots, setDaySlots] = useState<DaySlots | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const upcomingDays = useMemo(() => getUpcomingDays(10), []);
  const [selectedDay, setSelectedDay] = useState(upcomingDays[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchDoctorById(id)
      .then(setDoctor)
      .catch(() => setNotFound(true));
  }, [id, fetchDoctorById]);

  useEffect(() => {
    if (!id) return;
    setSlotsLoading(true);
    setSelectedTime(null);
    fetchSlots(id, selectedDay.iso)
      .then(setDaySlots)
      .finally(() => setSlotsLoading(false));
  }, [id, selectedDay, fetchSlots]);

  if (notFound) return <Navigate to="/find-doctors" replace />;

  if (!doctor) {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
      </div>
    );
  }

  const weeklySlotCount = (dayName: string) =>
    doctor.availability?.find((a) => a.day === dayName)?.slots.length ?? 0;

  const handleSelectDay = (day: (typeof upcomingDays)[number]) => {
    setSelectedDay(day);
    setError("");
  };

  const handleConfirm = async () => {
    if (!selectedTime || !id) return;
    setSubmitting(true);
    setError("");
    try {
      await bookAppointment({
        doctorId: id,
        date: selectedDay.iso,
        time: selectedTime,
        reason: reason.trim() || "General consultation",
      });
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not book this appointment. Please try again.");
      fetchSlots(id, selectedDay.iso).then(setDaySlots);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to={`/doctors/${doctor.id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600"
      >
        <ChevronLeft size={16} /> Back to profile
      </Link>

      <Card className="flex items-center gap-4 p-5">
        <Avatar name={doctor.name} colorClass={doctor.avatarColor} size="lg" />
        <div>
          <h1 className="font-semibold text-slate-900">{doctor.name}</h1>
          <p className="text-sm text-primary-700">{doctor.specialty}</p>
          <p className="text-xs text-slate-500">{doctor.hospital} · ${doctor.consultationFee} fee</p>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <CalendarDays size={17} /> Select a date
        </h2>
        <div className="mt-4 flex gap-2.5 overflow-x-auto pb-2">
          {upcomingDays.map((day) => {
            const hasSlots = weeklySlotCount(day.dayName) > 0;
            const active = day.iso === selectedDay.iso;
            return (
              <button
                key={day.iso}
                disabled={!hasSlots}
                onClick={() => handleSelectDay(day)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-4 py-2.5 text-center transition-colors",
                  active
                    ? "border-primary-600 bg-primary-600 text-white"
                    : hasSlots
                      ? "border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50"
                      : "cursor-not-allowed border-slate-100 text-slate-300",
                )}
              >
                <span className="text-xs font-medium opacity-80">{day.dayName.slice(0, 3)}</span>
                <span className="text-sm font-semibold">{day.label.split(", ")[1]}</span>
              </button>
            );
          })}
        </div>

        <h2 className="mt-6 flex items-center gap-2 font-semibold text-slate-900">
          <Clock size={17} /> Select a time slot
        </h2>
        {slotsLoading ? (
          <p className="mt-3 text-sm text-slate-500">Loading availability…</p>
        ) : !daySlots || daySlots.slots.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Dr. {doctor.name.replace("Dr. ", "")} is unavailable on this day. Please choose another date.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {daySlots.slots.map(({ time, available }) => {
              const active = time === selectedTime;
              return (
                <button
                  key={time}
                  disabled={!available}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    !available
                      ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through"
                      : active
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50",
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <Textarea
            label="Reason for visit (optional)"
            placeholder="Briefly describe your symptoms or reason for the appointment"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <Button
          fullWidth
          size="lg"
          className="mt-6"
          disabled={!selectedTime || submitting}
          loading={submitting}
          onClick={handleConfirm}
        >
          Confirm Appointment {selectedTime ? `· ${selectedDay.label} at ${selectedTime}` : ""}
        </Button>
      </Card>

      <Modal open={confirmed} onClose={() => navigate("/my-appointments")} title="Appointment Confirmed">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 size={48} className="text-accent-600" />
          <p className="mt-3 text-sm text-slate-600">
            Your appointment with <span className="font-medium text-slate-900">{doctor.name}</span> on{" "}
            <span className="font-medium text-slate-900">{selectedDay.label}</span> at{" "}
            <span className="font-medium text-slate-900">{selectedTime}</span> has been booked.
          </p>
          <Button fullWidth className="mt-5" onClick={() => navigate("/my-appointments")}>
            View My Appointments
          </Button>
        </div>
      </Modal>
    </div>
  );
}
