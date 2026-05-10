import Link from "next/link";

export default function PendingActionCard({ title, count, amount, color, href }) {
  const themeColor = color || "blue";

  return (
    <Link href={href} className="block h-full hover:-translate-y-1 transition-transform duration-200">
      <div className="bg-white border rounded-xl shadow-card p-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs text-gray-400 font-medium">{title}</h3>
            <p className="text-2xl font-semibold mt-1">{amount}</p>
          </div>

          <div className={`px-4 py-2 rounded-lg bg-${themeColor}-100 text-${themeColor}-600 font-bold text-xl min-w-[3rem] text-center flex items-center justify-center`}>
            {count}
          </div>
        </div>
      </div>
    </Link>
  );
}
