import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import api from "../api/api";
import { DatePicker } from "antd";
import MedicineBarChart from "../components/charts/MedicineBarChart";

export default function InventoryDashboard() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [medicines, setMedicines] = useState([]);

  // 🌟 Fetch prediction for selected date
  const fetchPrediction = async (date) => {
    if (!date) return;

    const formatted = date.format("YYYY-MM-DD");

    try {
      const res = await api.get(`/test/predict-by-date?date=${formatted}`);
      const pred = res.data.predictions;

      setPrediction(pred);

      // Extract only medicine categories — ROUND values
      const meds = Object.entries(pred)
        .filter(
          ([key]) =>
            ![
              "patient_count",
              "bed_count",
              "doctors_required",
              "nurses_required",
              "support_required",
              "accident_count",
              "staff_required_total",
            ].includes(key)
        )
        .map(([name, value]) => ({
          name,
          value: Math.round(value), // ✅ Rounded
        }));

      setMedicines(meds);
    } catch (err) {
      console.error("Failed to load prediction:", err);
    }
  };

  return (
    <DashboardLayout title="Inventory Dashboard">

      {/* ---- TOP FILTER ROW ---- */}
      <div className="bg-white p-5 rounded-xl shadow-sm mb-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* DATE FILTER */}
        <div>
          <label className="text-sm font-medium text-slate-700">
            Select Date
          </label>
          <DatePicker
            className="w-full mt-1"
            onChange={(date) => {
              setSelectedDate(date);
              fetchPrediction(date);
            }}
          />
        </div>

        {/* ADMITTED COUNT */}
        <div className="text-center">
          <p className="text-sm text-slate-500">Admitted Patients</p>
          <h2 className="text-3xl font-semibold">
            {prediction ? Math.round(prediction.patient_count) : "--"}
          </h2>
        </div>

        {/* ACCIDENT COUNT */}
        <div className="text-center">
          <p className="text-sm text-slate-500">Accidents Predicted</p>
          <h2 className="text-3xl font-semibold">
            {prediction ? Math.round(prediction.accident_count) : "--"}
          </h2>
        </div>

      </div>

      {/* ---- STAFF REQUIREMENT CARDS ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Doctors Required"
          value={prediction ? Math.round(prediction.doctors_required) : "--"}
        />

        <StatCard
          title="Nurses Required"
          value={prediction ? Math.round(prediction.nurses_required) : "--"}
        />

        <StatCard
          title="Support Staff Required"
          value={prediction ? Math.round(prediction.support_required) : "--"}
        />

        <StatCard
          title="Beds Required"
          value={prediction ? Math.round(prediction.bed_count) : "--"}
        />
      </div>

      {/* ---- MEDICINE REQUIREMENT CHART ---- */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-10">
        <h3 className="font-semibold text-lg mb-4">
          Medicine Requirement by Category
        </h3>

        <MedicineBarChart data={medicines} />
      </div>

    </DashboardLayout>
  );
}
