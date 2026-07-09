import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Stethoscope, Menu, X, LayoutDashboard, LogOut, CalendarCheck } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import { cn } from "../../utils/cn";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/find-doctors", label: "Find Doctors" },
];

const DASHBOARD_PATH: Record<string, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-primary-700">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Stethoscope size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">MediCare</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-primary-700 bg-primary-50" : "text-slate-600 hover:bg-slate-100",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {currentUser?.role === "patient" && (
            <NavLink
              to="/my-appointments"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-primary-700 bg-primary-50" : "text-slate-600 hover:bg-slate-100",
                )
              }
            >
              My Appointments
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 hover:bg-slate-50"
              >
                <Avatar name={currentUser.name} size="sm" />
                <span className="text-sm font-medium text-slate-700">{currentUser.name.split(" ")[0]}</span>
              </button>
              {menuOpen && (
                <>
                  <button className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} aria-hidden />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-2.5">
                      <p className="truncate text-sm font-medium text-slate-800">{currentUser.name}</p>
                      <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                    </div>
                    <Link
                      to={DASHBOARD_PATH[currentUser.role]}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    {currentUser.role === "patient" && (
                      <Link
                        to="/my-appointments"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <CalendarCheck size={16} /> My Appointments
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/register">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3.5 py-2.5 text-sm font-medium",
                    isActive ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {currentUser ? (
              <>
                {currentUser.role === "patient" && (
                  <NavLink
                    to="/my-appointments"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    My Appointments
                  </NavLink>
                )}
                <NavLink
                  to={DASHBOARD_PATH[currentUser.role]}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2 px-1">
                <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
                  <Button variant="outline" fullWidth>
                    Log in
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setOpen(false)}>
                  <Button fullWidth>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
