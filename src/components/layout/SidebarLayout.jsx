"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import "../../app/globals.css";

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Sidebar 
          isOpen={isOpen} 
          isMobileOpen={isMobileOpen} 
          onCloseMobile={closeMobileMenu} 
        />
        
        {/* Mobile backdrop */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity"
            onClick={closeMobileMenu}
          />
        )}

        <div className="flex flex-col flex-1">
          <Topbar 
            isOpen={isOpen} 
            onToggle={toggleSidebar} 
          />
          
          <main
            className={`pt-20 min-h-screen transition-all duration-300 px-4 md:px-6 pb-8 ${
              isOpen ? "lg:ml-64" : "lg:ml-20"
            } ml-0`}
          >
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
