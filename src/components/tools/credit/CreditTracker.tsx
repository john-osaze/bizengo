"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Download, MessageCircle, CheckCircle, Clock, Brain, TrendingUp, AlertTriangle, Zap, Target, BarChart3, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GenerateCredit from "./GenerateCredit";
import { Search } from 'lucide-react';
import { FiSearch } from 'react-icons/fi';

interface ApiResponse {
    status: string;
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    data: ApiCreditItem[];
}

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

interface CreditRecord {
    id: string;
    customerName: string;
    customerPhone: string;
    amount: number;
    description: string;
    dateCreated: string;
    dueDate: string;
    status: "pending" | "paid" | "overdue" | "deleted";
    paymentProbability?: number;
    riskScore?: number;
    aiInsights?: string[];
}

// Interface for business info fetched from API
interface BusinessInfo {
    business_id: string;
    email: string;
    business_name: string;
    business_email: string;
    address: string;
    description: string;
    contact: string;
    identifier: string;
    logo: string; // URL to the logo
    number: string;
    status: string;
    reg_time: string;
    uptime: string;
    admin: string;
}


const mapApiCreditToCreditRecord = (apiItem: ApiCreditItem): CreditRecord => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(apiItem.due_date);
    dueDate.setHours(0, 0, 0, 0);

    let recordStatus: "pending" | "paid" | "overdue" | "deleted" = "pending";

    if (apiItem.status === "paid") {
        recordStatus = "paid";
    } else if (apiItem.status === "deleted") {
        recordStatus = "deleted";
    }
    else if (dueDate < today) {
        recordStatus = "overdue";
    } else {
        recordStatus = "pending";
    }


    return {
        id: apiItem.credit_id,
        customerName: apiItem.customer_name,
        customerPhone: apiItem.customer_phone,
        amount: parseFloat(apiItem.amount),
        description: apiItem.description,
        dateCreated: apiItem.date_created,
        dueDate: apiItem.due_date,
        status: recordStatus,
        paymentProbability: apiItem.payment_probability ? parseInt(apiItem.payment_probability) : undefined,
        riskScore: apiItem.risk_score ? parseInt(apiItem.risk_score) : undefined,
        aiInsights: [],
    };
};

export const CreditTracker = () => {
    const { toast } = useToast();
    const [credits, setCredits] = useState<CreditRecord[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // New states for business information
    const [businessName, setBusinessName] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [businessPhone, setBusinessPhone] = useState("");
    const [businessLogo, setBusinessLogo] = useState<string | null>(null);


    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        amount: "",
        description: "",
        dueDate: ""
    });

    const fetchData = useCallback(async () => {
        setLoaded(false);
        const rsemail = sessionStorage.getItem("RSEmail");

        if (!rsemail) {
            setLoaded(true); // Ensure loaded is true even if no email
            return;
        }

        // Fetch credit records
        try {
            const response = await fetch(`https://api.rootsnsquares.com/innovations/get-credit.php?email=${rsemail}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiResponse: ApiResponse = await response.json();

            if (apiResponse.status === "success" && Array.isArray(apiResponse.data)) {
                const transformedCredits: CreditRecord[] = apiResponse.data.map(mapApiCreditToCreditRecord);
                setCredits(transformedCredits);
                localStorage.setItem("credits", JSON.stringify(transformedCredits));
            } else if (apiResponse.status === "success" && apiResponse.data.length === 0) {
                setCredits([]);
                localStorage.removeItem("credits");
                toast({
                    title: "Info",
                    description: "No credit records found for this email on the server.",
                    variant: "default"
                });
            } else {
                setCredits([]);
                localStorage.removeItem("credits");
                toast({
                    title: "Error",
                    description: "Invalid data format from API.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Error fetching credits from API:", error);
            setCredits([]);
            localStorage.removeItem("credits");
            toast({
                title: "Error",
                description: `Error fetching credits: ${error instanceof Error ? error.message : String(error)}`,
                variant: "destructive"
            });
        } finally {
            setLoaded(true);
        }
    }, [toast]);

    // NEW useEffect for fetching business data
    useEffect(() => {
        const storedEmail = sessionStorage.getItem("RSEmail");

        if (storedEmail) {
            const fetchBusinessData = async () => {
                try {
                    const response = await fetch(`https://api.rootsnsquares.com/innovations/getverify.php?email=${storedEmail}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch business data.");
                    }
                    const data: { status: string; data: BusinessInfo[] } = await response.json();
                    if (data.status === "success" && data.data && data.data.length > 0) {
                        const businessInfo = data.data[0];
                        setBusinessName(businessInfo.business_name || "");
                        setBusinessAddress(businessInfo.address || "");
                        setBusinessPhone(businessInfo.contact || "");
                        setBusinessLogo(businessInfo.logo || null); // Set the business logo
                    } else {
                        // If no data or not success, clear business info or leave as default
                        setBusinessName("");
                        setBusinessAddress("");
                        setBusinessPhone("");
                        setBusinessLogo(null);
                        console.warn("No business data found for this email or API status not success.");
                    }
                } catch (error) {
                    console.error("Error fetching business data:", error);
                    setBusinessName("");
                    setBusinessAddress("");
                    setBusinessPhone("");
                    setBusinessLogo(null);
                    toast({
                        title: "Business Data Load Error",
                        description: "Could not automatically load your business details.",
                        variant: "destructive",
                    });
                }
            };
            fetchBusinessData();
        }
    }, [toast]); // Added toast to dependency array

    useEffect(() => {

        const storedCredits = localStorage.getItem("credits");
        if (storedCredits) {
            try {
                const parsedCredits: CreditRecord[] = JSON.parse(storedCredits);
                setCredits(parsedCredits);
            } catch (error) {
                console.error("Error parsing stored credits from localStorage:", error);
                localStorage.removeItem("credits");
            }
        }

        fetchData();
    }, [fetchData]);

    const filteredCredits = useMemo(() => {
        if (!credits) return [];

        return credits.filter(credit => {
            if (credit.status === 'deleted') return false;

            const lowerCaseSearchQuery = searchQuery.toLowerCase().replace(/,/g, '');
            const matchesName = credit.customerName.toLowerCase().includes(lowerCaseSearchQuery);
            const matchesAmount = credit.amount.toFixed(2).replace(/,/g, '').toLowerCase().includes(lowerCaseSearchQuery);

            return matchesName || matchesAmount;
        });
    }, [credits, searchQuery]);

    const generatePaymentPrediction = (credit: CreditRecord) => {
        const daysSinceCreated = Math.floor((new Date().getTime() - new Date(credit.dateCreated).getTime()) / (1000 * 3600 * 24));
        const daysUntilDue = Math.floor((new Date(credit.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

        let probability = 85;
        if (daysSinceCreated > 30) probability -= 20;
        if (daysUntilDue < 0) probability -= 30;
        if (credit.amount > 100000) probability -= 10;
        if (daysUntilDue > 14) probability += 10;

        return Math.max(20, Math.min(95, probability));
    };

    const generateRiskScore = (credit: CreditRecord) => {
        const daysSinceCreated = Math.floor((new Date().getTime() - new Date(credit.dateCreated).getTime()) / (1000 * 3600 * 24));
        const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(credit.dueDate).getTime()) / (1000 * 3600 * 24)));

        let riskScore = 25;
        if (daysOverdue > 0) riskScore += daysOverdue * 5;
        if (credit.amount > 50000) riskScore += 15;
        if (daysSinceCreated > 60) riskScore += 20;

        return Math.min(100, riskScore);
    };

    const generateAIInsights = (credit: CreditRecord) => {
        const insights = [];
        const riskScore = generateRiskScore(credit);
        const paymentProb = generatePaymentPrediction(credit);

        if (paymentProb > 80) {
            insights.push("High likelihood of payment based on customer history");
        } else if (paymentProb < 50) {
            insights.push("Consider offering payment plan or incentives");
        }

        if (riskScore > 70) {
            insights.push("High risk - immediate follow-up recommended");
        } else if (riskScore < 30) {
            insights.push("Low risk customer with good payment behavior");
        }

        const daysUntilDue = Math.floor((new Date(credit.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        if (daysUntilDue <= 3 && daysUntilDue > 0) {
            insights.push("Payment due soon - send friendly reminder");
        }

        return insights;
    };

    const addCredit = async () => {
        if (!formData.customerName || !formData.amount) {
            toast({
                title: "Error",
                description: "Please fill in customer name and amount",
                variant: "destructive"
            });
            return;
        }

        const token = Math.random().toString(36).slice(-5);

        const newCredit: CreditRecord = {
            id: `CREDIT${Date.now().toString()}${token}`,
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            amount: parseFloat(formData.amount),
            description: formData.description,
            dateCreated: new Date().toISOString().split('T')[0],
            dueDate: formData.dueDate,
            status: "pending"
        };

        newCredit.paymentProbability = generatePaymentPrediction(newCredit);
        newCredit.riskScore = generateRiskScore(newCredit);
        newCredit.aiInsights = generateAIInsights(newCredit);

        const rsemail = sessionStorage.getItem("RSEmail");

        if (rsemail) {

            const payload = {
                email: rsemail,
                credit_id: newCredit.id,
                customer_name: newCredit.customerName,
                customer_phone: newCredit.customerPhone,
                amount: newCredit.amount,
                description: newCredit.description,
                date_created: newCredit.dateCreated,
                due_date: newCredit.dueDate,
                status: newCredit.status,
                payment_probability: newCredit.paymentProbability,
                risk_score: newCredit.riskScore,
            };

            try {
                const response = await fetch("https://api.rootsnsquares.com/innovations/credit.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();

                setCredits([...credits, newCredit]);
                localStorage.setItem("credits", JSON.stringify([...credits, newCredit]));
                setFormData({
                    customerName: "",
                    customerPhone: "",
                    amount: "",
                    description: "",
                    dueDate: ""
                });
                setShowForm(false);

                toast({
                    title: "Credit Added with AI Analysis",
                    description: `Credit record for ${formData.customerName} has been added with risk assessment`,
                    variant: "default"
                });


            } catch (error) {
                console.error("Error sending credit to the server:", error);
                toast({
                    title: "Error",
                    description: "Failed to add credit. Please try again.",
                    variant: "destructive"
                });
                return;
            }
        } else {
            setCredits([...credits, newCredit]);
            localStorage.setItem("credits", JSON.stringify([...credits, newCredit]));

            setFormData({
                customerName: "",
                customerPhone: "",
                amount: "",
                description: "",
                dueDate: ""
            });
            setShowForm(false);

            toast({
                title: "Credit Added with AI Analysis",
                description: `Credit record for ${formData.customerName} has been added with risk assessment`,
                variant: "default"
            });
        }
    };

    const markAsPaid = async (id: string) => {
        const rsemail = sessionStorage.getItem("RSEmail");

        if (rsemail) {
            const payload = {
                credit_id: id,
                status: "paid",
                admin: "admin@businesskits.com"
            };

            try {
                const response = await fetch("https://api.rootsnsquares.com/innovations/update-credit.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();

                setCredits(credits.map(credit =>
                    credit.id === id ? { ...credit, status: "paid" as const } : credit
                ));
                const updatedCredits = credits.map(credit =>
                    credit.id === id ? { ...credit, status: "paid" as const } : credit
                );
                localStorage.setItem("credits", JSON.stringify(updatedCredits));
                toast({
                    title: "Payment Recorded",
                    description: "Credit has been marked as paid",
                });

            } catch (error) {
                console.error("Error updating credit status:", error);
                toast({
                    title: "Error",
                    description: "Failed to update credit status. Please try again.",
                    variant: "destructive"
                });
                return;
            }
        } else {
            setCredits(credits.map(credit =>
                credit.id === id ? { ...credit, status: "paid" as const } : credit
            ));
            const updatedCredits = credits.map(credit =>
                credit.id === id ? { ...credit, status: "paid" as const } : credit
            );
            localStorage.setItem("credits", JSON.stringify(updatedCredits));

            toast({
                title: "Payment Recorded",
                description: "Credit has been marked as paid",
            });
        }
    };

    const deleteCredit = async (id: string) => {
        const rsemail = sessionStorage.getItem("RSEmail");

        if (rsemail) {

            try {
                const response = await fetch("https://api.rootsnsquares.com/innovations/delete-credit.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ credit_id: id, admin: "admin@businesskits.com", status: "deleted", })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();

                setCredits(credits.filter(credit => credit.id !== id));
                localStorage.setItem("credits", JSON.stringify(credits.filter(credit => credit.id !== id)));
                toast({
                    title: "Credit Deleted",
                    description: "Credit record has been removed",
                });


            } catch (error) {
                console.error("Error deleting credit:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete credit. Please try again.",
                    variant: "destructive"
                });
                return;
            }
        } else {
            setCredits(credits.filter(credit => credit.id !== id));
            localStorage.setItem("credits", JSON.stringify(credits.filter(credit => credit.id !== id)));

            toast({
                title: "Credit Deleted",
                description: "Credit record has been removed",
            });
        }
    };

    const sendSmartReminder = (credit: CreditRecord) => {
        const paymentProb = credit.paymentProbability || 50;
        const riskScore = credit.riskScore || 25;

        let message = `Hi ${credit.customerName}, `;

        if (paymentProb > 70) {
            message += `I hope you're doing well. This is a gentle reminder about your outstanding balance of ₦${credit.amount.toLocaleString()} for ${credit.description}. Based on our records, you've been a reliable customer, so I'm confident you'll settle this soon. `;
        } else if (riskScore > 60) {
            message += `I wanted to reach out regarding your overdue payment of ₦${credit.amount.toLocaleString()} for ${credit.description}. I understand circumstances can change, and I'm here to work with you on a payment plan if needed. `;
        } else {
            message += `this is a friendly reminder about your outstanding balance of ₦${credit.amount.toLocaleString()} for ${credit.description}. `;
        }

        message += `Please let me know when you can make the payment. Thank you for your business!`;

        const whatsappUrl = `https://wa.me/${credit.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        toast({
            title: "Smart Reminder Sent",
            description: "AI-optimized message sent based on customer risk profile",
        });
    };

    const totalPending = credits
        .filter(credit => credit.status === "pending")
        .reduce((sum, credit) => sum + credit.amount, 0);

    const totalPaid = credits
        .filter(credit => credit.status === "paid")
        .reduce((sum, credit) => sum + credit.amount, 0);

    const averagePaymentProbability = credits.length > 0
        ? credits.reduce((sum, credit) => sum + (credit.paymentProbability || 0), 0) / credits.length
        : 0;

    const highRiskCredits = credits.filter(credit => (credit.riskScore || 0) > 60).length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "text-green-600 bg-green-100";
            case "overdue": return "text-red-600 bg-red-100";
            default: return "text-yellow-600 bg-yellow-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "paid": return <CheckCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getRiskColor = (riskScore: number) => {
        if (riskScore >= 70) return "text-red-600 bg-red-100";
        if (riskScore >= 40) return "text-yellow-600 bg-yellow-100";
        return "text-green-600 bg-green-100";
    };

    const getProbabilityColor = (probability: number) => {
        if (probability >= 70) return "text-green-600";
        if (probability >= 50) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Intelligent Credit Tracker</h1>
                <p className="text-muted-foreground">AI-powered payment predictions and smart risk assessment</p>
            </div>

            <div className="hidden sm:grid md:grid-cols-3 gap-4">
                <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-4 text-center">
                        <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-blue-900">Payment Prediction</h3>
                        <p className="text-sm text-blue-700">AI analyzes payment likelihood</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-4 text-center">
                        <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-purple-900">Smart Reminders</h3>
                        <p className="text-sm text-purple-700">Personalized reminder messages</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-orange-200 bg-orange-50">
                    <CardContent className="p-4 text-center">
                        <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-orange-900">Risk Assessment</h3>
                        <p className="text-sm text-orange-700">Automated risk scoring</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">₦{totalPending.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {credits.filter(c => c.status === "pending").length} customers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {credits.filter(c => c.status === "paid").length} payments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Payment Probability</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getProbabilityColor(averagePaymentProbability)}`}>
                            {averagePaymentProbability.toFixed(0)}%
                        </div>
                        <Progress value={averagePaymentProbability} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">High Risk Accounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{highRiskCredits}</div>
                        <p className="text-xs text-muted-foreground">
                            Require immediate attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button onClick={() => setShowForm(!showForm)} >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Credit
                </Button>
                <GenerateCredit
                    credits={credits}
                    businessName={businessName}
                    businessAddress={businessAddress}
                    businessPhone={businessPhone}
                    businessLogo={businessLogo} // Pass the business logo here
                />
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Credit Record</CardTitle>
                        <CardDescription>AI will automatically analyze risk and payment probability</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="customerName">Customer Name</Label>
                                <Input
                                    id="customerName"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    placeholder="e.g., Mrs. Adebayo"
                                />
                            </div>
                            <div>
                                <Label htmlFor="customerPhone">Phone Number</Label>
                                <Input
                                    id="customerPhone"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    placeholder="e.g., +234 703 123 4567"
                                />
                            </div>
                            <div>
                                <Label htmlFor="amount">Amount Owed (₦)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="e.g., 15000"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g., 3 Ankara dresses for wedding"
                                rows={2}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={addCredit}>Add Credit with AI Analysis</Button>
                            <Button onClick={() => setShowForm(false)} variant="outline">Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="px-3 sm:px-6">
                    <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                        <BarChart3 className="h-5 w-5" />
                        Credit Records with AI Insights
                    </CardTitle>
                    <CardDescription>AI-powered risk assessment and payment predictions</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                    <div className="relative w-full sm:mb-4">
                        <input
                            type="text"
                            placeholder="Search by customer name or description..."
                            className="w-full pl-10 mb-4 p-2 text-sm  border border-gray-300 rounded-lg mt-3 focus:outline-none focus:ring-4 focus:ring--blue-200 focus:border-primary transition duration-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />

                    </div>
                    {filteredCredits.length === 0 ? (
                        <div className="text-center py-12">
                            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-muted-foreground">No credit records yet. Add your first credit record to see AI insights.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCredits.map((credit) => (
                                <div key={credit.id} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 sm:mb-2">
                                                <h3 className="font-semibold">{credit.customerName}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(credit.status)}`}>
                                                    {getStatusIcon(credit.status)}
                                                    {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-xl sm:text-2xl font-bold text-primary sm:mb-2">₦{credit.amount.toLocaleString()}</p>
                                            {credit.description && (
                                                <p className="text-muted-foreground sm:mb-2">{credit.description}</p>
                                            )}
                                            <div className="flex gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                                                <span>Created: {new Date(credit.dateCreated).toLocaleDateString()}</span>
                                                {credit.dueDate && (
                                                    <span>Due: {new Date(credit.dueDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-1">
                                            {credit.status === "pending" && (
                                                <>
                                                    <div className="hidden sm:flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => markAsPaid(credit.id)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            Mark Paid
                                                        </Button>
                                                        {credit.customerPhone && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => sendSmartReminder(credit)}
                                                            >
                                                                <Zap className="h-4 w-4 mr-1" />
                                                                Smart Reminder
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="sm:hidden">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-4 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => markAsPaid(credit.id)}>
                                                                    Mark Paid
                                                                </DropdownMenuItem>
                                                                {credit.customerPhone && (
                                                                    <DropdownMenuItem onClick={() => sendSmartReminder(credit)}>
                                                                        Smart Reminder
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteCredit(credit.id)}
                                                className="px-1"
                                            >
                                                <Trash2 className="h-4 w-4 " />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <Target className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium">Payment Probability</span>
                                            </div>
                                            <div className={`text-lg font-bold ${getProbabilityColor(credit.paymentProbability || 0)}`}>
                                                {credit.paymentProbability || 0}%
                                            </div>
                                            <Progress value={credit.paymentProbability || 0} className="mt-1" />
                                        </div>

                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                                <span className="text-sm font-medium">Risk Score</span>
                                            </div>
                                            <Badge className={getRiskColor(credit.riskScore || 0)}>
                                                {credit.riskScore || 0}/100
                                            </Badge>
                                        </div>

                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <Brain className="h-4 w-4 text-purple-600" />
                                                <span className="text-sm font-medium">AI Status</span>
                                            </div>
                                            <Badge variant="secondary">
                                                Analysis Complete
                                            </Badge>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};