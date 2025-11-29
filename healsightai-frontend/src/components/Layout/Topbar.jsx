import React from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Topbar({ title }) {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-gray-100">
      <div>
        <h2 className="text-2xl font-semibold text-[#00797C]">{title}</h2>
        <div className="text-sm text-gray-500 hidden md:block">
          Empowered by AI • Predictive Healthcare for India
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <FaBell className="text-[#F26B38]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <div className="text-sm font-medium">{email || "Admin"}</div>
            <div className="text-xs text-gray-400">Administrator</div>
          </div>
          <FaUserCircle className="text-3xl text-[#00797C]" />
        </div>
      </div>
    </header>
  );
}
