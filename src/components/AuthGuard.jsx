"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CookieManager } from "@/utils/cookie-utils";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check for authentication
    const token = CookieManager.get("satrixnow-admin-token");
    const isAuthenticated = CookieManager.get("isAuthenticated");

    if (!token || !isAuthenticated) {
      console.log("AuthGuard: No token found, redirecting to login");
      router.replace("/");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    // You can return a loading spinner here
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
}
