// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Mail, CheckCircle, RefreshCw, AlertCircle, Clock } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { usePost } from "@/hooks/useApi"; // Assuming you have this hook

// export default function VerifyEmailPage() {
//   const [isResending, setIsResending] = useState(false);
//   const [resendCount, setResendCount] = useState(0);
//   const [countdown, setCountdown] = useState(600); // Start with 10 minutes (600 seconds)
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [isInitialCountdown, setIsInitialCountdown] = useState(true);
//   const [errorMessage, setErrorMessage] = useState("");
//   const router = useRouter();

//   // Use the usePost hook for API calls
//   const resendEmailMutation = usePost("/api/admin/auth/resend-verification", null);

//   // Initialize countdown from localStorage
//   useEffect(() => {
//     const savedCountdown = localStorage.getItem('verificationCountdown');
//     const lastResendTime = localStorage.getItem('lastVerificationResend');
//     const isInitial = localStorage.getItem('isInitialCountdown');
    
//     if (savedCountdown && lastResendTime) {
//       const timePassed = Math.floor((Date.now() - parseInt(lastResendTime)) / 1000);
//       const remainingTime = parseInt(savedCountdown) - timePassed;
      
//       if (remainingTime > 0) {
//         setCountdown(remainingTime);
//         setIsInitialCountdown(isInitial === 'true');
//       } else {
//         // Countdown finished - clear localStorage
//         localStorage.removeItem('verificationCountdown');
//         localStorage.removeItem('lastVerificationResend');
//         localStorage.removeItem('isInitialCountdown');
//         setCountdown(0);
//         setIsInitialCountdown(false);
//       }
//     } else {
//       // First time visit - set initial 10-minute countdown
//       setCountdown(600);
//       setIsInitialCountdown(true);
//       localStorage.setItem('verificationCountdown', '600');
//       localStorage.setItem('lastVerificationResend', Date.now().toString());
//       localStorage.setItem('isInitialCountdown', 'true');
//     }
//   }, []);

//   // Countdown timer
//   useEffect(() => {
//     if (countdown > 0) {
//       const timer = setTimeout(() => {
//         const newCountdown = countdown - 1;
//         setCountdown(newCountdown);
//         localStorage.setItem('verificationCountdown', newCountdown.toString());
        
//         if (newCountdown === 0) {
//           // Countdown finished
//           localStorage.removeItem('verificationCountdown');
//           localStorage.removeItem('lastVerificationResend');
//           localStorage.removeItem('isInitialCountdown');
//           setIsInitialCountdown(false);
//         }
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [countdown]);

//   // Format countdown to MM:SS
//   const formatCountdown = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const handleResendEmail = async () => {
//     try {
//       setIsResending(true);
//       setErrorMessage(""); // Clear any previous error
      
//       // Get email from localStorage (assuming it was stored during registration)
//       const email = localStorage.getItem('registerEmail') || '';
      
//       if (!email) {
//         setErrorMessage("No email found. Please register again.");
//         setIsResending(false);
//         return;
//       }

//       // Make API call using the usePost hook
//       resendEmailMutation.mutate({ email }, {
//         onSuccess: (res) => {
//           if (res.success) {
//             // Set 10-minute (600 seconds) countdown
//             const newCountdown = 600;
//             setCountdown(newCountdown);
//             setResendCount(prev => prev + 1);
//             setShowSuccess(true);
//             setIsInitialCountdown(false);
            
//             // Save to localStorage
//             localStorage.setItem('verificationCountdown', newCountdown.toString());
//             localStorage.setItem('lastVerificationResend', Date.now().toString());
//             localStorage.setItem('isInitialCountdown', 'false');
            
//             // Hide success message after 5 seconds
//             setTimeout(() => setShowSuccess(false), 5000);
//           } else {
//             setErrorMessage(res.message || "Failed to resend verification email");
//           }
//         },
//         onError: (error) => {
//           console.error('Failed to resend email:', error);
//           setErrorMessage("Something went wrong. Please try again later.");
//         }
//       });
      
//     } catch (error) {
//       console.error('Failed to resend email:', error);
//       setErrorMessage("Something went wrong. Please try again later.");
//     } finally {
//       // Note: We don't set isResending to false here because 
//       // the usePost hook will handle the loading state
//       // We'll rely on the mutation's isPending state
//     }
//   };

//   const handleContinue = () => {
//     // Clear countdown when continuing
//     localStorage.removeItem('verificationCountdown');
//     localStorage.removeItem('lastVerificationResend');
//     localStorage.removeItem('isInitialCountdown');
//     router.push("/");
//   };

//   // Calculate if button should be disabled
//   // Use both our local isResending and the mutation's isPending state
//   const isButtonDisabled = isResending || resendEmailMutation.isPending || countdown > 0;

//   // Get appropriate message based on state
//   const getButtonText = () => {
//     if (isResending || resendEmailMutation.isPending) {
//       return "Sending...";
//     }
    
//     if (countdown > 0) {
//       if (isInitialCountdown) {
//         return `Resend after: ${formatCountdown(countdown)}`;
//       } else {
//         return `Resend in ${formatCountdown(countdown)}`;
//       }
//     }
    
//     return "Resend Verification Email";
//   };

//   // Get appropriate icon based on state
//   const getButtonIcon = () => {
//     if (isResending || resendEmailMutation.isPending) {
//       return <RefreshCw className="w-4 h-4 mr-2 animate-spin" />;
//     }
    
//     if (countdown > 0) {
//       return <Clock className="w-4 h-4 mr-2" />;
//     }
    
//     return <RefreshCw className="w-4 h-4 mr-2" />;
//   };

//   return (
//     <div className="min-h-screen justify-center flex flex-col lg:flex-row bg-white">
//       {/* Left section - Form */}
//       {/* <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-16 py-12 overflow-y-scroll"> */}
//           <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-16 py-12 overflow-y-auto">
//         <div className="w-full max-w-md">
//           <div className="mb-8 md:mb-10">
//             <h1 className="text-2xl font-bold text-gray-900 mb-1">
//               Verify Your Email
//             </h1>
//             <p className="text-gray-500 text-sm">
//               We've sent a verification link to your email address
//             </p>
//           </div>

//           <Card className="border border-gray-200 shadow-sm mb-6">
//             <CardContent className="pt-6">
//               <div className="flex items-start gap-4 mb-4">
//                 <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
//                   <Mail className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h3 className="font-medium text-gray-900 mb-1">
//                     Check your inbox
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     We've sent a verification email to your registered address.
//                     Click the link in the email to verify your account.
//                   </p>
//                 </div>
//               </div>

//               <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
//                 <div className="flex items-start gap-3">
//                   <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-sm font-medium text-blue-800 mb-1">
//                       {isInitialCountdown ? "Please wait before resending" : "Didn't receive the email?"}
//                     </p>
//                     <ul className="text-sm text-blue-700 space-y-1">
//                       <li className="flex items-start gap-2">
//                         <span className="text-blue-500">•</span>
//                         <span>Check your spam or junk folder</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <span className="text-blue-500">•</span>
//                         <span>Make sure you entered the correct email address</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <span className="text-blue-500">•</span>
//                         <span>Wait a few minutes for the email to arrive</span>
//                       </li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <div className="space-y-4">
//             {/* Error message display */}
//             {errorMessage && (
//               <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-300">
//                 <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
//                 <div>
//                   <p className="text-sm font-medium text-red-700">
//                     {errorMessage}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Countdown info is now ONLY in the button text */}
            
//             <Button
//               onClick={handleResendEmail}
//               variant={isButtonDisabled ? "outline" : "default"}
//               className={`w-full h-12 ${isButtonDisabled ? 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
//               disabled={isButtonDisabled}
//             >
//               {getButtonIcon()}
//               {getButtonText()}
//             </Button>

//             {showSuccess && (
//               <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in duration-300">
//                 <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
//                 <div>
//                   <p className="text-sm font-medium text-green-700 mb-1">
//                     Verification email sent successfully!
//                   </p>
//                   <p className="text-xs text-green-600">
//                     Please check your inbox. You can resend again in 10 minutes.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Resend Counter */}
//             {resendCount > 0 && !showSuccess && countdown === 0 && (
//               <div className="text-center">
//                 <p className="text-sm text-gray-600">
//                   You have resent the verification email {resendCount} time{resendCount > 1 ? 's' : ''}
//                 </p>
//               </div>
//             )}

//             <div className="pt-4 border-t border-gray-200">
//               <p className="text-sm text-gray-600 mb-4 text-center">
//                 Already verified your email or want to continue?
//               </p>
//               <Button
//                 onClick={handleContinue}
//                 variant="ghost"
//                 className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
//               >
//                 Continue to Login
//               </Button>
//             </div>
//           </div>

//           <p className="text-center text-sm text-gray-500 mt-6">
//             Need help?{" "}
//             <Link 
//               href="/support" 
//               className="text-blue-600 font-medium hover:underline"
//             >
//               Contact Support
//             </Link>
//           </p>
//         </div>
//       </div>

//       {/* Right section - Image */}
//       {/* <div className="hidden lg:flex items-center justify-center w-1/2"> */}
{/* <div className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen items-center justify-center w-1/2"> */}
//           <div className="hidden lg:flex items-center justify-center w-1/2 sticky top-0 h-screen">
//         <div className="w-[70%] h-[85%] overflow-hidden rounded-2xl shadow-md">
//           <Image
//             src="/assets/auth-image.png"
//             alt="Email verification visual"
//             width={800}
//             height={800}
//             className="object-cover w-full h-full"
//             priority
//           />
//         </div>
//       </div>
//     </div>
//   );
// }