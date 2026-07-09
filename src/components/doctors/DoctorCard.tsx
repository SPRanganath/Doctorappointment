import { Link } from "react-router-dom";
import { MapPin, Briefcase } from "lucide-react";
import type { Doctor } from "../../types";
import Card from "../ui/Card";
import Avatar from "../ui/Avatar";
import RatingStars from "../ui/RatingStars";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar name={doctor.name} colorClass={doctor.avatarColor} size="lg" />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{doctor.name}</h3>
          <p className="text-sm text-primary-700">{doctor.specialty}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <RatingStars rating={doctor.rating} />
            <span className="text-xs text-slate-500">
              {doctor.rating} ({doctor.reviewsCount})
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Briefcase size={15} className="shrink-0 text-slate-400" />
          <span>{doctor.experienceYears} yrs experience</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={15} className="shrink-0 text-slate-400" />
          <span className="truncate">{doctor.hospital}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge tone="primary">${doctor.consultationFee} fee</Badge>
      </div>

      <div className="mt-5 flex gap-2">
        <Link to={`/doctors/${doctor.id}`} className="flex-1">
          <Button variant="outline" fullWidth>
            View Profile
          </Button>
        </Link>
        <Link to={`/doctors/${doctor.id}/book`} className="flex-1">
          <Button fullWidth>Book Now</Button>
        </Link>
      </div>
    </Card>
  );
}
