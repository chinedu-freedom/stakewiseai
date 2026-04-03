// "use client";

// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Input } from "@/components/ui/auth-input";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";

// const verifySchema = z
//   .object({
//     fullName: z.string().min(2, "Full name is required"),
//     phoneNumber: z
//       .string()
//       .regex(/^\+\d{7,15}$/, "Use country code, e.g. +1234567890"),
//     password: z
//       .string()
//       .min(8, "Password must be at least 8 characters")
//       .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
//       .regex(/[a-z]/, "Password must contain at least one lowercase letter")
//       .regex(/\d/, "Password must contain at least one number")
//       .regex(
//         /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/,
//         "Password must contain at least one special character"
//       ),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });


// export default function VerifyAdminPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(verifySchema),
//   });

//   useEffect(() => {
//     if (!token) {
//       setError("Invalid or missing verification link");
//     }
//   }, [token]);

//   const onSubmit = async (data) => {
//     if (!token) return;

//     setIsLoading(true);
//     setError("");

//     try {
//       const res = await fetch("/api/admin/verify-invitation", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           token,
//           ...data,
//         }),
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         setError(result.message || "Verification failed");
//         setIsLoading(false);
//         return;
//       }

//       router.push("/auth/login?verified=true");
//     } catch {
//       setError("Something went wrong. Please try again.");
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row bg-white">
//       <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-16 py-12">
//         <div className="w-full max-w-sm">
//           <div className="mb-10">
//             <h1 className="text-2xl font-bold text-gray-900 mb-1">
//               Activate Admin Account
//             </h1>
//             <p className="text-gray-500 text-sm">Complete your account setup</p>
//           </div>

//           {error && (
//             <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             <div>
//               <Input label="Full Name" {...register("fullName")} />
//               {errors.fullName && (
//                 <p className="text-red-500 text-sm ">
//                   {errors.fullName.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <Input type="tel" label="Phone Number" {...register("phoneNumber")} />
//               {errors.phoneNumber && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.phoneNumber.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <Input
//                 label="Password"
//                 type="password"
//                 {...register("password")}
//               />
//               {errors.password && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>
// <div>
//   <Input
//     label="Confirm Password"
//     type="password"
//     {...register("confirmPassword")}
//   />
//   {errors.confirmPassword && (
//     <p className="text-red-500 text-sm mt-1">
//       {errors.confirmPassword.message}
//     </p>
//   )}
// </div>

//             <Button
//               type="submit"
//               disabled={isLoading}
//               // disabled={isLoading || !token}
//               className="w-full bg-blue-600 text-white py-3"
//             >
//               {isLoading ? "Activating..." : "Activate Account"}
//             </Button>
//           </form>

//           <p className="text-center text-sm text-gray-500 mt-6">
//             Already activated?{" "}
//             <Link href="/auth/login" className="text-blue-600 font-medium">
//               Login
//             </Link>
//           </p>
//         </div>
//       </div>

//       <div className="hidden lg:flex items-center justify-center w-1/2">
//         <div className="w-[70%] h-[85%] overflow-hidden rounded-2xl shadow-md">
//           <Image
//             src="/assets/auth-image.png"
//             alt="Auth visual"
//             width={800}
//             height={800}
//             className="object-cover w-full h-full"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { signupSchema } from "@/lib/schemas";
// import { usePost } from "@/hooks/useApi";
// import { Input } from "@/components/ui/auth-input";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";

// export default function SignupPage() {
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(signupSchema),
//   });

//   const signupMutation = usePost("/api/admin/auth/sign-up", null);

//   const onSubmit = (data) => {
//     signupMutation.mutate(
//       {
//         fullName: data.fullName,
//         email: data.email,
//         phoneNumber: data.phoneNumber,
//         password: data.password,
//         adminSecret: data.adminSecret || undefined,
//       },
//       {
//         onSuccess: () => {
//           // Manual users must log in after signup
//           router.push("/login");
//         },
//       }
//     );
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-white">
//       <div className="w-full md:w-1/2 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">
//           <h1 className="text-2xl font-bold mb-2">Create an account</h1>
//           <p className="text-sm text-gray-500 mb-8">
//             Sign up to get started
//           </p>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             <div>
//               <Input label="Full Name" {...register("fullName")} />
//               {errors.fullName && (
//                 <p className="text-red-500 text-sm">
//                   {errors.fullName.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <Input label="Email" type="email" {...register("email")} />
//               {errors.email && (
//                 <p className="text-red-500 text-sm">
//                   {errors.email.message}
//                 </p>
//               )}
//             </div>

//             <Input label="Phone Number" {...register("phoneNumber")} />

//             <div>
//               <Input label="Password" type="password" {...register("password")} />
//               {errors.password && (
//                 <p className="text-red-500 text-sm">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <Input
//                 label="Confirm Password"
//                 type="password"
//                 {...register("confirmPassword")}
//               />
//               {errors.confirmPassword && (
//                 <p className="text-red-500 text-sm">
//                   {errors.confirmPassword.message}
//                 </p>
//               )}
//             </div>

//             <Input
//               label="Admin Secret (if applicable)"
//               type="password"
//               {...register("adminSecret")}
//             />

//             <Button
//               type="submit"
//               className="w-full"
//               disabled={signupMutation.isPending}
//             >
//               {signupMutation.isPending
//               ?
//               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1"><animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13"/><animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13"/><animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="13;1"/><animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="13;1"/></rect><rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1"><animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="13;1"/><animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13"/><animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="1;13"/><animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="13;1"/></rect><rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1"><animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1"/><animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1"/><animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="1;13"/><animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="1;13"/></rect></svg>
//               : "Sign up"}
//               // ? "Creating account..."

//             </Button>

//             <div className="flex items-center gap-2 my-4">
//               <div className="flex-1 h-px bg-gray-300" />
//               <span className="text-sm text-gray-400">or</span>
//               <div className="flex-1 h-px bg-gray-300" />
//             </div>

//             <button
//               type="button"
//               onClick={() => signIn("google", { callbackUrl: "/admin" })}
//               className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2.5 hover:bg-gray-50 transition"
//             >
//               <Image
//                 src="/assets/google.png"
//                 alt="Google"
//                 width={18}
//                 height={18}
//               />
//               <span className="ml-2 text-sm font-medium">
//                 Continue with Google
//               </span>
//             </button>
//           </form>

//           <p className="text-center text-sm mt-6">
//             Already have an account?{" "}
//             <Link href="/" className="text-blue-600 font-medium">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { signupSchema } from "@/lib/schemas";
// import { usePost } from "@/hooks/useApi"; // ✅ centralized hook
// import { Input } from "@/components/ui/auth-input";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";

// export default function SignupPage() {
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(signupSchema),
//     defaultValues: {
//       fullName: "",
//       email: "",
//       phoneNumber: "",
//       password: "",
//       confirmPassword: "",
//       adminSecret: "",
//     },
//   });

//   // ✅ usePost hook
//   const signupMutation = usePost("/api/admin/auth/sign-up", null); // no queryKey needed

//   const onSubmit = (data) => {
//     const payload = {
//       fullName: data.fullName,
//       email: data.email,
//       phoneNumber: data.phoneNumber,
//       password: data.password,
//       adminSecret: data.adminSecret || undefined,
//     };

//     signupMutation.mutate(payload, {
//       onSuccess: (res) => {
//         // localStorage.setItem('registerEmail', data.email);
//         // router.push("/auth/verify-email"); // redirect after successful signup
//         router.push("/"); // redirect after successful signup
//       },
//     });
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-white">
//       {/* Left section */}
//       <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 overflow-y-auto">
//         <div className="w-full max-w-md">
//           <div className="mb-10">
//             <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign up</h1>
//             <p className="text-gray-500 text-sm">
//               Sign up for free and start growing your wealth today
//             </p>
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             {/* Full Name */}
//             <div>
//               <Input label="Full Name" {...register("fullName")} />
//               {errors.fullName && (
//                 <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <Input label="Email" type="email" {...register("email")} />
//               {errors.email && (
//                 <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
//               )}
//             </div>

//             {/* Phone Number */}
//             <div>
//               <Input label="Phone Number" type="tel" {...register("phoneNumber")} />
//               {errors.phoneNumber && (
//                 <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
//               )}
//             </div>

//             {/* Password */}
//             <div>
//               <Input label="Password" type="password" {...register("password")} />
//               {errors.password && (
//                 <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//               )}
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <Input label="Confirm Password" type="password" {...register("confirmPassword")} />
//               {errors.confirmPassword && (
//                 <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
//               )}
//             </div>

//             {/* Admin Secret */}
//             <div>
//               <Input label="Secret Code" type="password" {...register("adminSecret")} />
//               {errors.adminSecret && (
//                 <p className="text-red-500 text-sm mt-1">{errors.adminSecret.message}</p>
//               )}
//             </div>

//             {/* Submit Button */}
//             <Button
//               type="submit"
//               className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md py-3 font-medium transition-all"
//               disabled={signupMutation.isPending}
//             >
//               {signupMutation.isPending ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1"><animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13"/><animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13"/><animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="13;1"/><animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="13;1"/></rect><rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1"><animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="13;1"/><animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13"/><animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="1;13"/><animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="13;1"/></rect><rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1"><animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1"/><animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1"/><animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="1;13"/><animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="1;13"/></rect></svg>  : "Sign up"}
//             </Button>

//             {/* Divider */}
//             <div className="flex items-center gap-2 my-4">
//               <div className="flex-1 h-px bg-gray-300" />
//               <span className="text-sm text-gray-400">or</span>
//               <div className="flex-1 h-px bg-gray-300" />
//             </div>

//             {/* Google Button */}
//             <button
//               type="button"
//               onClick={() =>
//                 signIn("google", {
//                   callbackUrl: "/admin",
//                 })
//               }
//               className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2.5 hover:bg-gray-50 transition-all cursor-pointer"
//             >
//               <Image
//                 src="/assets/google.png"
//                 alt="Google"
//                 width={18}
//                 height={18}
//                 className="mr-2"
//               />
//               <span className="text-sm font-medium text-gray-700">
//                 Continue with Google
//               </span>
//             </button>
//             {/* <button
//               type="button"
//               className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2.5 hover:bg-gray-50 transition-all cursor-pointer"
//             >
//               <Image
//                 src="/assets/google.png"
//                 alt="Google"
//                 width={18}
//                 height={18}
//                 className="mr-2"
//               />
//               <span className="text-sm font-medium text-gray-700">Continue with Google</span>
//             </button> */}
//           </form>

//           {/* Already have an account */}
//           <p className="text-center text-sm text-gray-500 mt-6">
//             Already have an account?{" "}
//             <Link href="/" className="text-blue-600 font-medium hover:underline">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>

//       {/* Right section */}
//       <div className="hidden md:flex w-1/2 items-center justify-center">
//         <div className="w-[70%] h-[75%] overflow-hidden rounded-2xl shadow-md">
//           <Image
//             src="/assets/auth-image.png"
//             alt="Signup visual"
//             width={600}
//             height={600}
//             className="object-cover w-full h-full"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
