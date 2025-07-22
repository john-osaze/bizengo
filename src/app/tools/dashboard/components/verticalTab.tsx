"use client";

import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/tools-dash-nav-items";
import { useAuth } from "@/context/AuthContext";

interface VerticalTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export default function VerticalTabs({ activeTab, onTabChange }: VerticalTabsProps) {
    const HEADER_HEIGHT_PX = 80;

    const { isLoggedIn, user, isLoading } = useAuth();

    const filteredNavItems = useMemo(() => {
        let effectiveRole: "user" | "admin" = "user";

        if (!isLoading && isLoggedIn && user && user.role === "admin") {
            effectiveRole = "admin";
        }

        return navItems.filter(item => item.allow.includes(effectiveRole));
    }, [isLoading, isLoggedIn, user]);


    if (filteredNavItems.length === 0) {
        return null;
    }

    return (
        <TooltipProvider>
            <div
                className={cn(
                    "fixed left-0 z-40 bg-purple-700 shadow-lg p-2 sm:p-3 flex flex-col items-center space-y-4",
                    "hidden sm:flex"
                )}
                style={{ top: `${HEADER_HEIGHT_PX}px`, height: `calc(100vh - ${HEADER_HEIGHT_PX}px)` }}
            >
                {filteredNavItems.map((item) => (
                    <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "p-0 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center transition-colors duration-200",
                                    activeTab === item.id ? "bg-purple-800 text-white shadow-md" : "text-purple-200 hover:bg-purple-600 hover:text-white"
                                )}
                                onClick={() => onTabChange(item.id)}
                                aria-label={item.label}
                            >
                                <item.icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-800 text-white text-sm px-3 py-1 rounded-md shadow-lg">
                            {item.label}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}