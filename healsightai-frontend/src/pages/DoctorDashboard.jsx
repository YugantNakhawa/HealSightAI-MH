import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import api from "../api/api";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [prescription, setPrescription] = useState("");

  useEffect(() => {
    fetchMyAppointments();
    fetchAdvisories();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      const res = await api.get("/doctor/appointments"); // implement backend
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdvisories = async () => {
    try {
      const res = await api.get("/doctor/advisories");
      setAdvisories(res.data || []);
    } catch (err) {
      setAdvisories([]);
    }
  };

  const savePrescription = async () => {
    if (!selected) return;
    try {
      await api.post("/doctor/prescriptions", { appointmentId: selected.id, prescription });
      setPrescription("");
      alert("Saved");
      fetchMyAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-3">Your Appointments</h3>
          <div className="divide-y">
            {appointments.map((a) => (
              <div key={a.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{a.patientName}</div>
                  <div className="text-xs text-slate-500">{new Date(a.date).toLocaleString()}</div>
                </div>
                <div>
                  <button onClick={() => setSelected(a)} className="px-3 py-1 rounded-md bg-emerald-600 text-white">Open</button>
                </div>
              </div>
            ))}
            {appointments.length === 0 && <div className="py-4 text-sm text-slate-400">No appointments assigned.</div>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-3">AI Advisories</h3>
          <ul className="text-sm space-y-2">
            {advisories.map((ad) => <li key={ad.id} className="text-slate-600">{ad.message}</li>)}
            {advisories.length===0 && <li className="text-slate-400">No advisories</li>}
          </ul>
        </div>
      </div>

      {selected && (
        <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
          <h3 className="font-semibold">Write Prescription for {selected.patientName}</h3>
          <textarea value={prescription} onChange={(e)=>setPrescription(e.target.value)} className="w-full border p-2 rounded-md mt-3" rows={4} />
          <div className="mt-3 flex gap-3">
            <button onClick={savePrescription} className="bg-emerald-700 text-white px-4 py-2 rounded-md">Save</button>
            <button onClick={()=>setSelected(null)} className="px-4 py-2 border rounded-md">Close</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
