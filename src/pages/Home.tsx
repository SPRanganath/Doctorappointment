import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, Clock3, Users2, Stethoscope, CalendarCheck, Star, ArrowRight } from "lucide-react";
import { useDoctorsStore } from "../store/doctorsStore";
import SpecialtyCard from "../components/doctors/SpecialtyCard";
import DoctorCard from "../components/doctors/DoctorCard";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const STATS = [
  { label: "Verified Doctors", value: "150+", icon: Stethoscope },
  { label: "Specialties", value: "12", icon: Users2 },
  { label: "Appointments Booked", value: "20k+", icon: CalendarCheck },
  { label: "Average Rating", value: "4.8/5", icon: Star },
];

const STEPS = [
  {
    title: "Search a doctor",
    description: "Browse by specialty, location or doctor name to find the right care for you.",
    icon: Search,
  },
  {
    title: "Pick a time slot",
    description: "View real-time availability and choose a slot that fits your schedule.",
    icon: Clock3,
  },
  {
    title: "Confirm your visit",
    description: "Get instant confirmation and manage your appointments anytime.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const specialties = useDoctorsStore((s) => s.specialties);
  const doctors = useDoctorsStore((s) => s.doctors);
  const fetchSpecialties = useDoctorsStore((s) => s.fetchSpecialties);
  const fetchDoctors = useDoctorsStore((s) => s.fetchDoctors);

  useEffect(() => {
    fetchSpecialties();
    fetchDoctors({ sort: "rating" });
  }, [fetchSpecialties, fetchDoctors]);

  const featuredDoctors = doctors.slice(0, 4);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/find-doctors${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`);
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white ring-1 ring-inset ring-white/25">
              <ShieldCheck size={14} /> Trusted healthcare booking platform
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Book the right doctor, right on time
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-primary-50 sm:text-lg">
              Search verified doctors by specialty, compare ratings and book appointments online in minutes —
              no phone calls needed.
            </p>

            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-xl flex-col gap-2.5 rounded-2xl bg-white p-2.5 shadow-xl sm:flex-row"
            >
              <div className="flex-1">
                <Input
                  placeholder="Search by doctor name or specialty"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  icon={<Search size={16} />}
                  className="border-0 focus:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="shrink-0">
                Search Doctors
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-primary-50">
              <span className="opacity-80">Popular:</span>
              {["Cardiology", "Dermatology", "Pediatrics", "Dentistry"].map((s) => (
                <button
                  key={s}
                  onClick={() => navigate(`/find-doctors?search=${encodeURIComponent(s)}`)}
                  className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/20"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Browse by Specialty</h2>
            <p className="mt-1 text-sm text-slate-500">Find specialists tailored to your health needs</p>
          </div>
          <Button variant="ghost" icon={<ArrowRight size={16} />} className="hidden sm:inline-flex" onClick={() => navigate("/find-doctors")}>
            View all
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {specialties.map((s) => (
            <SpecialtyCard key={s.id} specialty={s} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Top Rated Doctors</h2>
              <p className="mt-1 text-sm text-slate-500">Highly reviewed doctors ready to see you</p>
            </div>
            <Button variant="ghost" icon={<ArrowRight size={16} />} className="hidden sm:inline-flex" onClick={() => navigate("/find-doctors")}>
              View all
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDoctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">How MediCare Works</h2>
          <p className="mt-1 text-sm text-slate-500">Book your appointment in three simple steps</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary-600 text-white">
                <step.icon size={20} />
              </div>
              <span className="absolute right-6 top-6 text-3xl font-bold text-slate-100">0{i + 1}</span>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-primary-700 to-accent-600 px-6 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white">Ready to book your appointment?</h2>
            <p className="mt-1.5 text-primary-50">Join thousands of patients managing their healthcare online.</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10" onClick={() => navigate("/find-doctors")}>
              Find Doctors
            </Button>
            <Button className="bg-white text-primary-700 hover:bg-primary-50" onClick={() => navigate("/register")}>
              Sign up free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
