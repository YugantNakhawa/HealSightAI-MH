import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import InventoryDashboard from "./pages/InventoryDashboard"; // ✅ Import it

// ✅ Protected Route Wrapper
function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role")?.toUpperCase();

  if (!token) return <Navigate to="/" replace />;
  if (role && role !== userRole) return <Navigate to="/" replace />;

  return children;
}

// ✅ Main App
function App() {
  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ⭐ NEW — ADMIN INVENTORY PAGE ⭐ */}
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute role="ADMIN">
              <InventoryDashboard />
            </ProtectedRoute>
          }
        />

        {/* DOCTOR DASHBOARD */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute role="DOCTOR">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* STAFF DASHBOARD */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="STAFF">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* ANY UNKNOWN ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
