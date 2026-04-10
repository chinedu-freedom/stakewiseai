"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/schemas";
import { usePost } from "@/hooks/useApi"; // ✅ new centralized hook
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // ✅ usePost hook
  const requestOtpMutation = usePost("/api/admin/auth/request-otp", null);

  const onSubmit = (data) => {
    localStorage.setItem("resetEmail", data.email);

    requestOtpMutation.mutate(data, {
      onSuccess: (res) => {
        router.push("/auth/verify-otp"); // redirect after successful OTP request
      },
    });
  };

  return (
    <div className="min-h-screen justify-center flex flex-col lg:flex-row bg-white">
      {/* Left section (Form) */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-16 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
            <p className="text-gray-500 text-sm">
              Enter your registered email and we’ll send you a password reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input
                label="Email Address"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md py-3 font-medium transition-all"
              disabled={requestOtpMutation.isPending}
            >
              {requestOtpMutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Remembered your password?{" "}
              <Link href="/" className="text-blue-600 font-medium hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right section (Image) */}
      <div className="hidden lg:flex items-center justify-center w-1/2">
        <div className="w-[70%] h-[85%] overflow-hidden rounded-2xl shadow-md">
          <Image
            src="/assets/auth-image.svg"
            alt="Forgot password visual"
            width={800}
            height={800}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
