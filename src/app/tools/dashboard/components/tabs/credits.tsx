"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, CheckCircle, Trash2, Search, Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import CreditReport from '@/components/tools/credit/GenerateCredit';
import { CreditRecordItem } from '@/types/credit';
import { useAuth } from '@/context/AuthContext';

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

interface CreditsProps {
    credits: ApiCreditItem[] | null;
    loading: boolean;
    refetchCredits: () => void;
}

export default function Credits({ credits, loading, refetchCredits }: CreditsProps) {
    const { isLoading } = useAuth();
    const [searchText, setSearchText] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const router = useRouter();

    const ADMIN_EMAIL = "admin@businesskits.com";

    const mappedCredits: CreditRecordItem[] = useMemo(() => {
        if (!credits) {
            return [];
        }

        return credits.map(apiItem => ({
            id: apiItem.id,
            customerName: apiItem.customer_name,
            customerPhone: apiItem.customer_phone,
            amount: parseFloat(apiItem.amount),
            description: apiItem.description,
            dueDate: apiItem.due_date,
            dateCreated: apiItem.date_created,
            status: apiItem.status,
            riskScore: parseFloat(apiItem.risk_score),
            paymentProbability: parseFloat(apiItem.payment_probability),
            aiInsights: [],
        }));
    }, [credits]);

    const processCreditItemForDisplay = (item: ApiCreditItem) => {
        const amount = parseFloat(item.amount);

        const dueDate = new Date(item.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let daysInfo = "";
        if (diffDays === 0) {
            daysInfo = "Due today";
        } else if (diffDays > 0) {
            daysInfo = `${diffDays} day${diffDays !== 1 ? 's' : ''} to due date`;
        } else {
            daysInfo = `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
        }

        const riskScore = parseInt(item.risk_score);
        let risk: "low" | "medium" | "high";
        if (riskScore <= 30) {
            risk = "low";
        } else if (riskScore > 30 && riskScore <= 70) {
            risk = "medium";
        } else {
            risk = "high";
        }

        return {
            name: item.customer_name,
            amount: amount,
            daysInfo: daysInfo,
            risk: risk,
            rawRiskScore: riskScore,
            status: item.status,
            dueDate: dueDate,
        };
    };

    const filteredCredits = useMemo(() => {
        if (!credits) return [];

        let filtered = credits;

        filtered = filtered.filter(item => item.status !== "deleted");

        if (searchText) {
            const lowerCaseSearchText = searchText.toLowerCase().replace(/,/g, '');
            filtered = filtered.filter(item => {
                const customerName = item.customer_name.toLowerCase();
                const amountString = parseFloat(item.amount).toFixed(2).replace(/,/g, '').toLowerCase();
                return customerName.includes(lowerCaseSearchText) ||
                    amountString.includes(lowerCaseSearchText);
            });
        }

        if (selectedDate) {
            filtered = filtered.filter(item => {
                const itemDueDate = new Date(item.due_date);
                return isSameDay(itemDueDate, selectedDate);
            });
        }

        return filtered;
    }, [credits, searchText, selectedDate]);

    const handleMarkAsPaid = async (creditId: string) => {
        toast({
            title: "Updating credit status...",
            description: "Please wait while we mark this credit as paid.",
            variant: "default",
            duration: 9000
        });
        try {
            const response = await fetch("https://api.rootsnsquares.com/innovations/update-credit.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credit_id: creditId,
                    status: "paid",
                    admin: ADMIN_EMAIL,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === "success") {
                toast({
                    title: "Success!",
                    description: data.message || "Credit successfully marked as paid.",
                    variant: "default",
                });
                refetchCredits();
            } else {
                toast({
                    title: "Failed to update credit",
                    description: data.message || "An unknown error occurred.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: `Failed to mark credit as paid: ${error.message}`,
                variant: "destructive",
            });
            console.error("Error marking credit as paid:", error);
        }
    };

    const handleDeleteCredit = async (creditId: string) => {
        toast({
            title: "Deleting credit record...",
            description: "Please wait while we remove this credit.",
            variant: "default",
            duration: 9000
        });
        try {
            const response = await fetch("https://api.rootsnsquares.com/innovations/delete-credit.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credit_id: creditId,
                    status: "deleted",
                    admin: ADMIN_EMAIL,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === "success") {
                toast({
                    title: "Success!",
                    description: data.message || "Credit record successfully deleted.",
                    variant: "default",
                });
                refetchCredits();
            } else {
                toast({
                    title: "Failed to delete credit",
                    description: data.message || "An unknown error occurred.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: `Failed to delete credit: ${error.message}`,
                variant: "destructive",
            });
            console.error("Error deleting credit:", error);
        }
    };

    if (loading || isLoading) {
        return (
            <Card className="border-0  min-h-[90vh]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2  text-xl sm:text-2xl">
                        <CreditCard className="h-5 w-5 text-orange-600" />
                        Credit Management
                    </CardTitle>
                    <CardDescription>Tracking customer payments and credit risks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">Loading credit records...</div>
                </CardContent>
            </Card>
        );
    }

    if (!credits || credits.length === 0) {
        return (
            <Card className="border-0  min-h-[90vh]">
                <CardHeader className="flex flex-col sm:flex-row items-start justify-between space-y-2 sm:space-y-0 pb-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 sm:mb-2 text-xl sm:text-2xl">
                            <CreditCard className="h-5 w-5 text-orange-600" />
                            Credit Management
                        </CardTitle>
                        <CardDescription>Track customer payments and credit risks</CardDescription>
                    </div>
                    <Button variant="default" size="sm" onClick={() => router.push("/tools/credit-tracker")} className="shrink-0 mt-0">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add credit record
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">No credit record yet.</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 min-h-[90vh] shadow-none">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 px-3 sm:px-6">
                <div>
                    <CardTitle className="flex items-center gap-2 sm:mb-2 text-xl sm:text-2xl">
                        <CreditCard className="h-5 w-5 text-orange-600" />
                        Credit Management
                    </CardTitle>
                    <CardDescription>Track customer payments and credit risks</CardDescription>
                </div>
                <div className='flex sm:items-center gap-2'>
                    <Button variant="default" size="sm" onClick={() => router.push("/tools/credit-tracker")} className="shrink-0 mt-0">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add<span className=' hidden sm:inline'> credit</span> record
                    </Button>
                    <CreditReport credits={mappedCredits} />
                </div>
            </CardHeader>
            <CardContent className=' px-3 sm:px-6'>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">

                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by name or amount..."
                            className="pl-9"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-[280px] justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Filter by Due Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-4">
                    {filteredCredits.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No matching credit records found.</div>
                    ) : (
                        filteredCredits.map((apiItem) => {
                            const processedCustomer = processCreditItemForDisplay(apiItem);
                            return (
                                <div key={apiItem.credit_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Users className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{processedCustomer.name}</p>
                                            <p className="text-sm text-gray-600">{processedCustomer.daysInfo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-4">
                                        <p className="font-semibold text-gray-900">₦{processedCustomer.amount.toLocaleString()}</p>
                                        {apiItem.status === "paid" ? (
                                            <Badge
                                                variant="default"
                                                className="bg-green-100 text-green-700"
                                            >
                                                paid
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant={
                                                    processedCustomer.risk === "low" ? "default" :
                                                        processedCustomer.risk === "medium" ? "secondary" :
                                                            "destructive"
                                                }
                                                className={
                                                    processedCustomer.risk === "low" ? "bg-green-100 text-green-700" :
                                                        processedCustomer.risk === "medium" ? "bg-yellow-100 text-yellow-700" :
                                                            "bg-red-100 text-red-700"
                                                }
                                            >
                                                {processedCustomer.risk} risk
                                            </Badge>
                                        )}
                                        <div className="flex items-center sm:gap-1 sm:ml-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleMarkAsPaid(apiItem.credit_id)}
                                                className="text-green-500 hover:text-green-700"
                                                title="Mark as Paid"
                                                disabled={apiItem.status === "paid"}
                                            >
                                                <CheckCircle className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteCredit(apiItem.credit_id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete Credit Record"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}