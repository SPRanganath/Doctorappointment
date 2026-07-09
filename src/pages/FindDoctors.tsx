import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Stethoscope } from "lucide-react";
import { useDoctorsStore } from "../store/doctorsStore";
import DoctorCard from "../components/doctors/DoctorCard";
import { Input, Select } from "../components/ui/Input";
import EmptyState from "../components/ui/EmptyState";
import { cn } from "../utils/cn";

type SortKey = "rating" | "experience" | "fee-low" | "fee-high";

export default function FindDoctors() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const activeSpecialty = params.get("specialty") ?? "all";
  const [sort, setSort] = useState<SortKey>("rating");

  const doctors = useDoctorsStore((s) => s.doctors);
  const specialties = useDoctorsStore((s) => s.specialties);
  const loading = useDoctorsStore((s) => s.loading);
  const fetchSpecialties = useDoctorsStore((s) => s.fetchSpecialties);
  const fetchDoctors = useDoctorsStore((s) => s.fetchDoctors);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  useEffect(() => {
    fetchDoctors({ search, specialty: activeSpecialty, sort });
  }, [search, activeSpecialty, sort, fetchDoctors]);

  const setSpecialty = (id: string) => {
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("specialty");
    else next.set("specialty", id);
    setParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Find Doctors</h1>
        <p className="mt-1 text-sm text-slate-500">
          {loading ? "Searching…" : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} available`}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by doctor name or specialty"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="flex items-center gap-2 sm:w-56">
          <SlidersHorizontal size={16} className="shrink-0 text-slate-400" />
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="rating">Sort: Highest rated</option>
            <option value="experience">Sort: Most experienced</option>
            <option value="fee-low">Sort: Fee (low to high)</option>
            <option value="fee-high">Sort: Fee (high to low)</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSpecialty("all")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors",
            activeSpecialty === "all"
              ? "bg-primary-600 text-white ring-primary-600"
              : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
          )}
        >
          All Specialties
        </button>
        {specialties.map((s) => (
          <button
            key={s.id}
            onClick={() => setSpecialty(s.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors",
              activeSpecialty === s.id
                ? "bg-primary-600 text-white ring-primary-600"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {!loading && doctors.length === 0 ? (
          <EmptyState
            icon={<Stethoscope size={22} />}
            title="No doctors found"
            description="Try adjusting your search or filters to find available doctors."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
