"use client";

import Link from "next/link";
import { Menu, LogOut, Settings, KeyRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchData, usePost } from "@/hooks/useApi";
import { useImageSrc } from "@/hooks/useImageSrc";

export default function Topbar({ isOpen, onToggle }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: admin, isLoading } = useFetchData(
    "/api/admin/profile",
    "profile"
  );
  const imageSrc = useImageSrc(admin?.data?.image, "/placeholder-user.jpg");

  const { mutate: logout, isPending: isLoggingOut } = usePost(
    "/api/admin/auth/logout",
    null
  );

  const handleLogout = () => {
    logout(null, {
      onSuccess: () => {
        document.cookie = "isAuthenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        queryClient.clear();
        localStorage.removeItem("adminData");
        router.push("/");
      },
      onError: () => {
        alert("Logout failed, please try again.");
      },
    });
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 flex items-center justify-between bg-white/80 backdrop-blur-md border-b px-4 md:px-6 z-20 transition-all duration-300 ${
        isOpen ? "lg:left-64" : "lg:left-20"
      } left-0`}
    >
      {/* Sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu size={20} className="text-gray-700" />
        </button>
      </div>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md hover:bg-gray-50 transition p-1.5">
            <Avatar>
              {isLoading ? (
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              ) : (
                <>
                  <AvatarImage
            
                    src={imageSrc}
                    alt="Profile photo"
                  />
                  <AvatarFallback>
                    {admin?.data?.username
                      ? admin?.data?.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : ""}
                  </AvatarFallback>
                </>
              )}
            </Avatar>

            <div className="text-left">
              <div className="font-medium text-sm">
                {isLoading ? (
                  <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                ) : (
                  admin?.data?.username || "Unknown"
                )}
              </div>
              <div className="text-xs text-gray-400">
                {isLoading ? (
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mt-1" />
                ) : admin?.data?.role ? (
                  admin?.data?.role.charAt(0).toUpperCase() +
                  admin?.data?.role.slice(1).toLowerCase()
                ) : (
                  "Unknown"
                )}
              </div>
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6.5 h-6.5 text-gray-500 ml-1"
            >
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <Link
              href="/admin/settings?tab=manage-account"
              className="flex items-center w-full"
            >
              <Settings className="w-4 h-4 mr-2" /> Manage Account
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link
              href="/admin/settings?tab=change-password"
              className="flex items-center w-full"
            >
              <KeyRound className="w-4 h-4 mr-2" /> Change Password
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <Link href="/" className="flex items-center w-full">
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
