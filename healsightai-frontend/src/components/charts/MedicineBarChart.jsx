import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MedicineBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={140} />
        <Tooltip />
        <Bar dataKey="value" fill="#e63946" barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
