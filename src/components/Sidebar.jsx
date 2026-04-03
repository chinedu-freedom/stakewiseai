"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  FileText,
  Briefcase,
  CreditCard,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: <BarChart3 size={18} /> },
  { name: "User Management", href: "/admin/user-management", icon: <Users size={18} /> },
  { name: "Plans Management", href: "/admin/plans-management", icon: <FileText size={18} /> },
  { name: "Financial Services", href: "/admin/financial-services", icon: <Briefcase size={18} /> },
  { name: "Transactions", href: "/admin/transactions", icon: <CreditCard size={18} /> },
  { name: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
];

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (pathname === href) return true;
    
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    
    return pathname?.startsWith(href + "/");
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen border-r border-gray-100 flex flex-col justify-between bg-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="space-y-4 flex flex-col">
        <div className="h-16 border-b border-gray-100 flex items-center justify-center text-center">
          {isOpen ? (
            <h1 className="text-xl font-bold">PREMIUM INVEST</h1>
          ) : (
            <h1 className="text-xl font-bold">PI</h1>
          )}
        </div>

        <nav className="space-y-2 p-4">
          <TooltipProvider>
            {navItems.map((item) => {
              const active = isActive(item.href); 
              const linkClass = `flex items-center gap-3 px-2 py-3 rounded-lg text-sm transition ${
                active
                  ? "bg-premium-blue text-white"
                  : "hover:bg-premium-lightblue hover:text-white"
              } ${isOpen ? "justify-start" : "justify-center"}`;

              return (
                <Tooltip key={item.name} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className={linkClass}>
                      {item.icon}
                      {isOpen && <span>{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!isOpen && (
                    <TooltipContent side="right" className="text-xs font-medium">
                      {item.name}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
      </div>
    </aside>
  );
}