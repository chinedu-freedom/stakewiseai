"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePost } from "@/hooks/useApi";
import { Checkbox } from "@/components/ui/checkbox";
import { CookieManager } from "@/utils/cookie-utils";

export default function LoginPage() {
  const router = useRouter();

  const rememberedEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("rememberedEmail")
      : "";

  const loginMutation = usePost("/api/admin/auth/login");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail || "",
      password: "",
      keepMeLoggedIn: !!rememberedEmail,
    },
  });

  const onSubmit = (data) => {
    const keepMeLoggedIn = data.keepMeLoggedIn ?? false;

    // Store or remove remembered email
    if (keepMeLoggedIn) {
      localStorage.setItem("rememberedEmail", data.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    const payload = {
      email: data.email,
      password: data.password,
      keepMeLoggedIn, // 🔥 IMPORTANT
    };

    loginMutation.mutate(payload, {
      onSuccess: (response) => {
        const { accessToken } = response.data.data;
        
        if (accessToken) {
          // 0.5 days (~12 hours) provides maximum stability for local and production sessions
          CookieManager.set("stakewise-admin-token", accessToken, keepMeLoggedIn ? 1 : 0.5); 
        }
        
        CookieManager.set("isAuthenticated", "true", keepMeLoggedIn ? 1 : 0.5);
        
        console.log("Auth success: Cookies set, redirecting...");

        // location.replace is cleaner as it doesn't leave the login page in the back history
        window.location.replace("/admin");
      },
      onError: (error) => {
        console.error("Login failed:", error);
      },
    });
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="min-h-screen justify-center flex flex-col lg:flex-row bg-white">
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

            {/* Keep me logged in */}
            <div className="flex items-center justify-between -mt-2">
              <Controller
                name="keepMeLoggedIn"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                    <span className="text-sm text-gray-600">
                      Keep me logged in
                    </span>
                  </label>
                )}
              />

              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md py-3 font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1"><animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13"/><animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13"/><animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="13;1"/><animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="13;1"/></rect><rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1"><animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="13;1"/><animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13"/><animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="1;13"/><animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="13;1"/></rect><rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1"><animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1"/><animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1"/><animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="1;13"/><animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="1;13"/></rect></svg> : "Login"}
            </Button>
          </form>

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
