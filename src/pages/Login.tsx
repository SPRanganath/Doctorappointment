import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Stethoscope } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const DASHBOARD_PATH: Record<string, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

const DEMO_ACCOUNTS = [
  { role: "Patient", email: "patient@demo.com", password: "patient123" },
  { role: "Doctor", email: "doctor@demo.com", password: "doctor123" },
  { role: "Admin", email: "admin@demo.com", password: "admin123" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const currentUser = useAuthStore((s) => s.currentUser);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from;

  if (currentUser) {
    return <Navigate to={from ?? DASHBOARD_PATH[currentUser.role]} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    const user = useAuthStore.getState().currentUser;
    navigate(from ?? (user ? DASHBOARD_PATH[user.role] : "/"));
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="flex min-h-[calc(100svh-64px)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Stethoscope size={20} />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to manage your appointments</p>
        </div>

        <Card className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              icon={<Mail size={16} />}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              icon={<Lock size={16} />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" fullWidth loading={loading}>
              Log in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary-700 hover:underline">
              Sign up
            </Link>
          </p>
        </Card>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Demo accounts</p>
          <div className="mt-2.5 space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email, acc.password)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50"
              >
                <span className="font-medium">{acc.role}</span>
                <span className="text-slate-400">{acc.email} / {acc.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
