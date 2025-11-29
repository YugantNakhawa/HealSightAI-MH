import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";   // <--- Added
import DashboardLayout from "../components/Layout/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import LineAreaChart from "../components/charts/LineAreaChart";
import api from "../api/api";

export default function AdminDashboard() {
  const navigate = useNavigate();   // <--- Added

  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [predictionData, setPredictionData] = useState([]);
  const [topMedicine, setTopMedicine] = useState(null);

  const [temperature, setTemperature] = useState(null);
  const [aqi, setAqi] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    navigate("/login");
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [dres, sres, ares] = await Promise.all([
          api.get("/admin/doctors"),
          api.get("/admin/staff"),
          api.get("/admin/appointments"),
        ]);
        setDoctors(dres.data || []);
        setStaff(sres.data || []);
        setAppointments(ares.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchRealtime = async () => {
      try {
        const res = await api.get("/test/realtime");
        const data = res.data;

        setTemperature(data.temperatureC);
        setAqi(data.aqi);
      } catch (err) {
        console.error("Realtime data fetch failed", err);
      }
    };

    const fetchPredictions = async () => {
      try {
        const res = await api.get("/test/predict7");
        const dataArray = res.data.forecast_7_days || [];

        const chartData = dataArray.map((item) => ({
          name: new Date(item.date).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          value: Math.round(item.predictions.patient_count),
        }));
        setPredictionData(chartData);

        // Medicine weekly avg calculation
        if (dataArray.length) {
          const totals = {};
          const counts = {};

          dataArray.forEach((item) => {
            Object.entries(item.predictions || {}).forEach(([key, val]) => {
              if (
                [
                  "patient_count",
                  "bed_count",
                  "doctors_required",
                  "nurses_required",
                  "accident_count",
                  "support_required",
                  "staff_required_total",
                ].includes(key)
              )
                return;

              if (typeof val === "number") {
                totals[key] = (totals[key] || 0) + val;
                counts[key] = (counts[key] || 0) + 1;
              }
            });
          });

          const avg = {};
          Object.keys(totals).forEach((k) => {
            avg[k] = totals[k] / counts[k];
          });

          const top = Object.entries(avg).sort((a, b) => b[1] - a[1])[0];
          if (top) setTopMedicine({ name: top[0], avg: top[1] });
        }
      } catch (err) {
        console.error("Prediction fetch error:", err);
      }
    };

    fetchAllData();
    fetchRealtime();
    fetchPredictions();
  }, []);

  return (
    <DashboardLayout
      title="Admin Dashboard"
      extra={
        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      }
    >
      {/* ---- TOP STATS ROW ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">

        <StatCard
          title="Temperature (°C)"
          value={temperature !== null ? temperature.toFixed(1) : "Loading..."}
          delta="Live"
        >
          <div className="text-xs text-slate-400 mt-2">
            Updated via OpenWeather
          </div>
        </StatCard>

        <StatCard
          title="Pollution AQI"
          value={aqi !== null ? aqi : "Loading..."}
          delta={
            aqi >= 200
              ? "⚠️ Poor"
              : aqi >= 100
              ? "Moderate"
              : "Good"
          }
        >
          <div className="text-xs text-slate-400 mt-2">
            Air Quality Index (WAQI)
          </div>
        </StatCard>

        <StatCard
          title="Predicted Inflow (next 7d)"
          value={
            predictionData.length
              ? Math.round(
                  predictionData.reduce((s, d) => s + d.value, 0) /
                    predictionData.length
                )
              : 0
          }
          delta="+12%"
        >
          <div className="text-xs text-slate-400 mt-2">
            Avg daily predicted patients
          </div>
        </StatCard>

        <StatCard
          title="Top Medicine (7d)"
          value={topMedicine ? topMedicine.name : "Calculating..."}
          delta={topMedicine ? `${topMedicine.avg.toFixed(1)} Avg` : ""}
        >
          <div className="text-xs text-slate-400 mt-2">
            Highest weekly medicine demand
          </div>
        </StatCard>

      </div>

      {/* ---- CHART + STAFF PLANNER ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-emerald-800">
              Patient Prediction (7 days)
            </h3>
            <div className="text-sm text-slate-500">Updated: Today</div>
          </div>

          <LineAreaChart data={predictionData} yDomain={[250, "auto"]} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg text-emerald-800 mb-3">
            Staff Planner (AI)
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Next week recommendation
          </p>
          <ul className="space-y-2 text-sm">
            <li>Mon: Increase ER doctors 6 → 8</li>
            <li>Thu: Add 1 respiratory specialist</li>
            <li>Sat: Prepare extra inventory for masks</li>
          </ul>

          <div className="mt-4">
            <button className="w-full bg-emerald-700 text-white py-2 rounded-md">
              Accept Recommendation
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
