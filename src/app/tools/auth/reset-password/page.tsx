"use client"
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import axios from 'axios';

const passwordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) {
        score++;
    }
    if (password.match(/[a-z]+/)) {
        score++;
    }
    if (password.match(/[A-Z]+/)) {
        score++;
    }
    if (password.match(/[0-9]+/)) {
        score++;
    }
    if (password.match(/[^a-zA-Z0-9]+/)) {
        score++;
    }

    return score;
};

const PasswordStrengthBar = ({ strength, password }: { strength: number; password: string }) => {
    let color = 'red';
    let strengthText = 'Poor';
    if (strength >= 2) {
        color = 'yellow';
        strengthText = 'Weak';
    }
    if (strength >= 4) {
        color = 'green';
        strengthText = 'Strong';
    }

    return (
        <div className='mt-1'>
            {password && (
                <div className={`text-xs ${strengthText === "Poor" ? "text-red-600" : strengthText === "Weak" ? "text-yellow-500" : strengthText === "Strong" ? "text-green-600" : "text-gray-500"} mb-1`}>{strengthText}</div>
            )}
            {password && (
                <div className="h-1 w-full bg-gray-200 rounded-full mt-1">
                    <div
                        className={`h-full rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(strength * 25, 100)}%`, backgroundColor: color }}
                    ></div>
                </div>
            )}
        </div>
    );
};


const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const [otp, setOtp] = useState("");

    useEffect(() => {
        if (!email) {
            toast({
                title: "Error",
                description: "Something happened. Can't find your email.",
                variant: "destructive",
            });
            router.push("/tools/auth/forgot-password/");
        }
    }, [email, otp, router]);

    useEffect(() => {
        setPasswordStrengthScore(passwordStrength(password));
    }, [password]);

    useEffect(() => {
        if (confirmPassword) {
            setPasswordsMatch(password === confirmPassword);
        } else {
            setPasswordsMatch(true);
        }

    }, [password, confirmPassword]);

    const handleOtpChange = (otpValue: string) => {
        setOtp(otpValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !otp) {
            toast({
                title: "Error",
                description: "Invalid reset link.",
                variant: "destructive",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: "Error",
                description: "Password must be at least 8 characters long.",
                variant: "destructive",
            });
            return;
        }

        if (passwordStrengthScore < 3) {
            toast({
                title: "Error",
                description: "Password is not strong enough.",
                variant: "destructive",
            });
            return;
        }


        try {
            const payload = {
                "email": email,
                "password": password,
                "otp": otp
            };
            const response = await axios.post("https://api.rootsnsquares.com/innovations/reset-password.php", payload);

            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: "Password reset successfully. You will be redirected to login page in 2 seconds.",
                });
                setTimeout(() => {
                    router.push("/tools/auth/login/");
                }, 2000);
            } else {
                toast({
                    title: "Error",
                    description: "Password reset failed. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again later.",
                variant: "destructive",
            });
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
                        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                        <CardDescription>Enter the otp from your mail and your new password.</CardDescription>
                    </CardHeader>
                    <CardContent>



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






                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <PasswordStrengthBar strength={passwordStrengthScore} password={password} />
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                {!passwordsMatch && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                                )}
                                {passwordsMatch && confirmPassword && (
                                    <p className="text-xs text-green-500 mt-1">Passwords match!</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full">Reset Password</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const ResetPasswordPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPassword />
        </Suspense>
    );
};

export default ResetPasswordPage;