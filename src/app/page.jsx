"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
// import { signIn } from "next-auth/react";
// import { AUTH_ERROR_MESSAGES } from "@/lib/authErrors";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified");
  const errorParam = searchParams.get("error");
  // const errorMessage = errorParam
  //   ? AUTH_ERROR_MESSAGES[errorParam]
  //   : null;

  const [isLoading, setIsLoading] = useState(false);

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

  // const onSubmit = async (data) => {
  //   setIsLoading(true);

  //   const result = await signIn("credentials", {
  //     email: data.email,
  //     password: data.password,
  //     redirect: false,
  //   });

  //   setIsLoading(false);

  //   if (result?.error) {
  //     router.push(`/?error=${result.error}`);
  //     return;
  //   }

  //   router.push("/admin");
  // };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-16 py-12">
        <div className="w-full max-w-sm">
          <div className={verified ? "mb-5" : "mb-10"}>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm">
              Login to your account to continue
            </p>
          </div>

          {verified && (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              Your admin account has been activated successfully. Please log in.
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input label="Email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

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

            <div className="flex justify-end -mt-2">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md py-3 font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1">
                    <animate attributeName="x" dur="0.2s" values="1;13" repeatCount="indefinite" />
                  </rect>
                </svg>
              ) : (
                "Login"
              )}
            </Button>

            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <button
              type="button"
              onClick={() =>
                signIn("google", {
                  callbackUrl: "/admin",
                })
              }
              className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2.5 hover:bg-gray-50 transition-all"
            >
              <Image
                src="/assets/google.png"
                alt="Google"
                width={18}
                height={18}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Continue with Google
              </span>
            </button>
          </form>
<p className="text-center text-sm text-gray-500 mt-6">
  Access is by invitation only. Please contact an administrator.
</p>

        </div>
      </div>

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
