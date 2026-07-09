import { Link } from "react-router-dom";
import { Stethoscope, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2 text-primary-700">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Stethoscope size={18} />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">MediCare</span>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Book appointments with trusted doctors near you, anytime, anywhere.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link to="/" className="hover:text-primary-600">Home</Link></li>
            <li><Link to="/find-doctors" className="hover:text-primary-600">Find Doctors</Link></li>
            <li><Link to="/login" className="hover:text-primary-600">Log in</Link></li>
            <li><Link to="/register" className="hover:text-primary-600">Sign up</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800">For Providers</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link to="/register" className="hover:text-primary-600">Join as a doctor</Link></li>
            <li><Link to="/doctor/dashboard" className="hover:text-primary-600">Doctor dashboard</Link></li>
            <li><Link to="/admin/dashboard" className="hover:text-primary-600">Admin console</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800">Contact</h4>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-500">
            <li className="flex items-center gap-2"><Phone size={15} /> +1 (555) 010-0100</li>
            <li className="flex items-center gap-2"><Mail size={15} /> support@medicare.app</li>
            <li className="flex items-center gap-2"><MapPin size={15} /> 500 Wellness Ave, Springfield</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} MediCare. All rights reserved. This is a demo application with mock data.
      </div>
    </footer>
  );
}
