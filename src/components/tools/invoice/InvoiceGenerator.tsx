"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { Download, Mail, MessageCircle, Plus, Trash2, Camera, Scan, Sparkles, FileText, Eye, Zap, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GenerateInvoice from "./GenerateInvoice";
import InvoiceTemplate from "./invoiceTemplate";

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number | null;
    unit_price: number | null;
}

// Defining InvoiceData here for consistency when passing props
export interface InvoiceDataForGenerator {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessLogo: string | null; // Added businessLogo
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    items: InvoiceItem[];
    discount: number | null;
    tax: number | null;
    total: number;
    invoiceType: "invoice" | "receipt" | "";
    selectedTemplate: string;
}


type TemplateId = 'modern' | 'minimal' | 'classic' | 'creative';

type InvoiceDocumentType = "" | "invoice" | "receipt";

export const InvoiceGenerator = () => {
    const { toast } = useToast();
    const [invoiceType, setInvoiceType] = useState<InvoiceDocumentType>("");
    const [businessName, setBusinessName] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [businessPhone, setBusinessPhone] = useState("");
    const [businessLogo, setBusinessLogo] = useState<string | null>(null); // New state for business logo
    const [customerName, setCustomerName] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: "1", description: "", quantity: null, unit_price: null } // Updated initial state
    ]);
    const [discount, setDiscount] = useState<number | null>(null);
    const [tax, setTax] = useState<number | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>("modern");
    const [isScanning, setIsScanning] = useState(false);
    const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const popupRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                closePreview();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {

            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popupRef]);

    // NEW useEffect for fetching business data
    useEffect(() => {
        const storedEmail = sessionStorage.getItem("RSEmail");

        if (storedEmail) {
            // setIsLoggedIn(true); // Assuming you have an isLoggedIn state in InvoiceGenerator as well
            // setEmail(storedEmail); // Assuming you have an email state in InvoiceGenerator as well

            const fetchBusinessData = async () => {
                try {
                    const response = await fetch(`https://api.bizengo.com/innovations/getverify.php?email=${storedEmail}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch business data.");
                    }
                    const data = await response.json();
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

    const generateSmartSuggestions = () => {
        const suggestions = [
            "Screen protector for iPhone 15 Pro Max - ₦5,000",
            "Phone case for iPhone 15 Pro Max - ₦12,000",
            "Lightning to USB-C cable - ₦8,000",
            "Wireless charging pad - ₦15,000",
            "Extended warranty service - ₦25,000"
        ];
        setSmartSuggestions(suggestions);
        toast({
            title: "Smart Suggestions Generated",
            description: "AI has analyzed your items and found relevant add-ons",
        });
    };

    const addSmartSuggestion = (suggestion: string) => {
        const [description, priceStr] = suggestion.split(" - ₦");
        const unitPrice = parseFloat(priceStr.replace(/,/g, "")); // This is the unit price
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description,
            quantity: 1,
            unit_price: unitPrice // Assign to unit_price
        };
        setItems([...items, newItem]);
        setSmartSuggestions(smartSuggestions.filter(s => s !== suggestion));
    };

    const templates = [
        { id: "modern", name: "Modern", description: "Clean and professional" },
        { id: "classic", name: "Classic", description: "Traditional business style" },
        { id: "minimal", name: "Minimal", description: "Simple and elegant" },
        { id: "creative", name: "Creative", description: "Colorful and dynamic" }
    ];

    const templateImages: { [key in TemplateId]: string } = {
        modern: '/images/templates/modern.webp',
        minimal: '/images/templates/minimal.webp',
        classic: '/images/templates/classic.webp',
        creative: '/images/templates/creative.webp',
    };

    const handlePreviewClick = () => {
        if (selectedTemplate) {
            setShowPreview(true);
        }
    };

    const closePreview = () => {
        setShowPreview(false);
    };

    const addItem = () => {
        setItems([...items, {
            id: Date.now().toString(),
            description: "",
            quantity: null,
            unit_price: null // Initialize unit_price
        }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number | null) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleNumberInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<number | null>>,
        minValue: number = 0,
        maxValue?: number
    ) => {
        const inputValue = e.target.value;

        if (inputValue === '') {
            setter(null);
        } else {
            const parsedValue = parseFloat(inputValue);

            if (!isNaN(parsedValue)) {
                let finalValue = Math.max(minValue, parsedValue);
                if (maxValue !== undefined) {
                    finalValue = Math.min(maxValue, finalValue);
                }
                setter(finalValue);
            }
        }
    };

    const formatNumberForDisplay = (value: number | null | undefined, options?: Intl.NumberFormatOptions): string => {

        if (value === null || value === undefined) {
            return '';
        }

        const num = Number(value);
        if (isNaN(num)) {
            return '';
        }

        return num.toLocaleString(undefined, options);
    };

    const cleanAndParseNumber = (inputString: string): number | null => {
        const cleaned = inputString.replace(/[^\d.-]/g, '');

        if (cleaned === '' || cleaned === '-') {
            return null;
        }

        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    };


    const handleItemNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        itemId: string,
        field: "quantity" | "unit_price", // Changed "price" to "unit_price"
        minAllowedValue: number
    ) => {
        const inputValue = e.target.value;
        const parsedValue = cleanAndParseNumber(inputValue);

        if (parsedValue === null) {
            updateItem(itemId, field, null);
        } else {
            let finalValue = parsedValue;

            if (finalValue < minAllowedValue) {
                finalValue = minAllowedValue;
            }

            if (field === "quantity") {
                finalValue = Math.floor(finalValue);
            }
            updateItem(itemId, field, finalValue);
        }
    };

    const subtotal = items.reduce((sum, item) => {
        const itemQuantity = item.quantity ?? 0;
        const itemUnitPrice = item.unit_price ?? 0; // Use unit_price for calculation
        return sum + (itemQuantity * itemUnitPrice);
    }, 0);

    const actualDiscountPercentage = discount ?? 0;
    const discountAmount = (subtotal * actualDiscountPercentage) / 100;

    const actualTaxPercentage = tax ?? 0;
    const taxAmount = ((subtotal - discountAmount) * actualTaxPercentage) / 100;

    const total = subtotal - discountAmount + taxAmount;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Smart Invoice & Receipt Generator</h1>
                <p className="text-muted-foreground">AI-powered invoice creation with QR code generation and smart suggestions</p>
            </div>

            <div className="hidden sm:grid md:grid-cols-3 gap-4">
                <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-4 text-center">
                        <Scan className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-blue-900">QR Generation</h3>
                        <p className="text-sm text-blue-700">Scan QR code to get invoice/receipt.</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                        <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-green-900">Smart Suggestions</h3>
                        <p className="text-sm text-green-700">AI-powered item recommendations</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-4 text-center">
                        <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-purple-900">Professional Templates</h3>
                        <p className="text-sm text-purple-700">Beautiful invoice designs</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col gap-6 w-full md:w-1/2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Document Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={invoiceType} onValueChange={(value) => setInvoiceType(value as InvoiceDocumentType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="invoice">Invoice</SelectItem>
                                    <SelectItem value="receipt">Receipt</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-green-600" />
                                Account Information
                            </CardTitle>
                            <CardDescription>Only fill this field if you're generating an invoice</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 items-center">
                                <div>
                                    <Label htmlFor="bankName">Bank Name</Label>
                                    <Input
                                        id="bankName"
                                        type="text"
                                        placeholder="Enter bank name"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="accountNumber">Account Number</Label>
                                    <Input
                                        id="accountNumber"
                                        type="number"
                                        placeholder="Enter account number"
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (/^\d*$/.test(value)) {
                                                setAccountNumber(value);
                                            }
                                        }}
                                        value={accountNumber} // Bind value to state
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="accountName">Account Name</Label>
                                <Input
                                    id="accountName"
                                    placeholder="Enter account name"
                                    onChange={(e) => setAccountName(e.target.value)}
                                    value={accountName} // Bind value to state
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card className="w-full md:w-1/2">
                    <CardHeader>
                        <CardTitle>Your Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input
                                id="businessName"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="e.g., Adunni Fashion House"
                            />
                        </div>
                        <div>
                            <Label htmlFor="businessAddress">Business Address</Label>
                            <Textarea
                                id="businessAddress"
                                value={businessAddress}
                                onChange={(e) => setBusinessAddress(e.target.value)}
                                placeholder="e.g., 123 Market Street, Lagos"
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label htmlFor="businessPhone">Phone Number</Label>
                            <Input
                                id="businessPhone"
                                value={businessPhone}
                                onChange={(e) => setBusinessPhone(e.target.value)}
                                placeholder="e.g., +234 803 123 4567"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Professional Templates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className={`p - 3 border rounded - lg cursor - pointer transition - all ${selectedTemplate === template.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        } `}
                                    onClick={() => setSelectedTemplate(template.id as TemplateId)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-medium text-sm">{template.name}</h4>
                                        {selectedTemplate === template.id && (
                                            <Badge className="bg-blue-600 text-xs">Selected</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{template.description}</p>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-3" onClick={handlePreviewClick}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Template
                        </Button>
                        {showPreview && selectedTemplate && (
                            <InvoiceTemplate imageUrl={templateImages[selectedTemplate]} onClose={closePreview} popupRef={popupRef} />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input
                                id="customerName"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="e.g., Mrs. Kemi Johnson"
                            />
                        </div>
                        <div>
                            <Label htmlFor="customerAddress">Customer Address</Label>
                            <Textarea
                                id="customerAddress"
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                placeholder="e.g., 456 Victoria Island, Lagos"
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label htmlFor="customerPhone">Phone Number</Label>
                            <Input
                                id="customerPhone"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="e.g., +234 701 234 5678"
                            />
                        </div>
                    </CardContent>
                </Card>

            </div>

            {smartSuggestions.length > 0 && (
                <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-green-800">
                                <Sparkles className="h-5 w-5" />
                                Smart Suggestions
                            </div>
                            <Button size="sm" onClick={() => setSmartSuggestions([])} className="bg-green-800 hover:bg-green-900">
                                Close
                            </Button>
                        </CardTitle>
                        <CardDescription className="text-green-700">
                            AI found these relevant items based on your current selection
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {smartSuggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                <span className="text-sm">{suggestion}</span>
                                <Button size="sm" onClick={() => addSmartSuggestion(suggestion)}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card className="w-full">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle>Items/Services</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={generateSmartSuggestions} size="sm" variant="outline">
                                <Zap className="h-4 w-4 mr-2" />
                                Get Suggestions
                            </Button>
                            <Button onClick={addItem} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%] sm:w-[20%] min-w-[220px]">Description</TableHead>
                                    <TableHead className="w-[15%] sm:w-[10%] min-w-[80px]">Quantity</TableHead>
                                    <TableHead className="w-[20%] sm:w-[15%] min-w-[160px]">Unit Price (₦)</TableHead>
                                    <TableHead className="w-[20%] sm:w-[15%] min-w-[120px]">Price (₦)</TableHead>
                                    <TableHead className="w-[5%] min-w-[50px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                                placeholder="e.g., Custom Ankara dress"
                                                className="border-0 focus:ring-1 w-full"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                value={formatNumberForDisplay(item.quantity, { maximumFractionDigits: 0 })}
                                                onChange={(e) => handleItemNumberChange(e, item.id, "quantity", 1)}
                                                min="1"
                                                className="border-0 focus:ring-1 w-full"
                                                placeholder="0"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                value={formatNumberForDisplay(item.unit_price)}
                                                onChange={(e) => handleItemNumberChange(e, item.id, "unit_price", 0)}
                                                min="0"
                                                step="0.01"
                                                className="border-0 focus:ring-1 w-full"
                                                placeholder="0.00"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            ₦{((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {items.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(item.id)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Charges</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="discountInput">Discount (%)</Label>
                                <Input
                                    id="discountInput"
                                    type="number"
                                    value={discount === null ? '' : discount}
                                    onChange={(e) => handleNumberInputChange(e, setDiscount, 0, 100)}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <Label htmlFor="taxInput">Tax (%)</Label>
                                <Input
                                    id="taxInput"
                                    type="number"
                                    value={tax === null ? '' : tax}
                                    onChange={(e) => handleNumberInputChange(e, setTax, 0)}
                                    min="0"
                                    step="0.1"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>₦{subtotal.toLocaleString()}</span>
                            </div>
                            {(discount ?? 0) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({discount}%):</span> {/* Display the original discount for context */}
                                    <span>-₦{discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            {/* Display Tax only if it's greater than 0 (or not null and greater than 0) */}
                            {(tax ?? 0) > 0 && (
                                <div className="flex justify-between">
                                    <span>Tax ({tax}%):</span> {/* Display the original tax for context */}
                                    <span>₦{taxAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold border-t pt-2">
                                <span>Total:</span>
                                <span>₦{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <GenerateInvoice
                    invoiceType={invoiceType}
                    businessName={businessName}
                    businessAddress={businessAddress}
                    businessPhone={businessPhone}
                    businessLogo={businessLogo} // Pass the new businessLogo state
                    customerName={customerName}
                    customerAddress={customerAddress}
                    customerPhone={customerPhone}
                    bankName={bankName}
                    accountNumber={accountNumber}
                    accountName={accountName}
                    items={items}
                    discount={discount}
                    tax={tax}
                    selectedTemplate={selectedTemplate || ""}
                    total={total}
                />


            </div>
        </div>
    );
};