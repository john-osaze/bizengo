// CalculatorComponent.tsx (Main component)
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Make sure Button is imported
import { useEffect, useState, useRef } from "react";
import { BarChart3, LineChart, Target, Package, Brain, Calculator, TrendingUp, PlusCircle, Trash2 } from "lucide-react"; // Import new icons
import { useToast } from "@/hooks/use-toast";
import GenerateCalculator from "./GenerateCalculator";
import { ItemCalculationData } from "@/types/calculator"; // Import the new ItemCalculationData interface

// Define the shape of an item in our state before it's calculated
interface ItemInput {
    id: string;
    productCategory: string;
    costPerItem: string;
    quantity: string;
}

// Interface for business info fetched from API (can be moved to a shared type file)
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


export default function CalculatorComponent() {

    const { toast } = useToast();

    // State for individual items - now an array
    const [items, setItems] = useState<ItemInput[]>([
        { id: 'item-1', productCategory: "", costPerItem: "", quantity: "" } // Start with one item
    ]);

    // Global expenses and profit margin remain
    const [shippingCost, setShippingCost] = useState("");
    const [profitMargin, setProfitMargin] = useState("20");
    const [otherExpenses, setOtherExpenses] = useState("");

    // New states for business information
    const [businessName, setBusinessName] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [businessPhone, setBusinessPhone] = useState("");
    const [businessLogo, setBusinessLogo] = useState<string | null>(null);

    // Numeric parsing for global inputs
    const shippingCostNum = parseFloat(shippingCost) || 0;
    const profitMarginNum = parseFloat(profitMargin) || 0;
    const otherExpensesNum = parseFloat(otherExpenses) || 0;

    // --- Calculation Logic ---
    // These will be sums across all items
    let totalItemsBaseCost = 0;
    let totalItemsProfit = 0;
    let totalItemsRevenueBeforeGlobalExpenses = 0;

    // Array to hold detailed calculated data for each item, to be passed to GenerateCalculator and for local display
    const calculatedItems: ItemCalculationData[] = items.map(item => {
        const itemCostPerItemNum = parseFloat(item.costPerItem) || 0;
        const itemQuantityNum = parseFloat(item.quantity) || 0;

        const currentItemBaseCost = itemCostPerItemNum * itemQuantityNum;
        // Profit margin is applied to the base cost of each item
        const currentItemProfit = currentItemBaseCost * (profitMarginNum / 100);
        const currentItemSuggestedSellingPrice = currentItemBaseCost + currentItemProfit;
        const currentPricePerUnit = itemQuantityNum > 0 ? currentItemSuggestedSellingPrice / itemQuantityNum : 0;

        // Aggregate totals for the summary
        totalItemsBaseCost += currentItemBaseCost;
        totalItemsProfit += currentItemProfit;
        totalItemsRevenueBeforeGlobalExpenses += currentItemSuggestedSellingPrice;

        return {
            id: item.id,
            productCategory: item.productCategory,
            costPerItemNum: itemCostPerItemNum,
            quantityNum: itemQuantityNum,
            itemTotalCost: currentItemBaseCost,
            itemProfitAmount: currentItemProfit,
            itemSuggestedSellingPrice: currentItemSuggestedSellingPrice,
            pricePerUnit: currentPricePerUnit,
        };
    });

    // Final consolidated calculations for the entire batch/order
    const totalExpenditure = totalItemsBaseCost + shippingCostNum + otherExpensesNum;
    const finalSuggestedSellingPrice = totalItemsRevenueBeforeGlobalExpenses + shippingCostNum + otherExpensesNum;
    const overallNetProfit = finalSuggestedSellingPrice - totalExpenditure; // This should ideally equal totalItemsProfit


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
                    console.error("Error fetching business data for calculator:", error);
                    setBusinessName("");
                    setBusinessAddress("");
                    setBusinessPhone("");
                    setBusinessLogo(null);
                    toast({
                        title: "Business Data Load Error",
                        description: "Could not automatically load your business details for the calculator.",
                        variant: "destructive",
                    });
                }
            };
            fetchBusinessData();
        }
    }, [toast]);


    // --- Item Management Functions ---
    const handleAddItem = () => {
        setItems(prevItems => [
            ...prevItems,
            { id: `item-${Date.now()}`, productCategory: "", costPerItem: "", quantity: "" } // New item with unique ID
        ]);
    };

    const handleRemoveItem = (id: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const handleItemChange = (id: string, field: keyof ItemInput, value: string) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    // --- Optimization Suggestions ---
    // Adapted to use new aggregate totals where appropriate
    const generateOptimizationSuggestions = () => {
        const suggestions = [];

        if (items.length === 0 || totalExpenditure === 0) {
            return []; // No meaningful suggestions if no items or zero expenditure
        }

        if (profitMarginNum < 25) {
            suggestions.push({
                type: "margin",
                title: "Increase Profit Margin",
                description: `Consider increasing the desired profit margin per item to 25-30% for better profitability.`,
                impact: `+₦${((totalItemsBaseCost * 0.25) - totalItemsProfit).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, // Impact on base profit
                priority: "high"
            });
        }

        const totalQuantityAcrossAllItems = calculatedItems.reduce((sum, item) => sum + item.quantityNum, 0);
        if (totalQuantityAcrossAllItems < 50 && totalItemsBaseCost > 0) {
            suggestions.push({
                type: "quantity",
                title: "Bulk Order Discount",
                description: `Consider increasing total order quantity (e.g., to ${Math.ceil(totalQuantityAcrossAllItems * 1.5)} units) to potentially get better wholesale rates.`,
                impact: `Potential cost savings on base items.`,
                priority: "medium"
            });
        }

        if (shippingCostNum > totalItemsBaseCost * 0.1 && totalItemsBaseCost > 0) {
            suggestions.push({
                type: "shipping",
                title: "Optimize Shipping",
                description: "Shipping cost is high relative to product costs. Consider local suppliers or bulk shipping options.",
                impact: `-₦${(shippingCostNum * 0.3).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                priority: "medium"
            });
        }

        return suggestions;
    };

    const optimizationSuggestions = generateOptimizationSuggestions();

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": case "urgent": return "bg-red-100 text-red-700 border-red-200";
            case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default: return "bg-green-100 text-green-700 border-green-200";
        }
    };


    return (
        <>
            <div className="hidden sm:grid md:grid-cols-3 gap-4">
                <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-4 text-center">
                        <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-blue-900">Market Intelligence</h3>
                        <p className="text-sm text-blue-700">Real-time market price analysis</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                        <LineChart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-green-900">Demand Forecasting</h3>
                        <p className="text-sm text-green-700">Predict future demand trends</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-4 text-center">
                        <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-purple-900">Profit Optimization</h3>
                        <p className="text-sm text-purple-700">AI-driven profit maximization</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 ">

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Product Details & Expenses
                            </CardTitle>
                            <CardDescription>Enter details for each product and global expenses for analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Individual Product Input Section */}
                            {items.map((item, index) => (
                                <Card key={item.id} className="relative p-4 border border-dashed border-gray-300">
                                    <h4 className="font-semibold mb-3 text-lg">Product {index + 1}</h4>
                                    {items.length > 1 && ( // Allow removing only if more than one item
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemoveItem(item.id)}
                                            aria-label={`Remove Product ${index + 1}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor={`productCategory-${item.id}`}>Product Category</Label>
                                            <Input
                                                id={`productCategory-${item.id}`}
                                                value={item.productCategory}
                                                onChange={(e) => handleItemChange(item.id, "productCategory", e.target.value)}
                                                placeholder="e.g., Electronics, Fashion"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                This helps AI provide better market insights for this product.
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor={`costPerItem-${item.id}`}>Cost per Item (₦)</Label>
                                            <Input
                                                id={`costPerItem-${item.id}`}
                                                type="number"
                                                value={item.costPerItem}
                                                onChange={(e) => handleItemChange(item.id, "costPerItem", e.target.value)}
                                                placeholder="e.g., 5000"
                                                step="0.01"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                How much does each unit of this product cost you to buy/make?
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                                            <Input
                                                id={`quantity-${item.id}`}
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                                                placeholder="e.g., 50"
                                                min="1"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                How many units of this product are you ordering/selling?
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            <Button onClick={handleAddItem} className="w-full mt-4" variant="outline">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Another Product
                            </Button>

                            <hr className="my-6" /> {/* Separator for global expenses */}

                            {/* Global Expenses Section */}
                            <h3 className="font-semibold text-lg mb-3">Global Expenses & Margin</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="shippingCost">Total Shipping/Delivery Cost (₦)</Label>
                                    <Input
                                        id="shippingCost"
                                        type="number"
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(e.target.value)}
                                        placeholder="e.g., 2000"
                                        step="0.01"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Total shipping or delivery charges for this entire batch of products.
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="otherExpenses">Other Total Expenses (₦)</Label>
                                    <Input
                                        id="otherExpenses"
                                        type="number"
                                        value={otherExpenses}
                                        onChange={(e) => setOtherExpenses(e.target.value)}
                                        placeholder="e.g., 500"
                                        step="0.01"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Total packaging, handling, or other miscellaneous costs for this batch.
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="profitMargin">Desired Profit Margin (%) Per Item</Label>
                                    <Input
                                        id="profitMargin"
                                        type="number"
                                        value={profitMargin}
                                        onChange={(e) => setProfitMargin(e.target.value)}
                                        placeholder="e.g., 20"
                                        min="0"
                                        step="0.1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Your desired profit percentage applied to the base cost of *each individual item*.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Overall Cost Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Product Purchase Costs:</span>
                                    <span className="font-medium">₦{totalItemsBaseCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Shipping/Delivery:</span>
                                    <span className="font-medium">₦{shippingCostNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Other Expenses:</span>
                                    <span className="font-medium">₦{otherExpensesNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <hr />

                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total Expenditure:</span>
                                    <span className="text-red-600">₦{totalExpenditure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Overall Pricing & Profit Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Profit (from items, {profitMarginNum}%):</span>
                                    <span className="font-medium text-green-600">₦{totalItemsProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Revenue Before Global Expenses:</span>
                                    <span className="font-medium">₦{totalItemsRevenueBeforeGlobalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Final Suggested Selling Price:</span>
                                    <span className="text-green-600">₦{finalSuggestedSellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <hr />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Overall Net Profit:</span>
                                    <span className="text-green-600">₦{overallNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Display Individual Item Profits/Prices */}
                    {calculatedItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Individual Product Insights
                                </CardTitle>
                                <CardDescription>Suggested pricing and profit for each product, based on the global profit margin.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {calculatedItems.map((item, index) => (
                                    <div key={item.id} className="border-b pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                                        <h4 className="font-semibold text-md mb-2">{item.productCategory || `Product ${index + 1}`}</h4>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Base Cost ({item.quantityNum} units):</span>
                                                <span className="font-medium">₦{item.itemTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Profit ({profitMarginNum}%):</span>
                                                <span className="font-medium text-green-600">₦{item.itemProfitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Suggested Selling Price (Batch):</span>
                                                <span className="font-medium text-green-700">₦{item.itemSuggestedSellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Suggested Price per Unit:</span>
                                                <span className="font-medium">₦{item.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}


                    <GenerateCalculator
                        profitMarginNum={profitMarginNum}
                        shippingCostNum={shippingCostNum}
                        otherExpensesNum={otherExpensesNum}
                        items={calculatedItems} // Pass the array of calculated item details
                        totalItemsBaseCost={totalItemsBaseCost}
                        totalItemsProfit={totalItemsProfit}
                        totalItemsRevenueBeforeGlobalExpenses={totalItemsRevenueBeforeGlobalExpenses}
                        totalExpenditure={totalExpenditure}
                        finalSuggestedSellingPrice={finalSuggestedSellingPrice}
                        overallNetProfit={overallNetProfit}
                        // Pass business info here
                        businessName={businessName}
                        businessAddress={businessAddress}
                        businessPhone={businessPhone}
                        businessLogo={businessLogo}
                    />

                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-blue-900 text-sm flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                AI Pricing Intelligence
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-blue-800">
                            <ul className="space-y-1">
                                <li>• Electronics: 15-25% margin (high competition)</li>
                                <li>• Fashion: 40-60% margin (brand value)</li>
                                <li>• Food items: 25-35% margin (fast turnover)</li>
                                <li>• Handmade: 50-70% margin (unique value)</li>
                                <li>• Bulk orders: Consider 5-10% volume discounts</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}