"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { CalculationReportData, ItemCalculationData } from "@/types/calculator"; // Import both interfaces
import { generateCalculationReportPdf } from './generation/generateCalculationPdf';
import { formatDate } from '../invoice/generation/pdfUtils'; // Ensure this path is correct

// Updated interface to match the properties expected from calculator.tsx
// This aligns with the new CalculationReportData structure (excluding generationDate)
interface CalculationReportProps {
    profitMarginNum: number;
    shippingCostNum: number;
    otherExpensesNum: number;
    items: ItemCalculationData[]; // Array of calculated item data
    totalItemsBaseCost: number;
    totalItemsProfit: number;
    totalItemsRevenueBeforeGlobalExpenses: number;
    totalExpenditure: number;
    finalSuggestedSellingPrice: number;
    overallNetProfit: number;
    businessName?: string; // New
    businessAddress?: string; // New
    businessPhone?: string; // New
    businessLogo?: string | null; // New
}

const GenerateCalculator = (props: CalculationReportProps) => {

    const { toast } = useToast();

    const downloadPDF = async () => {
        try {
            // Construct the complete CalculationReportData object
            const calculationData: CalculationReportData = {
                ...props, // Spread all props which now match CalculationReportData's fields
                generationDate: formatDate(new Date()),
                businessName: props.businessName, // Ensure these are explicitly passed
                businessAddress: props.businessAddress,
                businessPhone: props.businessPhone,
                businessLogo: props.businessLogo, // Pass the logo
            };

            const pdfBlob: Blob = await generateCalculationReportPdf(calculationData);
            const url = URL.createObjectURL(pdfBlob);

            const a = document.createElement('a');
            a.href = url;
            // Generate a more readable filename
            a.download = `CalculationReport-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Clean up the URL object

            toast({
                title: "PDF Generated",
                description: "Calculation report has been generated successfully!",
            });

        } catch (error) {
            console.error("Error generating PDF:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = `Failed to generate PDF: ${error.message}`; // Provide more specific error info
            }
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Smart Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button onClick={downloadPDF} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Calculation Report
                    </Button>
                </CardContent>
            </Card>
        </>
    );
};

export default GenerateCalculator;