"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
// Using fetch instead of axios
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

const PasswordStrengthBar = ({
  strength,
  password,
}: {
  strength: number;
  password: string;
}) => {
  let color = "red";
  let strengthText = "Poor";
  if (strength >= 2) {
    color = "yellow";
    strengthText = "Weak";
  }
  if (strength >= 4) {
    color = "green";
    strengthText = "Strong";
  }

  return (
    <div>
      {password && (
        <div
          className={`text-xs ${
            strengthText === "Poor"
              ? "text-red-600"
              : strengthText === "Weak"
              ? "text-yellow-500"
              : strengthText === "Strong"
              ? "text-green-600"
              : "text-gray-500"
          } mb-1`}
        >
          {strengthText}
        </div>
      )}
      {password && (
        <div className="h-1 w-full bg-gray-200 rounded-full mt-1">
          <div
            className={`h-full rounded-full transition-all duration-300`}
            style={{
              width: `${Math.min(strength * 25, 100)}%`,
              backgroundColor: color,
            }}
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
    phone: "",
    country: "",
    state: "",
    referral_code: "",
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
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrengthScore < 3) {
      toast({
        title: "Weak Password",
        description:
          "Please create a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.country ||
      !formData.state
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Show loading notification
    toast({
      title: "Creating Account",
      description: "Please wait while we create your account...",
    });

    try {
      const requestBody = {
        country: formData.country,
        email: formData.email,
        name: formData.name,
        password: formData.password,
        phone: formData.phone,
        referral_code: formData.referral_code || undefined,
        state: formData.state,
      };

      console.log(
        "Sending request to:",
        "https://rsc-kl61.onrender.com/api/auth/signup/buyer"
      );
      console.log("Request body:", requestBody);

      const response = await fetch(
        "https://rsc-kl61.onrender.com/api/auth/signup/buyer",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("Response:", response);
      const data = await response.json();

      if (response.ok) {
        // Success notification
        toast({
          title: "Account Created Successfully! 🎉",
          description:
            data.message ||
            "Your account has been created. Please check your email for verification instructions.",
        });

        // Store email for potential verification flow
        if (typeof window !== "undefined") {
          sessionStorage.setItem("RSEmail", formData.email);
        }

        // Redirect based on response or to a default page
        setTimeout(() => {
          router.push(
            `/auth/verify-otp?email=${encodeURIComponent(formData.email)}`
          );
        }, 2000);
      } else {
        // Handle unexpected success status codes
        toast({
          title: "Account Created",
          description:
            data.message || "Account created but with an unexpected response.",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);

      let errorMessage = "Failed to create account. Please try again.";
      let errorTitle = "Signup Failed";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        // Network error
        errorTitle = "Connection Error";
        errorMessage =
          "Unable to connect to the server. Please check your internet connection and try again.";
      } else {
        // Parse response error if available
        try {
          const errorData = await error.response?.json?.();
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Use default error message
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
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
            href="/"
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
            <CardTitle className="text-2xl font-bold">
              Create Your Account
            </CardTitle>
            <CardDescription>
              Join thousands of Nigerian business owners
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
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
                <Label htmlFor="email">Email Address *</Label>
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
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="08012345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
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
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="Lagos"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_code">Referral Code (Optional)</Label>
                <Input
                  id="referral_code"
                  name="referral_code"
                  type="text"
                  placeholder="ABCD1234"
                  value={formData.referral_code}
                  onChange={handleInputChange}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
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
                <PasswordStrengthBar
                  strength={passwordStrengthScore}
                  password={formData.password}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
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
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 mt-1">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-xs text-green-600">
                          Passwords match!
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <p className="text-xs text-red-500">
                          Passwords do not match.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isLoading || !passwordsMatch || passwordStrengthScore < 3
                }
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Validation hints */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>* Required fields</p>
                <p>
                  Password must be strong (at least 8 characters with mixed
                  case, numbers, and symbols)
                </p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
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
