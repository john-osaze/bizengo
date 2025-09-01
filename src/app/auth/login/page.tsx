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
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Modal Notification Component
const NotificationModal = ({
  type,
  title,
  message,
  show,
  onClose,
}: {
  type: "success" | "error" | "info";
  title: string;
  message: string;
  show: boolean;
  onClose: () => void;
}) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case "error":
        return <XCircle className="h-12 w-12 text-red-500" />;
      case "info":
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          button: "bg-green-600 hover:bg-green-700",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          button: "bg-red-600 hover:bg-red-700",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          button: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={type !== "info" ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 ${colors.border}`}
      >
        {/* Close button - only show for non-info modals */}
        {type !== "info" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Content */}
        <div className={`p-8 rounded-t-xl ${colors.bg}`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">{getIcon()}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-700 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Actions - only show for non-info modals */}
        {type !== "info" && (
          <div className="p-6 bg-white rounded-b-xl">
            <Button
              onClick={onClose}
              className={`w-full ${colors.button} text-white`}
            >
              OK
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
    show: boolean;
  }>({
    type: "info",
    title: "",
    message: "",
    show: false,
  });
  const router = useRouter();

  // Show notification function
  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    setNotification({ type, title, message, show: true });

    // Auto hide after 5 seconds for non-info messages
    if (type !== "info") {
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  // Close notification function
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      showNotification(
        "error",
        "Missing Information",
        "Please enter both email and password."
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification(
        "error",
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    setIsLoading(true);

    // Show loading notification
    showNotification(
      "info",
      "Signing You In",
      "Please wait while we verify your credentials..."
    );

    try {
      const response = await fetch(
        "https://server.bizengo.com/api/auth/login",
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
        if (typeof window !== "undefined") {
          sessionStorage.setItem("RSEmail", email);
          if (data.access_token) {
            sessionStorage.setItem("RSToken", data.access_token);
          }
          // Store user data from login response
          if (data.user) {
            sessionStorage.setItem("RSUser", JSON.stringify(data.user));
          }
        }

        // Close loading modal first
        closeNotification();

        // Check user role from login response
        const userRole = data.user?.role;

        if (userRole && userRole.toLowerCase() === "admin") {
          // User is an admin, redirect to admin panel
          setTimeout(() => {
            showNotification(
              "success",
              "Admin Access Granted!",
              `Welcome Administrator! Redirecting to admin panel...`
            );

            // Clear form
            setEmail("");
            setPassword("");

            // Redirect to admin panel after showing success message
            setTimeout(() => {
              router.push("/Adminstration");
            }, 2000);
          }, 500);
          return; // Exit early for admin users
        }

        // For non-admin users, fetch user profile for additional details
        try {
          const profileResponse = await fetch(
            "https://server.bizengo.com/api/user/profile",
            {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();

            if (typeof window !== "undefined" && profileData) {
              // Merge profile data with existing user data
              const existingUser = JSON.parse(
                sessionStorage.getItem("RSUser") || "{}"
              );
              sessionStorage.setItem(
                "RSUser",
                JSON.stringify({ ...existingUser, ...profileData })
              );
            }

            // Check user role from profile data
            const profileRole = profileData?.role || userRole;

            if (profileRole && profileRole.toLowerCase() === "vendor") {
              // User is a vendor, redirect to vendor auth
              setTimeout(() => {
                showNotification(
                  "error",
                  "Vendor Access Required",
                  "You are a vendor. Please use the vendor login portal to access your account."
                );

                // Clear form
                setEmail("");
                setPassword("");

                // Redirect to vendor auth after showing notification
                setTimeout(() => {
                  router.push("/vendor/auth");
                }, 3000);
              }, 500);
            } else {
              // User is a buyer or other role, proceed with normal login
              setTimeout(() => {
                showNotification(
                  "success",
                  "Welcome Back!",
                  profileData?.business_name
                    ? `Good to see you again, ${profileData.business_name}! Redirecting to your dashboard...`
                    : "Successfully signed in to your account. Redirecting to marketplace..."
                );

                // Clear form
                setEmail("");
                setPassword("");

                // Redirect after showing success message
                setTimeout(() => {
                  const redirectUrl =
                    sessionStorage.getItem("redirectUrl") || "/marketplace";
                  router.push(redirectUrl);
                  sessionStorage.removeItem("redirectUrl");
                }, 2000);
              }, 500);
            }
          } else {
            console.error("Failed to fetch user profile");

            setTimeout(() => {
              showNotification(
                "success",
                "Login Successful!",
                data.message || "Welcome back! Redirecting to your dashboard..."
              );

              // Clear form
              setEmail("");
              setPassword("");

              // Redirect after showing success message
              setTimeout(() => {
                const redirectUrl =
                  sessionStorage.getItem("redirectUrl") || "/marketplace";
                router.push(redirectUrl);
                sessionStorage.removeItem("redirectUrl");
              }, 2000);
            }, 500);
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);

          setTimeout(() => {
            showNotification(
              "success",
              "Login Successful!",
              data.message || "Welcome back! Redirecting to your dashboard..."
            );

            // Clear form
            setEmail("");
            setPassword("");

            // Redirect after showing success message
            setTimeout(() => {
              const redirectUrl =
                sessionStorage.getItem("redirectUrl") || "/marketplace";
              router.push(redirectUrl);
              sessionStorage.removeItem("redirectUrl");
            }, 2000);
          }, 500);
        }
      } else {
        // Handle API error responses
        let errorMessage = "Invalid email or password. Please try again.";
        let errorTitle = "Login Failed";

        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(", ");
        }

        // Handle specific error cases
        if (response.status === 400) {
          errorTitle = "Invalid Request";
        } else if (response.status === 401) {
          errorTitle = "Authentication Failed";
          errorMessage =
            "Invalid email or password. Please check your credentials.";
        } else if (response.status === 403) {
          errorTitle = "Access Denied";
          errorMessage = "Your account may be suspended or not verified.";
        } else if (response.status === 404) {
          errorTitle = "Account Not Found";
          errorMessage = "No account found with this email address.";
        } else if (response.status === 429) {
          errorTitle = "Too Many Attempts";
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (response.status === 500) {
          errorTitle = "Server Error";
          errorMessage =
            "Our servers are experiencing issues. Please try again later.";
        }

        // Close loading modal first
        closeNotification();

        setTimeout(() => {
          showNotification("error", errorTitle, errorMessage);
        }, 500);
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Failed to sign in. Please try again.";
      let errorTitle = "Login Failed";

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        // Network error
        errorTitle = "Connection Error";
        errorMessage =
          "Unable to connect to our servers. Please check your internet connection and try again.";
      } else if (error.message.includes("timeout")) {
        errorTitle = "Request Timeout";
        errorMessage =
          "The request took too long to complete. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Close loading modal first
      closeNotification();

      setTimeout(() => {
        showNotification("error", errorTitle, errorMessage);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NotificationModal
        type={notification.type}
        title={notification.title}
        message={notification.message}
        show={notification.show}
        onClose={closeNotification}
      />

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
    </>
  );
};

export default Login;
