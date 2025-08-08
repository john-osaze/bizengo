"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

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
        <div>
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


const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        businessName: "",
        phone: "",
        address: "",
        description: "",
        country: "",
        state: "",
        zip: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const router = useRouter();


    useEffect(() => {
        setPasswordStrengthScore(passwordStrength(formData.password));
    }, [formData.password]);

    useEffect(() => {
        if (formData.confirmPassword) {
            setPasswordsMatch(formData.password === formData.confirmPassword);
        } else {
            setPasswordsMatch(true);
        }
    }, [formData.password, formData.confirmPassword]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
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


        setIsLoading(true);

        try {
            const requestBody = {
                fullname: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                businessname: formData.businessName,
                address: formData.address,
                description: formData.description,
                country: formData.country,
                state: formData.state,
                zip: formData.zip,
            };

            const response = await axios.post(
                "https://api.rootsnsquares.com/innovations/create-account.php",
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = response.data;

            if (data.status === "success") {
                sessionStorage.setItem("RSEmail", formData.email);
                toast({
                    title: data.message || "Account created successfully!",
                    description: "Verify your account from the OTP sent to your mail",
                });
                router.push(`/tools/auth/verify-otp?email=${formData.email}`);
            } else if (data.status === "error") {
                toast({
                    title: "Error creating account",
                    description: data.message,
                    variant: "destructive",
                });
                return;
            } else {
                toast({
                    title: "Unexpected error",
                    description: "An unexpected error occurred during signup.",
                    variant: "destructive",
                });
                return;
            }
        } catch (error: any) {
            toast({
                title: "Signup failed",
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
            <div className="w-full max-w-2xl">
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
                        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                        <CardDescription>
                            Join thousands of Nigerian entrepreneurs
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input
                                    id="businessName"
                                    name="businessName"
                                    type="text"
                                    placeholder="Your Business Name"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Business Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    type="text"
                                    placeholder="We offer agricultural consultancy and tools..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+2348123456789"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    type="text"
                                    placeholder="15 Johnson Street, Enugu"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    type="text"
                                    placeholder="Nigeria"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    type="text"
                                    placeholder="Enugu"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="zip">Zip Code</Label>
                                <Input
                                    id="zip"
                                    name="zip"
                                    type="text"
                                    placeholder="400001"
                                    value={formData.zip}
                                    onChange={handleInputChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="h-11 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <PasswordStrengthBar strength={passwordStrengthScore} password={formData.password} />
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="h-11"
                                />
                                {!passwordsMatch && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                                )}
                                {passwordsMatch && formData.confirmPassword && (
                                    <p className="text-xs text-green-500 mt-1">Passwords match!</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                href="/tools/auth/login"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Sign in here
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Signup;