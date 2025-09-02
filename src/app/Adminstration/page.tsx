"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  X,
  Copy,
  Store,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Eye,
  Shield,
  Activity,
  DollarSign,
  ShoppingCart,
  Star,
  ChevronDown,
  Loader2,
  RefreshCw,
  Bell,
  Settings,
  LogOut,
  Package,
  UserCheck,
  Building2,
} from "lucide-react";

// Types
interface AdminStats {
  products: {
    active: number;
    inactive_or_hidden: number;
    total: number;
  };
  storefronts: number;
  users: {
    buyers: number;
    total_accounts: number;
    vendors: number;
  };
}

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  account_type: string;
  referral_code: string;
  referred_by: string | null;
  business_name?: string;
  business_type?: string;
  kyc_status?: string;
}

interface Storefront {
  id: number;
  business_name: string;
  owner_name: string;
  email: string;
  status: string;
  created_at: string;
  total_products: number;
  total_sales: number;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "storefronts"
  >("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "buyer" | "vendor">(
    "all"
  );
  const [alerts, setAlerts] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Get admin token
  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken");
    }
    return null;
  };

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAdminToken();
    if (!token) {
      throw new Error("No admin token found");
    }

    const response = await fetch(`https://server.bizengo.com/api${endpoint}`, {
      ...options,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json();
  };

  // Load data functions
  const loadStats = async () => {
    try {
      const data = await apiCall("/admin/stats");
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
      setAlerts((prev) => [...prev, "Failed to load statistics"]);
      // Fallback mock data matching real structure
      setStats({
        products: { active: 1, inactive_or_hidden: 0, total: 1 },
        storefronts: 8,
        users: { buyers: 3, total_accounts: 4, vendors: 1 },
      });
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiCall("/admin/users");
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      setAlerts((prev) => [...prev, "Failed to load users"]);
    }
  };

  const loadStorefronts = async () => {
    try {
      const data = await apiCall("/admin/storefronts");
      setStorefronts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load storefronts:", error);
      setAlerts((prev) => [...prev, "Failed to load storefronts"]);
    }
  };

  // Delete functions
  const deleteUser = async (accountType: string, userId: number) => {
    if (!confirm(`Are you sure you want to delete this ${accountType}?`))
      return;

    try {
      await apiCall(`/admin/users/${accountType}/${userId}`, {
        method: "DELETE",
      });
      setUsers(users.filter((user) => user.id !== userId));
      setAlerts((prev) => [...prev, `${accountType} deleted successfully`]);
    } catch (error) {
      console.error("Failed to delete user:", error);
      setAlerts((prev) => [...prev, `Failed to delete ${accountType}`]);
    }
  };

  const deleteStorefront = async (storefrontId: number) => {
    if (!confirm("Are you sure you want to delete this storefront?")) return;

    try {
      await apiCall(`/admin/storefronts/${storefrontId}`, { method: "DELETE" });
      setStorefronts(storefronts.filter((store) => store.id !== storefrontId));
      setAlerts((prev) => [...prev, "Storefront deleted successfully"]);
    } catch (error) {
      console.error("Failed to delete storefront:", error);
      setAlerts((prev) => [...prev, "Failed to delete storefront"]);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadUsers(), loadStorefronts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.business_name &&
        user.business_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" || user.role === filterType;
    return matchesSearch && matchesFilter;
  });

  const dismissAlert = (index: number) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("isAdminLoggedIn");
    }
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">
            Loading admin dashboard...
          </p>
          <div className="mt-2 h-1 w-32 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-gray-500">
                  Bizengo Management Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-xl transition-all duration-200">
                <Bell className="h-5 w-5" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="mb-2 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-red-700 text-sm font-medium">
                  {alert}
                </span>
              </div>
              <button
                onClick={() => dismissAlert(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
          <nav className="flex space-x-2">
            {[
              { key: "overview", label: "Overview", icon: Activity },
              { key: "users", label: "Users", icon: Users },
              { key: "storefronts", label: "Storefronts", icon: Store },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === key
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/70"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Users",
                  value: stats?.users.total_accounts || 0,
                  icon: Users,
                  gradient: "from-blue-500 to-cyan-500",
                  bgGradient: "from-blue-50 to-cyan-50",
                },
                {
                  label: "Active Storefronts",
                  value: stats?.storefronts || 0,
                  icon: Store,
                  gradient: "from-green-500 to-emerald-500",
                  bgGradient: "from-green-50 to-emerald-50",
                },
                {
                  label: "Total Products",
                  value: stats?.products.total || 0,
                  icon: Package,
                  gradient: "from-purple-500 to-pink-500",
                  bgGradient: "from-purple-50 to-pink-50",
                },
                {
                  label: "Active Products",
                  value: stats?.products.active || 0,
                  icon: TrendingUp,
                  gradient: "from-orange-500 to-red-500",
                  bgGradient: "from-orange-50 to-red-50",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg`}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* User Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  User Distribution
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-700">
                        Buyers
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats?.users.buyers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-700">
                        Vendors
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {stats?.users.vendors || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Overview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Product Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-700">
                        Active Products
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {stats?.products.active || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-700">
                        Hidden/Inactive
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-gray-600">
                      {stats?.products.inactive_or_hidden || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("users")}
                  className="group flex items-center gap-4 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold text-gray-700">
                      Manage Users
                    </span>
                    <span className="block text-sm text-gray-500">
                      View and manage all users
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("storefronts")}
                  className="group flex items-center gap-4 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold text-gray-700">
                      Manage Stores
                    </span>
                    <span className="block text-sm text-gray-500">
                      View and manage storefronts
                    </span>
                  </div>
                </button>
                <button className="group flex items-center gap-4 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 transform hover:scale-105">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold text-gray-700">
                      System Settings
                    </span>
                    <span className="block text-sm text-gray-500">
                      Configure system parameters
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Users Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  User Management
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage all platform users and their access
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm"
                >
                  <option value="all">All Users</option>
                  <option value="buyer">Buyers</option>
                  <option value="vendor">Vendors</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Referral Code
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 cursor-pointer"
                      >
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => openUserDetails(user)}
                        >
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-sm">
                                {user.name
                                  .split(" ")
                                  .map((n) => n.charAt(0))
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              {user.business_name && (
                                <div className="text-xs text-purple-600 font-medium">
                                  {user.business_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                              user.role === "vendor"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                                : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {user.role}
                          </span>
                          {user.business_type && (
                            <div className="text-xs text-gray-500 mt-1 capitalize">
                              {user.business_type}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {user.phone}
                          </div>
                          {user.kyc_status && (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                user.kyc_status === "verified"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {user.kyc_status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700">
                            {user.referral_code}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/users/${user.account_type}/${user.id}`
                                )
                              }
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-all duration-200"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                deleteUser(user.account_type, user.id)
                              }
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-xl transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "storefronts" && (
          <div className="space-y-6">
            {/* Storefronts Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Storefront Management
                </h2>
                <p className="text-gray-600 mt-1">
                  Monitor and manage all vendor storefronts
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search storefronts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm"
                />
              </div>
            </div>

            {/* Storefronts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storefronts
                .filter(
                  (store) =>
                    store.business_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    store.owner_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((store) => (
                  <div
                    key={store.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Store className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                              {store.business_name}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          Owner: {store.owner_name}
                        </p>
                        <p className="text-sm text-gray-500">{store.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/storefronts/${store.id}`)
                          }
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteStorefront(store.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Products:
                        </span>
                        <span className="font-bold text-gray-900">
                          {store.total_products || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Total Sales:
                        </span>
                        <span className="font-bold text-green-600">
                          ${(store.total_sales || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Status:
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            store.status === "active"
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                              : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          {store.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        Created:{" "}
                        {new Date(store.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty State */}
            {storefronts.length === 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No storefronts found
                </h3>
                <p className="text-gray-600">
                  There are no storefronts matching your search criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n.charAt(0))
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                    <p className="text-white/80 text-sm">
                      {selectedUser.email}
                    </p>
                    <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-white/20 backdrop-blur-sm mt-2">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeUserModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </h3>

                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Full Name
                      </label>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {selectedUser.name}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email Address
                      </label>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {selectedUser.email}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {selectedUser.phone}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Account Type
                      </label>
                      <p className="text-sm font-bold text-gray-900 mt-1 capitalize">
                        {selectedUser.account_type}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business & Referral Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    Additional Details
                  </h3>

                  <div className="space-y-3">
                    {selectedUser.business_name && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Business Name
                        </label>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {selectedUser.business_name}
                        </p>
                      </div>
                    )}

                    {selectedUser.business_type && (
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Business Type
                        </label>
                        <p className="text-sm font-bold text-gray-900 mt-1 capitalize">
                          {selectedUser.business_type}
                        </p>
                      </div>
                    )}

                    {selectedUser.kyc_status && (
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          KYC Status
                        </label>
                        <div className="mt-2">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                              selectedUser.kyc_status === "verified"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                                : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                            }`}
                          >
                            {selectedUser.kyc_status}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Referral Code
                      </label>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="px-3 py-2 bg-gray-900 text-green-400 rounded-lg text-sm font-mono flex-1">
                          {selectedUser.referral_code}
                        </code>
                        <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                          <Copy className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {selectedUser.referred_by && (
                      <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Referred By
                        </label>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {selectedUser.referred_by}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() =>
                    router.push(
                      `/admin/users/${selectedUser.account_type}/${selectedUser.id}`
                    )
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Eye className="h-4 w-4" />
                  View Full Profile
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={closeUserModal}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      deleteUser(selectedUser.account_type, selectedUser.id);
                      closeUserModal();
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
