"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from "jspdf";

// Re-define interfaces locally to ensure type compatibility without explicit types/inventory.ts modification
// In a real application, these should be imported from '@/types/inventory'
export interface InventoryItemPdf {
    id: number | string;
    name: string;
    model: string;
    currentStock: number;
    minStock: number;
    unitPrice: number;
    category: string;
    lastRestocked: string;
    salesThisMonth: number;
}

export interface OrderPdf {
    id: string;
    supplier: string;
    items: string;
    status: string;
    expectedDelivery: string;
    totalValue: number;
}

// Base report data interface
interface BaseReportData {
    generationDate: string;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessLogo?: string | null; // <--- NEW: businessLogo
}

export interface InventoryReportData extends BaseReportData {
    reportType: 'inventory';
    inventoryItems: InventoryItemPdf[];
}

export interface OrderReportData extends BaseReportData {
    reportType: 'orders';
    orders: OrderPdf[];
}

export type InventoryAndOrderReportData = InventoryReportData | OrderReportData;


import { generateInventoryOrderPdf } from './generation/generateInventoryPdf';
import { formatDate } from '../invoice/generation/pdfUtils'; // Ensure this path is correct

interface InventoryReportProps {
    inventoryItems: InventoryItemPdf[];
    orders: OrderPdf[];
    reportType: 'inventory' | 'orders';
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessLogo?: string | null; // <--- ADDED AS PROP
}

const GenerateInventory = ({
    inventoryItems,
    orders,
    reportType,
    businessName,
    businessAddress,
    businessPhone,
    businessLogo // Destructure the new prop
}: InventoryReportProps) => {

    const { toast } = useToast();

    const downloadPDF = async () => {
        try {
            let reportData: InventoryAndOrderReportData;
            const currentGenerationDate = formatDate(new Date());

            if (reportType === 'inventory') {
                reportData = {
                    reportType: 'inventory',
                    inventoryItems: inventoryItems,
                    generationDate: currentGenerationDate,
                    businessName,
                    businessAddress,
                    businessPhone,
                    businessLogo // Pass the logo
                };
            } else {
                reportData = {
                    reportType: 'orders',
                    orders: orders,
                    generationDate: currentGenerationDate,
                    businessName,
                    businessAddress,
                    businessPhone,
                    businessLogo // Pass the logo
                };
            }

            const pdfBlob: Blob = await generateInventoryOrderPdf(reportData);
            const url = URL.createObjectURL(pdfBlob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType === 'inventory' ? "Inventory" : "Orders"} Report-${new Date().toISOString()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
                title: "PDF Generated",
                description: `${reportType === 'inventory' ? "Inventory" : "Orders"} report has been generated successfully!`,
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
        <>
            <Button variant="outline" onClick={downloadPDF}>
                {reportType === 'inventory' ? (
                    <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Inventory
                    </>
                ) : (
                    <>
                        <FileText className="h-4 w-4 mr-2" />
                        Export Orders
                    </>
                )}
            </Button>

        </>
    );
};

export default GenerateInventory;