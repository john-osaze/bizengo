
"use client";

import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    LogOut,
    Sparkles,
    Menu,
    Hammer,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from 'next/link';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { navItems } from "@/lib/tools-dash-nav-items";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    businessData: ApiBusinessItem[] | null;
}

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

export default function Header({ activeTab, onTabChange, businessData }: HeaderProps) {
    const router = useRouter();
    console.log("business", businessData);
    const { isLoggedIn, user, isLoading, logout } = useAuth();

    const useBusinessInfo = useMemo(() => {
        return businessData && businessData.length > 0 && businessData[0].logo;
    }, [businessData]);

    const currentUserRole = useMemo(() => {
        if (isLoading) {
            return "user";
        }
        if (!isLoggedIn || !user) {
            return "user";
        }
        return user.role;
    }, [isLoading, isLoggedIn, user]);

    const filteredNavItems = useMemo(() => {
        return navItems.filter(item => item.allow.includes(currentUserRole));
    }, [currentUserRole]);

    const handleLogout = () => {
        logout();
        toast({
            title: "Logged out successfully",
            description: "See you next time!",
        });
        window.location.href = "/tools/";
    };

    return (
        <div className="w-full bg-white/60 backdrop-blur-sm shadow-sm border-b border-gray-200 fixed top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {useBusinessInfo && businessData ? (
                            <div
                                onClick={() => router.push("/tools/")}
                                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border" // Added overflow-hidden for rounded image
                            >
                                <Image
                                    src={businessData[0].logo}
                                    alt={businessData[0].business_name || "Business Logo"}
                                    width={32} // Corresponds to w-8
                                    height={32} // Corresponds to h-8
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div onClick={() => router.push("/tools/")} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                        )}

                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Business Dashboard</h1>
                            <p className="text-sm text-gray-600">
                                {useBusinessInfo && businessData ? businessData[0].business_name : `Welcome back, ${user?.fullname?.split(' ')[0] || "User"}`}
                            </p>
                        </div>
                    </div>
                    {/* bg-gradient-to-r from-[#16274e] to-[#362b5b] hover:from-[#141d31] hover:to-[#3f316c] */}
                    <div className="flex items-center gap-4">
                        {(isLoggedIn || isLoading) && (
                            <Badge variant="secondary" className={cn(
                                "bg-[#16274e4a]",
                                currentUserRole === "admin" ? "text-[#16274e]" : "text-[#16274e]"
                            )}>
                                {currentUserRole === "admin" ? "Admin" : "User"}
                            </Badge>
                        )}


                        <div className="hidden sm:flex items-center gap-4">
                            <Link
                                href="/tools/"
                                className=" text-sm font-medium text-[#16274e] px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
                            >
                                All tools
                            </Link>
                            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2" size="sm">
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>

                        <div className="sm:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="p-2">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">

                                    {filteredNavItems.map((item) => (
                                        <DropdownMenuItem
                                            key={item.id}
                                            onClick={() => onTabChange(item.id)}
                                            className={cn(
                                                "flex items-center gap-2",
                                                activeTab === item.id ? "bg-accent text-accent-foreground" : ""
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/tools/"
                                            className="flex items-center gap-2 text-sm font-medium text-purple-700 w-full"
                                        >
                                            <Hammer className="h-4 w-4" />
                                            All tools
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}