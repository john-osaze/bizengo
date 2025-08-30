"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  MapPin,
  Loader2,
  CheckCircle,
  User,
  LogOut,
  Phone,
  Mail,
  Globe,
  Building,
  Gift,
  Crown,
} from "lucide-react";

interface UserProfileData {
  id: number;
  name?: string;
  business_name?: string;
  email: string;
  phone?: string;
  country?: string;
  state?: string;
  referral_code?: string;
  referred_by?: string | null;
  role?: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = sessionStorage.getItem("RSToken");
    const savedUser = sessionStorage.getItem("RSUser");

    if (!token) {
      console.error("No token found in sessionStorage");
      setLoading(false);
      return;
    }

    // First try to load from saved data
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
      }
    }

    // Then fetch fresh data
    fetch("https://server.bizengo.com/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        // Update saved data
        sessionStorage.setItem("RSUser", JSON.stringify(data));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = (): void => {
    sessionStorage.removeItem("RSToken");
    sessionStorage.removeItem("RSUser");
    sessionStorage.removeItem("RSEmail");
    window.location.href = "/auth/login"; // Adjust this to your login route
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Loading your profile...
            </p>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">Failed to load profile</p>
            <p className="text-gray-400 text-sm mt-2">
              Please try refreshing the page
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your account information
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 text-center text-white">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <User className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {user.business_name || user.name || "Valued Customer"}
                </h2>
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  {user.role === "buyer" ? (
                    <Crown className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {user.role === "buyer"
                      ? "Premium Buyer"
                      : user.role || "Customer"}
                  </span>
                </div>
                {user.referral_code && (
                  <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <p className="text-xs text-blue-100 mb-1">
                      Your Referral Code
                    </p>
                    <p className="font-mono text-lg font-semibold tracking-wider">
                      {user.referral_code}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Information Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      Email Address
                    </Label>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        Phone Number
                      </Label>
                      <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-gray-900 font-medium">
                          {user.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {user.country && (
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        <Globe className="h-4 w-4 text-purple-500" />
                        Country
                      </Label>
                      <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-gray-900 font-medium">
                          {user.country}
                        </p>
                      </div>
                    </div>
                  )}

                  {user.state && (
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        State
                      </Label>
                      <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <p className="text-gray-900 font-medium">
                          {user.state}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            {user.business_name && (
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 border-b">
                  <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Building className="h-5 w-5 text-green-600" />
                    Business Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                      <Building className="h-4 w-4 text-green-600" />
                      Business Name
                    </Label>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {user.business_name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referral Information */}
            {(user.referral_code || user.referred_by) && (
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b">
                  <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-blue-600" />
                    Referral Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {user.referred_by && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Label className="text-sm font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Referred By
                      </Label>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        {user.referred_by}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        Thank you for joining through a referral!
                      </p>
                    </div>
                  )}

                  {user.referral_code && (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                      <Label className="text-sm font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Share & Earn
                      </Label>
                      <div className="mt-2 p-3 bg-white rounded-lg border-2 border-dashed border-indigo-300">
                        <p className="font-mono text-lg font-bold text-center text-indigo-800 tracking-wider">
                          {user.referral_code}
                        </p>
                      </div>
                      <p className="text-sm text-indigo-600 mt-2 text-center">
                        Share this code with friends and earn rewards!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="mt-8">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Account Active</h3>
                    <p className="text-green-100">
                      Your account is in good standing
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-100">Member since</p>
                  <p className="font-semibold">2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
