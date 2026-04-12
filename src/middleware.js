// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// const PUBLIC_PATHS = [
//   "/", 
//   "/auth/register",
//   "/auth/verify-otp",
//   "/auth/verify-email",
//   "/auth/forgot-password",
//   "/auth/reset-password",
// ];

// function isPublicPath(pathname) {
//   return (
//     PUBLIC_PATHS.includes(pathname) ||
//     pathname.startsWith("/auth/") ||
//     pathname === "/favicon.ico" ||
//     pathname === "/placeholder-user.jpg"
//   );
// }

// export function middleware(req) {
//   const { pathname } = req.nextUrl;

//   if (pathname.startsWith("/api")) {
//     return NextResponse.next();
//   }

//   if (isPublicPath(pathname)) {
//     return NextResponse.next();
//   }

//   const token = req.cookies.get("token")?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   let user;
//   try {
//     user = jwt.verify(token, process.env.JWT_SECRET);
//   } catch (err) {
//     // Invalid or expired token
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   // ❌ Block non-admin from admin routes
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