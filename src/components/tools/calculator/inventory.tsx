"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef, useState } from "react";
import { Calculator, Download, Share2, TrendingUp, Package, Brain, BarChart3, Target, Zap, LineChart, PieChart, Plus, AlertTriangle, Upload, ShoppingCart, FileText, Calendar, DollarSign, TrendingDown, Truck, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GenerateInventory from "./GenerateInventory";


// Local interfaces (duplicates from types/inventory.ts for self-containment in this example)
interface InventoryItem {
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

interface Order {
    id: string;
    supplier: string;
    items: string;
    status: string;
    expectedDelivery: string;
    totalValue: number;
}

interface APIOrder {
    id: string;
    order_id: string;
    email: string;
    supplier: string;
    items: string;
    status: string;
    expectedDelivery: string;
    totalValue: string;
    uptime: string;
    admin: string;
}

interface APIResponse {
    status: string;
    orders: APIOrder[];
    meta: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

interface APIItemDetail {
    name: string;
    qty: number;
    price: number;
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


export default function InventoryComponent() {

    const { toast } = useToast();

    const inventoryRef = useRef<HTMLDivElement>(null);
    const ordersRef = useRef<HTMLDivElement>(null);

    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([ // Explicitly type useState
        { id: 1, name: "Samsung Galaxy Phone", model: "SGP001", currentStock: 15, minStock: 5, unitPrice: 350000, category: "Electronics", lastRestocked: "2025-01-10", salesThisMonth: 8 },
        { id: 2, name: "Nike Air Max", model: "NAM002", currentStock: 3, minStock: 10, unitPrice: 85000, category: "Fashion", lastRestocked: "2025-01-05", salesThisMonth: 2 },
        { id: 3, name: "iPhone Charger", model: "IPC003", currentStock: 25, minStock: 15, unitPrice: 5500, category: "Electronics", lastRestocked: "2025-01-12", salesThisMonth: 18 },
    ]);

    const [orders, setOrders] = useState<Order[]>([]);

    const [newItem, setNewItem] = useState({
        name: "",
        model: "",
        currentStock: "",
        minStock: "",
        unitPrice: "",
        category: ""
    });

    const [newOrder, setNewOrder] = useState({
        supplier: "",
        items: "",
        expectedDelivery: "",
        totalValue: ""
    });

    // New states for business information
    const [businessName, setBusinessName] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [businessPhone, setBusinessPhone] = useState("");
    const [businessLogo, setBusinessLogo] = useState<string | null>(null);


    useEffect(() => {
        const loadOrders = async () => {
            let currentOrders: Order[] = []; // Explicitly type currentOrders

            // 1. Try to load orders from Local Storage first
            const storedOrders = localStorage.getItem("orders");
            if (storedOrders) {
                try {
                    // Cast the parsed JSON to Order[]
                    currentOrders = JSON.parse(storedOrders) as Order[];
                    // console.log("Loaded orders from localStorage:", currentOrders);
                } catch (e) {
                    console.error("Failed to parse orders from localStorage:", e);
                    toast({
                        title: "Storage Error",
                        description: "Could not read saved orders from your browser. Data might be corrupted.",
                        variant: "destructive"
                    });
                    currentOrders = []; // Reset if corrupted
                }
            }

            // 2. Check if user is logged in via sessionStorage
            const userEmail = sessionStorage.getItem("RSEmail");

            if (userEmail) {
                // User is logged in, fetch orders from the API
                try {
                    const response = await fetch(`https://api.rootsnsquares.com/innovations/get-orders.php?email=${userEmail}`);

                    if (!response.ok) {
                        console.error("API HTTP Error:", response.status, response.statusText);
                        toast({
                            title: "Server Error",
                            description: `Failed to load latest orders from server (Status: ${response.status}). Displaying local data.`,
                            variant: "destructive"
                        });
                        setOrders(currentOrders); // Fallback to local storage data
                        return;
                    }

                    // Cast the response JSON to APIResponse
                    const result = await response.json() as APIResponse;

                    if (result.status === "success" && Array.isArray(result.orders)) {
                        // Explicitly type apiOrder in the map function
                        const apiOrders: Order[] = result.orders
                            .filter((apiOrder: APIOrder) => apiOrder.status !== "deleted") // Filter out deleted orders
                            .map((apiOrder: APIOrder) => { // Explicitly type apiOrder here
                                let itemsString: string = apiOrder.items;
                                try {
                                    // Attempt to parse items JSON and convert to a human-readable string
                                    const parsedItems: APIItemDetail[] = JSON.parse(apiOrder.items);
                                    if (Array.isArray(parsedItems)) {
                                        itemsString = parsedItems.map(item => item.name).join(', ');
                                    }
                                } catch (e) {
                                    console.warn("Could not parse items JSON for order:", apiOrder.order_id, e);
                                }

                                let mappedStatus: string = apiOrder.status;
                                if (apiOrder.status === 'active') {
                                    mappedStatus = 'Processing';
                                } else if (apiOrder.status === 'delivered') {
                                    mappedStatus = 'Delivered';
                                }

                                return {
                                    id: apiOrder.order_id,
                                    supplier: apiOrder.supplier,
                                    items: itemsString,
                                    status: mappedStatus,
                                    expectedDelivery: apiOrder.expectedDelivery,
                                    totalValue: parseFloat(apiOrder.totalValue) || 0,
                                };
                            });

                        setOrders(apiOrders);
                        localStorage.setItem("orders", JSON.stringify(apiOrders));
                        toast({
                            title: "Orders Loaded",
                            description: "Your latest orders have been loaded from the server.",
                        });
                    } else {
                        toast({
                            title: "API Error",
                            description: "Failed to retrieve orders from server.",
                            variant: "destructive"
                        });
                        setOrders(currentOrders);
                    }
                } catch (error) {
                    console.error("Network error fetching orders:", error);
                    toast({
                        title: "Network Error",
                        description: "Could not connect to the server to get orders. Displaying local data.",
                        variant: "destructive"
                    });
                    setOrders(currentOrders);
                }
            } else {
                setOrders(currentOrders);
                if (currentOrders.length > 0) {
                    toast({
                        title: "Orders Loaded Locally",
                        description: "No user logged in. Showing orders from your browser's storage.",
                    });
                } else {
                    toast({
                        title: "No Orders",
                        description: "No orders found in your browser storage. Log in to retrieve your orders.",
                    });
                }
            }
        };

        loadOrders();
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
                    console.error("Error fetching business data for inventory:", error);
                    setBusinessName("");
                    setBusinessAddress("");
                    setBusinessPhone("");
                    setBusinessLogo(null);
                    toast({
                        title: "Business Data Load Error",
                        description: "Could not automatically load your business details for inventory.",
                        variant: "destructive",
                    });
                }
            };
            fetchBusinessData();
        }
    }, [toast]);


    const addInventoryItem = () => {
        if (!newItem.name || !newItem.model || !newItem.currentStock || !newItem.unitPrice) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        const item: InventoryItem = { // Explicitly type item
            id: inventoryItems.length + 1,
            name: newItem.name,
            model: newItem.model,
            currentStock: parseInt(newItem.currentStock),
            minStock: parseInt(newItem.minStock) || 5,
            unitPrice: parseFloat(newItem.unitPrice),
            category: newItem.category || "General",
            lastRestocked: new Date().toISOString().split('T')[0],
            salesThisMonth: 0
        };

        setInventoryItems([...inventoryItems, item]);
        setNewItem({ name: "", model: "", currentStock: "", minStock: "", unitPrice: "", category: "" });

        toast({
            title: "Item Added",
            description: `${item.name} has been added to inventory`,
        });
    };

    const addOrder = async () => {

        if (!newOrder.supplier || !newOrder.items || !newOrder.expectedDelivery) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        const token = Math.random().toString(36).slice(-5);

        const orderId: string = `ORD${Date.now()}${token}`;
        const order: Order = {
            id: orderId,
            supplier: newOrder.supplier,
            items: newOrder.items,
            status: "Processing",
            expectedDelivery: newOrder.expectedDelivery,
            totalValue: parseFloat(newOrder.totalValue) || 0
        };

        const userEmail = sessionStorage.getItem("RSEmail");

        if (userEmail) {
            const adminEmail = "admin@businesskits.com";

            const payload = {
                order_id: orderId,
                email: userEmail,
                supplier: newOrder.supplier,
                items: newOrder.items,
                expectedDelivery: newOrder.expectedDelivery,
                totalValue: order.totalValue,
                admin: adminEmail
            };

            try {
                const response = await fetch("https://api.rootsnsquares.com/innovations/create-order.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    console.error("API HTTP Error:", response.status, response.statusText);
                    const errorData = await response.text();
                    toast({
                        title: "Server Error",
                        description: `Failed to connect to the order service (Status: ${response.status}). Please try again.`,
                        variant: "destructive"
                    });
                    return;
                }

                const result = await response.json();

                if (result.status === "success") {
                    const updatedOrders = [...orders, order];
                    setOrders(updatedOrders);
                    localStorage.setItem("orders", JSON.stringify(updatedOrders));
                    setNewOrder({ supplier: "", items: "", expectedDelivery: "", totalValue: "" });
                    toast({
                        title: "Order Created",
                        description: `Order ${order.id} has been created and saved to the server.`,
                    });
                } else {
                    toast({
                        title: "Order Creation Failed",
                        description: result.message || "Failed to create order via API. Please try again.",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                console.error("Error sending order to API:", error);
                toast({
                    title: "Network Error",
                    description: "Could not connect to the server. Please check your internet connection and try again.",
                    variant: "destructive"
                });
            }
        } else {
            const updatedOrders: Order[] = [...orders, order];
            setOrders(updatedOrders);
            localStorage.setItem("orders", JSON.stringify(updatedOrders));
            setNewOrder({ supplier: "", items: "", expectedDelivery: "", totalValue: "" });

            toast({
                title: "Order Created Locally",
                description: `Order ${order.id} has been created. Log in to save it permanently.`,
            });
        }
    };

    const updateOrder = async (orderId: string) => {
        const userEmail = sessionStorage.getItem("RSEmail");
        const adminEmail = "admin@businesskits.com";

        if (userEmail) {

            try {
                const payload = {
                    order_id: orderId,
                    status: "Delivered",
                    admin: adminEmail
                };

                const response = await fetch("https://api.rootsnsquares.com/innovations/update-order.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    console.error("API HTTP Error updating order:", response.status, response.statusText);
                    const errorData = await response.text();
                    toast({
                        title: "Server Error",
                        description: `Failed to update order status via API (Status: ${response.status}). Please try again.`,
                        variant: "destructive"
                    });
                    return;
                }

                const result = await response.json();

                if (result.status === "success") {
                    const updatedOrders = orders.map(order =>
                        order.id === orderId ? { ...order, status: "Delivered" } : order
                    );
                    setOrders(updatedOrders);
                    localStorage.setItem("orders", JSON.stringify(updatedOrders));
                    toast({
                        title: "Order Updated",
                        description: `Order ${orderId} status changed to Delivered.`,
                    });
                } else {
                    toast({
                        title: "Order Update Failed",
                        description: result.message || "Failed to update order via API. Please try again.",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                console.error("Error sending update order to API:", error);
                toast({
                    title: "Network Error",
                    description: "Could not connect to the server to update order. Please check your internet connection and try again.",
                    variant: "destructive"
                });
            }
        } else {
            const updatedOrders = orders.map(order =>
                order.id === orderId ? { ...order, status: "Delivered" } : order
            );
            setOrders(updatedOrders);
            localStorage.setItem("orders", JSON.stringify(updatedOrders));
            toast({
                title: "Order Updated Locally",
                description: `Order ${orderId} status changed to Delivered. Log in to save changes permanently.`,
            });
        }
    };

    const deleteOrder = async (orderId: string) => {
        const userEmail = sessionStorage.getItem("RSEmail");
        const adminEmail = "admin@businesskits.com";

        if (userEmail) {
            try {
                const payload = {
                    order_id: orderId,
                    admin: adminEmail
                };

                const response = await fetch("https://api.rootsnsquares.com/innovations/delete-order.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    console.error("API HTTP Error deleting order:", response.status, response.statusText);
                    const errorData = await response.text();
                    toast({
                        title: "Server Error",
                        description: `Failed to delete order via API (Status: ${response.status}). Please try again.`,
                        variant: "destructive"
                    });
                    return;
                }

                const result = await response.json();

                if (result.status === "success") {
                    const updatedOrders = orders.filter(order => order.id !== orderId);
                    setOrders(updatedOrders);
                    localStorage.setItem("orders", JSON.stringify(updatedOrders));
                    toast({
                        title: "Order Deleted",
                        description: `Order ${orderId} has been removed.`,
                    });
                } else {
                    toast({
                        title: "Order Deletion Failed",
                        description: result.message || "Failed to delete order via API. Please try again.",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                console.error("Error sending delete order to API:", error);
                toast({
                    title: "Network Error",
                    description: "Could not connect to the server to delete order. Please check your internet connection and try again.",
                    variant: "destructive"
                });
            }
        } else {
            const updatedOrders = orders.filter(order => order.id !== orderId);
            setOrders(updatedOrders);
            localStorage.setItem("orders", JSON.stringify(updatedOrders));
            toast({
                title: "Order Deleted Locally",
                description: `Order ${orderId} has been removed. Log in to save changes permanently.`,
            });
        }
    };

    const getLowStockItems = () => {
        return inventoryItems.filter(item => item.currentStock <= item.minStock);
    };

    const getTotalInventoryValue = () => {
        return inventoryItems.reduce((total, item) => total + (item.currentStock * item.unitPrice), 0);
    };

    const handleBulkUpload = () => {
        toast({
            title: "Bulk Upload",
            description: "CSV upload feature will be available. You can also use WhatsApp commands for quick updates.",
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": case "urgent": return "bg-red-100 text-red-700 border-red-200";
            case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default: return "bg-green-100 text-green-700 border-green-200";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Delivered": return "bg-green-100 text-green-700";
            case "In Transit": return "bg-blue-100 text-blue-700";
            case "Processing": return "bg-yellow-100 text-yellow-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <>
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Items</p>
                                <p className="text-2xl font-bold">{inventoryItems.length}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                                <p className="text-2xl font-bold text-red-600">{getLowStockItems().length}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Orders</p>
                                <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status !== "Delivered").length}</p>
                            </div>
                            <Truck className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Inventory Value</p>
                                <p className="text-lg font-bold text-green-600">₦{getTotalInventoryValue().toLocaleString()}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="inventory">📦 Inventory</TabsTrigger>
                    <TabsTrigger value="orders">🚚 Orders</TabsTrigger>
                    <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Add New Inventory Item
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <Label>Product Name *</Label>
                                    <Input
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        placeholder="e.g., Samsung Galaxy S24"
                                    />
                                </div>
                                <div>
                                    <Label>Model *</Label>
                                    <Input
                                        value={newItem.model}
                                        onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                                        placeholder="e.g., SGS24001"
                                    />
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Input
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        placeholder="e.g., Electronics"
                                    />
                                </div>
                                <div>
                                    <Label>Current Stock *</Label>
                                    <Input
                                        type="number"
                                        value={newItem.currentStock}
                                        onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                                        placeholder="e.g., 50"
                                    />
                                </div>
                                <div>
                                    <Label>Min Stock Level</Label>
                                    <Input
                                        type="number"
                                        value={newItem.minStock}
                                        onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                                        placeholder="e.g., 10"
                                    />
                                </div>
                                <div>
                                    <Label>Unit Price (₦) *</Label>
                                    <Input
                                        type="number"
                                        value={newItem.unitPrice}
                                        onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                                        placeholder="e.g., 350000"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={addInventoryItem}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                                <Button variant="outline" onClick={handleBulkUpload}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Bulk Upload CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader>
                            <CardTitle>Current Inventory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Min Stock</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventoryItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.model}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.currentStock}</TableCell>
                                            <TableCell>{item.minStock}</TableCell>
                                            <TableCell>₦{item.unitPrice.toLocaleString()}</TableCell>
                                            <TableCell>₦{(item.currentStock * item.unitPrice).toLocaleString()}</TableCell>
                                            <TableCell>
                                                {item.currentStock <= item.minStock ? (
                                                    <Badge variant="destructive">Low Stock</Badge>
                                                ) : item.currentStock <= item.minStock * 2 ? (
                                                    <Badge variant="secondary">Moderate</Badge>
                                                ) : (
                                                    <Badge variant="default">Good</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent >

                <TabsContent value="orders" className="space-y-4">

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Track New Order
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <Label>Supplier Name *</Label>
                                    <Input
                                        value={newOrder.supplier}
                                        onChange={(e) => setNewOrder({ ...newOrder, supplier: e.target.value })}
                                        placeholder="e.g., Tech Distributors Ltd"
                                    />
                                </div>
                                <div>
                                    <Label>Items Ordered *</Label>
                                    <Input
                                        value={newOrder.items}
                                        onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                                        placeholder="e.g., Samsung Galaxy S24 x 20"
                                    />
                                </div>
                                <div>
                                    <Label>Expected Delivery *</Label>
                                    <Input
                                        type="date"
                                        value={newOrder.expectedDelivery}
                                        onChange={(e) => setNewOrder({ ...newOrder, expectedDelivery: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Total Value (₦)</Label>
                                    <Input
                                        type="number"
                                        value={newOrder.totalValue}
                                        onChange={(e) => setNewOrder({ ...newOrder, totalValue: e.target.value })}
                                        placeholder="e.g., 7000000"
                                    />
                                </div>
                            </div>
                            <Button onClick={addOrder}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Order
                            </Button>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader>
                            <CardTitle>Order Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Expected Delivery</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                {orders.length > 0 ? (
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.id}</TableCell>
                                                <TableCell>{order.supplier}</TableCell>
                                                <TableCell>{order.items}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{order.expectedDelivery}</TableCell>
                                                <TableCell>₦{order.totalValue.toLocaleString()}</TableCell>
                                                <TableCell className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => updateOrder(order.id)}
                                                        className="text-green-500 hover:text-green-600"
                                                        title="Mark as Delivered"
                                                        disabled={order.status === "Delivered"}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteOrder(order.id)}
                                                        className="text-red-500 hover:text-red-600"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                ) : (
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Add an order to keep track of them.
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                )}
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">

                    <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Inventory Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {["Electronics", "Fashion", "Accessories"].map((category) => {
                                        const categoryItems = inventoryItems.filter(item => item.category === category);
                                        const percentage = (inventoryItems.length > 0 ? (categoryItems.length / inventoryItems.length) * 100 : 0); // Handle division by zero
                                        return (
                                            <div key={category}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{category}</span>
                                                    <span>{percentage.toFixed(1)}%</span>
                                                </div>
                                                <Progress value={percentage} className="h-2" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Sales Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {inventoryItems.slice(0, 3).map((item) => {
                                        const turnover = (item.currentStock > 0 ? (item.salesThisMonth / item.currentStock) * 100 : 0); // Handle division by zero
                                        return (
                                            <div key={item.id}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="truncate">{item.name}</span>
                                                    <span>{item.salesThisMonth} sold</span>
                                                </div>
                                                <Progress value={Math.min(turnover, 100)} className="h-2" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Export & Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <GenerateInventory
                                    inventoryItems={inventoryItems}
                                    orders={[]}
                                    reportType="inventory"
                                    businessName={businessName}
                                    businessAddress={businessAddress}
                                    businessPhone={businessPhone}
                                    businessLogo={businessLogo} // Pass the business logo here
                                />
                                <GenerateInventory
                                    inventoryItems={[]}
                                    orders={orders}
                                    reportType="orders"
                                    businessName={businessName}
                                    businessAddress={businessAddress}
                                    businessPhone={businessPhone}
                                    businessLogo={businessLogo} // Pass the business logo here
                                />
                            </div>
                        </CardContent>
                    </Card>


                </TabsContent>
            </Tabs >
        </>
    )
}