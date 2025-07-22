"use client"
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users as UsersIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming this utility is available for conditional class names

// Re-use ApiUserItem interface from the Dashboard component to ensure type consistency
interface ApiUserItem {
    id: string;
    account_id: string;
    fullname: string;
    email: string;
    role: string;
    phone: string;
    businessname: string;
    address: string;
    description: string;
    country: string;
    state: string;
    zip: string;
    status: string; // e.g., 'active', 'inactive', 'pending'
    regdate: string; // Date string (e.g., "YYYY-MM-DD HH:MM:SS")
    uptime: string;
    admin: string;
}

interface UsersProps {
    users: ApiUserItem[] | null;
    loading: boolean;
    refetchUser: () => void;
    // No refetchUsers prop is added here as per the parent component's structure,
    // where user data fetching is handled in Dashboard.
}

// Interface for processed user items, optimized for display
interface ProcessedUserItem {
    originalId: string;
    accountIdDisplay: string;
    fullname: string;
    email: string;
    role: string;
    phone: string;
    businessName: string;
    country: string;
    status: string;
    registrationDate: string; // Formatted date string for display
    originalRegDate: Date;    // For internal date comparison/sorting if needed
}

export default function Users({ users, loading, refetchUser }: UsersProps) {
    // State for search and filter controls
    const [searchText, setSearchText] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("all"); // 'all', 'active', 'inactive', etc.
    const [filterRole, setFilterRole] = useState<string>("all");     // 'all', 'admin', 'user', etc.

    // State for pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10; // Number of users to display per page

    // Helper function to process individual user items for display
    const processUserItemForDisplay = (item: ApiUserItem): ProcessedUserItem => {
        // You can truncate account_id if it's very long, similar to invoice_id
        // For example: const accountIdDisplay = item.account_id.slice(0, 3) + '...' + item.account_id.slice(-5);
        return {
            originalId: item.id,
            accountIdDisplay: item.account_id, // Using full ID for now
            fullname: item.fullname,
            email: item.email,
            role: item.role,
            phone: item.phone,
            businessName: item.businessname,
            country: item.country,
            status: item.status,
            registrationDate: new Date(item.regdate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }), // Format date for better readability
            originalRegDate: new Date(item.regdate)
        };
    };

    // Memoized computation for filtered and paginated users
    const filteredUsers = useMemo(() => {
        if (!users) return [];

        let processed = users.map(processUserItemForDisplay);

        // 1. Apply search filter
        if (searchText) {
            const lowerCaseSearchText = searchText.toLowerCase();
            processed = processed.filter(item => {
                return item.fullname.toLowerCase().includes(lowerCaseSearchText) ||
                    item.email.toLowerCase().includes(lowerCaseSearchText) ||
                    item.businessName.toLowerCase().includes(lowerCaseSearchText);
            });
        }

        // 2. Apply status filter
        if (filterStatus !== "all") {
            processed = processed.filter(item => item.status.toLowerCase() === filterStatus.toLowerCase());
        }

        // 3. Apply role filter
        if (filterRole !== "all") {
            processed = processed.filter(item => item.role.toLowerCase() === filterRole.toLowerCase());
        }

        return processed;
    }, [users, searchText, filterStatus, filterRole]);

    // Pagination logic: Calculate total pages and slice data for the current page
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, itemsPerPage]);

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
                        <UsersIcon className="h-5 w-5 text-purple-600" />
                        User Accounts
                    </CardTitle>
                    <CardDescription>Manage your platform's user base</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">Loading user records...</div>
                </CardContent>
            </Card>
        );
    }

    // --- No Data State (if initially empty) ---
    if (!users || users.length === 0) {
        return (
            <Card className="border-0 min-h-[90vh] shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-purple-600" />
                        User Accounts
                    </CardTitle>
                    <CardDescription>Manage your platform's user base</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">No user records yet.</div>
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
                        <UsersIcon className="h-5 w-5 text-purple-600" />
                        User Accounts
                    </CardTitle>
                    <CardDescription>Manage your platform's user base</CardDescription>
                </div>
                {/* Potentially add an "Add User" button here */}
                {/* <Button variant="default" size="sm" onClick={() => router.push("/tools/add-user")} className="shrink-0 mt-0">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New User
                </Button> */}
            </CardHeader>

            <CardContent className='px-3 sm:px-6'>
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by name, email, or business..."
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            {/* Add more status options if they exist in your data */}
                        </SelectContent>
                    </Select>

                    {/* Role Filter */}
                    <Select value={filterRole} onValueChange={(value) => {
                        setFilterRole(value);
                        setCurrentPage(1); // Reset to first page when filter changes
                    }}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            {/* Add more role options if they exist */}
                        </SelectContent>
                    </Select>
                </div>

                {/* Display message if no matching records found after filtering */}
                {currentUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No matching user records found.</div>
                ) : (
                    <>
                        {/* Users Table */}
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[100px]">Account ID</TableHead>
                                        <TableHead className="min-w-[150px]">Full Name</TableHead>
                                        <TableHead className="min-w-[200px]">Email</TableHead>
                                        <TableHead className="hidden md:table-cell min-w-[100px]">Role</TableHead>
                                        <TableHead className="hidden lg:table-cell min-w-[150px]">Business Name</TableHead>
                                        <TableHead className="hidden sm:table-cell min-w-[100px]">Status</TableHead>
                                        <TableHead className="text-right min-w-[120px]">Reg. Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentUsers.map((user) => (
                                        <TableRow key={user.originalId}>
                                            <TableCell className="font-medium">{user.accountIdDisplay}</TableCell>
                                            <TableCell>{user.fullname}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant={user.role.toLowerCase() === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">{user.businessName}</TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge
                                                    className={cn(
                                                        user.status.toLowerCase() === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600',
                                                        "text-white"
                                                    )}
                                                >
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{user.registrationDate}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-end items-center space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>
                            <span className="text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
