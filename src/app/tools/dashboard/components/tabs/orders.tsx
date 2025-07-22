
"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { CheckCircle, Loader2, PlusCircle, Trash2, Search, CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import GenerateInventory from "@/components/tools/calculator/GenerateInventory";
import { OrderPdf } from "@/types/inventory";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

interface ApiOrderItem {
    id: string;
    order_id: string;
    email: string;
    supplier: string;
    items: string;
    status: string;
    expectedDelivery: string;
    totalValue: string;
    uptime: string;
    admin: string | null;
}

interface OrdersProps {
    orders: ApiOrderItem[] | null;
    loading: boolean;
    refetchOrders: () => void;
}

const Orders = ({ orders, loading, refetchOrders }: OrdersProps) => {
    const router = useRouter();
    const { isLoading } = useAuth();
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

    const ordersForGenerateInventory: OrderPdf[] = orders?.map(order => ({
        id: order.id,
        supplier: order.supplier,
        items: order.items,
        status: order.status,
        expectedDelivery: order.expectedDelivery,
        totalValue: parseFloat(order.totalValue),
    })) || [];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-blue-500 hover:bg-blue-600";
            case "delivered":
                return "bg-green-500 hover:bg-green-600";
            case "cancelled":
                return "bg-red-500 hover:bg-red-600";
            default:
                return "bg-gray-500 hover:bg-gray-600";
        }
    };

    const ADMIN_EMAIL = "admin@businesskits.com";

    const updateOrder = async (orderId: string) => {

        try {
            setUpdatingOrderId(orderId);
            const response = await fetch("https://api.rootsnsquares.com/innovations/update-order.php", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order_id: orderId,
                    status: "Delivered",
                    admin: ADMIN_EMAIL,
                }),
            });

            const result = await response.json();

            if (response.ok && result.status === "success") {
                toast({
                    title: "Order Updated",
                    description: `Order ${orderId} has been successfully marked as 'Delivered'.`,
                });
                refetchOrders();
            } else {
                toast({
                    title: "Update Failed",
                    description: `Failed to update order ${orderId}. Please try again.`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to connect to the server or an unexpected error occurred while updating order ${orderId}.`,
                variant: "destructive",
            });
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const deleteOrder = async (orderId: string) => {

        try {
            setDeletingOrderId(orderId);
            const response = await fetch("https://api.rootsnsquares.com/innovations/delete-order.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order_id: orderId,
                    admin: ADMIN_EMAIL,
                }),
            });

            const result = await response.json();

            if (response.ok && result.status === "success") {
                toast({
                    title: "Order Deleted",
                    description: `Order ${orderId} has been successfully deleted.`,
                });
                refetchOrders();
            } else {
                toast({
                    title: "Deletion Failed",
                    description: `Failed to delete order ${orderId}. Please try again.`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to connect to the server or an unexpected error occurred while deleting order ${orderId}.`,
                variant: "destructive",
            });
        } finally {
            setDeletingOrderId(null);
        }
    };

    const filteredOrders = useMemo(() => {
        if (!orders) return [];

        let tempOrders = orders;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            tempOrders = tempOrders.filter(order => {
                const supplierMatch = order.supplier.toLowerCase().includes(lowerCaseSearchTerm);
                const itemsMatch = order.items.toLowerCase().includes(lowerCaseSearchTerm);
                const statusMatch = order.status.toLowerCase().includes(lowerCaseSearchTerm);

                const totalValueMatch = order.totalValue.replace(/,/g, '').toLowerCase().includes(lowerCaseSearchTerm);

                return supplierMatch || itemsMatch || statusMatch || totalValueMatch;
            });
        }

        if (filterDate) {
            const searchDateString = filterDate.toISOString().split('T')[0];

            tempOrders = tempOrders.filter(order => {
                try {
                    const orderDate = new Date(order.expectedDelivery);
                    if (isNaN(orderDate.getTime())) {
                        return false;
                    }
                    const orderDateString = orderDate.toISOString().split('T')[0];
                    return orderDateString === searchDateString;
                } catch (e) {
                    console.error("Invalid expectedDelivery date format:", order.expectedDelivery, e);
                    return false;
                }
            });
        }

        return tempOrders;
    }, [orders, searchTerm, filterDate]);

    if (loading || isLoading) {
        return (
            <Card className="shadow-none border-0">
                <CardHeader>
                    <CardTitle>Order Tracking</CardTitle>
                    <CardDescription>Track the status of your product orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-48 text-gray-500">
                        <p>Loading orders...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <Card className="shadow-none border-0">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 px-3 sm:px-6">
                    <div>
                        <CardTitle className="sm:mb-2 text-xl sm:text-2xl">Order Tracking</CardTitle>
                        <CardDescription>Track the status of your product orders.</CardDescription>
                    </div>
                    <Button variant="default" size="sm" onClick={() => router.push("/tools/calculator-inventory")} className="shrink-0 mt-0">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add order
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-48 text-gray-500">
                        <p>No orders found.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-none border-0">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 px-3 sm:px-6">
                <div>
                    <CardTitle className="sm:mb-2 text-xl sm:text-2xl">Order Tracking</CardTitle>
                    <CardDescription>Track the status of your product orders.</CardDescription>
                </div>
                <div className='flex sm:items-center gap-2'>
                    <Button variant="default" size="sm" onClick={() => router.push("/tools/calculator-inventory")} className="shrink-0 mt-0">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add order
                    </Button>
                    <GenerateInventory inventoryItems={[]} orders={ordersForGenerateInventory} reportType="orders" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">

                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Search by supplier, items, status, or value..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 w-full"
                        />
                    </div>
                    {/* Date Input */}
                    <div className="relative shrink-0">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                        <Input
                            type="date"
                            value={filterDate ? filterDate.toISOString().split('T')[0] : ''} // Format Date to YYYY-MM-DD for input
                            onChange={(e) => {
                                const dateValue = e.target.value;
                                setFilterDate(dateValue ? new Date(dateValue) : undefined); // Convert string back to Date object
                            }}
                            className="pl-9 pr-3 py-2 w-full sm:w-auto"
                        />
                    </div>
                </div>
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
                    <TableBody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.order_id}</TableCell>
                                    <TableCell>{order.supplier}</TableCell>
                                    <TableCell>{order.items}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{order.expectedDelivery}</TableCell>
                                    <TableCell>₦{parseFloat(order.totalValue).toLocaleString()}</TableCell>
                                    <TableCell className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updateOrder(order.order_id)}
                                            className="text-green-500 hover:text-green-600"
                                            title="Mark as Delivered"
                                            disabled={
                                                order.status.toLowerCase() === "delivered" ||
                                                updatingOrderId === order.order_id ||
                                                deletingOrderId === order.order_id
                                            }
                                        >
                                            {updatingOrderId === order.order_id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteOrder(order.order_id)}
                                            className="text-red-500 hover:text-red-600"
                                            title="Delete Order"
                                            disabled={
                                                deletingOrderId === order.order_id ||
                                                updatingOrderId === order.order_id
                                            }
                                        >
                                            {deletingOrderId === order.order_id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No matching orders found for your search/filter criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default Orders;