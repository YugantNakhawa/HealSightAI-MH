import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";

function DashboardLayout({ title, children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-blue-600 text-white flex justify-between items-center px-6 py-3 shadow-md">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-sm">{role}</span>
            <span className="text-xs text-blue-200">{email}</span>
          </div>
          <FaUserCircle className="text-2xl" />
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

export default DashboardLayout;
