import { Link } from "react-router-dom";
import type { Specialty } from "../../types";
import SpecialtyIcon from "../SpecialtyIcon";

export default function SpecialtyCard({ specialty }: { specialty: Specialty }) {
  return (
    <Link
      to={`/find-doctors?specialty=${specialty.id}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
        <SpecialtyIcon name={specialty.icon} className="size-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{specialty.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">{specialty.description}</p>
      </div>
    </Link>
  );
}
