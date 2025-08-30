"use client";
import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";

const VerifyOtpPage = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const sessionEmail = sessionStorage.getItem("RSEmail");

    let foundEmail = null;
    if (urlEmail) {
      foundEmail = urlEmail;
    } else if (sessionEmail) {
      foundEmail = sessionEmail;
    }

    if (foundEmail) {
      setEmail(foundEmail);
    } else {
      toast({
        title: "Error",
        description: "Email not found. Please signup or login.",
        variant: "destructive",
      });
      router.push("/auth/signup");
    }

    return () => {
      sessionStorage.removeItem("RSEmail");
    };
  }, [router, searchParams]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (otpValue: string) => {
    setOtp(otpValue);
  };

  const handleResendOtp = async () => {
    if (!email || isResending || countdown > 0) return;

    setIsResending(true);
    try {
      const response = await axios.post(
        "https://sever.bizengo.com/api/auth/resend-otp", // Add this endpoint if available
        { email: email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast({
          title: "OTP Sent",
          description: "A new OTP has been sent to your email.",
        });
        setCountdown(60); // 60 second cooldown
        setOtp(""); // Clear current OTP
      } else {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email is missing. Please signup or login.",
        variant: "destructive",
      });
      router.push("/vendor/auth");
      return;
    }

    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a complete 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        email: email,
        otp: otp,
      };

      let response;
      try {
        // Try HTTPS first
        response = await axios.post(
          "https://server.bizengo.com/api/auth/verify-email", // Fixed typo: server not sever
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (httpsError) {
        console.log(
          "HTTPS failed due to SSL issue, trying HTTP...",
          httpsError
        );
        // Fallback to HTTP for development
        response = await axios.post(
          "http://server.bizengo.com/api/auth/verify-email",
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const data = response.data;
      console.log("OTP verification response:", data);

      if (data.status === "success" || response.status === 200) {
        toast({
          title: "Success",
          description: data.message || "OTP verified successfully!",
        });

        // Clear the stored email
        sessionStorage.removeItem("RSEmail");

        // Redirect to login or dashboard
        router.push("/vendor/auth");
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);

      let errorMessage = "Failed to connect to the server. Please try again.";

      if (error.response) {
        // Server responded with error status
        errorMessage =
          error.response.data?.message || "Invalid OTP. Please try again.";
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.message.includes("Network Error")
      ) {
        errorMessage =
          "Unable to connect to server. SSL certificate issue detected. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Signup
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
            <CardDescription>
              Enter the 6-digit OTP sent to your email
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {email && (
              <div className="text-center">
                An OTP has been sent to <b>{email}</b>.
              </div>
            )}

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || !email || otp.length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            {/* Resend OTP Section */}
            <div className="text-center text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                onClick={handleResendOtp}
                disabled={isResending || countdown > 0}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isResending
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend OTP"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const VerifyOTP = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpPage />
    </Suspense>
  );
};

export default VerifyOTP;
