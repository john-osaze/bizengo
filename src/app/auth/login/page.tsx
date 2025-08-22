"use client";
import { useState } from "react";
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
  MapPin,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast({
        title: "📝 Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "📧 Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Show loading notification
    toast({
      title: "🔐 Signing You In",
      description: "Please wait while we verify your credentials...",
    });

    try {
      const response = await fetch(
        "https://rsc-kl61.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

if (
  response.ok &&
  (data.status === "success" || data.success || response.status === 200)
) {
  toast({
    title: "🎉 Login Successful!",
    description:
      data.message || "Welcome back! Redirecting to your dashboard...",
  });

  if (typeof window !== "undefined") {
    sessionStorage.setItem("RSEmail", email);
    if (data.access_token) {
      sessionStorage.setItem("RSToken", data.access_token);
    }
  }

  // Fetch user profile
  try {
    const profileResponse = await fetch(
      "https://rsc-kl61.onrender.com/api/user/profile",
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,  // 👈 fixed
          "Content-Type": "application/json",
        },
      }
    );

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();

      if (typeof window !== "undefined" && profileData) {
        sessionStorage.setItem("RSUser", JSON.stringify(profileData));
      }

      toast({
        title: "🎉 Welcome back!",
        description: profileData?.business_name
          ? `Good to see you again, ${profileData.business_name}!`
          : "Successfully signed in to your account.",
      });
    } else {
      console.error("Failed to fetch user profile");
    }
  } catch (profileError) {
    console.error("Error fetching user profile:", profileError);
  }

        // Clear form
        setEmail("");
        setPassword("");

        // Check for redirect URL and redirect after a short delay
        setTimeout(() => {
          const redirectUrl =
            sessionStorage.getItem("redirectUrl") || "/marketplace";
          router.push(redirectUrl);
          sessionStorage.removeItem("redirectUrl"); // Clean up after redirect
        }, 1500);
      } else {
        // Handle API error responses
        let errorMessage = "Invalid email or password. Please try again.";
        let errorTitle = "❌ Login Failed";

        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(", ");
        }

        // Handle specific error cases
        if (response.status === 400) {
          errorTitle = "⚠️ Invalid Request";
        } else if (response.status === 401) {
          errorTitle = "🔒 Authentication Failed";
          errorMessage =
            "Invalid email or password. Please check your credentials.";
        } else if (response.status === 403) {
          errorTitle = "🚫 Access Denied";
          errorMessage = "Your account may be suspended or not verified.";
        } else if (response.status === 404) {
          errorTitle = "👤 Account Not Found";
          errorMessage = "No account found with this email address.";
        } else if (response.status === 429) {
          errorTitle = "⏰ Too Many Attempts";
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (response.status === 500) {
          errorTitle = "🔧 Server Error";
          errorMessage =
            "Our servers are experiencing issues. Please try again later.";
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Failed to sign in. Please try again.";
      let errorTitle = "❌ Login Failed";

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        // Network error
        errorTitle = "🌐 Connection Error";
        errorMessage =
          "Unable to connect to our servers. Please check your internet connection and try again.";
      } else if (error.message.includes("timeout")) {
        errorTitle = "⏱️ Request Timeout";
        errorMessage =
          "The request took too long to complete. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
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
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm relative">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="enter@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Validation hints */}
              <div className="text-xs text-gray-500">
                <p>* Required fields</p>
              </div>
            </form>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 shadow-lg flex items-center gap-3">
                  <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                  <p className="text-gray-700">Verifying credentials...</p>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
