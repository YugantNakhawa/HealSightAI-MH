import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import LineAreaChart from "../components/charts/LineAreaChart";
import api from "../api/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [predictionData, setPredictionData] = useState([]);
  const [topMedicine, setTopMedicine] = useState(null);

  const [temperature, setTemperature] = useState(null);
  const [aqi, setAqi] = useState(null);

  const [festivals, setFestivals] = useState([]);
  const [advisory, setAdvisory] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  // ---- AI ADVISORY GENERATOR (uses current state) ----
  const generateAdvisory = () => {
    const avgPatients = predictionData.length
      ? Math.round(
          predictionData.reduce((s, d) => s + d.value, 0) /
            predictionData.length
        )
      : 0;

    const tips = [];

    // AQI based
    if (aqi !== null) {
      if (aqi >= 200) {
        tips.push(
          "⚠️ AQI is very high. Expect more respiratory cases. Increase pulmonary and respiratory medicine stock."
        );
      } else if (aqi >= 120) {
        tips.push(
          "Air quality is moderate. Monitor OPD for cough, asthma and allergy spikes."
        );
      } else {
        tips.push(
          "Air quality is good. No special respiratory surge expected from pollution alone."
        );
      }
    }

    // Temperature based
    if (temperature !== null) {
      if (temperature >= 32) {
        tips.push(
          "High temperature detected. Prepare for heat-related issues and dehydration cases. Ensure ORS and cooling areas."
        );
      } else if (temperature <= 18) {
        tips.push(
          "Low temperature: Be ready for increased flu, cold and viral infections."
        );
      } else {
        tips.push(
          "Temperature is in a normal range. No extreme weather-related spikes expected."
        );
      }
    }

    // Patient inflow based
    if (avgPatients > 0) {
      if (avgPatients > 350) {
        tips.push(
          `High predicted patient inflow (~${avgPatients} / day). Ensure extra triage nurses, ER doctors and support staff.`
        );
      } else if (avgPatients > 250) {
        tips.push(
          `Moderate predicted inflow (~${avgPatients} / day). Slightly increase ER readiness and pharmacy stock.`
        );
      } else {
        tips.push(
          `Predicted inflow (~${avgPatients} / day) is manageable. Maintain standard staffing levels.`
        );
      }
    }

    // Top medicine info
    if (topMedicine) {
      tips.push(
        `Demand spike alert: "${topMedicine.name}" is the top required medicine for the coming week (avg usage ${topMedicine.avg.toFixed(
          1
        )}). Ensure buffer stock.`
      );
    }

    if (!tips.length) {
      tips.push("No critical alerts. Operations look normal for the upcoming week.");
    }

    setAdvisory(tips);
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

    const fetchFestivals = async () => {
  try {
    const year = new Date().getFullYear();

    const res = await fetch(
      `https://calendarific.com/api/v2/holidays?api_key=GdFW94rsXO4qFZUJKaETYjLnRkVWm1R6&country=IN&year=${2025}`
    );

    if (!res.ok) {
      throw new Error("Calendarific API failed with status: " + res.status);
    }

    const json = await res.json();

    // Convert to simplified objects
    let list = json.response.holidays.map((h) => ({
      localName: h.name,
      date: h.date.iso,
    }));

    // ---- FILTER CURRENT MONTH ----
    const currentMonth = new Date().getMonth() + 1;
    list = list.filter((item) => {
      const itemMonth = new Date(item.date).getMonth() + 1;
      return itemMonth === currentMonth;
    });

    setFestivals(list);
  } catch (err) {
    console.error("Festival fetch error:", err);
    setFestivals([]);
  }
};



    fetchAllData();
    fetchRealtime();
    fetchPredictions();
    fetchFestivals();
  }, []);

  // Re-generate advisory whenever inputs change
  useEffect(() => {
    generateAdvisory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictionData, aqi, temperature, topMedicine]);

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
            aqi === null
              ? "Loading..."
              : aqi >= 200
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

      {/* ---- CHART + FESTIVAL + AI ADVISORY ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-emerald-800">
              Patient Prediction (7 days)
            </h3>
            <div className="text-sm text-slate-500">Updated: Today</div>
          </div>

          <LineAreaChart data={predictionData} yDomain={[250, "auto"]} />
        </div>

        {/* Right column: Festival + AI Advisory */}
        <div className="space-y-6">
          {/* Festival Calendar */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg text-emerald-800 mb-3">
              Upcoming Festivals (India)
            </h3>
            <p className="text-sm text-slate-500 mb-3">
              Auto-updated national holidays
            </p>

            {festivals.length ? (
              <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
                {festivals.slice(0, 7).map((f) => (
                  <li key={f.date} className="flex justify-between">
                    <span>{f.localName}</span>
                    <span className="text-slate-500">
                      {new Date(f.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Loading festivals...</p>
            )}
          </div>

                  </div>
      </div>
    </DashboardLayout>
  );
}
