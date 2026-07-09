import type { ReactNode } from "react";
import { CalendarDays, Clock, DollarSign } from "lucide-react";
import type { Appointment } from "../../types";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
import { formatDateLong } from "../../utils/date";

const STATUS_TONE = {
  upcoming: "primary",
  completed: "success",
  cancelled: "danger",
} as const;

export default function AppointmentCard({
  appointment,
  perspective,
  actions,
}: {
  appointment: Appointment;
  perspective: "patient" | "doctor" | "admin";
  actions?: ReactNode;
}) {
  const primaryName = perspective === "doctor" ? appointment.patientName : appointment.doctorName;
  const subtitle =
    perspective === "doctor" ? "Patient" : appointment.specialty;

  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Avatar name={primaryName} size="md" />
        <div>
          <p className="font-semibold text-slate-900">{primaryName}</p>
          <p className="text-sm text-slate-500">{subtitle}</p>
          {perspective === "admin" && (
            <p className="text-xs text-slate-400">Patient: {appointment.patientName}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CalendarDays size={13} /> {formatDateLong(appointment.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} /> {appointment.time}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={13} /> {appointment.fee}
            </span>
          </div>
          {appointment.reason && (
            <p className="mt-2 max-w-md text-sm text-slate-600">{appointment.reason}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
        <Badge tone={STATUS_TONE[appointment.status]}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </Badge>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </Card>
  );
}
