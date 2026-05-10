import Link from "next/link";

export default function PendingActionCard({ title, count, amount, label, href }) {
  return (
    <div className="bg-white border rounded-xl shadow-card p-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</h3>
        <Link 
          href={href} 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Count Box */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center w-16 h-16 shrink-0">
          <span className="text-orange-600 font-bold text-2xl">{count}</span>
        </div>

        {/* Amount & Label */}
        <div className="flex flex-col truncate">
          <span className="text-gray-900 font-bold text-2xl tracking-wide truncate">{amount}</span>
          <span className="text-gray-400 text-xs mt-1 truncate">{label}</span>
        </div>
      </div>
    </div>
  );
}
