"use client";
import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Download } from "lucide-react";

// Redefine interfaces here assuming types/credit.ts is not directly modified for this response
// In a real app, you would import these from '@/types/credit'
export interface CreditRecordItem {
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

export interface CreditRecordData {
    credits: CreditRecordItem[];
    totalPending: number;
    totalCollected: number;
    generationDate: string;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessLogo?: string | null; // <--- ADDED HERE
}

export type CreditRecordPdfGeneratorFunction = (data: CreditRecordData) => Promise<Blob>;

import { generateCreditRecordPdf } from "./generation/generateCreditPdf";
import { formatDate } from "../invoice/generation/pdfUtils"; // Assuming this utility exists

interface CreditReportProps {
    credits: CreditRecordItem[];
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessLogo?: string | null; // <--- ADDED AS PROP
}

const CreditReport = ({ credits, businessName, businessAddress, businessPhone, businessLogo }: CreditReportProps) => {
    const { toast } = useToast();

    const calculateTotals = () => {
        let totalPending = 0;
        let totalCollected = 0;

        credits.forEach((credit) => {
            if (credit.status === "pending") {
                totalPending += credit.amount;
            } else if (credit.status === "paid") {
                totalCollected += credit.amount;
            }
        });

        return { totalPending, totalCollected };
    };

    const { totalPending, totalCollected } = calculateTotals();

    const downloadPDF = async () => {
        try {
            const creditReportData: CreditRecordData = {
                credits: credits,
                totalPending: totalPending,
                totalCollected: totalCollected,
                generationDate: formatDate(new Date()),
                businessName: businessName,
                businessAddress: businessAddress,
                businessPhone: businessPhone,
                businessLogo: businessLogo, // <--- PASS THE LOGO DATA
            };

            const pdfBlob: Blob = await generateCreditRecordPdf(creditReportData);
            const url = URL.createObjectURL(pdfBlob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `CreditReport-${new Date().toISOString()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
                title: "PDF Generated",
                description: "Credit report has been generated successfully!",
            });

        } catch (error) {
            console.error("Error generating PDF:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = `Failed to generate PDF: ${error.message}`;
            }
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };


    return (
        <div>
            <Button onClick={downloadPDF} variant="outline" className="bg-white w-full">
                <Download className="h-4 w-4 mr-2" />
                Export<span className=' hidden sm:inline'> Credit</span> Record
            </Button>
        </div>
    );
};

export default CreditReport;