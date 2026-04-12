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
  X,
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
  { name: "Investment Management", href: "/admin/investment-management", icon: <Briefcase size={18} /> },
  { name: "Transactions", href: "/admin/transactions", icon: <CreditCard size={18} /> },
  { name: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
];

export default function Sidebar({ isOpen, isMobileOpen, onCloseMobile }) {
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
      className={`fixed top-0 z-30 h-screen border-r border-gray-100 flex flex-col justify-between bg-white transition-all duration-300 ease-in-out ${
        isMobileOpen ? "left-0 w-64 shadow-xl" : "-left-full lg:left-0"
      } ${isOpen ? "lg:w-64" : "lg:w-20"}`}
    >
      <div className="space-y-4 flex flex-col">
        {/* <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 lg:justify-center">
          <Link href="/admin" onClick={onCloseMobile}>
            {isOpen || isMobileOpen ? (
              <h1 className="text-xl font-bold">StakeWiseAI</h1>
          
            ) : (
              <h1 className="text-xl font-bold">SWI</h1>
            )}
          </Link>
          
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div> */}
 <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 lg:justify-center">
  <Link href="/admin" onClick={onCloseMobile} className="flex items-center gap-2">
    
    {(isOpen || isMobileOpen) && <>
    <img
      src="/logo.jpeg"
      alt="StakeWiseAI Logo"
      className="w-8 h-8 object-contain"
    />
      <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
        StakeWiseAI
      </h1>
    </> }

    {/* Collapsed mode fallback text */}
    {!isOpen && !isMobileOpen && (
      <h1 className="text-xl font-bold text-gray-900">SWI</h1>
    )}
  </Link>

  <button
    onClick={onCloseMobile}
    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
  >
    <X size={20} className="text-gray-700" />
  </button>
</div>

        <nav className="space-y-2 p-4">
          <TooltipProvider>
            {navItems.map((item) => {
              const active = isActive(item.href); 
              const linkClass = `flex items-center gap-3 px-2 py-3 rounded-lg text-sm transition ${
                active
                  ? "bg-premium-blue text-white"
                  : "hover:bg-premium-lightblue hover:text-white"
              } ${(isOpen || isMobileOpen) ? "justify-start" : "justify-center"}`;

              return (
                <Tooltip key={item.name} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className={linkClass} onClick={onCloseMobile}>
                      {item.icon}
                      {(isOpen || isMobileOpen) && <span className="whitespace-nowrap">{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!(isOpen || isMobileOpen) && (
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
