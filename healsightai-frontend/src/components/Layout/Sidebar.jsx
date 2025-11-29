import React from "react";
import { FaChartLine, FaUsers, FaCalendarAlt, FaUserMd, FaCog } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.jpeg"; // ✅ Add your logo path here

const nav = [
  { to: "/admin", label: "Dashboard", icon: <FaChartLine /> },
  { to: "/admin/patients", label: "Patients", icon: <FaUsers /> },
  { to: "/admin/appointments", label: "Appointments", icon: <FaCalendarAlt /> },
  { to: "/admin/staff-planner", label: "Staff Planner", icon: <FaUserMd /> },
  { to: "/admin/settings", label: "Settings", icon: <FaCog /> },
];

export default function Sidebar() {
  const loc = useLocation();

  return (
    <aside className="w-72 bg-[#00797C] text-white shadow-lg min-h-screen flex flex-col justify-between">
      <div className="p-6">
        {/* LOGO + BRAND */}
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="HealSightAI" className="w-10 h-10 rounded-md" />
          <div>
            <div className="font-bold text-lg tracking-wide">HealSightAI</div>
            <div className="text-xs text-white/80">Predictive Healthcare</div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                loc.pathname.startsWith(n.to)
                  ? "bg-white/15 text-white"
                  : "hover:bg-white/10 text-white/80"
              }`}
            >
              <div className="text-lg">{n.icon}</div>
              <div className="text-sm font-medium">{n.label}</div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 text-xs text-center text-white/60 border-t border-white/10">
        © {new Date().getFullYear()} HealSightAI
      </div>
    </aside>
  );
}
