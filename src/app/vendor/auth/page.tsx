"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
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
  Store,
  Loader2,
  Chrome,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

// Updated interfaces
interface FormData {
  email: string;
  password: string;
  businessName: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessType: string;
  confirmPassword: string;
  country: string;
  state: string;
  referralCode?: string;
}

interface Errors {
  email?: string;
  password?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  businessType?: string;
  confirmPassword?: string;
  country?: string;
  state?: string;
  submit?: string;
}

interface VendorSignupRequest {
  business_name: string;
  business_type: string;
  country: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  phone: string;
  referral_code?: string;
  state: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Constants
const businessTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "retail", label: "Retail Store" },
  { value: "service", label: "Service Provider" },
  { value: "healthcare", label: "Healthcare" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "automotive", label: "Automotive" },
  { value: "home", label: "Home & Garden" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

const countries = [{ value: "Nigeria", label: "Nigeria" }];

const nigerianStates = [
  { value: "Lagos", label: "Lagos" },
  { value: "Abuja", label: "Abuja" },
  { value: "Kano", label: "Kano" },
  { value: "Rivers", label: "Rivers" },
  { value: "Oyo", label: "Oyo" },
  { value: "Delta", label: "Delta" },
  { value: "Kaduna", label: "Kaduna" },
  { value: "Edo", label: "Edo" },
  { value: "Plateau", label: "Plateau" },
  { value: "Kwara", label: "Kwara" },
];

// API Service
const API_BASE_URL = "https://rsc-kl61.onrender.com/api";

const vendorAuthService = {
  signup: async (data: VendorSignupRequest) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup/vendor`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },

  login: async (data: LoginRequest) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    return response.json();
  },
};

// Notification Component
const NotificationBanner = ({
  type,
  message,
  show,
  onClose,
}: {
  type: "success" | "error" | "info";
  message: string;
  show: boolean;
  onClose: () => void;
}) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <XCircle className="h-5 w-5" />;
      case "info":
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg max-w-md ${getColors()}`}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>
    </div>
  );
};

const VendorAuth: React.FC = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    businessName: "",
    firstName: "",
    lastName: "",
    phone: "",
    businessType: "",
    confirmPassword: "",
    country: "Nigeria", // Default to Nigeria
    state: "",
    referralCode: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
    show: boolean;
  }>({
    type: "info",
    message: "",
    show: false,
  });

  // Show notification function
  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000); // Auto hide after 5 seconds
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (!formData.businessName) {
        newErrors.businessName = "Business name is required";
      }
      if (!formData.firstName) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName) {
        newErrors.lastName = "Last name is required";
      }
      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
      }
      if (!formData.businessType) {
        newErrors.businessType = "Business type is required";
      }
      if (!formData.country) {
        newErrors.country = "Country is required";
      }
      if (!formData.state) {
        newErrors.state = "State is required";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      if (isLogin) {
        showNotification("info", "Signing you in...");

        const loginData: LoginRequest = {
          email: formData.email,
          password: formData.password,
        };

        console.log("Login request:", loginData);

        const response = await vendorAuthService.login(loginData);
        console.log("Login response:", response);

        // Store auth data (adjust based on your API response structure)
        const vendorData = {
          id:
            response.vendor?.id || response.user?.id || "vendor_" + Date.now(),
          email:
            response.vendor?.email || response.user?.email || formData.email,
          businessName:
            response.vendor?.business_name ||
            response.user?.business_name ||
            "My Business",
          firstName:
            response.vendor?.firstname ||
            response.user?.firstname ||
            response.vendor?.first_name ||
            "John",
          lastName:
            response.vendor?.lastname ||
            response.user?.lastname ||
            response.vendor?.last_name ||
            "Doe",
          phone:
            response.vendor?.phone || response.user?.phone || formData.phone,
          businessType:
            response.vendor?.business_type ||
            response.user?.business_type ||
            "other",
          isVerified:
            response.vendor?.isVerified || response.user?.isVerified || false,
          joinDate:
            response.vendor?.joinDate ||
            response.user?.created_at ||
            new Date().toISOString(),
          profileComplete: 100,
          token: response.token || response.access_token, // Store auth token if provided
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("vendorAuth", JSON.stringify(vendorData));
          localStorage.setItem("isVendorLoggedIn", "true");

          if (vendorData.token) {
            localStorage.setItem("vendorToken", vendorData.token);
          }
        }

        showNotification(
          "success",
          "Login successful! Redirecting to dashboard..."
        );

        // Delay redirect to show success message
        setTimeout(() => {
          router.push("../dashboard");
        }, 1500);
      } else {
        showNotification("info", "Creating your account...");

        const signupData: VendorSignupRequest = {
          business_name: formData.businessName,
          business_type: formData.businessType,
          country: formData.country,
          email: formData.email,
          firstname: formData.firstName,
          lastname: formData.lastName,
          password: formData.password,
          phone: formData.phone,
          state: formData.state,
          ...(formData.referralCode && {
            referral_code: formData.referralCode,
          }),
        };

        console.log("Signup request:", signupData);

        const response = await vendorAuthService.signup(signupData);
        console.log("Signup response:", response);

        // Store vendor data
        const vendorData = {
          id: response.vendor?.id || "vendor_" + Date.now(),
          email: response.vendor?.email || formData.email,
          businessName: response.vendor?.business_name || formData.businessName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          businessType: formData.businessType,
          country: formData.country,
          state: formData.state,
          isVerified: false,
          joinDate: new Date().toISOString(),
          profileComplete: 50,
          token: response.token || response.access_token,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("vendorAuth", JSON.stringify(vendorData));
          localStorage.setItem("isVendorLoggedIn", "true");

          if (vendorData.token) {
            localStorage.setItem("vendorToken", vendorData.token);
          }
        }

        showNotification(
          "success",
          "Account created successfully! Redirecting to dashboard..."
        );

        // Delay redirect to show success message
        setTimeout(() => {
          router.push("../dashboard");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);

      let errorMessage =
        error.message || "Authentication failed. Please try again.";
      let errorTitle = isLogin ? "Login Failed" : "Signup Failed";

      // Handle specific error cases
      if (
        errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("Unauthorized")
      ) {
        errorTitle = "Invalid Credentials";
        errorMessage = "Please check your email and password and try again.";
      } else if (errorMessage.includes("User not found")) {
        errorTitle = "Account Not Found";
        errorMessage =
          "No account found with this email. Please sign up first.";
      } else if (errorMessage.includes("already exists")) {
        errorTitle = "Account Already Exists";
        errorMessage =
          "An account with this email already exists. Please try logging in.";
      }

      showNotification("error", `${errorTitle}: ${errorMessage}`);

      setErrors({
        submit: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    showNotification("info", "Connecting with Google...");

    try {
      // For now, keeping the demo implementation
      // You can integrate with Google OAuth later
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const vendorData = {
        id: "vendor_google_" + Date.now(),
        email: "demo@example.com",
        businessName: "Demo Business",
        firstName: "Demo",
        lastName: "User",
        phone: "+234-555-0123",
        businessType: "retail",
        country: "Nigeria",
        state: "Lagos",
        isVerified: true,
        joinDate: new Date().toISOString(),
        profileComplete: 100,
        authProvider: "google",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("vendorAuth", JSON.stringify(vendorData));
        localStorage.setItem("isVendorLoggedIn", "true");
      }

      showNotification("success", "Google sign-in successful! Redirecting...");

      setTimeout(() => {
        router.push("../dashboard");
      }, 1500);
    } catch (error) {
      showNotification(
        "error",
        "Google authentication failed. Please try again."
      );
      setErrors({ submit: "Google authentication failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NotificationBanner
        type={notification.type}
        message={notification.message}
        show={notification.show}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-bold text-2xl text-gray-900 mb-2">
              {isLogin ? "Welcome Back" : "Start Selling Online"}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? "Sign in to your vendor account"
                : "Create your storefront and reach more customers"}
            </p>
          </div>

          {/* Auth Form */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div onSubmit={handleSubmit} className="space-y-4">
                {/* Registration Fields */}
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="h-11"
                          required
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="h-11"
                          required
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="Enter your business name"
                        className="h-11"
                        required
                      />
                      {errors.businessName && (
                        <p className="text-red-500 text-sm">
                          {errors.businessName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="08012345678"
                        className="h-11"
                        required
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm">{errors.phone}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={`w-full h-11 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.country
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          required
                        >
                          <option value="">Select country</option>
                          {countries.map((country) => (
                            <option key={country.value} value={country.value}>
                              {country.label}
                            </option>
                          ))}
                        </select>
                        {errors.country && (
                          <p className="text-red-500 text-sm">
                            {errors.country}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full h-11 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.state ? "border-red-500" : "border-gray-300"
                          }`}
                          required
                          disabled={!formData.country}
                        >
                          <option value="">Select state</option>
                          {formData.country === "Nigeria" &&
                            nigerianStates.map((state) => (
                              <option key={state.value} value={state.value}>
                                {state.label}
                              </option>
                            ))}
                        </select>
                        {errors.state && (
                          <p className="text-red-500 text-sm">{errors.state}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className={`w-full h-11 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.businessType
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.businessType && (
                        <p className="text-red-500 text-sm">
                          {errors.businessType}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referralCode">
                        Referral Code (Optional)
                      </Label>
                      <Input
                        id="referralCode"
                        name="referralCode"
                        value={formData.referralCode || ""}
                        onChange={handleInputChange}
                        placeholder="Enter referral code if any"
                        className="h-11"
                      />
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="h-11"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="h-11 pr-10"
                      required
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
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="h-11"
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </div>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <Chrome className="h-5 w-5 mr-2" />
                Google
              </Button>
            </CardContent>
          </Card>

          {/* Toggle Auth Mode */}
          <div className="text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 font-medium ml-1 hover:underline"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorAuth;
