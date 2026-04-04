"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePost } from "@/hooks/useApi"; // ✅ added

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified");
  const errorParam = searchParams.get("error");

  // ✅ use your API hook
  const loginMutation = usePost("/api/admin/auth/login");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ✅ updated submit handler
 const onSubmit = (data) => {
  loginMutation.mutate(data, {
    onSuccess: () => {
      router.push("/admin");
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

  const isLoading = loginMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-16 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm">
              Login to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <Input label="Email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Input
                label="Password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot password */}
            {/* <div className="flex justify-end -mt-2">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div> */}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md py-3 font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Signup link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="hidden lg:flex items-center justify-center w-1/2">
        <div className="w-[70%] h-[85%] overflow-hidden rounded-2xl shadow-md">
          <Image
            src="/assets/auth-image.png"
            alt="Login visual"
            width={800}
            height={800}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}