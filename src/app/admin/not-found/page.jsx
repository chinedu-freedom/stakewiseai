"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // Countdown for auto-redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto-redirect to home after countdown
      router.push("/");
    }
  }, [countdown, router]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen justify-center flex flex-col lg:flex-row bg-white">
      {/* Left section - Content */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-16 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Page Not Found
            </h1>
            <p className="text-gray-500 text-sm">
              The page you're looking for doesn't exist or has been moved
            </p>
          </div>

          <Card className="border border-gray-200 shadow-sm mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Error 404: Page Not Found
                  </h3>
                  <p className="text-sm text-gray-600">
                    We couldn't find the page you're looking for. This might be because:
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Possible reasons:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>The page may have been moved or deleted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>You might have typed the wrong URL</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>The link you followed might be broken</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Auto-redirect countdown */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Auto-redirecting in:
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-800">
                    {countdown}s
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  You'll be automatically redirected to the homepage in {countdown} seconds
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleGoHome}
                variant="default"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>

              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="w-full h-12 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Need further assistance?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/support">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50"
                  >
                    Contact Support
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50"
                  >
                    View FAQ
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Return to{" "}
            <Link 
              href="/" 
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </Link>
            {" • "}
            <Link 
              href="/auth/signup" 
              className="text-blue-600 font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right section - Image */}
      <div className="hidden lg:flex items-center justify-center w-1/2">
        <div className="w-[70%] h-[85%] overflow-hidden rounded-2xl shadow-md relative">
          <Image
            src="/assets/auth-image.svg"
            alt="404 page not found visual"
            width={800}
            height={800}
            className="object-cover w-full h-full"
            priority
          />
          {/* Overlay with 404 text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-8 text-white">
              <div className="text-8xl font-bold mb-2">404</div>
              <p className="text-xl">Page Not Found</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}