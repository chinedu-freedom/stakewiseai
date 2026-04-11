// import { NextResponse } from "next/server";

// const PUBLIC_PATHS = [
//   "/",
//   "/auth/register",
//   "/auth/verify-otp",
//   "/auth/verify-email",
//   "/auth/forgot-password",
//   "/auth/reset-password",
//   "/favicon.ico",
//   "/placeholder-user.jpg",
// ];

// function isPublicPath(pathname) {
//   return PUBLIC_PATHS.some(
//     (path) => pathname === path || pathname.startsWith(path + "/")
//   );
// }

// export function middleware(req) {
//   const { pathname } = req.nextUrl;

//   // Allow API routes
//   if (pathname.startsWith("/api")) {
//     return NextResponse.next();
//   }

//   // Allow public routes
//   if (isPublicPath(pathname)) {
//     return NextResponse.next();
//   }

//   // ✅ Get token from cookies (IMPORTANT)
//   const token = req.cookies.get("token")?.value;

//   // ❌ Not logged in
//   if (!token) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

  
//   const user = JSON.parse(req.cookies.get("user")?.value || "{}");

//   if (pathname.startsWith("/admin") && user.role !== "admin") {
//     return NextResponse.redirect(new URL("/unauthorized", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico).*)",
//   ],
// };

export function middleware (req){

}