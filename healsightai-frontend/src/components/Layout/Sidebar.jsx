import React from "react";
import { FaChartLine, FaUserMd, FaCog, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";

const nav = [
  { to: "/admin", label: "Dashboard", icon: <FaChartLine /> },
  { to: "/admin/advisory", label: "Advisory", icon: <FaUserMd /> },
  { to: "/admin/inventory", label: "Inventory", icon: <FaCog /> },
];

export default function Sidebar() {
  const loc = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-[#00797C] text-white shadow-lg min-h-screen flex flex-col justify-between">

      {/* TOP SECTION */}
      <div className="p-6">
        
        {/* Logo + Title */}
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="HealSightAI" className="w-10 h-10 rounded-md" />
          <div>
            <div className="font-bold text-lg tracking-wide">HealSightAI</div>
            <div className="text-xs text-white/80">Predictive Healthcare</div>
          </div>
        </div>

        {/* Navigation Links */}
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

      {/* BOTTOM SECTION */}
      <div className="px-6 mb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 
                     bg-red-600 hover:bg-red-700 
                     rounded-md text-white text-sm py-2"
        >
          <FaSignOutAlt className="text-sm" />
          Logout
        </button>
      </div>

      <div className="p-4 text-xs text-center text-white/60 border-t border-white/10">
        © {new Date().getFullYear()} HealSightAI
      </div>
    </aside>
  );
}
