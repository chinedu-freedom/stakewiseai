// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

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

// export async function middleware(req) {
//   const { pathname } = req.nextUrl;

//   if (pathname.startsWith("/api")) {
//     return NextResponse.next();
//   }

//   if (isPublicPath(pathname)) {
//     return NextResponse.next();
//   }

//   const token = await getToken({
//     req,
//     secret: process.env.NEXTAUTH_SECRET,
//   });


//   if (!token) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   if (token.accountStatus !== "active") {
//     return NextResponse.redirect(new URL("/account-suspended", req.url));
//   }

//   if (!token.emailVerified) {
//     return NextResponse.redirect(new URL("/auth/verify-email", req.url));
//   }

//   if (pathname.startsWith("/admin") && token.role !== "admin") {
//     return NextResponse.redirect(new URL("/unauthorized", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico).*)",
//   ],
// };


export async function middleware(req) {
  
}