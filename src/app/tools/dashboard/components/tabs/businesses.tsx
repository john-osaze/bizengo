// components/tabs/businesses.tsx
"use client"
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Building2, ChevronLeft, ChevronRight } from "lucide-react"; // Building2 icon for businesses
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utility for conditional class names

// Re-use ApiBusinessItem interface from the Dashboard component to ensure type consistency
interface ApiBusinessItem {
    id: string;
    email: string;
    business_id: string;
    business_name: string;
    business_email: string;
    address: string;
    description: string;
    contact: string;
    identifier: string;
    logo: string;
    number: string;
    status: string;
    reg_time: string;
    uptime: string;
    admin: string | null;
}

interface BusinessesProps {
    businesses: ApiBusinessItem[] | null;
    loading: boolean;
    refetchBusinesses: () => void;
}

// Interface for processed business items, optimized for display
interface ProcessedBusinessItem {
    originalId: string;
    businessIdDisplay: string;
    businessName: string;
    businessEmail: string;
    contact: string;
    status: string;
    registrationDate: string; // Formatted date string for display
    originalRegDate: Date;    // For internal date comparison/sorting if needed
}

export default function Businesses({ businesses, loading, refetchBusinesses }: BusinessesProps) {
    const [searchText, setSearchText] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("all"); // 'all', 'approved', 'pending', etc.

    // State for pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10; // Number of businesses to display per page

    // Helper function to process individual business items for display
    const processBusinessItemForDisplay = (item: ApiBusinessItem): ProcessedBusinessItem => {
        return {
            originalId: item.id,
            businessIdDisplay: item.business_id,
            businessName: item.business_name,
            businessEmail: item.business_email,
            contact: item.contact,
            status: item.status,
            registrationDate: new Date(item.reg_time).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }), // Format date for better readability
            originalRegDate: new Date(item.reg_time)
        };
    };

    // Memoized computation for filtered and paginated businesses
    const filteredBusinesses = useMemo(() => {
        if (!businesses) return [];

        let processed = businesses.map(processBusinessItemForDisplay);

        // 1. Apply search filter
        if (searchText) {
            const lowerCaseSearchText = searchText.toLowerCase();
            processed = processed.filter(item => {
                return item.businessName.toLowerCase().includes(lowerCaseSearchText) ||
                    item.businessEmail.toLowerCase().includes(lowerCaseSearchText) ||
                    item.businessIdDisplay.toLowerCase().includes(lowerCaseSearchText);
            });
        }

        // 2. Apply status filter
        if (filterStatus !== "all") {
            processed = processed.filter(item => item.status.toLowerCase() === filterStatus.toLowerCase());
        }

        return processed;
    }, [businesses, searchText, filterStatus]);

    // Pagination logic: Calculate total pages and slice data for the current page
    const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
    const currentBusinesses = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredBusinesses.slice(startIndex, endIndex);
    }, [filteredBusinesses, currentPage, itemsPerPage]);

    // Handlers for pagination buttons
    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    // --- Loading State ---
    if (loading) {
        return (
            <Card className="border-0 min-h-[90vh] shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        Business Accounts
                    </CardTitle>
                    <CardDescription>Manage registered businesses</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">Loading business records...</div>
                </CardContent>
            </Card>
        );
    }

    // --- No Data State (if initially empty) ---
    if (!businesses || businesses.length === 0) {
        return (
            <Card className="border-0 min-h-[90vh] shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        Business Accounts
                    </CardTitle>
                    <CardDescription>Manage registered businesses</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">No business records yet.</div>
                </CardContent>
            </Card>
        );
    }

    // --- Main Component Render ---
    return (
        <Card className="border-0 shadow-none min-h-[90vh]">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 px-3 sm:px-6">
                <div>
                    <CardTitle className="flex items-center gap-2 sm:mb-2 text-xl sm:text-2xl">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        Business Accounts
                    </CardTitle>
                    <CardDescription>Manage registered businesses on the platform</CardDescription>
                </div>
                {/* Add a "Refresh" button here if needed */}
                <Button variant="outline" size="sm" onClick={refetchBusinesses} className="shrink-0 mt-0">
                    Refresh
                </Button>
            </CardHeader>

            <CardContent className='px-3 sm:px-6'>
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by name, email, or business ID..."
                            className="pl-9"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentPage(1); // Reset to first page when search text changes
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={filterStatus} onValueChange={(value) => {
                        setFilterStatus(value);
                        setCurrentPage(1); // Reset to first page when filter changes
                    }}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            {/* Add more status options if they exist in your data */}
                        </SelectContent>
                    </Select>
                </div>

                {/* Display message if no matching records found after filtering */}
                {currentBusinesses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No matching business records found.</div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="hidden sm:table-cell">Contact</TableHead>
                                    <TableHead className="hidden md:table-cell">Business ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden lg:table-cell">Reg. Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentBusinesses.map((business) => (
                                    <TableRow key={business.originalId}>
                                        <TableCell className="font-medium">{business.businessName}</TableCell>
                                        <TableCell>{business.businessEmail}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{business.contact}</TableCell>
                                        <TableCell className="hidden md:table-cell">{business.businessIdDisplay}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "px-2 py-1 text-xs font-semibold rounded-full",
                                                    business.status.toLowerCase() === 'approved' && "bg-green-100 text-green-800",
                                                    business.status.toLowerCase() === 'pending' && "bg-yellow-100 text-yellow-800",
                                                    business.status.toLowerCase() === 'rejected' && "bg-red-100 text-red-800",
                                                    business.status.toLowerCase() === 'inactive' && "bg-gray-100 text-gray-800",
                                                )}
                                            >
                                                {business.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">{business.registrationDate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center mt-4">
                            <Button
                                variant="outline"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                size="sm"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                            </Button>
                            <span className="text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                size="sm"
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}