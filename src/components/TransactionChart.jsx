"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "5k", value: 20 },
  { name: "10k", value: 45 },
  { name: "15k", value: 30 },
  { name: "20k", value: 80 },
  { name: "25k", value: 50 },
  { name: "30k", value: 70 },
  { name: "35k", value: 60 },
  { name: "40k", value: 75 },
];

export default function TransactionChart() {
  return (
    <div className="bg-white rounded-xl shadow-card">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Transaction Details</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

                       