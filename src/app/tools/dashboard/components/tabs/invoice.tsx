"use client"
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Receipt, AlertCircle, CheckCircle, Clock, FileText, Search, Calendar as CalendarIcon, Download, Trash2,
    PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ApiInvoiceItem {
    id: string;
    invoice_id: string,
    amount: string,
    email: string;
    pdf_url: string;
    type: string;
    fullname: string;
    phone: string;
    date: string;
    template: string;
    uptime: string;
    admin: string | null;
}

interface InvoiceProps {
    invoices: ApiInvoiceItem[] | null;
    loading: boolean;
    refetchInvoices: () => void;
}

interface ProcessedInvoiceItem {
    originalId: string;
    invoiceIdDisplay: string;
    customer: string;
    amount: string;
    date: string;
    pdfUrl: string;
    originalDate: Date;
    template: string;
}

export default function Invoice({ invoices, loading, refetchInvoices }: InvoiceProps) {
    const { isLoading } = useAuth();
    const [searchText, setSearchText] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const router = useRouter();


    const processInvoiceItemForDisplay = (item: ApiInvoiceItem): ProcessedInvoiceItem => {
        const first3 = item.invoice_id.slice(0, 3);

        const last5 = item.invoice_id.slice(-5);

        const combinedId = first3 + last5;
        return {
            originalId: item.invoice_id,
            invoiceIdDisplay: combinedId,
            customer: item.fullname,
            amount: item.amount,
            template: item.template,
            date: format(new Date(item.date), "PPP"),
            pdfUrl: item.pdf_url,
            originalDate: new Date(item.date)
        };
    };

    const filteredInvoices = useMemo(() => {
        if (!invoices) return [];

        let processed = invoices.map(processInvoiceItemForDisplay);

        if (searchText) {
            const lowerCaseSearchText = searchText.toLowerCase().replace(/,/g, '');
            processed = processed.filter(item => {
                const customerName = item.customer.toLowerCase();
                const amountString = item.amount.toLocaleString().replace(/,/g, '').toLowerCase();
                const invoiceId = item.invoiceIdDisplay.toLowerCase();
                return customerName.includes(lowerCaseSearchText) ||
                    amountString.includes(lowerCaseSearchText) ||
                    invoiceId.includes(lowerCaseSearchText);
            });
        }

        if (selectedDate) {
            processed = processed.filter(item => {
                return isSameDay(item.originalDate, selectedDate);
            });
        }

        return processed;
    }, [invoices, searchText, selectedDate]);


    const handleDeleteInvoice = async (invoiceId: string) => {
        toast({
            title: "Deleting invoice record...",
            description: "Please wait while we remove this invoice.",
            variant: "default",
            duration: 9000
        });
        try {
            const response = await fetch("https://api.rootsnsquares.com/innovations/delete-record.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    invoice_id: invoiceId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status} `);
            }

            const data = await response.json();
            if (data.status === "success") {
                toast({
                    title: "Success!",
                    description: data.message || "Invoice record successfully deleted.",
                    variant: "default",
                });
                refetchInvoices();
            } else {
                toast({
                    title: "Failed to delete invoice",
                    description: data.message || "An unknown error occurred.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: `Failed to delete invoice: ${error.message} `,
                variant: "destructive",
            });
            console.error("Error deleting invoice:", error);
        }
    };


    if (loading || isLoading) {
        return (
            <Card className="border-0 min-h-[90vh] shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Recent Invoices
                    </CardTitle>
                    <CardDescription>Your latest invoice activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">Loading invoice records...</div>
                </CardContent>
            </Card>
        );
    }

    if (!invoices || invoices.length === 0) {
        return (
            <Card className="border-0 min-h-[90vh] shadow-none">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 px-3 sm:px-6">
                    <div>
                        <CardTitle className="flex items-center gap-2 sm:mb-2 text-xl sm:text-2xl">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Recent Invoices
                        </CardTitle>
                        <CardDescription>Your latest invoice activity</CardDescription>
                    </div>
                    <Button variant="default" size="sm" onClick={() => router.push("/tools/invoice-generator")} className="shrink-0 mt-0">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create invoice
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">No invoice records yet.</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0  shadow-none min-h-[90vh]">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 px-3 sm:px-6">
                <div>
                    <CardTitle className="flex items-center gap-2 sm:mb-2 text-xl sm:text-2xl">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Recent Invoices
                    </CardTitle>
                    <CardDescription>Your latest invoice activity</CardDescription>
                </div>
                <Button variant="default" size="sm" onClick={() => router.push("/tools/invoice-generator")} className="shrink-0 mt-0">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create invoice
                </Button>
            </CardHeader>

            <CardContent className=' px-3 sm:px-6'>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">

                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by name, ID, or amount..."
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
                                {selectedDate ? format(selectedDate, "PPP") : <span>Filter by Date</span>}
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
                    {filteredInvoices.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No matching invoice records found.</div>
                    ) : (
                        filteredInvoices.map((invoice) => (
                            <div key={invoice.pdfUrl} className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Receipt className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{invoice.customer}</p>
                                        <p className="text-sm text-gray-600">{invoice.invoiceIdDisplay} • {invoice.date}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-0 sm:ml-auto">
                                    <p className="font-semibold text-gray-900">₦{invoice.amount.toLocaleString()}</p>
                                    <Badge
                                        variant="default"
                                        className="bg-green-100 text-green-700"
                                    >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {invoice.template}
                                    </Badge>
                                    <div className="flex items-center gap-1 ml-auto sm:ml-4">

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            title="Download Invoice PDF"

                                        >
                                            <a href={invoice.pdfUrl} target="_blank" download={`${invoice.invoiceIdDisplay}.pdf`} rel="noopener noreferrer">
                                                <Download className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                                            </a>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteInvoice(invoice.originalId)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete Invoice Record"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}