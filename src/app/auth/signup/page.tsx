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
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
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
      showNotification(
        "error",
        "Password Mismatch",
        "Passwords do not match. Please check and try again."
      );
      return;
    }

    if (passwordStrengthScore < 3) {
      showNotification(
        "error",
        "Weak Password",
        "Please create a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters."
      );
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.country ||
      !formData.state
    ) {
      showNotification(
        "error",
        "Missing Information",
        "Please fill in all required fields."
      );
      return;
    }

    setIsLoading(true);

    // Show loading notification
    showNotification(
      "info",
      "Creating Your Account",
      "Please wait while we set up your account. This may take a few moments..."
    );

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

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        // Close loading modal first
        closeNotification();

        setTimeout(() => {
          // Success notification
          showNotification(
            "success",
            "Account Created Successfully!",
            data.message ||
              "Your account has been created successfully. You will be redirected to the login page shortly."
          );

          // Clear form data
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            country: "",
            state: "",
            referral_code: "",
          });

          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        }, 500);
      } else {
        // Handle API error responses
        let errorMessage = "Failed to create account. Please try again.";
        let errorTitle = "Signup Failed";

        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(", ");
        }

        // Handle specific error cases
        if (response.status === 400) {
          errorTitle = "Invalid Information";
          if (errorMessage.toLowerCase().includes("email")) {
            errorMessage =
              "This email address is already registered or invalid.";
          } else if (errorMessage.toLowerCase().includes("phone")) {
            errorMessage =
              "This phone number is already registered or invalid.";
          }
        } else if (response.status === 409) {
          errorTitle = "Account Already Exists";
          errorMessage =
            "An account with this email or phone number already exists. Please try logging in instead.";
        } else if (response.status === 422) {
          errorTitle = "Validation Error";
          errorMessage =
            errorMessage || "Please check your information and try again.";
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
      console.error("Signup error:", error);

      let errorMessage = "Failed to create account. Please try again.";
      let errorTitle = "Signup Failed";

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
              <form onSubmit={handleSignup} className="space-y-4">
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referral_code">
                    Referral Code (Optional)
                  </Label>
                  <Input
                    id="referral_code"
                    name="referral_code"
                    type="text"
                    placeholder="ABCD1234"
                    value={formData.referral_code}
                    onChange={handleInputChange}
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={
                    isLoading || !passwordsMatch || passwordStrengthScore < 3
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
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
              </form>

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
    </>
  );
};

export default Signup;
