"use client"
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
    Receipt, Users, Search, TrendingUp,
    DollarSign, CreditCard, Package, Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Credits from "./components/tabs/credits";
import Header from "./components/header";
import Invoice from "./components/tabs/invoice";
import { isWithinInterval, subDays } from "date-fns";

import VerticalTabs from './components/verticalTab';
import { navItems } from "@/lib/tools-dash-nav-items";
import Receipts from "./components/tabs/receipts";
import Orders from "./components/tabs/orders";
import User from "./components/tabs/users";
import Businesses from "./components/tabs/businesses";
import Settings from "./components/tabs/settings";
import { useAuth } from "@/context/AuthContext";

interface ApiCreditItem {
    id: string;
    email: string;
    credit_id: string;
    customer_name: string;
    customer_phone: string;
    amount: string;
    description: string;
    date_created: string;
    due_date: string;
    status: "pending" | "paid" | "overdue" | "deleted"; // <-- CHANGE THIS LINE
    payment_probability: string;
    risk_score: string;
    uptime: string;
    admin: string;
}

interface ApiInvoiceItem {
    id: string;
    invoice_id: string,
    email: string;
    pdf_url: string;
    type: string;
    fullname: string;
    phone: string;
    date: string;
    template: string;
    uptime: string;
    amount: string;
    admin: string | null;
}

interface ApiOrderItem {
    id: string;
    order_id: string;
    email: string;
    supplier: string;
    items: string;
    status: string;
    expectedDelivery: string;
    totalValue: string;
    uptime: string;
    admin: string | null;
}

interface ApiUserItem {
    id: string;
    account_id: string;
    fullname: string;
    email: string;
    role: string;
    phone: string;
    businessname: string;
    address: string;
    description: string;
    country: string;
    state: string;
    zip: string;
    resetid?: string;
    status: string;
    regdate: string;
    uptime: string;
    admin: string;
}

// NEW: Interface for Business data
interface ApiBusinessItem {
    id: string;
    email: string;
    business_id: string;
    business_name: string;
    business_email: string;
    address: string;
    description: string;
    contact: string;
    identifier: string;
    logo: string;
    number: string;
    status: string;
    reg_time: string;
    uptime: string;
    admin: string | null;
}

const Dashboard = () => {
    const { isLoggedIn, user, isLoading, error, login, logout } = useAuth();
    const [creditData, setCreditData] = useState<ApiCreditItem[] | null>(null);
    const [loadingCredits, setLoadingCredits] = useState<boolean>(true);
    const [pendingCreditCount, setPendingCreditCount] = useState<number>(0);
    const [pendingCreditAmountTotal, setPendingCreditAmountTotal] = useState<number>(0);
    const [invoiceData, setInvoiceData] = useState<ApiInvoiceItem[] | null>(null);
    const [loadingInvoices, setLoadingInvoices] = useState<boolean>(true);
    const [totalInvoiceCount, setTotalInvoiceCount] = useState<number>(0);
    const [weeklyInvoiceCount, setWeeklyInvoiceCount] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<string>("overview");
    const [receiptData, setReceiptData] = useState<ApiInvoiceItem[]>([]);
    const [totalReceiptCount, setTotalReceiptCount] = useState<number>(0);
    const [weeklyReceiptCount, setWeeklyReceiptCount] = useState<number>(0);
    const [orderData, setOrderData] = useState<ApiOrderItem[] | null>(null);
    const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
    const [userData, setUserData] = useState<ApiUserItem[] | null>(null);
    const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
    const [allBusinessesData, setAllBusinessesData] = useState<ApiBusinessItem[] | null>(null);
    // NEW: State for the current user's specific business data (for Header/Settings)
    const [currentUserBusinessData, setCurrentUserBusinessData] = useState<ApiBusinessItem | null>(null);
    const [loadingBusinesses, setLoadingBusinesses] = useState<boolean>(true);

    const fetchCreditData = useCallback(async (email: string) => {
        setLoadingCredits(true);
        try {
            const response = await fetch(`https://api.rootsnsquares.com/innovations/get-credit.php?email=${email}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                setCreditData(data.data);
            } else {
                setCreditData([]);
            }
        } catch (error) {
            setCreditData([]);
            toast({
                title: "Error fetching credit data",
                description: "Could not retrieve credit records. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoadingCredits(false);
        }
    }, []);


    const fetchInvoiceData = useCallback(async (email: string) => {
        setLoadingInvoices(true);
        try {
            const response = await fetch(`https://api.rootsnsquares.com/innovations/get-records.php?email=${email}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.records)) {
                const allRecords: ApiInvoiceItem[] = data.records;

                const invoices: ApiInvoiceItem[] = [];
                const receipts: ApiInvoiceItem[] = [];

                allRecords.forEach((item: ApiInvoiceItem) => {
                    if (item.type === 'invoice') {
                        invoices.push(item);
                    } else if (item.type === 'receipt') {
                        receipts.push(item);
                    }
                });

                setInvoiceData(invoices);
                setTotalInvoiceCount(invoices.length);

                const today = new Date();
                const sevenDaysAgo = subDays(today, 7);

                const weeklyInvoices = invoices.filter((item: ApiInvoiceItem) => {

                    const invoiceDate = new Date(item.date);
                    return isWithinInterval(invoiceDate, { start: sevenDaysAgo, end: today });
                });
                setWeeklyInvoiceCount(weeklyInvoices.length);



                setReceiptData(receipts);
                setTotalReceiptCount(receipts.length);

                const weeklyReceipts = receipts.filter((item: ApiInvoiceItem) => {
                    const receiptDate = new Date(item.date);
                    return isWithinInterval(receiptDate, { start: sevenDaysAgo, end: today });
                });
                setWeeklyReceiptCount(weeklyReceipts.length);

            } else {
                setInvoiceData([]);
                setTotalInvoiceCount(0);
                setWeeklyInvoiceCount(0);

                setReceiptData([]);
                setTotalReceiptCount(0);
                setWeeklyReceiptCount(0);
            }
        } catch (error) {

            setInvoiceData([]);
            setTotalInvoiceCount(0);
            setWeeklyInvoiceCount(0);

            setReceiptData([]);
            setTotalReceiptCount(0);
            setWeeklyReceiptCount(0);

            toast({
                title: "Error fetching data",
                description: "Could not retrieve records. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoadingInvoices(false);
        }
    }, []);

    const fetchOrderData = useCallback(async (email: string) => {

        setLoadingOrders(true);
        setOrderData(null);

        const baseUrl = "https://api.rootsnsquares.com/innovations/get-orders.php";
        const params = new URLSearchParams();

        if (user && user.role === "user") {
            params.append("email", email);
        }

        try {
            const response = await fetch(`${baseUrl}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.orders)) {
                const filteredOrders = data.orders.filter((order: ApiOrderItem) => order.status !== "deleted");
                setOrderData(filteredOrders);
            } else {
                setOrderData([]);
            }
        } catch (error) {
            setOrderData([]);
            toast({
                title: "Error fetching order data",
                description: "Could not retrieve order records. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoadingOrders(false);
        }
    }, []);

    const fetchUserData = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const response = await fetch("https://api.rootsnsquares.com/innovations/users.php");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.users)) {
                setUserData(data.users);
            } else {
                setUserData([]);
            }
        } catch (error) {
            setUserData([]);
            toast({
                title: "Error fetching user data",
                description: "Could not retrieve user records. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoadingUsers(false);
        }
    }, []);


    const fetchBusinessData = useCallback(async (sessionEmail: string) => {
        setLoadingBusinesses(true);
        // Clear previous states before fetching
        setAllBusinessesData(null);
        setCurrentUserBusinessData(null);

        try {
            let url = "https://api.rootsnsquares.com/innovations/getverify.php";
            // If user is a normal user, we filter the API request directly
            if (user && user.role === "user" && sessionEmail) {
                url += `?email=${sessionEmail}`;
            }
            // If user is admin, the URL remains without an email param to fetch all

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                if (user && user.role === "admin") {
                    // Admin: Set all fetched data for the 'Businesses' tab
                    setAllBusinessesData(data.data);

                    // Admin: Find their own specific business from the fetched data
                    const adminOwnBusiness = data.data.find((item: ApiBusinessItem) => item.email === sessionEmail);
                    setCurrentUserBusinessData(adminOwnBusiness || null); // Set to null if not found
                } else if (user && user.role === "user") {
                    // Normal User: Only their business should be returned by the API
                    // Do NOT set allBusinessesData as a normal user doesn't see it
                    setAllBusinessesData(null);

                    // Normal User: Set their specific business (first item if any, otherwise null)
                    const userOwnBusiness = data.data.length > 0 ? data.data[0] : null;
                    setCurrentUserBusinessData(userOwnBusiness);
                } else {
                    // Fallback for roles that are neither admin nor user, or if user object is not ready
                    setAllBusinessesData(null);
                    setCurrentUserBusinessData(null);
                }
            } else {
                // API returned status 'fail' or data is not an array
                setAllBusinessesData(null);
                setCurrentUserBusinessData(null);
            }
        } catch (error) {
            console.error("Error fetching business data:", error);
            setAllBusinessesData(null);
            setCurrentUserBusinessData(null);
            toast({
                title: "Error fetching business data",
                description: "Could not retrieve business records. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoadingBusinesses(false);
        }
    }, [user]);

    useEffect(() => {
        const userData = sessionStorage.getItem("RSEmail");

        if (!userData) {
            window.location.href = "/tools/auth/login";
            return;
        }
    }, [])

    useEffect(() => {
        const userData = sessionStorage.getItem("RSEmail");

        if (!userData) {
            window.location.href = "/tools/auth/login";
            return;
        }

        if (!isLoading && user) {
            fetchCreditData(userData);
            fetchInvoiceData(userData);
            fetchOrderData(userData);
            fetchBusinessData(userData);

            if (user.role === "admin") {
                fetchUserData();
            }
        }


    }, [isLoading, user, fetchCreditData, fetchInvoiceData, fetchOrderData, fetchUserData, fetchBusinessData]);

    useEffect(() => {
        if (creditData) {
            const pendingItems = creditData.filter(item => item.status === 'pending');

            const pendingCount = pendingItems.length;
            setPendingCreditCount(pendingCount);

            const totalAmount = pendingItems.reduce((sum, item) => {

                const amountValue = parseFloat(item.amount || '0');

                if (!isNaN(amountValue)) {
                    return sum + amountValue;
                }
                return sum;
            }, 0);

            setPendingCreditAmountTotal(totalAmount);
        } else {
            setPendingCreditCount(0);
            setPendingCreditAmountTotal(0);
        }
    }, [creditData]);

    const creditDataForPieChart = useMemo(() => {
        if (!creditData || creditData.length === 0) {
            return [];
        }

        let paidCount = 0;
        let pendingCount = 0;
        let overdueCount = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        creditData.forEach(item => {
            if (item.status.toLowerCase() === "paid") {
                paidCount++;
            } else if (item.status.toLowerCase() === "pending") {
                try {
                    const dueDate = new Date(item.due_date);
                    dueDate.setHours(0, 0, 0, 0);

                    if (isNaN(dueDate.getTime())) {
                        pendingCount++;
                    } else if (dueDate < today) {
                        overdueCount++;
                    } else {
                        pendingCount++;
                    }
                } catch (e) {
                    pendingCount++;
                }
            }
        });

        const totalCredits = paidCount + pendingCount + overdueCount;

        if (totalCredits === 0) {
            return [];
        }

        const data = [];

        if (paidCount > 0) {
            data.push({ name: "Paid", value: parseFloat(((paidCount / totalCredits) * 100).toFixed(1)), color: "#10B981" });
        }
        if (pendingCount > 0) {
            data.push({ name: "Pending", value: parseFloat(((pendingCount / totalCredits) * 100).toFixed(1)), color: "#F59E0B" });
        }
        if (overdueCount > 0) {
            data.push({ name: "Overdue", value: parseFloat(((overdueCount / totalCredits) * 100).toFixed(1)), color: "#EF4444" });
        }

        return data;

    }, [creditData]);

    const revenueData = [
        { month: "Jan", revenue: 45000, invoices: 12 },
        { month: "Feb", revenue: 52000, invoices: 15 },
        { month: "Mar", revenue: 48000, invoices: 13 },
        { month: "Apr", revenue: 61000, invoices: 18 },
        { month: "May", revenue: 55000, invoices: 16 },
        { month: "Jun", revenue: 67000, invoices: 21 }
    ];

    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId);
    }, []);

    return (
        <div className="w-full min-h-screen bg-white pt-[60px] sm:pt-[80px] overflow-scroll">

            <Header
                activeTab={activeTab}
                onTabChange={handleTabChange}
                businessData={currentUserBusinessData ? [currentUserBusinessData] : null}
            />

            <VerticalTabs activeTab={activeTab} onTabChange={handleTabChange} />

            <div className="container mx-auto px-4 py-8 sm:ml-[72px]">

                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">₦328,000</div>
                                <p className="text-xs text-gray-600 mt-1">+12% from last month</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-gray-600">Invoices Created</CardTitle>
                                    <Receipt className="h-4 w-4 text-green-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{totalInvoiceCount}</div>
                                <p className="text-xs text-gray-600 mt-1">+{weeklyInvoiceCount} this week</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-gray-600">Pending Credits</CardTitle>
                                    <CreditCard className="h-4 w-4 text-orange-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">₦{pendingCreditAmountTotal.toLocaleString('en-US')}</div>
                                <p className="text-xs text-gray-600 mt-1">{pendingCreditCount} {pendingCreditCount > 1 ? "customers" : "customer"}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-gray-600">Products Tracked</CardTitle>
                                    <Package className="h-4 w-4 text-purple-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">247</div>
                                <p className="text-xs text-gray-600 mt-1">+15 new items</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-sm">
                                <CardHeader className=" px-3 sm:px-6">
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        Revenue Trend
                                    </CardTitle>
                                    <CardDescription>Monthly revenue and invoice count</CardDescription>
                                </CardHeader>
                                <CardContent className=" px-3 sm:px-6">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="revenue" fill="#3B82F6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader className=" px-3 sm:px-6">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-green-600" />
                                        Credit Status
                                    </CardTitle>
                                    <CardDescription>Customer payment distribution</CardDescription>
                                </CardHeader>
                                <CardContent className="px-3 sm:px-6">
                                    {loadingCredits ? (
                                        <div className="flex justify-center items-center h-48">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                            <p className="ml-2 text-gray-600">Loading credit data...</p>
                                        </div>
                                    ) : creditDataForPieChart.length > 0 ? (
                                        <>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={creditDataForPieChart}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={120}
                                                        dataKey="value"
                                                    >
                                                        {creditDataForPieChart.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>

                                            <div className="flex justify-end gap-2 mt-2 pr-2">
                                                {creditDataForPieChart.map((entry, index) => (
                                                    <span
                                                        key={`legend-${index}`}
                                                        className="text-[10px] sm:text-xs px-2 py-1 rounded-sm text-white"
                                                        style={{
                                                            backgroundColor: entry.color,
                                                        }}
                                                    >
                                                        {entry.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-center text-gray-500 mt-4">
                                            No credit records found.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === "users" && (
                    <div className="space-y-6">
                        <User
                            users={userData}
                            loading={loadingUsers}
                            refetchUser={() => !isLoading && user && fetchUserData()}
                        />
                    </div>
                )}

                {activeTab === "businesses" && user?.role === "admin" && (
                    <div className="space-y-6">
                        <Businesses
                            businesses={allBusinessesData} // Admin sees all businesses
                            loading={loadingBusinesses}
                            refetchBusinesses={() => {
                                const userDataFromSession = sessionStorage.getItem("RSEmail");
                                if (!isLoading && user && userDataFromSession) {
                                    fetchBusinessData(userDataFromSession); // Refetching all data for admin
                                }
                            }}
                        />
                    </div>
                )}

                {activeTab === "invoices" && (
                    <div className="space-y-6">
                        <Invoice
                            invoices={invoiceData}
                            loading={loadingInvoices}
                            refetchInvoices={() => !isLoading && user && fetchInvoiceData(user.email)}
                        />
                    </div>
                )}

                {activeTab === "receipts" && (
                    <div className="space-y-6">
                        <Receipts
                            invoices={receiptData}
                            loading={loadingInvoices}
                            refetchInvoices={() => !isLoading && user && fetchInvoiceData(user.email)}
                        />
                    </div>
                )}

                {activeTab === "credits" && (
                    <div className="space-y-6">
                        <Credits
                            credits={creditData}
                            loading={loadingCredits}
                            refetchCredits={() => !isLoading && user && fetchCreditData(user.email)}
                        />
                    </div>
                )}

                {activeTab === "products" && (
                    <div className="space-y-6">
                        <div className="text-center py-12">
                            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Analytics Coming Soon</h3>
                            <p className="text-gray-600 mb-6">Track product performance, market trends, and inventory insights</p>
                            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                Enable Product Tracking
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === "inventory" && (
                    <div className="space-y-6"> {/* Apply space-y-6 directly */}
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Management Coming Soon</h3>
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="space-y-6">
                        <Orders
                            orders={orderData}
                            loading={loadingOrders}
                            refetchOrders={() => !isLoading && user && fetchOrderData(user.email)} // Pass the refetch function
                        />
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="space-y-6">
                        <Settings
                            businessData={currentUserBusinessData ? [currentUserBusinessData] : null}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;










