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
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";

const VerifyOtpPage = () => {
    const [email, setEmail] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
            router.push("/tools");
        }

        return () => {
            sessionStorage.removeItem("RSEmail");
        };
    }, [router, searchParams]);

    const handleOtpChange = (otpValue: string) => {
        setOtp(otpValue);
    };

    const handleVerifyOtp = async () => {
        if (!email) {
            toast({
                title: "Error",
                description: "Email is missing. Please signup or login.",
                variant: "destructive",
            });
            router.push("/tools");
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

            const response = await axios.post(
                "https://api.rootsnsquares.com/innovations/verify-otp.php",
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = response.data;

            if (data.status === "success") {
                toast({
                    title: "Success",
                    description: data.message || "OTP verified successfully!",
                });
                router.push("/tools/auth/login");
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Invalid OTP. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description:
                    error.message || "Failed to connect to the server. Please try again.",
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
                        href="/tools"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
                        <CardDescription>Enter the 6-digit OTP sent to your email</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {email && (
                            <div className="text-center">
                                An OTP has been sent to <b>{email}</b>.
                            </div>
                        )}

                        <div className="flex justify-center">
                            <InputOTP maxLength={6} onChange={handleOtpChange}>
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
                            disabled={isLoading || !email}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const VerifyOTP = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpPage />
        </Suspense>
    );
};

export default VerifyOTP;