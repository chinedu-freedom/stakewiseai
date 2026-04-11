import { Search } from "lucide-react";

export default function SearchBar({ search, setSearch }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, or id..."
        className="pl-9 pr-3 py-2 w-full text-sm border rounded-lg bg-gray-50/50 outline-none focus:ring-2 focus:ring-premium-blue transition-all"
      />
    </div>
  );
}
