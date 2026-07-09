import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { MapPin, Briefcase, Languages, DollarSign, CalendarDays, ChevronLeft } from "lucide-react";
import { useDoctorsStore } from "../store/doctorsStore";
import { getUpcomingDays } from "../utils/date";
import type { Doctor } from "../types";
import Avatar from "../components/ui/Avatar";
import RatingStars from "../components/ui/RatingStars";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function DoctorDetails() {
  const { id } = useParams<{ id: string }>();
  const fetchDoctorById = useDoctorsStore((s) => s.fetchDoctorById);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    fetchDoctorById(id)
      .then(setDoctor)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, fetchDoctorById]);

  if (notFound) return <Navigate to="/find-doctors" replace />;

  if (loading || !doctor) {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
      </div>
    );
  }

  const upcomingDays = getUpcomingDays(5);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/find-doctors" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
        <ChevronLeft size={16} /> Back to search
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar name={doctor.name} colorClass={doctor.avatarColor} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{doctor.name}</h1>
                <p className="mt-0.5 text-primary-700">{doctor.specialty}</p>
                <p className="mt-1 text-sm text-slate-500">{doctor.qualifications}</p>
              </div>
              <Link to={`/doctors/${doctor.id}/book`}>
                <Button size="lg">Book Appointment</Button>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <RatingStars rating={doctor.rating} />
              <span className="text-sm text-slate-500">
                {doctor.rating} ({doctor.reviewsCount} reviews)
              </span>
              <Badge tone="success">Available</Badge>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div className="flex items-center gap-2.5">
                <Briefcase size={16} className="text-slate-400" /> {doctor.experienceYears} years experience
              </div>
              <div className="flex items-center gap-2.5">
                <DollarSign size={16} className="text-slate-400" /> ${doctor.consultationFee} consultation fee
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-slate-400" /> {doctor.hospital}, {doctor.location}
              </div>
              <div className="flex items-center gap-2.5">
                <Languages size={16} className="text-slate-400" /> {doctor.languages.join(", ")}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">About {doctor.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{doctor.bio}</p>
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <CalendarDays size={17} /> Upcoming Availability
          </h2>
          <ul className="mt-4 space-y-2.5">
            {upcomingDays.map((day) => {
              const daySlots = doctor.availability?.find((a) => a.day === day.dayName)?.slots ?? [];
              return (
                <li key={day.iso} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{day.label}</span>
                  <span className={daySlots.length ? "font-medium text-primary-700" : "text-slate-400"}>
                    {daySlots.length ? `${daySlots.length} slots` : "Unavailable"}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link to={`/doctors/${doctor.id}/book`} className="mt-5 block">
            <Button fullWidth>Book Appointment</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
