"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TransactionChart({ data = [] }) {
  // Format yAxis to use 'k' for thousands if values are large
  const formatYAxis = (tickItem) => {
    if (tickItem >= 1000) {
      return `${(tickItem / 1000).toFixed(0)}k`;
    }
    return tickItem;
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="text-gray-600 font-medium mb-1">{label}</p>
          <p className="text-blue-600 font-bold">
            ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-card">
      <h3 className="text-xl font-semibold mb-4 text-gray-700 pl-2 pt-2">Transaction Details</h3>
      <ResponsiveContainer className="-ml-5" width="100%" height={260}>
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickMargin={10} />
          <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

                       