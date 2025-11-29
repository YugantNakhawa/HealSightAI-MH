import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function LineAreaChart({ data, yDomain }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={yDomain || ["auto", "auto"]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#34D399"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
