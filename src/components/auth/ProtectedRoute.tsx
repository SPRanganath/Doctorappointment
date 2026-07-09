import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import type { Role } from "../../types";

const DASHBOARD_PATH: Record<Role, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

export default function ProtectedRoute({
  roles,
  children,
}: {
  roles?: Role[];
  children: ReactNode;
}) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const initializing = useAuthStore((s) => s.initializing);
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to={DASHBOARD_PATH[currentUser.role]} replace />;
  }

  return <>{children}</>;
}
