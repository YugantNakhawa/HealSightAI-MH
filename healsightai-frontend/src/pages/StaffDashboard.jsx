import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import api from "../api/api";
import LineAreaChart from "../components/charts/LineAreaChart";

export default function StaffDashboard() {
  const [inventory, setInventory] = useState([]);
  const [vendorRequests, setVendorRequests] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    fetchInventory();
    fetchVendorRequests();
    fetchTrend();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get("/staff/inventory");
      setInventory(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchVendorRequests = async () => {
    try {
      const res = await api.get("/staff/vendor-requests");
      setVendorRequests(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchTrend = async () => {
    try {
      const res = await api.get("/ai/inventory/trend"); // backend AI route
      setTrend(res.data || sampleTrend());
    } catch (err) { setTrend(sampleTrend()); }
  };

  const sampleTrend = () => [
    { name: "Mon", value: 120 },
    { name: "Tue", value: 100 },
    { name: "Wed", value: 80 },
    { name: "Thu", value: 95 },
    { name: "Fri", value: 85 },
    { name: "Sat", value: 70 },
    { name: "Sun", value: 60 },
  ];

  const approveVendor = async (id) => {
    try {
      await api.post(`/staff/vendor-requests/${id}/approve`);
      fetchVendorRequests();
    } catch (err) { console.error(err); }
  };

  return (
    <DashboardLayout title="Staff Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="font-semibold mb-3">Inventory Trend (7d)</h3>
          <LineAreaChart data={trend} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-3">Low Stock</h3>
          <ul className="text-sm">
            {inventory.filter(i=>i.quantity < 20).map(i=>(
              <li key={i.id} className="py-2 flex justify-between">
                <div>{i.name}</div>
                <div className="text-sm text-amber-600">{i.quantity}</div>
              </li>
            ))}
            {inventory.length===0 && <li className="text-slate-400">No items</li>}
          </ul>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-3">Vendor Requests</h3>
        <ul className="divide-y">
          {vendorRequests.map(v=>(
            <li key={v.id} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{v.itemName}</div>
                <div className="text-xs text-slate-500">Qty: {v.qty} • Requested by {v.requestedBy}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>approveVendor(v.id)} className="px-3 py-1 bg-emerald-600 text-white rounded-md">Approve</button>
                <button onClick={()=>{/* reject call */}} className="px-3 py-1 border rounded-md">Reject</button>
              </div>
            </li>
          ))}
          {vendorRequests.length===0 && <div className="py-4 text-sm text-slate-400">No pending requests</div>}
        </ul>
      </div>
    </DashboardLayout>
  );
}
