import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, Stethoscope } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { cn } from "../utils/cn";
import type { Role } from "../types";

const DASHBOARD_PATH: Record<string, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

export default function Register() {
  const [role, setRole] = useState<Role>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const currentUser = useAuthStore((s) => s.currentUser);
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to={DASHBOARD_PATH[currentUser.role]} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await register({ name, email, password, role, phone });
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    navigate(DASHBOARD_PATH[role]);
  };

  return (
    <div className="flex min-h-[calc(100svh-64px)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Stethoscope size={20} />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Book appointments faster with a free account</p>
        </div>

        <Card className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {(["patient", "doctor"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "rounded-lg border px-3.5 py-2.5 text-sm font-medium capitalize transition-colors",
                      role === r
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-slate-300 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Full name"
              icon={<User size={16} />}
              placeholder="Jordan Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              label="Phone number (optional)"
              type="tel"
              icon={<Phone size={16} />}
              placeholder="+1 555-0100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              icon={<Lock size={16} />}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm password"
              type="password"
              icon={<Lock size={16} />}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" fullWidth loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary-700 hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
