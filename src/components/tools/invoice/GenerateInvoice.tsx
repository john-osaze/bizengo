"use client";
import { jsPDF } from "jspdf";
import { useEffect, useRef, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    QrCode,
    X,
    Loader2,
    Save,
    Mail
} from "lucide-react"
import { toast } from "@/components/ui/use-toast";
import { QRCodeCanvas } from 'qrcode.react';
// Assuming InvoiceItem is imported or defined consistently from InvoiceGenerator.tsx
import { InvoiceItem } from "./InvoiceGenerator"; // Adjust import path if needed

// Update InvoiceData interface to include businessLogo
export interface InvoiceData {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessLogo: string | null; // Added businessLogo
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    items: InvoiceItem[];
    discount: number | null;
    tax: number | null;
    total: number;
    invoiceType: "invoice" | "receipt" | "";
    bankName: string;
    accountName: string;
    accountNumber: string;
}

// PdfGeneratorFunction type remains the same
export type PdfGeneratorFunction = (data: InvoiceData) => Promise<Blob>;

import { generateModernPdf } from "./generation/generateModernPdf";
import { generateMinimalPdf } from "./generation/generateMinimalPdf";
import { generateClassicPdf } from "./generation/generateClassicPdf";
import { generateCreativePdf } from "./generation/generateCreativePdf";
import { formatDate } from "./generation/pdfUtils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


const GenerateInvoice = ({ // Renamed from InvoiceGenerator to GenerateInvoice to avoid conflict
    invoiceType,
    businessName,
    businessAddress,
    businessPhone,
    businessLogo, // Accept businessLogo as prop
    customerName,
    customerAddress,
    customerPhone,
    bankName,
    accountNumber,
    accountName,
    items,
    discount,
    tax,
    selectedTemplate,
    total
}: {
    invoiceType: "invoice" | "receipt" | "";
    businessName: string,
    businessAddress: string,
    businessPhone: string,
    businessLogo: string | null, // Prop type for businessLogo
    customerName: string,
    customerAddress: string,
    customerPhone: string,
    bankName: string,
    accountNumber: string,
    accountName: string,
    items: InvoiceItem[],
    discount: number | null,
    tax: number | null,
    selectedTemplate: string,
    total: number
}) => {

    const [qrCode, setQrCode] = useState<string | null>(null); // Initialized to null
    const [viewQRCodePopup, setViewQRCodePopup] = useState(false);
    const [generatingQR, setGeneratingQR] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState("");
    const [savingRecord, setSavingRecord] = useState(false);
    const [showEmailDropdown, setShowEmailDropdown] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [sendingToEmail, setSendingToEmail] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedEmail = sessionStorage.getItem("RSEmail");

        if (storedEmail) {
            setEmail(storedEmail);
            setIsLoggedIn(true);
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && viewQRCodePopup) {
                handleCloseQRCodePopup();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                handleCloseQRCodePopup();
            }
        };

        if (viewQRCodePopup) {
            document.addEventListener('keydown', handleKeyDown);
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 0);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, [viewQRCodePopup]);


    const generateQRCode = async () => {

        if (!customerName || !businessName || invoiceType === "") {
            toast({
                title: "Missing Information",
                description: "Customer name, business name, or document type is missing. Cannot generate QR code.",
                variant: "destructive",
            });
            return;
        }

        setGeneratingQR(true);

        const invoiceData: InvoiceData = {
            businessName,
            businessAddress,
            businessPhone,
            businessLogo, // Pass businessLogo
            customerName,
            customerAddress,
            customerPhone,
            items,
            discount,
            tax,
            total,
            invoiceType,
            bankName,
            accountName,
            accountNumber,
        };

        try {
            let generator: PdfGeneratorFunction | undefined;

            switch (selectedTemplate) {
                case "modern":
                    generator = generateModernPdf;
                    break;
                case "minimal":
                    generator = generateMinimalPdf;
                    break;
                case "creative":
                    generator = generateCreativePdf;
                    break;
                case "classic":
                    generator = generateClassicPdf;
                    break;
                default:
                    toast({
                        title: "Error",
                        description: "Selected template not supported for native PDF generation.",
                        variant: "destructive"
                    });
                    return null;
            }

            if (!generator) {
                toast({
                    title: "Error",
                    description: "PDF generator not found for the selected template.",
                    variant: "destructive"
                });
                return null;
            }

            const pdfBlob: Blob = await generator(invoiceData);

            if (!pdfBlob) {
                toast({
                    title: "Error",
                    description: "Failed to create PDF document blob for sending.",
                    variant: "destructive"
                });
                return null;
            }

            const formData = new FormData();
            const fileName = invoiceType === "invoice" ? "invoice.pdf" : "receipt.pdf";
            formData.append('file', pdfBlob, fileName);

            const response = await fetch("https://api.rootsnsquares.com/innovations/upload-file.php", {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();
            console.log(responseData);
            if (!response.ok || responseData.status !== "success" || !responseData.file_url) {
                console.error(
                    "Rootsnsquares PDF Upload Error Response:",
                    responseData
                );
                throw new Error(
                    responseData.message || "Failed to upload PDF to Rootsnsquares."
                );
            }

            const uploadedUrl = responseData.file_url;
            setQrCode(uploadedUrl);
            toast({
                title: "QR Generated Successfully",
                description: "The QR has been generated",
                variant: "default"
            });
            setViewQRCodePopup(true);
        } catch (error) {
            console.error("Rootsnsquares PDF Upload Error:", error);
            toast({
                title: "Upload Error",
                description: `Failed to upload PDF: ${error instanceof Error ? error.message : String(error)} `,
                variant: "destructive"
            });
        } finally {
            setGeneratingQR(false);
        }
    };


    const handleDownloadQRCode = () => {
        const qrCanvas = document.getElementById("qr-code") as HTMLCanvasElement;

        if (!qrCanvas) {
            toast({
                title: "Error",
                description: "Could not find QR code to download. Make sure QRCodeCanvas has id='qr-code'.",
                variant: "destructive"
            });
            return;
        }

        const finalImageSize = 512;
        const borderPixels = 50;

        const qrCodeContentSize = finalImageSize - (borderPixels * 2);

        if (qrCodeContentSize <= 0) {
            toast({
                title: "Error",
                description: "Download image size is too small for the specified border. Adjust finalImageSize or borderPixels.",
                variant: "destructive"
            });
            return;
        }

        const tempCanvas = document.createElement("canvas");
        const ctx = tempCanvas.getContext("2d");

        if (!ctx) {
            toast({
                title: "Error",
                description: "Failed to get 2D rendering context for canvas.",
                variant: "destructive"
            });
            return;
        }

        tempCanvas.width = finalImageSize;
        tempCanvas.height = finalImageSize;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, finalImageSize, finalImageSize);

        ctx.drawImage(
            qrCanvas,
            0, 0, qrCanvas.width, qrCanvas.height,
            borderPixels, borderPixels,
            qrCodeContentSize, qrCodeContentSize
        );

        const pngUrl = tempCanvas.toDataURL("image/png")
            .replace("image/png", "image/octet-stream");

        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${invoiceType} -qr - code.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const handleCloseQRCodePopup = () => {
        setViewQRCodePopup(false);
        setQrCode(null);
    };

    const generateAndUploadPdf = async (
        invoiceData: InvoiceData,
        template: string,
        docType: string
    ): Promise<string | null> => {

        try {
            let generator: PdfGeneratorFunction | undefined;

            switch (selectedTemplate) {
                case "modern":
                    generator = generateModernPdf;
                    break;
                case "minimal":
                    generator = generateMinimalPdf;
                    break;
                case "creative":
                    generator = generateCreativePdf;
                    break;
                case "classic":
                    generator = generateClassicPdf;
                    break;
                default:
                    toast({
                        title: "Error",
                        description: "Selected template not supported for native PDF generation.",
                        variant: "destructive"
                    });
                    return null;
            }

            if (!generator) {
                toast({
                    title: "Error",
                    description: "PDF generator not found for the selected template.",
                    variant: "destructive"
                });
                return null;
            }

            const pdfBlob: Blob = await generator(invoiceData);

            if (!pdfBlob) {
                toast({
                    title: "Error",
                    description: "Failed to create PDF document blob for sending.",
                    variant: "destructive"
                });
                return null;
            }

            const formData = new FormData();
            const fileName = docType === "invoice" ? "invoice.pdf" : "receipt.pdf";
            formData.append('file', pdfBlob, fileName);

            const uploadResponse = await fetch("https://api.rootsnsquares.com/innovations/upload-file.php", {
                method: "POST",
                body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok || uploadData.status !== "success" || !uploadData.file_url) {
                throw new Error(uploadData.message || "Failed to upload PDF for email.");
            }

            return uploadData.file_url;

        } catch (error: any) {
            console.error("PDF Generation/Upload Error:", error);
            toast({
                title: "Error",
                description: `Failed to prepare document for sending: ${error.message || error} `,
                variant: "destructive",
            });
            return null;
        }
    };

    const saveRecord = async () => {
        if (!email || !isLoggedIn) {
            toast({
                title: "Login Required",
                description: "You're not logged in. Please log in to save records.",
                variant: "destructive",
            });
            return;
        }

        if (!customerName || !businessName || invoiceType === "") {
            toast({
                title: "Missing Information",
                description: "Customer name, business name, or document type is missing. Cannot save record.",
                variant: "destructive",
            });
            return;
        }

        setSavingRecord(true);

        const invoiceData: InvoiceData = {
            businessName,
            businessAddress,
            businessPhone,
            businessLogo, // Pass businessLogo
            customerName,
            customerAddress,
            customerPhone,
            items,
            discount,
            tax,
            total,
            invoiceType,
            bankName,
            accountName,
            accountNumber,
        };

        try {
            const uploadedPdfUrl = await generateAndUploadPdf(invoiceData, selectedTemplate, invoiceType);

            if (!uploadedPdfUrl) {
                return;
            }

            const token = Math.random().toString(36).slice(-5);
            const invoice_id = invoiceType === "invoice" ? `INV${Date.now().toString()}${token} ` : `REC${Date.now().toString()}${token} `;
            const currentDate = formatDate(new Date());

            const payload = {
                invoice_id: invoice_id,
                amount: total,
                email: email,
                pdf_url: uploadedPdfUrl,
                type: invoiceType,
                fullname: customerName,
                phone: customerPhone,
                date: currentDate,
                template: selectedTemplate,
            };

            const sendRecordResponse = await fetch("https://api.rootsnsquares.com/innovations/create-records.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const sendRecordData = await sendRecordResponse.json();

            if (!sendRecordResponse.ok || sendRecordData.status !== "success") {
                console.error("Send Record Error Response:", sendRecordData);
                throw new Error(sendRecordData.message || "Failed to save record to database.");
            }

            toast({
                title: "Record Saved Successfully",
                description: sendRecordData.message || `Your ${invoiceType} record has been saved.`,
                variant: "default",
            });

        } catch (error: any) {
            console.error("Save Record Error:", error);
            toast({
                title: "Error Saving Record",
                description: `Failed to save ${invoiceType} record: ${error.message || error} `,
                variant: "destructive",
            });
        } finally {
            setSavingRecord(false);
        }
    };



    const handleSendEmailSubmit = async () => {
        if (!recipientEmail) {
            toast({
                title: "Email Required",
                description: "Please enter an email address to send the document.",
                variant: "destructive",
            });
            return;
        }

        if (!customerName || !businessName || invoiceType === "") {
            toast({
                title: "Missing Information",
                description: "Customer name, business name, or document type is missing. Cannot send record.",
                variant: "destructive",
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address.",
                variant: "destructive",
            });
            return;
        }

        setSendingToEmail(true);

        try {
            const invoiceData: InvoiceData = {
                businessName,
                businessAddress,
                businessPhone,
                businessLogo, // Pass businessLogo
                customerName,
                customerAddress,
                customerPhone,
                items,
                discount,
                tax,
                total,
                invoiceType,
                bankName,
                accountName,
                accountNumber,
            };

            const uploadedPdfUrl = await generateAndUploadPdf(invoiceData, selectedTemplate, invoiceType);

            if (!uploadedPdfUrl) {
                return;
            }

            const payload = {
                email: recipientEmail,
                pdf_url: uploadedPdfUrl,
                type: invoiceType,
                fullname: customerName,
                business_name: businessName,
            };

            const sendEmailResponse = await fetch("https://api.rootsnsquares.com/innovations/send-receipt.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const sendEmailData = await sendEmailResponse.json();

            if (!sendEmailResponse.ok || sendEmailData.status !== "success") {
                console.error("Send Email Error Response:", sendEmailData);
                throw new Error(sendEmailData.message || "Failed to send email.");
            }

            toast({
                title: "Email Sent Successfully",
                description: sendEmailData.message || `Your ${invoiceType} has been sent to ${recipientEmail}.`,
                variant: "default",
            });

            setShowEmailDropdown(false);
            setRecipientEmail('');

        } catch (error: any) {
            console.error("Send Email Error:", error);
            toast({
                title: "Error Sending Email",
                description: `Failed to send ${invoiceType} to email: ${error.message || error} `,
                variant: "destructive",
            });
        } finally {
            setSendingToEmail(false);
        }
    };


    const downloadPDF = async () => {
        if (invoiceType === "") {
            toast({
                title: "Set Document Type",
                description: "Choose a document type first.",
                variant: "destructive",
            });
            return;
        }

        try {
            let pdf: jsPDF;
            const invoiceData: InvoiceData = {
                businessName,
                businessAddress,
                businessPhone,
                businessLogo, // Pass businessLogo
                customerName,
                customerAddress,
                customerPhone,
                items,
                discount,
                tax,
                total,
                invoiceType: invoiceType as "invoice" | "receipt" | "",
                bankName,
                accountName,
                accountNumber,
            };

            let generator: PdfGeneratorFunction | undefined;

            switch (selectedTemplate) {
                case "modern":
                    generator = generateModernPdf;
                    break;
                case "minimal":
                    generator = generateMinimalPdf;
                    break;
                case "creative":
                    generator = generateCreativePdf;
                    break;
                case "classic":
                    generator = generateClassicPdf;
                    break;
                default:
                    toast({
                        title: "Error",
                        description: "Selected template not supported for native PDF generation.",
                        variant: "destructive"
                    });
                    return;
            }

            if (!generator) {
                toast({
                    title: "Error",
                    description: "PDF generator not found for the selected template.",
                    variant: "destructive"
                });
                return;
            }

            const pdfBlob: Blob = await generator(invoiceData);
            const url = URL.createObjectURL(pdfBlob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${invoiceType === "invoice" ? "Invoice" : "Receipt"} -${businessName.replace(/\s/g, '_')} -${new Date().toISOString()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
                title: "PDF Generated",
                description: `${invoiceType === "invoice" ? "Invoice" : "Receipt"} has been generated successfully!`,
            });

        } catch (error) {
            console.error("Error generating PDF:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = `Failed to generate PDF: ${error.message} `;
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
            {generatingQR && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center text-white">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                            <div className="absolute w-full h-full rounded-full border-4 border-r-blue-500 border-l-transparent border-t-transparent border-b-transparent animate-spin [animation-delay:-0.2s]"></div>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">Generating QR Code...</p>
                        <p className="text-sm text-gray-600">Please wait, this might take a moment.</p>
                    </div>
                </div>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Generate & Share</CardTitle>
                    <CardDescription>
                        Create your {invoiceType} using the {selectedTemplate} template
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button onClick={downloadPDF} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF ({selectedTemplate} template)
                    </Button>
                    <Button
                        onClick={generateQRCode}
                        className="w-full bg-gray-800 text-white hover:bg-gray-700"
                        disabled={generatingQR}
                    >
                        {generatingQR ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating QR Code...
                            </>
                        ) : (
                            <>
                                <QrCode className="h-4 w-4 mr-2" />
                                Generate {invoiceType} QR code
                            </>
                        )}
                    </Button>
                    <Popover open={showEmailDropdown} onOpenChange={setShowEmailDropdown}>
                        <PopoverTrigger asChild>
                            {/* The button that triggers the popover */}
                            <Button
                                className="w-full bg-gray-800 text-white hover:bg-gray-700"
                                disabled={sendingToEmail} // Disable if email is being sent
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Send {invoiceType || 'document'} to email
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-80 p-0" // w-80 for fixed width, p-0 to remove default popover padding
                            side="top" // Position above the trigger button
                            align="center" // Align popover content center with the trigger
                            onOpenAutoFocus={(e) => e.preventDefault()} // Prevents default focus behavior
                        >
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-semibold">Enter Email</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowEmailDropdown(false)}
                                        className="h-6 w-6"
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Close</span>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="mb-4">
                                        Enter the recipient's email address to send the {invoiceType || 'document'}.
                                    </CardDescription>
                                    <Input
                                        type="email"
                                        placeholder="example@email.com"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        className="mb-4"
                                        disabled={sendingToEmail} // Disable input while sending
                                    />
                                    <Button
                                        onClick={handleSendEmailSubmit}
                                        className="w-full"
                                        disabled={sendingToEmail} // Disable button while sending
                                    >
                                        {sendingToEmail ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send to Email"
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </PopoverContent>
                    </Popover>

                    {isLoggedIn && (
                        <Button onClick={saveRecord} disabled={savingRecord} className="w-full">
                            {savingRecord ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving Record...
                                </>
                            ) : (
                                <>
                                    < Save className="h-4 w-4 mr-2" />
                                    Save {invoiceType} Record
                                </>
                            )}
                        </Button>
                    )}

                    {viewQRCodePopup && qrCode && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                            <div ref={popupRef} className="relative bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">

                                <Button
                                    onClick={handleCloseQRCodePopup}
                                    className="absolute top-3 right-3 p-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </Button>

                                <h3 className="text-lg font-semibold mb-4">Your QR Code</h3>

                                <div className="p-2 border border-gray-300 rounded-md inline-block mb-4 bg-white">
                                    <QRCodeCanvas
                                        id="qr-code"
                                        value={qrCode}
                                        size={256}
                                        level="H"
                                    />
                                </div>

                                <Button
                                    onClick={handleDownloadQRCode}
                                    className="w-full bg-primary text-white hover:bg-primary/90"
                                >
                                    Download QR Code
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>

    );
};

export default GenerateInvoice; // Changed component name to GenerateInvoice