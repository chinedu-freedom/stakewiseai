"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import "../../app/globals.css";

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <html lang="en">
      <body>
        <Sidebar isOpen={isOpen} />
        <Topbar isOpen={isOpen} onToggle={toggleSidebar} />
        <main
          className={`pt-20 p-6 min-h-screen transition-all duration-300 ${
            isOpen ? "ml-64" : "ml-20"
          }`}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
