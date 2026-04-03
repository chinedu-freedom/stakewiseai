// export default function StatCard({ title, value, delta, color, icon: Icon }) {
//   const deltaColor = delta > 0 ? "text-green-600" : "text-red-600";

//   return (
//     <div className="bg-white border rounded-xl shadow-card p-4 flex items-start justify-between ">
//       <div>
//         <h3 className="text-xs text-gray-400 font-medium">{title}</h3>
//         <p className="text-2xl font-semibold mt-1">${value}</p>
//         <p className={`${deltaColor} text-sm mt-1`}>
//           {delta > 0
//             ? `▲ ${delta}% Up from yesterday`
//             : `▼ ${Math.abs(delta)}% Down from yesterday`}
//         </p>
//       </div>

//       <div
//         className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}
//       >
//         <Icon size={20} />
//       </div>
//     </div>
//   );
// }
export default function StatCard({ title, value, delta, color, icon: Icon }) {
  const deltaColor = delta > 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white border rounded-xl shadow-card p-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs text-gray-400 font-medium">{title}</h3>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>

        <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
          <Icon size={20} />
        </div>
      </div>

      <p className={`${deltaColor} text-sm mt-2 h-5`}>
        {delta > 0
          ? `▲ ${delta}% Up from yesterday`
          : `▼ ${Math.abs(delta)}% Down from yesterday`}
      </p>
    </div>
  );
}
