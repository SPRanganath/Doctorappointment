import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100svh-64px)] flex-col items-center justify-center px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Stethoscope size={26} />
      </span>
      <h1 className="mt-5 text-3xl font-bold text-slate-900">404 — Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
