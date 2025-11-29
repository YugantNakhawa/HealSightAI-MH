import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import StaffDashboard from "./pages/StaffDashboard";

// ✅ Protected Route Wrapper
function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role")?.toUpperCase(); // normalize to uppercase

  // 🔒 If no token → redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 🚫 If role doesn’t match → redirect to login
  if (role && role !== userRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ✅ Main App
function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Doctor Dashboard */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute role="DOCTOR">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Staff Dashboard */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="STAFF">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Any unknown route → go to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;