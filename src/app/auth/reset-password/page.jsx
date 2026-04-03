"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import { usePost } from "@/hooks/useApi"; // ✅ centralized hook
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ usePost hook
  const resetPasswordMutation = usePost("/api/admin/auth/reset-password", null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.newPassword || !form.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validatePassword(form.newPassword)) {
      toast.error(
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const email = localStorage.getItem("resetEmail");
    if (!email) {
      toast.error("Session expired. Please request a new reset link.");
      router.push("/auth/forgot-password");
      return;
    }

    // ✅ usePost mutation
    resetPasswordMutation.mutate(
      { email, newPassword: form.newPassword },
      {
        onSuccess: () => {
          localStorage.removeItem("resetEmail");
          toast.success("Password reset successfully");
          router.push("/"); // redirect to login
        },
        onError: (err) => {
          toast.error(err?.message || "Reset failed. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-16 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Reset Password
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your new password and confirm it below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
            />

            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md py-3 font-medium transition-all disabled:opacity-70"
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Back to{" "}
              <Link
                href="/"
                className="text-blue-600 font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-center w-1/2">
        <div className="w-[70%] h-[85%] overflow-hidden rounded-2xl shadow-md">
          <Image
            src="/assets/auth-image.png"
            alt="Reset password visual"
            width={800}
            height={800}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
