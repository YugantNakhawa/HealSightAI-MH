import React from "react";

export default function StatCard({ title, value, delta, children }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm w-full">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-slate-400">{title}</div>
          <div className="text-2xl font-semibold text-emerald-700">{value}</div>
        </div>
        <div className="text-sm text-slate-500">{delta}</div>
      </div>
      <div className="mt-3">
        {children}
      </div>
    </div>
  );
}
