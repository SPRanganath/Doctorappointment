import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, Search, Users, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { cn } from "../../utils/cn";

const NAV_BY_ROLE: Record<string, { to: string; label: string; icon: ReactNode; end?: boolean }[]> = {
  patient: [
    { to: "/patient/dashboard", label: "Overview", icon: <LayoutDashboard size={17} />, end: true },
    { to: "/my-appointments", label: "My Appointments", icon: <CalendarCheck size={17} /> },
    { to: "/find-doctors", label: "Find Doctors", icon: <Search size={17} /> },
  ],
  doctor: [
    { to: "/doctor/dashboard", label: "Overview", icon: <LayoutDashboard size={17} />, end: true },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Overview", icon: <LayoutDashboard size={17} />, end: true },
    { to: "/admin/dashboard", label: "Doctors", icon: <Users size={17} /> },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  patient: "Patient",
  doctor: "Doctor",
  admin: "Administrator",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  if (!currentUser) return null;

  const navItems = NAV_BY_ROLE[currentUser.role] ?? [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <aside className="shrink-0 lg:w-64">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <Avatar name={currentUser.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{currentUser.name}</p>
              <Badge tone="primary">
                <ShieldCheck size={12} /> {ROLE_LABEL[currentUser.role]}
              </Badge>
            </div>
          </div>

          <nav className="mt-5 flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100",
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
